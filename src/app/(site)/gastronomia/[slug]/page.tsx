import type { Metadata } from 'next'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/react'
import { getGastronomiaBySlug } from '@/lib/data'
import { Container } from '@/components/ui/Container'
import {
  ArrowLeft,
  MapPin,
  Clock,
  Utensils,
  Map,
  Flame,
  Leaf,
  Users,
  Timer,
  CalendarDays,
  Globe,
} from 'lucide-react'
import DynamicImageCarousel from '@/components/gallery/DynamicImageCarousel'
import DynamicLeafletMap from '@/components/map/DynamicLeafletMap'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PRICE_RANGE_SYMBOLS: Record<string, number> = {
  bajo: 1,
  '$': 1,
  medio: 2,
  '$$': 2,
  alto: 3,
  '$$$': 3,
}

const DIFFICULTY_LABEL: Record<string, string> = {
  facil: 'Fácil',
  medio: 'Intermedio',
  avanzado: 'Avanzado',
}

const DIFFICULTY_FLAMES: Record<string, number> = {
  facil: 1,
  medio: 2,
  avanzado: 3,
}

const DISH_TYPE_LABELS: Record<string, string> = {
  'platillo-tipico': 'Platillo Típico',
  restaurante: 'Restaurante',
  mercado: 'Mercado',
  bebida: 'Bebida Regional',
  antojito: 'Antojito',
}

// ---------------------------------------------------------------------------
// Sub-components (all server-side — no client hooks)
// ---------------------------------------------------------------------------

function DividerOrnamental() {
  return (
    <div className="flex items-center gap-4 my-10">
      <div className="flex-1 h-px bg-stone/20" />
      <div className="flex items-center gap-1.5 text-accent opacity-60">
        <span className="text-xs">✦</span>
        <span className="text-xs">✦</span>
        <span className="text-xs">✦</span>
      </div>
      <div className="flex-1 h-px bg-stone/20" />
    </div>
  )
}

function DifficultyFlames({ difficulty }: { difficulty: string }) {
  const filled = DIFFICULTY_FLAMES[difficulty] ?? 1
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3].map((n) => (
        <Flame
          key={n}
          className="w-4 h-4"
          style={{ color: n <= filled ? '#BF360C' : '#d6ccc2', fill: n <= filled ? '#BF360C' : '#d6ccc2' }}
        />
      ))}
      <span className="ml-1.5 text-sm text-stone font-medium">{DIFFICULTY_LABEL[difficulty] ?? difficulty}</span>
    </div>
  )
}

