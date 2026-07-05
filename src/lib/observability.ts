const LOG_LEVEL = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const

const LOG_RUNTIME = {
  CLIENT: 'client',
  SERVER: 'server',
} as const

type LogLevel = (typeof LOG_LEVEL)[keyof typeof LOG_LEVEL]
type LogRuntime = (typeof LOG_RUNTIME)[keyof typeof LOG_RUNTIME]

type SerializableValue = string | number | boolean | null | SerializableObject | SerializableValue[]

interface SerializableObject {
  [key: string]: SerializableValue
}

interface ErrorDetails {
  digest?: string | null
  message: string
  name?: string
}

interface StructuredLogContext {
  error?: ErrorDetails
  metadata?: SerializableObject
  route?: string
  runtime: LogRuntime
  source: string
  statusCode?: number
  timestamp: string
}

interface LogOptions {
  error?: unknown
  metadata?: Record<string, unknown>
  route?: string
  source: string
  statusCode?: number
}

function getRuntime(): LogRuntime {
  return typeof window === 'undefined' ? LOG_RUNTIME.SERVER : LOG_RUNTIME.CLIENT
}

function normalizeValue(value: unknown): SerializableValue {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (value instanceof Error) {
    const normalizedError = summarizeError(value)

    return {
      ...(normalizedError.digest !== undefined ? { digest: normalizedError.digest } : {}),
      message: normalizedError.message,
      ...(normalizedError.name ? { name: normalizedError.name } : {}),
    }
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item))
  }

  if (typeof value === 'object' && value !== null) {
    return normalizeRecord(value as Record<string, unknown>)
  }

  return String(value)
}

function normalizeRecord(value: Record<string, unknown>): SerializableObject {
  const result: SerializableObject = {}

  for (const [key, nestedValue] of Object.entries(value)) {
    if (nestedValue === undefined) {
      continue
    }

    result[key] = normalizeValue(nestedValue)
  }

  return result
}

function summarizeError(error: unknown): ErrorDetails {
  if (error instanceof Error) {
    const digest = 'digest' in error && typeof error.digest === 'string' ? error.digest : null

    return {
      digest,
      message: error.message,
      name: error.name,
    }
  }

  if (typeof error === 'object' && error !== null) {
    const errorRecord = error as Record<string, unknown>
    const message = typeof errorRecord.message === 'string' ? errorRecord.message : 'Unknown error'
    const name = typeof errorRecord.name === 'string' ? errorRecord.name : undefined
    const digest = typeof errorRecord.digest === 'string' ? errorRecord.digest : null

    return {
      digest,
      message,
      name,
    }
  }

  return {
    digest: null,
    message: typeof error === 'string' ? error : 'Unknown error',
  }
}

function createContext(options: LogOptions): StructuredLogContext {
  return {
    source: options.source,
    runtime: getRuntime(),
    timestamp: new Date().toISOString(),
    ...(options.route ? { route: options.route } : {}),
    ...(typeof options.statusCode === 'number' ? { statusCode: options.statusCode } : {}),
    ...(options.metadata ? { metadata: normalizeValue(options.metadata) as SerializableObject } : {}),
    ...(options.error !== undefined ? { error: summarizeError(options.error) } : {}),
  }
}

function writeLog(level: LogLevel, message: string, options: LogOptions): void {
  const context = createContext(options)

  if (level === LOG_LEVEL.ERROR) {
    console.error(message, context)
    return
  }

  if (level === LOG_LEVEL.WARN) {
    console.warn(message, context)
    return
  }

  console.info(message, context)
}

export function logInfo(message: string, options: LogOptions): void {
  writeLog(LOG_LEVEL.INFO, message, options)
}

export function logWarn(message: string, options: LogOptions): void {
  writeLog(LOG_LEVEL.WARN, message, options)
}

export function logError(message: string, options: LogOptions): void {
  writeLog(LOG_LEVEL.ERROR, message, options)
}
