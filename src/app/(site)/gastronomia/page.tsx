import type { Metadata } from 'next'
import Image from 'next/image'
import { Utensils, Leaf, Flame, Hammer, Sun, Wheat } from 'lucide-react'
import { getAllGastronomia } from '@/lib/data'

// F-21: ISR — las páginas de listado se revalidan cada hora.
export const revalidate = 3600
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { PlaceGrid } from '@/components/places/PlaceGrid'
import type { PlaceCardProps } from '@/types'
import { buildStaticPageMetadata } from '@/lib/metadata'
import { PageHero, PageHeroBreadcrumb, PageHeroHeader, PageHeroStats } from '@/components/ui/PageHero'
import { SANITY_CDN_BASE, HERO_FALLBACKS } from '@/lib/constants'

export const metadata: Metadata = buildStaticPageMetadata({
  title: 'Gastronomía',
  description: 'Descubre la gastronomía típica de Tepexi de Rodríguez, Puebla: mole de caderas, mezcal, cocina regional y sabores de la Mixteca Poblana.',
  path: '/gastronomia',
})

// ─── Datos ───

const timelineItems = [
  {
    icon: Leaf,
    title: 'La Raíz Prehispánica',
    description:
      'Nuestros ancestros dominaron el arte de la recolección en la aridez. Las cactáceas como órganos y biznagas, las flores silvestres, una vasta variedad de insectos junto a la trilogía mesoamericana (maíz, frijol, calabaza) formaron la base de una dieta simbiótica con el entorno.',
    tagLabel: 'Ingredientes Clave',
    tagItems: ['Cactáceas y Frutos', 'Flores', 'Semillas y Vainas', 'Insectos'],
  },
  {
    icon: Utensils,
    title: 'La Llegada del Ganado',
    description:
      'Con la colonización española, el paisaje se transformó. El ganado caprino encontró en la Mixteca su segundo hogar. Nació la técnica de la matanza y las cocciones lentas en hornos de tierra, fusionando el barro con la grasa y la especia.',
    tagLabel: 'Técnica Introducida',
    tagItems: ['Caprino', 'Porcino', 'Cocción Lenta'],
  },
] as const

const endemicIngredients = [
  {
    image: `${SANITY_CDN_BASE}/6db339c125445879cb76d93f8f9bd298b667ea3b-1920x1630.webp`,
    title: 'El Guaje',
    description:
      'Semilla y vaina de notas astringentes. El rey indiscutible que da alma a los guisos locales.',
  },
  {
    image: `${SANITY_CDN_BASE}/359d8f7cc2da87a200061194097273cd54408265-1920x1440.webp`,
    title: 'Cactáceas y Frutos',
    description:
      'El tesoro del desierto, La Pitaya o Pitahaya, un fruto vibrante y dulce que domina la temporada de calor.',
  },
  {
    image: `${SANITY_CDN_BASE}/c06551f6a86f1943d6dd11a22c78db0323529972-1920x1478.webp`,
    title: 'Proteína de Recolección',
    description:
      'Chicatanas, Chapulines, Texcas y Cueclas, insectos valorados por su alto valor proteico y sabor único.',
  },
  {
    image: `${SANITY_CDN_BASE}/a2ef5eb06238b35096e2fd91867dfb9984b738e1-512x512.webp`,
    title: 'Los Agaves',
    description:
      'Especies como el papalomé y espadín, bases esenciales para el aguamiel y los destilados artesanales.',
  },
] as const

const ancientTechniques = [
  {
    icon: Flame,
    title: 'Horno de Hoyo',
    description:
      'Cocción lenta (8-12 horas) bajo tierra con piedras volcánicas y pencas de maguey, esencial para la barbacoa.',
  },
  {
    icon: Hammer,
    title: 'Molienda Tradicional',
    description:
      'Uso de metate y molcajete para liberar aceites esenciales de chiles y semillas, logrando texturas imposibles para la licuadora.',
  },
  {
    icon: Sun,
    title: 'Deshidratación',
    description:
      'Conservación ancestral al sol para carnes (cecina), chiles y frutas, garantizando alimento en temporada de sequía.',
  },
  {
    icon: Wheat,
    title: 'Nixtamalización',
    description:
      'Hervido del maíz con cal viva, el proceso químico mesoamericano que potencia nutrientes y da vida a la masa.',
  },
] as const

