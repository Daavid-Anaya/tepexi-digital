/**
 * Sanity CDN image URL transformer.
 *
 * Appends Sanity's image transformation params to any `cdn.sanity.io` URL so
 * the CDN returns an appropriately sized, modern-format image instead of the
 * raw original (which can be 4000–6000 px / 8–12 MB).
 *
 * Docs: https://www.sanity.io/docs/image-urls
 */

export interface SanityImgOptions {
  /** Target width in pixels */
  width?: number
  /** Target height in pixels */
  height?: number
  /** JPEG/WebP quality 1-100 (default 80) */
  quality?: number
  /**
   * Resize mode (default 'crop').
   * - 'crop'    → crop to exact dimensions
   * - 'fill'    → fill canvas with letterboxing
   * - 'fillmax' → like fill but never upscale
   * - 'max'     → fit inside box, no crop
   * - 'scale'   → scale to exact dimensions
   */
  fit?: 'crop' | 'fill' | 'fillmax' | 'max' | 'scale'
  /** Focal point for crops (default 'center') */
  crop?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'focalpoint' | 'entropy'
}

/**
 * Appends Sanity image transformation query params to a CDN URL.
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

// ─── Preset helpers for common use-cases ──────────────────────────────────────

/** Card thumbnail — 600×400, quality 75 */
export const sanityCardImg = (url: string | null | undefined) =>
  sanityImgUrl(url, { width: 600, height: 400, quality: 75 })

/** Hero image — 1920 wide, quality 80, no height constraint */
export const sanityHeroImg = (url: string | null | undefined) =>
  sanityImgUrl(url, { width: 1920, quality: 80, fit: 'max' })

/** Detail image — 1200 wide, quality 80 */
export const sanityDetailImg = (url: string | null | undefined) =>
  sanityImgUrl(url, { width: 1200, quality: 80, fit: 'max' })

/** Small thumbnail — 400×300, quality 70 */
export const sanityThumbImg = (url: string | null | undefined) =>
  sanityImgUrl(url, { width: 400, height: 300, quality: 70 })
