import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Utensils, Leaf, Flame, Hammer, Sun, Wheat } from 'lucide-react'
import { getAllGastronomia } from '@/lib/data'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { PlaceGrid } from '@/components/places/PlaceGrid'
import type { PlaceCardProps } from '@/types'

export const metadata: Metadata = {
  title: 'Gastronomía',
  description: 'Conoce la gastronomía típica de Tepexi de Rodríguez, Puebla.',
}

// ─── Data ────────────────────────────────────────────────────────────────────

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
    image: '/images/gastronomia/guaje.jpg',
    title: 'El Guaje',
    description:
      'Semilla y vaina de notas astringentes. El rey indiscutible que da alma a los guisos locales.',
  },
  {
    image: '/images/gastronomia/pitaya.jpg',
    title: 'Cactáceas y Frutos',
    description:
      'El tesoro del decierto, La Pitaya o Pitahaya, un fruto vibrante y dulce que domina la temporada de calor.',
  },
  {
    image: '/images/gastronomia/chapulines.jpg',
    title: 'Proteína de Recolección',
    description:
      'Chicatanas, Chapulines, Texcas y Cueclas, insectos valorados por su alto valor proteico y sabor único.',
  },
  {
    image: '/images/gastronomia/agaves.jpg',
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function GastronomiaPage() {
  const data = await getAllGastronomia()

  const places: PlaceCardProps[] = data.map((item) => ({
    title: item.title,
    slug: item.slug.current,
    category: item.category,
    categoryColor: item.categoryColor,
    imageUrl: item.imageUrl,
    imageAlt: item.imageAlt,
    excerpt: item.address ?? undefined,
  }))

  return (
    <>
      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-accent py-20">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -left-10 w-72 h-72 rounded-full bg-accent-light" />
          <div className="absolute bottom-0 right-1/3 w-48 h-48 rounded-full bg-primary" />
        </div>

        <Container className="relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-white/90">Gastronomía</span>
          </nav>

          <div className="flex items-start gap-5">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <Utensils className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-4xl md:text-5xl text-white leading-tight mb-3">
                Gastronomía
              </h1>
              <p className="text-white/75 text-lg max-w-2xl leading-relaxed">
                Descubre los sabores tradicionales de la Mixteca Poblana — Huaxmole,
                Chilate, Mole, Tlacoyos y los platillos que han alimentado generaciones.
              </p>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-10 flex gap-6 flex-wrap">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 text-white">
              <div className="text-2xl font-bold font-heading">{places.length}</div>
              <div className="text-xs text-white/70 uppercase tracking-wide">lugares</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 text-white">
              <div className="text-2xl font-bold font-heading">Mixteca</div>
              <div className="text-xs text-white/70 uppercase tracking-wide">cocina</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 text-white">
              <div className="text-2xl font-bold font-heading">Artesanal</div>
              <div className="text-xs text-white/70 uppercase tracking-wide">tradición</div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── 2. Evolución Histórica — Timeline ───────────────────────────── */}
      <section className="bg-cream py-20">
        <Container>
          {/* Section header */}
          <div className="mb-12 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-3">
              <span className="block w-8 h-0.5 bg-accent rounded-full" />
              <span className="text-sm font-semibold uppercase tracking-widest text-accent">
                Historia
              </span>
            </div>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary">
              Raíces y Mestizaje
            </h2>
          </div>

          {/* Two-column layout */}
          <div className="flex flex-col md:flex-row gap-10 items-start">
            {/* Left — description + image */}
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
                  src="/images/gastronomia/raices-mestizaje.jpg"
                  alt="Raíces y mestizaje de la gastronomía de Tepexi"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              </div>
            </div>

            {/* Right — timeline */}
            <div className="flex-1 relative pl-8">
              {/* Vertical line */}
              <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-primary-200 rounded-full" />

              <div className="space-y-10">
                {timelineItems.map(({ icon: Icon, title, description, tagLabel, tagItems }, idx) => (
                  <div key={idx} className="relative animate-fade-in-up" style={{ animationDelay: `${idx * 120}ms` }}>
                    {/* Icon marker */}
                    <div className="absolute -left-8 top-1 w-7 h-7 rounded-full bg-accent flex items-center justify-center shadow-sm ring-4 ring-cream">
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>

                    <div className="bg-primary-50 rounded-xl p-6 border border-primary-100 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
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

      {/* ── 3. Ingredientes Endémicos — Card Grid ───────────────────────── */}
      <section className="bg-sand py-20">
        <Container>
          {/* Section header */}
          <div className="mb-12 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-3">
              <span className="block w-8 h-0.5 bg-secondary rounded-full" />
              <span className="text-sm font-semibold uppercase tracking-widest text-secondary">
                Ingredientes Endémicos
              </span>
            </div>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary">
              Los Tesoros de Nuestra Tierra
            </h2>
            <p className="mt-2 text-stone text-base max-w-xl leading-relaxed">
              Ingredientes únicos del valle semiárido de la Mixteca Poblana que definen la identidad de su cocina.
            </p>
          </div>

          {/* 2×2 → 4 col grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {endemicIngredients.map(({ image, title, description }) => (
              <Card key={title} className="flex flex-col">
                {/* Card image */}
                <div className="relative w-full aspect-square overflow-hidden">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="p-5">
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

      {/* ── 4. Técnicas Milenarias — Icon Grid ──────────────────────────── */}
      <section className="bg-cream py-20">
        <Container>
          {/* Section header */}
          <div className="mb-12 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-3">
              <span className="block w-8 h-0.5 bg-primary rounded-full" />
              <span className="text-sm font-semibold uppercase tracking-widest text-primary/70">
                Técnicas Milenarias
              </span>
            </div>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary">
              La Magia Detrás del Plato
            </h2>
            <p className="mt-2 text-stone text-base max-w-xl leading-relaxed">
              Adentrarse en las técnicas de la Mixteca Poblana es comprender cómo la paciencia,
              la química ancestral y el respeto por los ciclos del semidesierto transforman ingredientes agrestes
              en verdaderas joyas culinarias, diseñadas para maximizar el sabor y conservar los alimentos en un
              clima cálido.
            </p>
          </div>

          {/* Icon grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {ancientTechniques.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group flex flex-col items-center text-center gap-4 p-8 rounded-2xl border border-primary-100 bg-primary-50 hover:bg-primary-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
              >
                {/* Large icon in colored circle */}
                <div className="w-16 h-16 rounded-full bg-accent/15 border-2 border-accent/25 flex items-center justify-center group-hover:bg-accent/25 transition-colors duration-300">
                  <Icon className="w-8 h-8 text-accent" />
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

      {/* ── 5. Grid section ─────────────────────────────────────────────── */}
      <section className="py-20">
        <Container>
          {/* Section header */}
          <div className="mb-12 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-3">
              <span className="block w-8 h-0.5 bg-accent rounded-full" />
              <span className="text-sm font-semibold uppercase tracking-widest text-accent">
                Muestra Gastronómica
              </span>
            </div>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary">
              Platillos Representativos
            </h2>
            <p className="mt-2 text-stone text-base max-w-xl leading-relaxed">
              Los platillos más emblematicos donde la tradición mixteca cobra vida en cada bocado.
            </p>
          </div>

          {places.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5">
                <Utensils className="w-10 h-10 text-accent/50" />
              </div>
              <h2 className="font-heading font-semibold text-xl text-primary mb-2">
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
