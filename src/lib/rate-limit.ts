/**
 * Rate limiter de ventana fija respaldado por un almacén compartido.
 *
 * Algoritmo: la ventana empieza con la primera solicitud de una clave y dura
 * `windowSeconds`. Cada solicitud dentro de la ventana incrementa el contador;
 * cuando supera `limit`, las solicitudes se bloquean hasta que la ventana expira.
 * NO es una ventana deslizante: un cliente puede gastar toda su cuota al final
 * de una ventana y otra vez al inicio de la siguiente.
 *
 * Selección del almacén:
 * - Upstash Redis cuando están definidos `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`
 *   (o los de Vercel Marketplace `KV_REST_API_URL`/`KV_REST_API_TOKEN`).
 *   Los contadores se comparten entre instancias serverless y sobreviven a reinicios.
 * - En producción sin esa configuración, cada verificación reporta
 *   `unavailable` para que cada llamador aplique su política de fallo explícita en lugar
 *   de degradarse en silencio a contadores por instancia.
 * - Fuera de producción (desarrollo local, pruebas), un almacén en memoria por proceso.
 *
 * Los errores y timeouts del almacén nunca lanzan excepciones: devuelven `unavailable` y se
 * registran. Quien llama decide si eso bloquea o permite la operación.
 */

import { Redis } from '@upstash/redis'
import { logError } from '@/lib/observability'

export const RATE_LIMIT_STATUS = {
  ALLOWED: 'allowed',
  BLOCKED: 'blocked',
  UNAVAILABLE: 'unavailable',
} as const

export type RateLimitStatus = (typeof RATE_LIMIT_STATUS)[keyof typeof RATE_LIMIT_STATUS]

interface RateLimitOptions {
  /** Máximo de solicitudes permitidas en la ventana */
  limit: number
  /** Duración de la ventana en segundos */
  windowSeconds: number
}

export interface RateLimitResult {
  status: RateLimitStatus
  remaining: number
  /** Segundos hasta que la ventana se reinicia; 0 salvo que la solicitud se haya bloqueado */
  retryAfterSeconds: number
}

interface WindowHit {
  count: number
  ttlMs: number
}

interface RateLimitStore {
  hit(key: string, windowMs: number): Promise<WindowHit>
}

const STORE_TIMEOUT_MS = 2_000
// La señal de aborto aplica STORE_TIMEOUT_MS. El plazo de respaldo es un poco más largo
// para que el aborto se resuelva primero y la carrera solo cubra el trabajo que no puede cancelar.
const STORE_BACKSTOP_TIMEOUT_MS = STORE_TIMEOUT_MS + 250

// Atómico: incrementa el contador, inicia la ventana con la primera solicitud y
// repara una clave que quedó sin expiración; luego devuelve [count, ttl restante en ms].
const FIXED_WINDOW_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('PTTL', KEYS[1])
if ttl < 0 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
  ttl = tonumber(ARGV[1])
end
return { count, ttl }
`

const UNAVAILABLE_RESULT: RateLimitResult = {
  status: RATE_LIMIT_STATUS.UNAVAILABLE,
  remaining: 0,
  retryAfterSeconds: 0,
}

function createMemoryStore(): RateLimitStore {
  const entries = new Map<string, { count: number; resetAt: number }>()

  return {
    async hit(key, windowMs) {
      const now = Date.now()

      for (const [entryKey, entry] of entries) {
        if (entry.resetAt <= now) entries.delete(entryKey)
      }

      const entry = entries.get(key)
      if (!entry) {
        entries.set(key, { count: 1, resetAt: now + windowMs })
        return { count: 1, ttlMs: windowMs }
      }

      entry.count += 1
      return { count: entry.count, ttlMs: entry.resetAt - now }
    },
  }
}

function isWindowReply(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every((item) => typeof item === 'number' && Number.isFinite(item))
  )
}

function createRedisStore(redis: Redis): RateLimitStore {
  return {
    async hit(key, windowMs) {
      const reply: unknown = await redis.eval(FIXED_WINDOW_SCRIPT, [key], [windowMs])
      if (!isWindowReply(reply)) {
        throw new Error('Unexpected rate limit store reply')
      }

      const [count, ttlMs] = reply
      return { count, ttlMs }
    },
  }
}

interface StoreCredentials {
  url: string
  token: string
}

// La URL y el token se resuelven en pareja para que una configuración parcial de Upstash
// nunca se combine con valores de Marketplace; las cadenas vacías cuentan como no definidas.
function getStoreCredentials(): StoreCredentials | null {
  const pairs = [
    [process.env.UPSTASH_REDIS_REST_URL, process.env.UPSTASH_REDIS_REST_TOKEN],
    [process.env.KV_REST_API_URL, process.env.KV_REST_API_TOKEN],
  ]

  for (const [url, token] of pairs) {
    if (url && token) return { url, token }
  }

  return null
}

function createDefaultStore(): RateLimitStore | null {
  const credentials = getStoreCredentials()

  if (credentials) {
    return createRedisStore(
      new Redis({
        ...credentials,
        // Un reintento tolera errores de red transitorios. El cliente reintenta solo
        // cuando `fetch` lanza un error, así que una conexión perdida después de que Redis ejecutó el script
        // puede contar una solicitud dos veces; eso solo sobrecuenta y se acepta.
        retry: { retries: 1 },
        // Se evalúa por solicitud, así que cada una obtiene su propio plazo y se
        // aborta (sin reintento) cuando vence, en lugar de seguir ejecutándose.
        signal: () => createTimeoutSignal(STORE_TIMEOUT_MS),
      }),
    )
  }

  if (process.env.NODE_ENV === 'production') return null

  return createMemoryStore()
}

let defaultStore: RateLimitStore | null | undefined

function getDefaultStore(): RateLimitStore | null {
  if (defaultStore === undefined) defaultStore = createDefaultStore()
  return defaultStore
}

function timeoutError(timeoutMs: number): Error {
  return new Error(`Rate limit store timed out after ${timeoutMs}ms`)
}

// Como `AbortSignal.timeout`, pero construido sobre `setTimeout` para que las pruebas lo controlen
// con temporizadores falsos. El temporizador usa unref para nunca mantener vivo el proceso.
function createTimeoutSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(timeoutError(timeoutMs)), timeoutMs)
  timer.unref?.()
  return controller.signal
}

// Límite superior para cualquier almacén, incluido el trabajo que la señal de aborto no cubre.
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(timeoutError(timeoutMs)), timeoutMs)
  })

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

function getScope(key: string): string {
  return key.split(':')[0] ?? 'unknown'
}

export async function rateLimit(
  key: string,
  { limit, windowSeconds }: RateLimitOptions,
): Promise<RateLimitResult> {
  const store = getDefaultStore()

  if (!store) {
    logError('[rate-limit] shared store is not configured', {
      source: 'rateLimit',
      metadata: { scope: getScope(key) },
    })
    return UNAVAILABLE_RESULT
  }

  let hit: WindowHit
  try {
    hit = await withTimeout(store.hit(key, windowSeconds * 1000), STORE_BACKSTOP_TIMEOUT_MS)
  } catch (error) {
    logError('[rate-limit] shared store request failed', {
      source: 'rateLimit',
      metadata: { scope: getScope(key) },
      error,
    })
    return UNAVAILABLE_RESULT
  }

  if (hit.count > limit) {
    return {
      status: RATE_LIMIT_STATUS.BLOCKED,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil(hit.ttlMs / 1000)),
    }
  }

  return {
    status: RATE_LIMIT_STATUS.ALLOWED,
    remaining: limit - hit.count,
    retryAfterSeconds: 0,
  }
}
