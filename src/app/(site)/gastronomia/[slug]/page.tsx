import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PortableText } from '@portabletext/react'
import { getGastronomiaBySlug } from '@/lib/data'

// F-21: ISR — detail pages rarely change; revalidate once per day.
export const revalidate = 86400
import { Container } from '@/components/ui/Container'
import { PageHero, PageHeroBackLink } from '@/components/ui/PageHero'
import { QuoteCard } from '@/components/ui/QuoteCard'
import { HERO_FALLBACKS } from '@/lib/constants'
import { fetchStaticSlugs } from '@/lib/sanity-params'
import { buildSlugMetadata } from '@/lib/metadata'
import { DifficultyFlames } from '@/components/gastronomia/DifficultyFlames'
import { PriceSymbols } from '@/components/gastronomia/PriceSymbols'
import { KeyIngredientsBento } from '@/components/gastronomia/KeyIngredientsBento'
import { PreparationTimeline } from '@/components/gastronomia/PreparationTimeline'
import { DISH_TYPE_LABELS } from '@/components/gastronomia/constants'
import {
  Utensils,
  Flame,
  Users,
  Timer,
  CalendarDays,
  Globe,
} from 'lucide-react'
import Image from 'next/image'
import DynamicImageCarousel from '@/components/gallery/DynamicImageCarousel'

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

interface Props {
  params: Promise<{ slug: string }>
}

export const generateStaticParams = () => fetchStaticSlugs('gastronomia')

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const item = await getGastronomiaBySlug(slug)
  return buildSlugMetadata(slug, 'gastronomia', item ? {
    ...item,
    ogImageUrl: item.images?.[0]?.url ?? null,
  } : null, 'Gastronomía')
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

  const HERO_FALLBACK = HERO_FALLBACKS.gastronomia
  const heroImageUrl = images[0]?.url ?? HERO_FALLBACK
  const heroImageAlt = images[0]?.alt ?? item.title ?? 'Imagen de gastronomía'

  const dishTypeLabels = item.dishType?.length
    ? item.dishType.map((t) => DISH_TYPE_LABELS[t] ?? t)
    : null

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
      {/* 1. HERO                                                           */}
      {/* ================================================================ */}
      <PageHero imageUrl={heroImageUrl} imageAlt={heroImageAlt} size="compact">
        <PageHeroBackLink href="/gastronomia" label="Volver a Gastronomía" />

        {/* Category + dish type badges */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {item.category && (
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/25">
              <Utensils className="w-3 h-3" />
              {item.category}
            </span>
          )}
          {dishTypeLabels?.map((label) => (
            <span key={label} className="inline-flex items-center bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/25">
              {label}
            </span>
          ))}
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
      </PageHero>

      {/* ================================================================ */}
      {/* 2. ARTICLE LEAD — intro & description (two-column with image)    */}
      {/* ================================================================ */}
      <section className="py-10 md:py-14 bg-cream">
        <Container>
          <div className={item.descriptionImage ? 'grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start' : ''}>
            {/* Left column: description content */}
            <div className={item.descriptionImage ? '' : 'max-w-3xl mx-auto'}>
              <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-4 text-accent">
                Gastronomía de la Mixteca
              </p>

              {item.introduction && (
                <div
                  className="prose max-w-none mb-8"
                  style={{ lineHeight: '1.9', fontSize: '1.0925rem', color: '#3a3a3a', fontWeight: 500 }}
                >
                  <PortableText value={item.introduction} />
                </div>
              )}

              {item.description && (
                <div
                  className="prose max-w-none"
                  style={{ lineHeight: '1.9', fontSize: '1.0625rem', color: '#4a4a4a' }}
                >
                  <PortableText value={item.description} />
                </div>
              )}
            </div>

            {/* Right column: description image (only if present) */}
            {item.descriptionImage && (
              <div className="relative">
                <div className="w-full rounded-2xl overflow-hidden shadow-lg">
                  {/* F-09: add sizes so the browser downloads the right resolution */}
                  <Image
                    src={item.descriptionImage.url}
                    alt={item.descriptionImage.alt ?? item.title ?? ''}
                    width={800}
                    height={600}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="w-full h-auto rounded-2xl object-cover"
                  />
                </div>
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
        <KeyIngredientsBento ingredients={item.keyIngredients!} />
      )}

      {/* ================================================================ */}
      {/* 4. PROCESO DE PREPARACIÓN — alternating vertical timeline        */}
      {/* ================================================================ */}
      {hasPreparationSteps && (
        <PreparationTimeline steps={item.preparationSteps!} />
      )}

      {/* ================================================================ */}
      {/* 5. MAIN CONTENT — two-column editorial layout                    */}
      {/* ================================================================ */}
      <section className="py-10 md:py-14 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

            {/* ------- LEFT: main editorial content ------- */}
            <div className="lg:col-span-2 space-y-14">
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
                  <div className="px-4 sm:px-5 py-4 bg-accent">
                    <h2 className="font-heading font-semibold text-white text-sm tracking-widest uppercase">
                      Ficha del platillo
                    </h2>
                  </div>

                  <div className="p-4 sm:p-5 space-y-5" style={{ background: '#FDFAF8' }}>
                    {item.difficulty && (
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 bg-accent/10">
                          <Flame className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <dt className="text-[11px] uppercase tracking-widest font-semibold mb-1 text-stone">
                            Dificultad
                          </dt>
                          <DifficultyFlames difficulty={item.difficulty} />
                        </div>
                      </div>
                    )}

                    {item.preparationTime && (
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 bg-accent/10">
                          <Timer className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <dt className="text-[11px] uppercase tracking-widest font-semibold mb-0.5 text-stone">
                            Preparación
                          </dt>
                          <dd className="text-sm font-medium text-primary">{item.preparationTime}</dd>
                        </div>
                      </div>
                    )}

                    {item.servings && (
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 bg-accent/10">
                          <Users className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <dt className="text-[11px] uppercase tracking-widest font-semibold mb-0.5 text-stone">
                            Porciones
                          </dt>
                          <dd className="text-sm font-medium text-primary">{item.servings}</dd>
                        </div>
                      </div>
                    )}

                    {item.season && (
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 bg-accent/10">
                          <CalendarDays className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <dt className="text-[11px] uppercase tracking-widest font-semibold mb-0.5 text-stone">
                            Temporada
                          </dt>
                          <dd className="text-sm font-medium text-primary">{item.season}</dd>
                        </div>
                      </div>
                    )}

                    {item.priceRange && (
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 bg-accent/10">
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

                    {item.origin && (
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 bg-accent/10">
                          <Globe className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <dt className="text-[11px] uppercase tracking-widest font-semibold mb-0.5 text-stone">
                            Origen
                          </dt>
                          <dd className="text-sm font-medium text-primary">{item.origin}</dd>
                        </div>
                      </div>
                    )}

                    {item.cost && (
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 bg-accent/10">
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
                <QuoteCard text={item.quote.text} author={item.quote.author} />
              )}
            </aside>
          </div>
        </Container>
      </section>
    </>
  )
}
