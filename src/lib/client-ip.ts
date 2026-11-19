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