function PriceSymbols({ priceRange }: { priceRange: string }) {
  const active = PRICE_RANGE_SYMBOLS[priceRange] ?? 1
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className="text-lg font-bold"
          style={{ color: n <= active ? '#BF360C' : '#d6ccc2' }}
        >
          $
        </span>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const item = await getGastronomiaBySlug(slug)
  if (!item) return { title: 'No encontrado' }
  return {
    title: item.seo?.metaTitle ?? item.title ?? 'Gastronomía',
    description: item.seo?.metaDescription ?? undefined,
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function GastronomiaDetailPage({ params }: Props) {
  const { slug } = await params
  const item = await getGastronomiaBySlug(slug)

  if (!item) {
    return (
      <Container className="py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <Utensils className="w-8 h-8 text-accent/40" />
        </div>
        <h1 className="font-heading font-semibold text-xl text-primary mb-2">Elemento no encontrado</h1>
        <p className="text-stone mb-6">No pudimos encontrar este lugar gastronómico.</p>
        <Link
          href="/gastronomia"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Gastronomía
        </Link>
      </Container>
    )
  }

  const images = (item.images ?? [])
    .map((img) => ({ url: img.url ?? img.asset?.url ?? '', alt: img.alt ?? item.title ?? '' }))
    .filter((img) => img.url)

  const heroImageUrl = images[0]?.url ?? null

  const markers = item.coordinates
    ? [
        {
          id: item._id,
          title: item.title ?? '',
          slug: item.slug?.current ?? slug,
          coordinates: { lat: item.coordinates.lat, lng: item.coordinates.lng },
          category: item.category ?? '',
          categoryColor: item.categoryColor ?? '#BF360C',
          type: 'gastronomia' as const,
        },
      ]
    : []

  const dishTypeLabel = item.dishType ? (DISH_TYPE_LABELS[item.dishType] ?? item.dishType) : null

  // Article metadata strip values
  const hasMagazineContent = !!(
    item.origin ||
    item.season ||
    item.preparationTime ||
    item.difficulty ||
    item.servings ||
    item.ingredients?.length ||
    item.pairings?.length ||
    item.history
  )

  return (
    <>
      {/* ================================================================ */}
      {/* 1. FULL-BLEED HERO — editorial magazine cover                    */}
      {/* ================================================================ */}
      <section className="relative min-h-[70vh] flex flex-col justify-end overflow-hidden bg-primary">
        {/* Background image */}
        {heroImageUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImageUrl})` }}
          />
        )}

        {/* Multi-layer gradient for depth and legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(30,14,8,0.25) 0%, rgba(30,14,8,0.1) 30%, rgba(30,14,8,0.75) 65%, rgba(30,14,8,0.97) 100%)',
          }}
        />

        {/* Warm terracotta top strip */}
        <div
          className="absolute top-0 inset-x-0 h-1"
          style={{ background: '#BF360C' }}
        />

        {/* Back link */}
        <div className="absolute top-6 left-0 right-0 z-20">
          <Container>
            <Link
              href="/gastronomia"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              Gastronomía
            </Link>
          </Container>
        </div>

        {/* Hero content */}
        <Container className="relative z-10 pb-10 pt-24">
          {/* Category + dish type */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {item.category && (
              <span
                className="inline-flex items-center gap-1.5 text-white text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full border border-white/30"
                style={{ background: 'rgba(191,54,12,0.75)', backdropFilter: 'blur(4px)' }}
              >
                <Utensils className="w-3 h-3" />
                {item.category}
              </span>
            )}
            {dishTypeLabel && (
              <span className="inline-flex items-center text-white/80 text-xs font-medium tracking-wide uppercase px-3 py-1 rounded-full border border-white/20">
                {dishTypeLabel}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-heading font-bold text-4xl md:text-6xl lg:text-7xl text-white leading-none mb-6 max-w-4xl">
            {item.title}
          </h1>

          {/* Origin + season meta */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-8">
            {item.origin && (
              <span className="flex items-center gap-2 text-white/70 text-sm">
                <Globe className="w-3.5 h-3.5 text-accent/80" />
                {item.origin}
              </span>
            )}
            {item.season && (
              <span className="flex items-center gap-2 text-white/70 text-sm">
                <CalendarDays className="w-3.5 h-3.5 text-accent/80" />
                Temporada: {item.season}
              </span>
            )}
            {item.address && (
              <span className="flex items-center gap-2 text-white/70 text-sm">
                <MapPin className="w-3.5 h-3.5 text-accent/80" />
                {item.address}
              </span>
            )}
          </div>

          {/* Pull quote — the soul of this dish, overlaid on the hero */}
          {item.quote && (
            <blockquote
              className="relative border-l-2 pl-6 max-w-2xl"
              style={{ borderColor: '#BF360C' }}
            >
              <p className="font-heading italic text-white/90 text-xl md:text-2xl leading-snug mb-2">
                &ldquo;{item.quote.text}&rdquo;
              </p>
              <footer className="text-white/50 text-xs tracking-widest uppercase">
                — {item.quote.author}
              </footer>
            </blockquote>
          )}
        </Container>
      </section>

      {/* ================================================================ */}
      {/* 2. ARTICLE LEAD — intro & description                            */}
      {/* ================================================================ */}
      <section className="py-14 bg-cream">
        <Container>
          <div className="max-w-3xl mx-auto">
            {/* Section label */}
            <p
              className="text-xs font-semibold tracking-[0.25em] uppercase mb-4"
              style={{ color: '#BF360C' }}
            >
              Gastronomía de la Mixteca
            </p>

            {/* Dish name as editorial lead-in */}
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary leading-tight mb-8">
              {item.title}
            </h2>

            {/* Dish type tags as elegant pills */}
            {item.dishType && (
              <div className="flex flex-wrap gap-2 mb-8">
                <span
                  className="inline-flex items-center gap-1.5 text-white text-xs font-semibold px-4 py-1.5 rounded-full"
                  style={{ background: '#BF360C' }}
                >
                  <Utensils className="w-3 h-3" />
                  {dishTypeLabel}
                </span>
                {item.season && (
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-1.5 rounded-full border"
                    style={{ color: '#BF360C', borderColor: '#BF360C30', background: '#BF360C0A' }}
                  >
                    <CalendarDays className="w-3 h-3" />
                    {item.season}
                  </span>
                )}
              </div>
            )}

            {/* Main description as magazine body text */}
            {item.description && (
              <div
                className="prose max-w-none"
                style={{
                  lineHeight: '1.9',
                  fontSize: '1.0625rem',
                  color: '#4a4a4a',
                }}
              >
                <PortableText value={item.description as PortableTextBlock[]} />
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* ================================================================ */}
      {/* 3. INGREDIENTS & PAIRINGS STRIP — warm terracotta band           */}
      {/* ================================================================ */}
      {(item.ingredients?.length || item.pairings?.length) && (
        <section className="py-14" style={{ background: '#FBF5F0' }}>
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
              {/* Ingredients */}
              {item.ingredients && item.ingredients.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: '#BF360C15' }}
                    >
                      <Leaf className="w-4 h-4" style={{ color: '#BF360C' }} />
                    </div>
                    <h3 className="font-heading font-semibold text-primary text-lg">
                      Ingredientes principales
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.ingredients.map((ingredient) => (
                      <span
                        key={ingredient}
                        className="text-sm font-medium px-3 py-1.5 rounded-full border"
                        style={{
                          color: '#5a2e0c',
                          background: '#FFF8F5',
                          borderColor: '#BF360C25',
                        }}
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pairings */}
              {item.pairings && item.pairings.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: '#2E7D3215' }}
                    >
                      <Utensils className="w-4 h-4" style={{ color: '#2E7D32' }} />
                    </div>
                    <h3 className="font-heading font-semibold text-primary text-lg">
                      Maridaje &amp; Acompañamientos
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.pairings.map((pairing) => (
                      <span
                        key={pairing}
                        className="text-sm font-medium px-3 py-1.5 rounded-full border"
                        style={{
                          color: '#1a4a1c',
                          background: '#F5FBF5',
                          borderColor: '#2E7D3225',
                        }}
                      >
                        {pairing}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* ================================================================ */}
      {/* 4. MAIN CONTENT — two-column editorial layout                    */}
      {/* ================================================================ */}
      <section className="py-14 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* ------- LEFT: main editorial content ------- */}
            <div className="lg:col-span-2 space-y-14">

              {/* Featured Dishes Gallery */}
              {item.featuredDishes && item.featuredDishes.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span
                      className="w-0.5 h-6 rounded-full inline-block"
                      style={{ background: '#BF360C' }}
                    />
                    <h2 className="font-heading font-bold text-primary text-2xl">
                      Platillos destacados
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {item.featuredDishes.map((dish, i) => (
                      <div
                        key={i}
                        className="rounded-xl overflow-hidden border"
                        style={{ borderColor: '#E8DDD5' }}
                      >
                        {/* Image or warm placeholder */}
                        {dish.imageUrl ? (
                          <div
                            className="h-44 bg-cover bg-center"
                            style={{ backgroundImage: `url(${dish.imageUrl})` }}
                          />
                        ) : (
                          <div
                            className="h-36 flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #FBF5F0 0%, #F5EAE0 100%)' }}
                          >
                            <Utensils className="w-8 h-8" style={{ color: '#BF360C40' }} />
                          </div>
                        )}

                        <div className="p-4" style={{ background: '#FDFAF8' }}>
                          <h3 className="font-heading font-semibold text-primary text-base mb-1">
                            {dish.name}
                          </h3>
                          {dish.description && (
                            <p className="text-sm leading-relaxed" style={{ color: '#6b5b4e' }}>
                              {dish.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* History / Cultural Context */}
              {item.history && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span
                      className="w-0.5 h-6 rounded-full inline-block"
                      style={{ background: '#BF360C' }}
                    />
                    <h2 className="font-heading font-bold text-primary text-2xl">
                      Historia y contexto cultural
                    </h2>
                  </div>

                  {/* Large decorative opening quote mark */}
                  <div className="relative">
                    <span
                      className="absolute -top-8 -left-3 font-heading text-8xl leading-none select-none pointer-events-none"
                      style={{ color: '#BF360C12' }}
                      aria-hidden="true"
                    >
                      &ldquo;
                    </span>
                    <div
                      className="relative prose max-w-none"
                      style={{
                        lineHeight: '1.9',
                        fontSize: '1.0625rem',
                        color: '#4a4a4a',
                      }}
                    >
                      <PortableText value={item.history as PortableTextBlock[]} />
                    </div>
                  </div>
                </div>
              )}

              {/* Image Gallery */}
              {images.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span
                      className="w-0.5 h-6 rounded-full inline-block"
                      style={{ background: '#BF360C' }}
                    />
                    <h2 className="font-heading font-bold text-primary text-2xl">
                      Galería
                    </h2>
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-md border" style={{ borderColor: '#E8DDD5' }}>
                    <DynamicImageCarousel images={images} />
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {item.recommendations && (
                <div
                  className="rounded-2xl p-6 border-l-4"
                  style={{ background: '#FFF8F5', borderLeftColor: '#BF360C' }}
                >
                  <p
                    className="text-xs font-semibold tracking-widest uppercase mb-3"
                    style={{ color: '#BF360C' }}
                  >
                    Recomendaciones del experto
                  </p>
                  <div className="prose max-w-none text-stone leading-relaxed">
                    <PortableText value={item.recommendations as PortableTextBlock[]} />
                  </div>
                </div>
              )}

            </div>

            {/* ------- RIGHT: sidebar ------- */}
            <aside className="space-y-5">

              {/* Recipe Quick Facts Card */}
              {hasMagazineContent && (
                <div
                  className="rounded-2xl overflow-hidden shadow-sm border"
                  style={{ borderColor: '#E8DDD5' }}
                >
                  {/* Card header */}
                  <div
                    className="px-5 py-4"
                    style={{ background: '#BF360C' }}
                  >
                    <h2 className="font-heading font-semibold text-white text-sm tracking-widest uppercase">
                      Ficha del platillo
                    </h2>
                  </div>

                  <div className="p-5 space-y-5" style={{ background: '#FDFAF8' }}>
                    {/* Difficulty */}
                    {item.difficulty && (
                      <div className="flex items-start gap-3">
                        <div
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
                          style={{ background: '#BF360C15' }}
                        >
                          <Flame className="w-4 h-4" style={{ color: '#BF360C' }} />
                        </div>
                        <div>
                          <dt
                            className="text-[11px] uppercase tracking-widest font-semibold mb-1"
                            style={{ color: '#9e7b6b' }}
                          >
                            Dificultad
                          </dt>
                          <DifficultyFlames difficulty={item.difficulty} />
                        </div>
                      </div>
                    )}

                    {/* Prep time */}
                    {item.preparationTime && (
                      <div className="flex items-start gap-3">
                        <div
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
                          style={{ background: '#BF360C15' }}
                        >
                          <Timer className="w-4 h-4" style={{ color: '#BF360C' }} />
                        </div>
                        <div>
                          <dt
                            className="text-[11px] uppercase tracking-widest font-semibold mb-0.5"
                            style={{ color: '#9e7b6b' }}
                          >
                            Preparación
                          </dt>
                          <dd className="text-sm font-medium text-primary">{item.preparationTime}</dd>
                        </div>
                      </div>
                    )}

                    {/* Servings */}
                    {item.servings && (
                      <div className="flex items-start gap-3">
                        <div
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
                          style={{ background: '#BF360C15' }}
                        >
                          <Users className="w-4 h-4" style={{ color: '#BF360C' }} />
                        </div>
                        <div>
                          <dt
                            className="text-[11px] uppercase tracking-widest font-semibold mb-0.5"
                            style={{ color: '#9e7b6b' }}
                          >
                            Porciones
                          </dt>
                          <dd className="text-sm font-medium text-primary">{item.servings}</dd>
                        </div>
                      </div>
                    )}

                    {/* Season */}
                    {item.season && (
                      <div className="flex items-start gap-3">
                        <div
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
                          style={{ background: '#BF360C15' }}
                        >
                          <CalendarDays className="w-4 h-4" style={{ color: '#BF360C' }} />
                        </div>
                        <div>
                          <dt
                            className="text-[11px] uppercase tracking-widest font-semibold mb-0.5"
                            style={{ color: '#9e7b6b' }}
                          >
                            Temporada
                          </dt>
                          <dd className="text-sm font-medium text-primary">{item.season}</dd>
                        </div>
                      </div>
                    )}

                    {/* Price range */}
                    {item.priceRange && (
                      <div className="flex items-start gap-3">
                        <div
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
                          style={{ background: '#BF360C15' }}
                        >
                          <span className="text-sm font-bold" style={{ color: '#BF360C' }}>$</span>
                        </div>
                        <div>
                          <dt
                            className="text-[11px] uppercase tracking-widest font-semibold mb-0.5"
                            style={{ color: '#9e7b6b' }}
                          >
                            Rango de precios
                          </dt>
                          <PriceSymbols priceRange={item.priceRange} />
                        </div>
                      </div>
                    )}

                    {/* Origin */}
                    {item.origin && (
                      <div className="flex items-start gap-3">
                        <div
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
                          style={{ background: '#BF360C15' }}
                        >
                          <Globe className="w-4 h-4" style={{ color: '#BF360C' }} />
                        </div>
                        <div>
                          <dt
                            className="text-[11px] uppercase tracking-widest font-semibold mb-0.5"
                            style={{ color: '#9e7b6b' }}
                          >
                            Origen
                          </dt>
                          <dd className="text-sm font-medium text-primary">{item.origin}</dd>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Practical Info Card */}
              {(item.schedule || item.cost || item.address) && (
                <div
                  className="rounded-2xl overflow-hidden shadow-sm border"
                  style={{ borderColor: '#E8DDD5' }}
                >
                  <div
                    className="px-5 py-4 border-b"
                    style={{ background: '#FDFAF8', borderColor: '#E8DDD5' }}
                  >
                    <h2 className="font-heading font-semibold text-primary text-sm tracking-widest uppercase">
                      Información práctica
                    </h2>
                  </div>

                  <div className="p-5 space-y-5" style={{ background: '#FFFFFF' }}>
                    {item.schedule && (
                      <div className="flex gap-3">
                        <div
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: '#BF360C15' }}
                        >
                          <Clock className="w-4 h-4" style={{ color: '#BF360C' }} />
                        </div>
                        <div>
                          <dt
                            className="text-[11px] uppercase tracking-widest font-semibold mb-0.5"
                            style={{ color: '#9e7b6b' }}
                          >
                            Horario
                          </dt>
                          <dd className="text-sm text-stone leading-snug">{item.schedule}</dd>
                        </div>
                      </div>
                    )}

                    {item.cost && (
                      <div className="flex gap-3">
                        <div
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: '#BF360C15' }}
                        >
                          <span className="text-sm font-bold" style={{ color: '#BF360C' }}>$</span>
                        </div>
                        <div>
                          <dt
                            className="text-[11px] uppercase tracking-widest font-semibold mb-0.5"
                            style={{ color: '#9e7b6b' }}
                          >
                            Precio aproximado
                          </dt>
                          <dd className="text-sm text-stone leading-snug">{item.cost}</dd>
                        </div>
                      </div>
                    )}

                    {item.address && (
                      <div className="flex gap-3">
                        <div
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: '#BF360C15' }}
                        >
                          <MapPin className="w-4 h-4" style={{ color: '#BF360C' }} />
                        </div>
                        <div>
                          <dt
                            className="text-[11px] uppercase tracking-widest font-semibold mb-0.5"
                            style={{ color: '#9e7b6b' }}
                          >
                            Dirección
                          </dt>
                          <dd className="text-sm text-stone leading-snug">{item.address}</dd>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Standalone quote card (if no hero quote was shown above fold) */}
              {item.quote && !heroImageUrl && (
                <figure
                  className="rounded-2xl p-6 border"
                  style={{ background: '#FBF5F0', borderColor: '#E8DDD5' }}
                >
                  <span
                    className="block font-heading text-5xl leading-none mb-3"
                    style={{ color: '#BF360C40' }}
                    aria-hidden="true"
                  >
                    &ldquo;
                  </span>
                  <blockquote
                    className="font-heading italic text-primary text-base leading-relaxed mb-3"
                  >
                    {item.quote.text}
                  </blockquote>
                  <figcaption
                    className="text-xs tracking-widest uppercase font-medium"
                    style={{ color: '#BF360C' }}
                  >
                    — {item.quote.author}
                  </figcaption>
                </figure>
              )}
            </aside>
          </div>

          {/* Map */}
          {markers.length > 0 && (
            <>
              <DividerOrnamental />
              <div
                className="rounded-2xl border overflow-hidden shadow-sm"
                style={{ borderColor: '#E8DDD5' }}
              >
                <div
                  className="flex items-center gap-3 px-6 py-4 border-b"
                  style={{ background: '#FDFAF8', borderColor: '#E8DDD5' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: '#BF360C15' }}
                  >
                    <Map className="w-4 h-4" style={{ color: '#BF360C' }} />
                  </div>
                  <h2 className="font-heading font-semibold text-primary text-lg">Ubicación</h2>
                </div>
                <DynamicLeafletMap markers={markers} center={markers[0].coordinates} zoom={16} />
              </div>
            </>
          )}
        </Container>
      </section>
    </>
  )
}
