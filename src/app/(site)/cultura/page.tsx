import type { Metadata } from 'next'
import Image from 'next/image'
import { Palette, Crown, Route, ShieldUser, Users, ChevronDown, Hand, Gem } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { PageHero, PageHeroBreadcrumb, PageHeroHeader, PageHeroStats } from '@/components/ui/PageHero'

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
    image: '/images/cultura/cantera-tlayua.jpg',
  },
  {
    title: 'Pie de Vaca',
    description: 'Huellas petrificadas de camélidos y felinos del Pleistoceno.',
    image: '/images/cultura/pie-de-vaca.jpg',
  },
  {
    title: 'Tepexi el Viejo',
    description: 'Imponente zona arqueológica de la antigua fortaleza popoloca.',
    image: '/images/cultura/tepexi-el-viejo.jpg',
  },
  {
    title: 'Ex-convento de Santo Domingo',
    description: 'Joya de la arquitectura religiosa del siglo XVI.',
    image: '/images/cultura/iglesia.jpg',
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
  return (
    <>
      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <PageHero imageUrl="/images/cultura/img-hero-cultura.jpg" imageAlt="Imagen hero de cultura">
        <PageHeroBreadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Cultura' }]} />
        <PageHeroHeader
          icon={Palette}
          title="Cultura"
          description="Sitios arqueológicos, tradiciones vivas, artesanías y el patrimonio ancestral de la Mixteca Poblana que persiste a través de los siglos."
        />
        <PageHeroStats stats={[{ value: 4, label: 'sitios' }, { value: 'Prehispánico', label: 'legado' }, { value: 'Patrimonio', label: 'categoría' }]} />
      </PageHero>

      {/* ── 2. Evolución Histórica — Timeline ───────────────────────────── */}
      <section className="bg-cream py-12 md:py-20">
        <Container>
          {/* Section header */}
          <div className="mb-8 md:mb-12 animate-fade-in-up">
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
                  src="/images/cultura/palacio-municipal.jpg"
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

                    <div className="bg-primary-50 rounded-xl p-4 sm:p-6 border border-primary-100 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
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
      <section className="bg-sand py-12 md:py-20">
        <Container>
          {/* Section header */}
          <div className="mb-8 md:mb-12 animate-fade-in-up">
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
            {exploraCards.map(({ title, description, image }) => (
              <Card key={title} className="flex flex-col">
                {/* Card image */}
                <div className="relative w-full aspect-square overflow-hidden">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
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

      {/* ── 4. Tradiciones Vivas — Accordion ────────────────────────────── */}
      <section className="bg-cream py-12 md:py-20">
        <Container>
          {/* Section header */}
          <div className="mb-8 md:mb-12 animate-fade-in-up">
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
                <summary className="p-4 sm:p-5 cursor-pointer font-heading font-semibold text-primary hover:bg-primary-100 transition-colors list-none flex items-center justify-between">
                  <span>{title}</span>
                  <span className="chevron transition-transform duration-200 group-open:rotate-180 flex-shrink-0 ml-3">
                    <ChevronDown className="w-5 h-5 text-primary/50" />
                  </span>
                </summary>
                <div className="p-4 sm:p-5 pt-0 text-stone text-sm leading-relaxed">
                  {content}
                </div>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* ── 5. Manos Tepexanas — Two Columns ────────────────────────────── */}
      <section className="bg-sand py-12 md:py-20">
        <Container>
          {/* Section header */}
          <div className="mb-8 md:mb-12 animate-fade-in-up">
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
            <div className="rounded-2xl border border-primary-100 bg-primary-50 p-5 sm:p-8">
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
                  src="/images/cultura/tejido-palma.jpg"
                  alt="Tejido de palma artesanal"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>

            {/* Column 2: Talla en Piedra */}
            <div className="rounded-2xl border border-primary-100 bg-primary-50 p-5 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(123,63,160,0.15)' }}
                >
                  <Gem className="w-5 h-5" style={{ color: '#7B3FA0' }} />
                </div>
                <h3 className="font-heading font-semibold text-lg text-primary">
                  Corte en Piedra
                </h3>
              </div>
              <p className="text-stone text-sm leading-relaxed">
                Piezas de mármol, cantera y ónix extraídas de los cerros locales y trabajadas
                por expertos.
              </p>
              <div className="relative rounded-xl overflow-hidden aspect-[16/9] mt-6">
                <Image
                  src="/images/cultura/pieza-onix.jpg"
                  alt="Piezas de onix"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

    </>
  )
}
