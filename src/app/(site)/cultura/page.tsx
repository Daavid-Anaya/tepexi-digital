import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Palette, Crown, Route, ShieldUser, Users, ChevronDown, Hand, Gem } from 'lucide-react'
import { getAllCultura } from '@/lib/data'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { PlaceGrid } from '@/components/places/PlaceGrid'
import type { PlaceCardProps } from '@/types'

export const metadata: Metadata = {
  title: 'Cultura',
  description: 'Conoce la riqueza cultural de Tepexi de Rodríguez, Puebla.',
}

// ─── Data ────────────────────────────────────────────────────────────────────

const timelineItems = [
  {
    icon: Crown,
    title: 'El Señorío Popoloca',
    description:
      'El florecimiento de una cultura milenaria que dominó el paisaje mineral antes de la conquista. El corazón de este señorío fue Tepexi el Viejo, una imponente fortaleza militar y ceremonial, diseñada para controlar las rutas comerciales y aduanales que conectaban la Mixteca oaxaqueña con el altiplano central.',
  },
  {
    icon: Route,
    title: 'La Ruta de la Seda (1530-1596)',
    description:
      'Un periodo de intercambio comercial y cultural sin precedentes que transformó la economía de la Mixteca. Tras la conquista española, Tepexi se convirtió en el centro de producción de seda más importante del continente americano gracias a la introducción de la morera y el gusano de seda.',
  },
  {
    icon: ShieldUser,
    title: 'El agregado "de Rodríguez"',
    description:
      'El agregado "de Rodríguez" fue otorgado en honor al general Prudencio Rodríguez, una figura militar destacada en la región durante las guerras del siglo XIX.',
  },
  {
    icon: Users,
    title: 'Identidad Mestiza',
    description:
      'La cultura tepexana es un rico modelo mestizo, representativo del sur de Puebla. Nace del sincretismo entre sus raíces indígenas (popolocas, mixtecas y nahuas) y la herencia colonial española y católica.',
  },
] as const

const exploraCards = [
  {
    title: 'Cantera Tlayúa',
    description: 'Fósiles de peces y plantas con 100 millones de años de antigüedad.',
  },
  {
    title: 'Pie de Vaca',
    description: 'Huellas petrificadas de camélidos y felinos del Pleistoceno.',
  },
  {
    title: 'Tepexi el Viejo',
    description: 'Imponente zona arqueológica de la antigua fortaleza popoloca.',
  },
  {
    title: 'Ex-convento de Santo Domingo',
    description: 'Joya de la arquitectura religiosa del siglo XVI.',
  },
] as const

