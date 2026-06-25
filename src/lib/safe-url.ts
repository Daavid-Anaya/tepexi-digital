const ALLOWED_PROTOCOLS = ['https:', 'http:', 'mailto:', 'tel:']

/**
 * Validates that a URL uses an allowed protocol.
 * Prevents javascript:, data:, vbscript: and other dangerous URI schemes
 * from being rendered in PortableText links.
 */
export function isSafeUrl(href: string | undefined): boolean {
  if (!href) return false
  try {
    const url = new URL(href, 'https://placeholder.invalid')
    return ALLOWED_PROTOCOLS.includes(url.protocol)
  } catch {
    return false
  }
}