// ─── Página ───

export default async function GastronomiaPage() {
  const data = await getAllGastronomia()

  const places: PlaceCardProps[] = data.map((item) => ({
    title: item.title,
    slug: item.slug.current,
    category: item.category,
    categoryColor: item.categoryColor,
    imageUrl: item.imageUrl,
    imageAlt: item.imageAlt,
    excerpt: undefined,
  }))

  return (
    <>
      {/* ── 1. Hero ── */}
      <PageHero imageUrl={HERO_FALLBACKS.gastronomia}>
        <PageHeroBreadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Gastronomía' }]} currentPath="/gastronomia" />
        <PageHeroHeader
          icon={Utensils}
          title="Gastronomía"
          description="Descubre los sabores tradicionales de la Mixteca Poblana — Huaxmole, Chilate, Mole, Tlacoyos y los platillos que han alimentado generaciones."
        />
        <PageHeroStats stats={[{ value: places.length, label: 'Platillos' }, { value: 'Mixteca', label: 'cocina' }, { value: 'Artesanal', label: 'tradición' }]} />
      </PageHero>

      {/* ── 2. Evolución Histórica — Línea de tiempo ── */}
      <section className="bg-cream py-12 md:py-20">
        <Container>
          {/* Encabezado de la sección */}
          <div className="mb-8 md:mb-12 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-3">
              <span className="block w-8 h-0.5 bg-accent rounded-full" />
              <span className="text-sm font-semibold uppercase tracking-widest text-accent">
                Historia
              </span>
            </div>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-text-primary">
              Raíces y Mestizaje
            </h2>
          </div>

          {/* Diseño de dos columnas */}
          <div className="flex flex-col md:flex-row gap-10 items-start">
            {/* Izquierda — descripción + imagen */}
            <div className="w-full md:w-2/5 flex-shrink-0 flex flex-col gap-6">
              <p className="text-stone text-base leading-relaxed">
                La Mixteca Poblana es una región donde la aridez del paisaje
                y la historia convergen para forjar una de las tradiciones
                culinarias más resilientes y fascinantes de México. Su gastronomía
                no es solo un conjunto de recetas, sino un testimonio de
                supervivencia, adaptación y mestizaje. Desde el polen de las
                tetechas hasta la introducción del ganado menor, cada bocado
                narra siglos de historia.
              </p>
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-md">
                 <Image
                    src={`${SANITY_CDN_BASE}/79ecddc81138b7b166b83f7999de224264d46bf3-1920x1440.webp`}
                   alt="Ingredientes representativos de la gastronomía de Tepexi"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              </div>
            </div>

            {/* Derecha — línea de tiempo */}
            <div className="flex-1 relative pl-8">
              {/* Línea vertical */}
              <div aria-hidden="true" className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-primary-200 rounded-full" />

              <div className="space-y-10">
                {timelineItems.map(({ icon: Icon, title, description, tagLabel, tagItems }, idx) => (
                  <div key={idx} className="relative animate-fade-in-up" style={{ animationDelay: `${idx * 120}ms` }}>
                    {/* Marcador con ícono */}
                    <div aria-hidden="true" className="absolute -left-8 top-1 w-7 h-7 rounded-full bg-accent flex items-center justify-center shadow-sm ring-4 ring-cream">
                      <Icon className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                    </div>

                    <div className="bg-primary-50 rounded-xl p-4 sm:p-6 border border-primary-100 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
                      <h3 className="font-heading font-semibold text-lg text-primary mb-2">
                        {title}
                      </h3>
                      <p className="text-stone text-sm leading-relaxed">
                        {description}
                      </p>
                      <div className="mt-4 pt-4 border-t border-primary-100">
                        <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                          {tagLabel}
                        </span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {tagItems.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs font-medium text-primary bg-primary-100 px-3 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── 3. Ingredientes Endémicos — Cuadrícula de tarjetas ── */}
      <section className="bg-sand py-12 md:py-20">
        <Container>
          {/* Encabezado de la sección */}
          <div className="mb-8 md:mb-12 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-3">
              <span className="block w-8 h-0.5 bg-secondary rounded-full" />
              <span className="text-sm font-semibold uppercase tracking-widest text-secondary">
                Ingredientes Endémicos
              </span>
            </div>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-text-primary">
              Los Tesoros de Nuestra Tierra
            </h2>
            <p className="mt-2 text-stone text-base max-w-xl leading-relaxed">
              Ingredientes únicos del valle semiárido de la Mixteca Poblana que definen la identidad de su cocina.
            </p>
          </div>

          {/* Cuadrícula de 2×2 → 4 columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {endemicIngredients.map(({ image, title, description }) => (
              <Card key={title} className="flex flex-col">
                {/* Imagen de la tarjeta */}
                <div className="relative w-full aspect-square overflow-hidden">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="p-4 sm:p-5">
                  <h3 className="font-heading font-bold text-primary text-base mb-1.5">
                    {title}
                  </h3>
                  <p className="text-stone text-sm leading-relaxed">
                    {description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ── 4. Técnicas Milenarias — Cuadrícula de íconos ──*/}
      <section className="bg-cream py-12 md:py-20">
        <Container>
          {/* Encabezado de la sección */}
          <div className="mb-8 md:mb-12 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-3">
              <span className="block w-8 h-0.5 bg-primary rounded-full" />
              <span className="text-sm font-semibold uppercase tracking-widest text-primary/70">
                Técnicas Milenarias
              </span>
            </div>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-text-primary">
              La Magia Detrás del Plato
            </h2>
            <p className="mt-2 text-stone text-base max-w-xl leading-relaxed">
              Adentrarse en las técnicas de la Mixteca Poblana es comprender cómo la paciencia,
              la química ancestral y el respeto por los ciclos del semidesierto transforman ingredientes agrestes
              en verdaderas joyas culinarias, diseñadas para maximizar el sabor y conservar los alimentos en un
              clima cálido.
            </p>
          </div>

          {/* Cuadrícula de íconos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {ancientTechniques.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group flex flex-col items-center text-center gap-4 p-5 sm:p-8 rounded-2xl border border-primary-100 bg-primary-50 hover:bg-primary-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
              >
                {/* Ícono grande en un círculo de color */}
                <div className="w-16 h-16 rounded-full bg-accent/15 border-2 border-accent/25 flex items-center justify-center group-hover:bg-accent/25 transition-colors duration-300">
                  <Icon className="w-8 h-8 text-accent" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-primary text-base mb-2">
                    {title}
                  </h3>
                  <p className="text-stone text-sm leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── 5. Sección de cuadrícula ──*/}
      <section className="py-12 md:py-20">
        <Container>
          {/* Encabezado de la sección */}
          <div className="mb-8 md:mb-12 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-3">
              <span className="block w-8 h-0.5 bg-accent rounded-full" />
              <span className="text-sm font-semibold uppercase tracking-widest text-accent">
                Muestra Gastronómica
              </span>
            </div>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-text-primary">
              Platillos Representativos
            </h2>
            <p className="mt-2 text-stone text-base max-w-xl leading-relaxed">
               Los platillos más emblemáticos donde la tradición mixteca cobra vida en cada bocado.
            </p>
          </div>

          {places.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5">
                 <Utensils className="w-10 h-10 text-accent/50" aria-hidden="true" />
              </div>
              <h2 className="font-heading font-semibold text-xl text-text-primary mb-2">
                Sin platillos disponibles
              </h2>
              <p className="text-stone max-w-sm mx-auto">
                Pronto descubrirás aquí los mejores platillos para degustar la gastronomía de Tepexi.
              </p>
            </div>
          ) : (
            <PlaceGrid places={places} basePath="/gastronomia" />
          )}
        </Container>
      </section>
    </>
  )
}
