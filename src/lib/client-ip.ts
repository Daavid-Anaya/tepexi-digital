import { isIP } from 'node:net'

/**
 * Returns the client IP set by the Vercel proxy, or null when it is missing
 * or malformed.
 *
 * Vercel overwrites `x-forwarded-for` (and sets the identical `x-real-ip`)
 * with the client's public IP to prevent spoofing, unless an Enterprise
 * trusted proxy is configured. See
 * https://vercel.com/docs/headers/request-headers. Outside Vercel these
 * headers are client-controlled, so callers must not treat the value as an
 * identity, only as a rate limit bucket.
 */
export function getClientIp(headers: Headers): string | null {
  const candidate =
    headers.get('x-real-ip')?.trim() || headers.get('x-forwarded-for')?.split(',')[0]?.trim()

  return candidate && isIP(candidate) ? candidate : null
}

/** Key segment for requests without a trusted IP; they share one bucket. */
export const UNKNOWN_CLIENT_IP = 'unknown'

const IPV6_HEXTETS = 8

// Converts one side of `::` into hextets; an embedded IPv4 tail adds two.
function toHextets(part: string | undefined): number[] {
  if (!part) return []

  return part.split(':').flatMap((group) => {
    if (!group.includes('.')) return [Number.parseInt(group, 16)]
    const [a, b, c, d] = group.split('.').map(Number)
    return [(a << 8) | b, (c << 8) | d]
  })
}

// Expands a valid IPv6 address (compressed, with an embedded IPv4 tail or a
// zone identifier) into its 8 numeric hextets.
function expandIpv6(address: string): number[] {
  const [head, tail] = address.split('%')[0].split('::')
  const headHextets = toHextets(head)
  const tailHextets = toHextets(tail)
  const zeros = Array<number>(IPV6_HEXTETS - headHextets.length - tailHextets.length).fill(0)

  return [...headHextets, ...zeros, ...tailHextets]
}

/**
 * Normalizes an IP into its rate limit bucket.
 *
 * IPv4 keeps the full address. IPv6 is grouped by its /64 prefix, the usual
 * allocation for a single home or server, so rotating addresses inside it
 * cannot bypass the limits. IPv4-mapped IPv6 (`::ffff:a.b.c.d`) shares the
 * bucket of its IPv4 address.
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

/** Rate limit key segment for the client: its IPv4, IPv6 /64, or `unknown`. */
export function getClientIpBucket(headers: Headers): string {
  const ip = getClientIp(headers)
  return ip ? toRateLimitBucket(ip) : UNKNOWN_CLIENT_IP
}
