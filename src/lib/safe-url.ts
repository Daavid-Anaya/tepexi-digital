const ALLOWED_PROTOCOLS = ['https:', 'http:', 'mailto:', 'tel:']

/**
 * Valida que una URL use un protocolo permitido.
 * Evita que javascript:, data:, vbscript: y otros esquemas URI peligrosos
 * se rendericen en enlaces de PortableText.
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