const tradicionesItems = [
  {
    title: 'La Gran Feria Anual',
    content:
      'La Feria de Tepexi de Rodríguez en honor al Señor de Huajoyuca, Constituida por corredor gastronómico con platillos típicos, mezcal de la región, concursos de artesanías de palma, desfile-carnaval, bailes populares, rodeo-baile y actividades culturales. Una celebración que reúne a toda la comunidad en una fiesta de tradición y devoción que se ha mantenido por generaciones.',
  },
  {
    title: 'Sonidos y Expresiones',
    content:
      'Música de banda de viento tradicional para carnavales y procesiones. Los ritmos que acompañan cada momento importante de la vida tepexana.',
  },
  {
    title: 'Resiliencia Lingüística',
    content:
      'La supervivencia de lenguas originarias como el popoloca, náhuatl y mixteco. Un patrimonio intangible que resiste y se reinventa en cada generación.',
  },
] as const

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CulturaPage() {
  const data = await getAllCultura()

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
      <section className="relative overflow-hidden py-20" style={{ backgroundColor: '#4A1D6E' }}>
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full" style={{ backgroundColor: '#7B3FA0' }} />
          <div className="absolute -bottom-10 left-1/4 w-56 h-56 rounded-full" style={{ backgroundColor: '#2D0A46' }} />
        </div>

        <Container className="relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-white/90">Cultura</span>
          </nav>

          <div className="flex items-start gap-5">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <Palette className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-4xl md:text-5xl text-white leading-tight mb-3">
                Cultura
              </h1>
              <p className="text-white/75 text-lg max-w-2xl leading-relaxed">
                Sitios arqueológicos, tradiciones vivas, artesanías y el patrimonio ancestral
                de la Mixteca Poblana que persiste a través de los siglos.
              </p>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-10 flex gap-6 flex-wrap">
            <div className="rounded-xl px-5 py-3 text-white" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <div className="text-2xl font-bold font-heading">{places.length}</div>
              <div className="text-xs text-white/70 uppercase tracking-wide">sitios</div>
            </div>
            <div className="rounded-xl px-5 py-3 text-white" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <div className="text-2xl font-bold font-heading">Prehispánico</div>
              <div className="text-xs text-white/70 uppercase tracking-wide">legado</div>
            </div>
            <div className="rounded-xl px-5 py-3 text-white" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <div className="text-2xl font-bold font-heading">Patrimonio</div>
              <div className="text-xs text-white/70 uppercase tracking-wide">categoría</div>
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
              <span className="block w-8 h-0.5 rounded-full" style={{ backgroundColor: '#7B3FA0' }} />
              <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#7B3FA0' }}>
                Historia
              </span>
            </div>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary">
              Crónicas en Piedra y Tiempo
            </h2>
          </div>

          {/* Two-column layout */}
          <div className="flex flex-col md:flex-row gap-10 items-start">
            {/* Left — description + image placeholder */}
            <div className="w-full md:w-2/5 flex-shrink-0 flex flex-col gap-6">
              <p className="text-stone text-base leading-relaxed">
                Tepexi de Rodríguez es un lugar viviente donde cada capa geológica
                y cultural cuenta una historia. Desde los señoríos prehispánicos que dominaron
                la Mixteca, hasta la impronta colonial que trazó nuevas rutas de comercio,
                este territorio ha sido testigo de transformaciones profundas.
              </p>
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-md">
                <Image
                  src="/images/cultura/prueba.jpg"
                  alt="Crónicas históricas de Tepexi"
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
                {timelineItems.map(({ icon: Icon, title, description }, idx) => (
                  <div key={idx} className="relative animate-fade-in-up" style={{ animationDelay: `${idx * 120}ms` }}>
                    {/* Icon marker */}
                    <div
                      className="absolute -left-8 top-1 w-7 h-7 rounded-full flex items-center justify-center shadow-sm ring-4 ring-cream"
                      style={{ backgroundColor: '#7B3FA0' }}
                    >
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>

                    <div className="bg-primary-50 rounded-xl p-6 border border-primary-100 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
                      <h3 className="font-heading font-semibold text-lg text-primary mb-2">
                        {title}
                      </h3>
                      <p className="text-stone text-sm leading-relaxed">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── 3. Explora Tepexi — Card Grid ───────────────────────────────── */}
      <section className="bg-sand py-20">
        <Container>
          {/* Section header */}
          <div className="mb-12 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-3">
              <span className="block w-8 h-0.5 rounded-full" style={{ backgroundColor: '#9B59B6' }} />
              <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#9B59B6' }}>
                Patrimonio Cultural
              </span>
            </div>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary">
              Explora Tepexi
            </h2>
            <p className="mt-2 text-stone text-base max-w-xl leading-relaxed">
              Descubre los sitios que hacen de Tepexi un destino único para los amantes de la historia,
              la paleontología y la arquitectura.
            </p>
          </div>

          {/* 4-col grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {exploraCards.map(({ title, description }) => (
              <Card key={title} className="flex flex-col">
                {/* Card image */}
                <div className="relative w-full aspect-square overflow-hidden">
                  <Image
                    src="/images/cultura/prueba.jpg"
                    alt={title}
                    fill
                    className="object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
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

      {/* ── 4. Tradiciones Vivas — Accordion ────────────────────────────── */}
      <section className="bg-cream py-20">
        <Container>
          {/* Section header */}
          <div className="mb-12 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-3">
              <span className="block w-8 h-0.5 rounded-full" style={{ backgroundColor: '#7B3FA0' }} />
              <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#7B3FA0' }}>
                Tradiciones
              </span>
            </div>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary">
              Tradiciones Vivas
            </h2>
            <p className="mt-2 text-stone text-base max-w-xl leading-relaxed">
              La cultura tepexana se mantiene viva a través de celebraciones, música y lenguas
              que resisten el paso del tiempo.
            </p>
          </div>

          {/* Accordion — zero-JS using details/summary */}
          <div className="max-w-2xl mx-auto">
            {tradicionesItems.map(({ title, content }) => (
              <details
                key={title}
                className="group rounded-xl border border-primary-100 bg-primary-50 overflow-hidden mb-3"
              >
                <summary className="p-5 cursor-pointer font-heading font-semibold text-primary hover:bg-primary-100 transition-colors list-none flex items-center justify-between">
                  <span>{title}</span>
                  <span className="chevron transition-transform duration-200 group-open:rotate-180 flex-shrink-0 ml-3">
                    <ChevronDown className="w-5 h-5 text-primary/50" />
                  </span>
                </summary>
                <div className="p-5 pt-0 text-stone text-sm leading-relaxed">
                  {content}
                </div>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* ── 5. Manos Tepexanas — Two Columns ────────────────────────────── */}
      <section className="bg-sand py-20">
        <Container>
          {/* Section header */}
          <div className="mb-12 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-3">
              <span className="block w-8 h-0.5 rounded-full" style={{ backgroundColor: '#9B59B6' }} />
              <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#9B59B6' }}>
                Artesanías
              </span>
            </div>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary">
              Manos Tepexanas
            </h2>
            <p className="mt-2 text-stone text-base max-w-xl leading-relaxed">
              El trabajo manual que ha definido la identidad económica y cultural de Tepexi
              durante siglos.
            </p>
          </div>

          {/* Two equal columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Column 1: El Arte de la Palma */}
            <div className="rounded-2xl border border-primary-100 bg-primary-50 p-8">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(123,63,160,0.15)' }}
                >
                  <Hand className="w-5 h-5" style={{ color: '#7B3FA0' }} />
                </div>
                <h3 className="font-heading font-semibold text-lg text-primary">
                  El Arte de la Palma
                </h3>
              </div>
              <p className="text-stone text-sm leading-relaxed">
                Tejido a mano de sombreros, petates y chiquihuites; una herencia de subsistencia
                invaluable que ha pasado de generación en generación.
              </p>
              <div className="relative rounded-xl overflow-hidden aspect-[16/9] mt-6">
                <Image
                  src="/images/cultura/prueba.jpg"
                  alt="Tejido de palma artesanal"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>

            {/* Column 2: Talla en Piedra */}
            <div className="rounded-2xl border border-primary-100 bg-primary-50 p-8">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(123,63,160,0.15)' }}
                >
                  <Gem className="w-5 h-5" style={{ color: '#7B3FA0' }} />
                </div>
                <h3 className="font-heading font-semibold text-lg text-primary">
                  Talla en Piedra
                </h3>
              </div>
              <p className="text-stone text-sm leading-relaxed">
                Piezas de mármol, cantera y ónix extraídas de los cerros locales y labradas
                por expertos artesanos que dominan una técnica ancestral.
              </p>
              <div className="relative rounded-xl overflow-hidden aspect-[16/9] mt-6">
                <Image
                  src="/images/cultura/prueba.jpg"
                  alt="Talla en piedra artesanal"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── 6. Grid section ─────────────────────────────────────────────── */}
      <section className="py-20">
        <Container>
          {/* Section header */}
          <div className="mb-12 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-3">
              <span className="block w-8 h-0.5 rounded-full" style={{ backgroundColor: '#7B3FA0' }} />
              <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#7B3FA0' }}>
                Patrimonio Cultural
              </span>
            </div>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary">
              Sitios Culturales
            </h2>
            <p className="mt-2 text-stone text-base max-w-xl leading-relaxed">
              Explora en detalle los sitios que conforman la riqueza cultural de nuestra región.
            </p>
          </div>

          {places.length === 0 ? (
            <div className="text-center py-20">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ backgroundColor: 'rgba(74,29,110,0.1)' }}
              >
                <Palette className="w-10 h-10" style={{ color: 'rgba(74,29,110,0.4)' }} />
              </div>
              <h2 className="font-heading font-semibold text-xl text-primary mb-2">
                Sin sitios culturales disponibles
              </h2>
              <p className="text-stone max-w-sm mx-auto">
                Pronto encontrarás aquí el rico patrimonio cultural de Tepexi de Rodríguez.
              </p>
            </div>
          ) : (
            <PlaceGrid places={places} basePath="/cultura" />
          )}
        </Container>
      </section>
    </>
  )
}
