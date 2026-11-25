/**
 * Transformador de URLs de imágenes del CDN de Sanity.
 *
 * Agrega los parámetros de transformación de imágenes de Sanity a cualquier URL de `cdn.sanity.io`
 * para que el CDN devuelva una imagen del tamaño adecuado y en formato moderno en lugar del
 * original sin procesar (que puede medir 4000–6000 px / pesar 8–12 MB).
 *
 * Documentación: https://www.sanity.io/docs/image-urls
 */

export interface SanityImgOptions {
  /** Ancho objetivo en píxeles */
  width?: number
  /** Alto objetivo en píxeles */
  height?: number
  /** Calidad JPEG/WebP 1-100 (por defecto 80) */
  quality?: number
  /**
   * Modo de redimensionado (por defecto 'crop').
   * - 'crop'    → recorta a las dimensiones exactas
   * - 'fill'    → llena el lienzo con bandas (letterboxing)
   * - 'fillmax' → como fill, pero nunca amplía
   * - 'max'     → se ajusta dentro del recuadro, sin recortar
   * - 'scale'   → escala a las dimensiones exactas
   */
  fit?: 'crop' | 'fill' | 'fillmax' | 'max' | 'scale'
  /** Punto focal para recortes (por defecto 'center') */
  crop?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'focalpoint' | 'entropy'
}

/**
 * Agrega los parámetros de transformación de imágenes de Sanity a una URL del CDN.
 *
 * @example
 * sanityImgUrl(rawUrl, { width: 800, quality: 75 })
 * // → "https://cdn.sanity.io/.../photo.jpg?w=800&q=75&auto=format&fit=crop&crop=center"
 */
export function sanityImgUrl(
  url: string | null | undefined,
  options: SanityImgOptions = {},
): string {
  if (!url) return ''

  const { width, height, quality = 80, fit = 'crop', crop = 'center' } = options

  const params = new URLSearchParams()

  if (width) params.set('w', String(width))
  if (height) params.set('h', String(height))
  params.set('q', String(quality))
  params.set('auto', 'format')
  params.set('fit', fit)
  params.set('crop', crop)

  return `${url}?${params.toString()}`
}

// ─── Ajustes predefinidos para casos de uso comunes ──────────────────────────────────────

/** Miniatura de tarjeta — 600×400, calidad 75 */
export const sanityCardImg = (url: string | null | undefined) =>
  sanityImgUrl(url, { width: 600, height: 400, quality: 75 })

/** Imagen hero — 1920 de ancho, calidad 80, sin restricción de alto */
export const sanityHeroImg = (url: string | null | undefined) =>
  sanityImgUrl(url, { width: 1920, quality: 80, fit: 'max' })

/** Imagen de detalle — 1200 de ancho, calidad 80 */
export const sanityDetailImg = (url: string | null | undefined) =>
  sanityImgUrl(url, { width: 1200, quality: 80, fit: 'max' })

/** Miniatura pequeña — 400×300, calidad 70 */
export const sanityThumbImg = (url: string | null | undefined) =>
  sanityImgUrl(url, { width: 400, height: 300, quality: 70 })
