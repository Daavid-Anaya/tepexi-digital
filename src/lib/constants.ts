// ─── Site identity ────────────────────────────────────────────────────────────
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tepexidigital.com.mx'

// ─── Sanity CDN ───────────────────────────────────────────────────────────────
const SANITY_PROJECT_ID =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '45s7lmkb'
const SANITY_DATASET =
  process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'

export const SANITY_CDN_BASE = `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}`

// F-07: Hero fallbacks use Sanity CDN transformation params (w=1920, quality=80)
// to avoid serving raw originals of up to 8–12 MB.
const heroParams = '?w=1920&q=80&auto=format&fit=max'

export const HERO_FALLBACKS = {
  lugares: `${SANITY_CDN_BASE}/737c94162af932675cbb7eaddf8d63e379404009-1920x1440.jpg${heroParams}`,
  gastronomia: `${SANITY_CDN_BASE}/04919ba0ea9ad85fd4f46aea35d7c3a513f4becb-4104x2736.jpg${heroParams}`,
  servicios: `${SANITY_CDN_BASE}/fd162108faf44809f73b46edd219740140a8c42c-5472x3648.jpg${heroParams}`,
  agenda: `${SANITY_CDN_BASE}/1207eeb4636baf3a09b4a926173eb07861f3693e-1920x1280.jpg${heroParams}`,
  mapa: `${SANITY_CDN_BASE}/5770b9cad7f1ad28b453a3ccc9390e4e8962fa25-4928x3264.jpg${heroParams}`,
  comoLlegar: `${SANITY_CDN_BASE}/97ba498893be9fef6e66f00e11b7fe6c19a023d0-4452x2968.jpg${heroParams}`,
  contacto: `${SANITY_CDN_BASE}/c792c5f25303c69523311963917babcf56c4c131-3008x2000.jpg${heroParams}`,
  cultura: `${SANITY_CDN_BASE}/7a5100ea170bd307785b455ecfb340bf96036b54-6000x4000.jpg${heroParams}`,
} as const

// ─── Map ──────────────────────────────────────────────────────────────────────
export const TEPEXI_CENTER = { lat: 18.5793, lng: -97.9218 } as const

// ─── Category colors ──────────────────────────────────────────────────────────
export const CATEGORY_COLORS = {
  default: '#8B4513',
  servicios: '#37474F',
  cultura: '#7B3FA0',
} as const
