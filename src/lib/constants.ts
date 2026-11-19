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
  lugares: `${SANITY_CDN_BASE}/459d7c29407878b33d5137a6bbd245cb8645f967-1920x1440.webp${heroParams}`,
  gastronomia: `${SANITY_CDN_BASE}/812be96591fbc57940fbce986ee7faa6da00ef56-1920x1280.webp${heroParams}`,
  servicios: `${SANITY_CDN_BASE}/d64d9048b382622d1a2a7df6f29587ac70daa63e-1920x1280.webp${heroParams}`,
  agenda: `${SANITY_CDN_BASE}/8b89bc73f2f426b32ca276c8b2dcea74af1cca4b-1920x1280.webp${heroParams}`,
  mapa: `${SANITY_CDN_BASE}/171da5d6eb0a5d80ed13cbdd5d44720cc5e2852a-1920x1272.webp${heroParams}`,
  comoLlegar: `${SANITY_CDN_BASE}/79946c2cf58948eb96dafd50525f0b35a7a854ae-1920x1280.webp${heroParams}`,
  contacto: `${SANITY_CDN_BASE}/2bb226376850fd330f7187843aeaa1dd66b13e00-1920x1277.webp${heroParams}`,
  cultura: `${SANITY_CDN_BASE}/5bfb9c77b342b07e76197db8835de91b905cdcf7-1920x1280.webp${heroParams}`,
} as const

export const HOME_PREVIEW_LIMITS = {
  FEATURED_LUGARES: 4,
  LATEST_GASTRONOMIA: 3,
  UPCOMING_EVENTOS: 3,
} as const

export const SANITY_FETCH_LIMITS = {
  UPCOMING_EVENTOS: 50,
} as const

// ─── Form and rate limits ─────────────────────────────────────────────────────
export const CONTACT_FIELD_LIMITS = {
  NAME: 100,
  EMAIL: 254,
  SUBJECT: 200,
  MESSAGE: 5000,
} as const

export const RATE_LIMITS = {
  CONTACT: { limit: 5, windowSeconds: 900 },
  REVALIDATE: { limit: 30, windowSeconds: 60 },
} as const

// ─── Map ──────────────────────────────────────────────────────────────────────
export const TEPEXI_CENTER = { lat: 18.5793, lng: -97.9218 } as const

// ─── Category colors ──────────────────────────────────────────────────────────
export const CATEGORY_COLORS = {
  default: '#8B4513',
  servicios: '#37474F',
  cultura: '#7B3FA0',
} as const
