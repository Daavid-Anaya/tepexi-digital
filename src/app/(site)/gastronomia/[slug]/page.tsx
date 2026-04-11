import type { Metadata } from 'next'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/react'
import { getGastronomiaBySlug } from '@/lib/data'
import { Container } from '@/components/ui/Container'
import {
  ArrowLeft,
  Utensils,
  Flame,
  Leaf,
  Users,
  Timer,
  CalendarDays,
  Globe,
  CircleDot,
  Clock,
} from 'lucide-react'
import DynamicImageCarousel from '@/components/gallery/DynamicImageCarousel'

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

function IngredientIcon({ icon }: { icon: string | null }) {
  if (icon === 'utensils') return <Utensils className="w-5 h-5" style={{ color: '#BF360C' }} />
  if (icon === 'flame') return <Flame className="w-5 h-5" style={{ color: '#BF360C' }} />
  if (icon === 'leaf') return <Leaf className="w-5 h-5" style={{ color: '#BF360C' }} />
  if (icon === 'grain') return <CircleDot className="w-5 h-5" style={{ color: '#BF360C' }} />
  return <Utensils className="w-5 h-5" style={{ color: '#BF360C' }} />
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

  const dishTypeLabel = item.dishType ? (DISH_TYPE_LABELS[item.dishType] ?? item.dishType) : null

  // Article metadata strip values
  const hasMagazineContent = !!(
    item.origin ||
    item.season ||
    item.preparationTime ||
    item.difficulty ||
    item.servings
  )

  const hasKeyIngredients = !!(item.keyIngredients && item.keyIngredients.length > 0)
  const hasPreparationSteps = !!(item.preparationSteps && item.preparationSteps.length > 0)

  return (
    <>
      {/* ================================================================ */}
      {/* 1. HERO — solid background, same pattern as /lugares/[slug]       */}
      {/* ================================================================ */}
      <section className="relative overflow-hidden bg-primary py-14">
        {/* Decorative circles */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-primary-light" />
          <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full bg-primary-dark" />
        </div>

        <Container className="relative">
          {/* Back navigation */}
          <Link
            href="/gastronomia"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Volver a Gastronomía
          </Link>

          {/* Category + dish type badges */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {item.category && (
              <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/25">
                <Utensils className="w-3 h-3" />
                {item.category}
              </span>
            )}
            {dishTypeLabel && (
              <span className="inline-flex items-center bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/25">
                {dishTypeLabel}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-heading font-bold text-3xl md:text-5xl text-white leading-tight mb-3">
            {item.title}
          </h1>

          {/* Origin + season meta */}
          {(item.origin || item.season) && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3">
              {item.origin && (
                <p className="flex items-center gap-2 text-white/70 text-sm">
                  <Globe className="w-4 h-4 flex-shrink-0" />
                  <span>{item.origin}</span>
                </p>
              )}
              {item.season && (
                <p className="flex items-center gap-2 text-white/70 text-sm">
                  <CalendarDays className="w-4 h-4 flex-shrink-0" />
                  <span>Temporada: {item.season}</span>
                </p>
              )}
            </div>
          )}
        </Container>
      </section>

      {/* ================================================================ */}
      {/* 2. ARTICLE LEAD — intro & description (two-column with image)    */}
      {/* ================================================================ */}
      <section className="py-14 bg-cream">
        <Container>
          <div className={item.descriptionImage ? 'grid grid-cols-1 lg:grid-cols-2 gap-12 items-start' : ''}>
            {/* Left column: description content */}
            <div className={item.descriptionImage ? '' : 'max-w-3xl mx-auto'}>
              {/* Section label */}
              <p
                className="text-xs font-semibold tracking-[0.25em] uppercase mb-4"
                style={{ color: '#BF360C' }}
              >
                Gastronomía de la Mixteca
              </p>

              {/* Dish name as editorial lead-in */}
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary leading-tight mb-8">
                Historia y contexto cultural
              </h2>

              {/* Introduction — shown before description */}
              {item.introduction && (
                <div
                  className="prose max-w-none mb-8"
                  style={{
                    lineHeight: '1.9',
                    fontSize: '1.0925rem',
                    color: '#3a3a3a',
                    fontWeight: 500,
                  }}
                >
                  <PortableText value={item.introduction as PortableTextBlock[]} />
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

            {/* Right column: description image (only if present) */}
            {item.descriptionImage && (
              <div className="relative">
                <div className="w-full rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={item.descriptionImage.url}
                    alt={item.descriptionImage.alt ?? item.title ?? ''}
                    className="w-full h-auto rounded-2xl object-cover"
                  />
                </div>
                {/* Decorative terracotta accent */}
                <div
                  className="absolute -bottom-3 -right-3 w-24 h-24 rounded-xl -z-10"
                  style={{ background: '#BF360C15' }}
                />
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* ================================================================ */}
      {/* 3. INGREDIENTES CLAVE — editorial ingredient grid                */}
      {/* ================================================================ */}
      {hasKeyIngredients && (
        <section className="py-16" style={{ background: '#FBF5F0' }}>
          <Container>
            {/* Section header */}
            <div className="flex items-center gap-3 mb-10">
              <span
                className="w-1 h-8 rounded-full inline-block"
                style={{ background: '#BF360C' }}
              />
              <h2 className="font-heading font-bold text-primary text-2xl md:text-3xl">
                Ingredientes Clave
              </h2>
            </div>

            {/* Grid: mobile=1col, md=2col, lg=4col */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1 — spans 2 cols, large with icon + title + description */}
              {item.keyIngredients![0] && (
                <div
                  className="group lg:col-span-2 rounded-xl p-6 border flex flex-col gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                  style={{ background: '#FFFFFF', borderColor: '#E8DDD5' }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:bg-accent/25 transition-colors duration-300"
                    style={{ background: '#BF360C10' }}
                  >
                    <IngredientIcon icon={item.keyIngredients![0].icon} />
                  </div>
                  {item.keyIngredients![0].name && (
                    <h3 className="font-heading font-bold text-primary text-xl">
                      {item.keyIngredients![0].name}
                    </h3>
                  )}
                  {item.keyIngredients![0].description && (
                    <p className="text-sm leading-relaxed" style={{ color: '#6b5b4e' }}>
                      {item.keyIngredients![0].description}
                    </p>
                  )}
                </div>
              )}

              {/* Card 2 — 1 col square, icon centered + title + subtitle */}
              {item.keyIngredients![1] && (
                <div
                  className="group rounded-xl p-6 border flex flex-col items-center justify-center gap-3 text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                  style={{ background: '#FFFFFF', borderColor: '#E8DDD5', minHeight: '160px' }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-accent/25 transition-colors duration-300"
                    style={{ background: '#BF360C10' }}
                  >
                    <IngredientIcon icon={item.keyIngredients![1].icon} />
                  </div>
                  {item.keyIngredients![1].name && (
                    <h3 className="font-heading font-semibold text-primary text-base">
                      {item.keyIngredients![1].name}
                    </h3>
                  )}
                  {item.keyIngredients![1].description && (
                    <p
                      className="text-xs font-medium tracking-widest uppercase"
                      style={{ color: '#9e7b6b' }}
                    >
                      {item.keyIngredients![1].description}
                    </p>
                  )}
                </div>
              )}

              {/* Card 3 — 1 col square, small flame icon + title + subtitle */}
              {item.keyIngredients![2] && (
                <div
                  className="group rounded-xl p-6 border flex flex-col items-center justify-center gap-3 text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                  style={{ background: '#FFFFFF', borderColor: '#E8DDD5', minHeight: '160px' }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-accent/25 transition-colors duration-300"
                    style={{ background: '#BF360C10' }}
                  >
                    <IngredientIcon icon={item.keyIngredients![2].icon} />
                  </div>
                  {item.keyIngredients![2].name && (
                    <h3 className="font-heading font-semibold text-primary text-base">
                      {item.keyIngredients![2].name}
                    </h3>
                  )}
                  {item.keyIngredients![2].description && (
                    <p
                      className="text-xs font-medium tracking-widest uppercase"
                      style={{ color: '#9e7b6b' }}
                    >
                      {item.keyIngredients![2].description}
                    </p>
                  )}
                </div>
              )}

              {/* Card 4 — spans 2 cols, full image */}
              {item.keyIngredients![3] && (
                <div
                  className="group lg:col-span-2 rounded-xl overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                  style={{ minHeight: '200px' }}
                >
                  {item.keyIngredients![3].imageUrl ? (
                    <img
                      src={item.keyIngredients![3].imageUrl}
                      alt={item.keyIngredients![3].name ?? 'Ingrediente'}
                      className="w-full h-full object-cover"
                      style={{ minHeight: '200px' }}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #FBF5F0 0%, #F5EAE0 100%)',
                        minHeight: '200px',
                      }}
                    >
                      <Utensils className="w-10 h-10" style={{ color: '#BF360C30' }} />
                    </div>
                  )}
                </div>
              )}

              {/* Card 5 — spans 2 cols, leaf icon + title + description, text left */}
              {item.keyIngredients![4] && (
                <div
                  className="group lg:col-span-2 rounded-xl p-6 border flex flex-col gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                  style={{ background: '#FFFFFF', borderColor: '#E8DDD5' }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:bg-accent/25 transition-colors duration-300"
                    style={{ background: '#BF360C10' }}
                  >
                    <IngredientIcon icon={item.keyIngredients![4].icon} />
                  </div>
                  {item.keyIngredients![4].name && (
                    <h3 className="font-heading font-bold text-primary text-xl">
                      {item.keyIngredients![4].name}
                    </h3>
                  )}
                  {item.keyIngredients![4].description && (
                    <p className="text-sm leading-relaxed" style={{ color: '#6b5b4e' }}>
                      {item.keyIngredients![4].description}
                    </p>
                  )}
                </div>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* ================================================================ */}
      {/* 4. PROCESO DE PREPARACIÓN — alternating vertical timeline        */}
      {/* ================================================================ */}
      {hasPreparationSteps && (
        <section className="py-16 bg-white">
          <Container>
            {/* Section header */}
            <div className="flex items-center gap-3 mb-12">
              <span
                className="w-1 h-8 rounded-full inline-block"
                style={{ background: '#BF360C' }}
              />
              <h2 className="font-heading font-bold text-primary text-2xl md:text-3xl">
                Proceso de Preparación
              </h2>
            </div>

            {/* Timeline — alternating left/right on desktop, stacked on mobile */}
            <div className="relative max-w-6xl mx-auto">
              {/* Central vertical line (desktop only) */}
              <div
                className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
                style={{ background: '#BF360C20' }}
              />

              {item.preparationSteps!.map((step, index) => {
                const isLeft = index % 2 === 0
                return (
                  <div key={index} className="relative mb-12 last:mb-0">
                    {/* Step circle — centered on the line (desktop), left-aligned (mobile) */}
                    <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 z-10">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-white text-sm shadow-md"
                        style={{ background: '#BF360C' }}
                      >
                        {index + 1}
                      </div>
                    </div>

                    {/* Content card — alternates sides on desktop */}
                    <div
                      className={[
                        'ml-14 md:ml-0 md:w-[calc(50%-2rem)]',
                        isLeft ? 'md:mr-auto md:pr-4' : 'md:ml-auto md:pl-4',
                      ].join(' ')}
                    >
                      <div
                        className="rounded-xl p-5 border hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                        style={{ background: '#FDFAF8', borderColor: '#E8DDD5' }}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <h3 className="font-heading font-bold text-primary text-lg leading-snug">
                            {step.title}
                          </h3>
                          {step.duration && (
                            <span
                              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border flex-shrink-0"
                              style={{ color: '#BF360C', borderColor: '#BF360C30', background: '#BF360C08' }}
                            >
                              <Clock className="w-3 h-3" />
                              {step.duration}
                            </span>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: '#6b5b4e' }}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Container>
        </section>
      )}

      {/* ================================================================ */}
      {/* 6. MAIN CONTENT — two-column editorial layout                    */}
      {/* ================================================================ */}
      <section className="py-14 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* ------- LEFT: main editorial content ------- */}
            <div className="lg:col-span-2 space-y-14">

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

                    {/* Cost */}
                    {item.cost && (
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
                            Precio aproximado
                          </dt>
                          <dd className="text-sm text-stone leading-snug">{item.cost}</dd>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Standalone quote card */}
              {item.quote && (
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
        </Container>
      </section>
    </>
  )
}
