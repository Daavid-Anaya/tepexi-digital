import { isIP } from 'node:net'

/**
 * Devuelve la IP del cliente que establece el proxy de Vercel, o null cuando falta
 * o está mal formada.
 *
 * Vercel sobrescribe `x-forwarded-for` (y establece un `x-real-ip` idéntico)
 * con la IP pública del cliente para evitar suplantaciones, salvo que haya un
 * proxy de confianza Enterprise configurado. Ver
 * https://vercel.com/docs/headers/request-headers. Fuera de Vercel estos
 * headers los controla el cliente, así que quien llame no debe tratar el valor como una
 * identidad, solo como un bucket de rate limit.
 */
export function getClientIp(headers: Headers): string | null {
  const candidate =
    headers.get('x-real-ip')?.trim() || headers.get('x-forwarded-for')?.split(',')[0]?.trim()

  return candidate && isIP(candidate) ? candidate : null
}

/** Segmento de clave para solicitudes sin IP confiable; comparten un mismo bucket. */
export const UNKNOWN_CLIENT_IP = 'unknown'

const IPV6_HEXTETS = 8

// Convierte un lado de `::` en hextetos; una cola IPv4 embebida agrega dos.
function toHextets(part: string | undefined): number[] {
  if (!part) return []

  return part.split(':').flatMap((group) => {
    if (!group.includes('.')) return [Number.parseInt(group, 16)]
    const [a, b, c, d] = group.split('.').map(Number)
    return [(a << 8) | b, (c << 8) | d]
  })
}

// Expande una dirección IPv6 válida (comprimida, con una cola IPv4 embebida o un
// identificador de zona) en sus 8 hextetos numéricos.
function expandIpv6(address: string): number[] {
  const [head, tail] = address.split('%')[0].split('::')
  const headHextets = toHextets(head)
  const tailHextets = toHextets(tail)
  const zeros = Array<number>(IPV6_HEXTETS - headHextets.length - tailHextets.length).fill(0)

  return [...headHextets, ...zeros, ...tailHextets]
}

/**
 * Normaliza una IP a su bucket de rate limit.
 *
 * IPv4 conserva la dirección completa. IPv6 se agrupa por su prefijo /64, la
 * asignación habitual de un solo hogar o servidor, así que rotar direcciones dentro de él
 * no permite evadir los límites. Una IPv6 mapeada a IPv4 (`::ffff:a.b.c.d`) comparte el
 * bucket de su dirección IPv4.
 */
function toRateLimitBucket(ip: string): string {
  if (isIP(ip) !== 6) return ip

  const hextets = expandIpv6(ip)
  const isIpv4Mapped = hextets.slice(0, 5).every((hextet) => hextet === 0) && hextets[5] === 0xffff

  if (isIpv4Mapped) {
    const [high, low] = hextets.slice(6)
    return [high >> 8, high & 0xff, low >> 8, low & 0xff].join('.')
  }

  return `${hextets
    .slice(0, 4)
    .map((hextet) => hextet.toString(16))
    .join(':')}::/64`
}

/** Segmento de clave de rate limit del cliente: su IPv4, su IPv6 /64 o `unknown`. */
export function getClientIpBucket(headers: Headers): string {
  const ip = getClientIp(headers)
  return ip ? toRateLimitBucket(ip) : UNKNOWN_CLIENT_IP
}
