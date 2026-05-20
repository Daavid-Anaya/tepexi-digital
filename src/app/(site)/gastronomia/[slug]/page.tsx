import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/react'
import { getGastronomiaBySlug } from '@/lib/data'
import { client } from '@/sanity/lib/client'
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
import Image from 'next/image'
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
          className={`w-4 h-4 ${n <= filled ? 'text-accent fill-accent' : 'text-stone/40 fill-stone/40'}`}
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
          className={`text-lg font-bold ${n <= active ? 'text-accent' : 'text-stone/40'}`}
        >
          $
        </span>
      ))}
    </div>
  )
}

function IngredientIcon({ icon }: { icon: string | null }) {
  if (icon === 'utensils') return <Utensils className="w-5 h-5 text-accent" />
  if (icon === 'flame') return <Flame className="w-5 h-5 text-accent" />
  if (icon === 'leaf') return <Leaf className="w-5 h-5 text-accent" />
  if (icon === 'grain') return <CircleDot className="w-5 h-5 text-accent" />
  return <Utensils className="w-5 h-5 text-accent" />
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(
    `*[_type == "gastronomia" && defined(slug.current)]{ "slug": slug.current }`,
    {},
    { next: { tags: ['gastronomia'] } },
  )
  return slugs.map((l) => ({ slug: l.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const item = await getGastronomiaBySlug(slug)
  if (!item) return { title: 'No encontrado' }
  const title = item.seo?.metaTitle ?? item.title ?? 'Gastronomía'
  const description = item.seo?.metaDescription ?? undefined
  const url = `https://tepexidigital.com.mx/gastronomia/${slug}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      ...(item.images?.[0]?.url && { images: [{ url: item.images[0].url, width: 1200, height: 630 }] }),
    },
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function GastronomiaDetailPage({ params }: Props) {
  const { slug } = await params
  const item = await getGastronomiaBySlug(slug)

  if (!item) notFound()

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
      <section className="relative overflow-hidden bg-primary py-10 md:py-14">
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
      <section className="py-10 md:py-14 bg-cream">
        <Container>
          <div className={item.descriptionImage ? 'grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start' : ''}>
            {/* Left column: description content */}
            <div className={item.descriptionImage ? '' : 'max-w-3xl mx-auto'}>
              {/* Section label */}
              <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-4 text-accent">
                Gastronomía de la Mixteca
              </p>

              {/* Dish name as editorial lead-in */}
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-text-primary leading-tight mb-8">
                {/*Historia y contexto cultural*/}
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
                  <Image
                    src={item.descriptionImage.url}
                    alt={item.descriptionImage.alt ?? item.title ?? ''}
                    width={800}
                    height={600}
                    className="w-full h-auto rounded-2xl object-cover"
                  />
                </div>
                {/* Decorative terracotta accent */}
                <div className="absolute -bottom-3 -right-3 w-24 h-24 rounded-xl -z-10 bg-accent/10" />
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* ================================================================ */}
      {/* 3. INGREDIENTES CLAVE — editorial ingredient grid                */}
      {/* ================================================================ */}
      {hasKeyIngredients && (
        <section className="py-10 md:py-16 bg-primary-50">
          <Container>
            {/* Section header */}
            <div className="flex items-center gap-3 mb-6 md:mb-10">
              <span className="w-1 h-8 rounded-full inline-block bg-accent" />
              <h2 className="font-heading font-bold text-text-primary text-2xl md:text-3xl">
                Ingredientes Clave
              </h2>
            </div>

            {/* Grid: mobile=1col, md=2col, lg=4col */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1 — spans 2 cols, large with icon + title + description */}
              {item.keyIngredients![0] && (
                <div
                  className="group lg:col-span-2 rounded-xl p-4 sm:p-6 border flex flex-col gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                  style={{ background: '#FFFFFF', borderColor: '#E8DDD5' }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent/10 group-hover:bg-accent/25 transition-colors duration-300">
                    <IngredientIcon icon={item.keyIngredients![0].icon} />
                  </div>
                  {item.keyIngredients![0].name && (
                    <h3 className="font-heading font-bold text-primary text-xl">
                      {item.keyIngredients![0].name}
                    </h3>
                  )}
                  {item.keyIngredients![0].description && (
                    <p className="text-sm leading-relaxed text-stone">
                      {item.keyIngredients![0].description}
                    </p>
                  )}
                </div>
              )}

              {/* Card 2 — 1 col square, icon centered + title + subtitle */}
              {item.keyIngredients![1] && (
                <div
                  className="group rounded-xl p-4 sm:p-6 border flex flex-col items-center justify-center gap-3 text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                  style={{ background: '#FFFFFF', borderColor: '#E8DDD5', minHeight: '160px' }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-accent/10 group-hover:bg-accent/25 transition-colors duration-300">
                    <IngredientIcon icon={item.keyIngredients![1].icon} />
                  </div>
                  {item.keyIngredients![1].name && (
                    <h3 className="font-heading font-semibold text-primary text-base">
                      {item.keyIngredients![1].name}
                    </h3>
                  )}
                  {item.keyIngredients![1].description && (
                    <p className="text-xs font-medium tracking-widest uppercase text-stone">
                      {item.keyIngredients![1].description}
                    </p>
                  )}
                </div>
              )}

              {/* Card 3 — 1 col square, small flame icon + title + subtitle */}
              {item.keyIngredients![2] && (
                <div
                  className="group rounded-xl p-4 sm:p-6 border flex flex-col items-center justify-center gap-3 text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                  style={{ background: '#FFFFFF', borderColor: '#E8DDD5', minHeight: '160px' }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-accent/10 group-hover:bg-accent/25 transition-colors duration-300">
                    <IngredientIcon icon={item.keyIngredients![2].icon} />
                  </div>
                  {item.keyIngredients![2].name && (
                    <h3 className="font-heading font-semibold text-primary text-base">
                      {item.keyIngredients![2].name}
                    </h3>
                  )}
                  {item.keyIngredients![2].description && (
                    <p className="text-xs font-medium tracking-widest uppercase text-stone">
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
                    <Image
                      src={item.keyIngredients![3].imageUrl}
                      alt={item.keyIngredients![3].name ?? 'Ingrediente'}
                      width={800}
                      height={400}
                      className="w-full h-full object-cover"
                      style={{ minHeight: '200px' }}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100"
                      style={{ minHeight: '200px' }}
                    >
                      <Utensils className="w-10 h-10 text-accent/20" />
                    </div>
                  )}
                </div>
              )}

              {/* Card 5 — spans 2 cols, leaf icon + title + description, text left */}
              {item.keyIngredients![4] && (
                <div
                  className="group lg:col-span-2 rounded-xl p-4 sm:p-6 border flex flex-col gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                  style={{ background: '#FFFFFF', borderColor: '#E8DDD5' }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent/10 group-hover:bg-accent/25 transition-colors duration-300">
                    <IngredientIcon icon={item.keyIngredients![4].icon} />
                  </div>
                  {item.keyIngredients![4].name && (
                    <h3 className="font-heading font-bold text-primary text-xl">
                      {item.keyIngredients![4].name}
                    </h3>
                  )}
                  {item.keyIngredients![4].description && (
                    <p className="text-sm leading-relaxed text-stone">
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
        <section className="py-10 md:py-16 bg-white">
          <Container>
            {/* Section header */}
            <div className="flex items-center gap-3 mb-8 md:mb-12">
              <span className="w-1 h-8 rounded-full inline-block bg-accent" />
              <h2 className="font-heading font-bold text-text-primary text-2xl md:text-3xl">
                Proceso de Preparación
              </h2>
            </div>

            {/* Timeline — alternating left/right on desktop, stacked on mobile */}
            <div className="relative max-w-6xl mx-auto">
              {/* Central vertical line (desktop only) */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-accent/[0.125]" />

              {item.preparationSteps!.map((step, index) => {
                const isLeft = index % 2 === 0
                return (
                  <div key={index} className="relative mb-12 last:mb-0">
                    {/* Step circle — centered on the line (desktop), left-aligned (mobile) */}
                    <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 z-10">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-white text-sm shadow-md bg-accent"
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
                              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border flex-shrink-0 text-accent border-accent/20 bg-accent/5"
                            >
                              <Clock className="w-3 h-3" />
                              {step.duration}
                            </span>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed text-stone">
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
      <section className="py-10 md:py-14 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

            {/* ------- LEFT: main editorial content ------- */}
            <div className="lg:col-span-2 space-y-14">

              {/* Image Gallery */}
              {images.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-0.5 h-6 rounded-full inline-block bg-accent" />
                     <h2 className="font-heading font-bold text-text-primary text-2xl">
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
                <div className="rounded-2xl overflow-hidden shadow-sm border border-[#E8DDD5]">
                  {/* Card header */}
                  <div className="px-4 sm:px-5 py-4 bg-accent">
                    <h2 className="font-heading font-semibold text-white text-sm tracking-widest uppercase">
                      Ficha del platillo
                    </h2>
                  </div>

                  <div className="p-4 sm:p-5 space-y-5" style={{ background: '#FDFAF8' }}>
                    {/* Difficulty */}
                    {item.difficulty && (
                      <div className="flex items-start gap-3">
                        <div
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 bg-accent/10"
                        >
                          <Flame className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <dt
                            className="text-[11px] uppercase tracking-widest font-semibold mb-1 text-stone"
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
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 bg-accent/10"
                        >
                          <Timer className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <dt
                            className="text-[11px] uppercase tracking-widest font-semibold mb-0.5 text-stone"
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
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 bg-accent/10"
                        >
                          <Users className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <dt
                            className="text-[11px] uppercase tracking-widest font-semibold mb-0.5 text-stone"
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
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 bg-accent/10"
                        >
                          <CalendarDays className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <dt
                            className="text-[11px] uppercase tracking-widest font-semibold mb-0.5 text-stone"
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
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 bg-accent/10"
                        >
                          <span className="text-sm font-bold text-accent">$</span>
                        </div>
                        <div>
                          <dt className="text-[11px] uppercase tracking-widest font-semibold mb-0.5 text-stone">
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
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 bg-accent/10"
                        >
                          <Globe className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <dt
                            className="text-[11px] uppercase tracking-widest font-semibold mb-0.5 text-stone"
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
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 bg-accent/10"
                        >
                          <span className="text-sm font-bold text-accent">$</span>
                        </div>
                        <div>
                          <dt className="text-[11px] uppercase tracking-widest font-semibold mb-0.5 text-stone">
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
                <figure className="rounded-2xl p-4 sm:p-6 border bg-primary-50 border-[#E8DDD5]">
                  <span
                    className="block font-heading text-5xl leading-none mb-3 text-accent/25"
                    aria-hidden="true"
                  >
                    &ldquo;
                  </span>
                  <blockquote
                    className="font-heading italic text-primary text-base leading-relaxed mb-3"
                  >
                    {item.quote.text}
                  </blockquote>
                  <figcaption className="text-xs tracking-widest uppercase font-medium text-accent">
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
