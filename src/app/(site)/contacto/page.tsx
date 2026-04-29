import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import ContactForm from '@/components/contact/ContactForm'
import { getSettings } from '@/lib/data'
import { PageHero, PageHeroBreadcrumb, PageHeroHeader } from '@/components/ui/PageHero'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Ponte en contacto con el equipo de Tepexi Digital.',
}

export default async function ContactoPage() {
  const settings = await getSettings()

  const contactItems = [
    {
      icon: MapPin,
      title: 'Ubicaci\u00f3n',
      content: settings.address || 'Tepexi de Rodr\u00edguez, Puebla, M\u00e9xico.',
      colorClass: 'bg-primary/10',
      iconColor: 'text-primary',
      href: null as string | null,
    },
    {
      icon: Mail,
      title: 'Correo electr\u00f3nico',
      content: settings.contactEmail || 'contacto@tepexidigital.com',
      colorClass: 'bg-secondary/10',
      iconColor: 'text-secondary',
      href: settings.contactEmail
        ? `mailto:${settings.contactEmail}`
        : 'mailto:contacto@tepexidigital.com',
    },
    {
      icon: Phone,
      title: 'Tel\u00e9fono',
      content: settings.contactPhone || 'Pr\u00f3ximamente.',
      colorClass: 'bg-accent/10',
      iconColor: 'text-accent',
      href: settings.contactPhone ? `tel:${settings.contactPhone}` : null,
    },
  ]
  return (
    <>
      {/* Page hero */}
      <PageHero imageUrl="/images/contacto/img-hero-contacto.jpg" imageAlt="Imagen hero de contacto">
        <PageHeroBreadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Contacto' }]} />
        <PageHeroHeader
          icon={MessageCircle}
          title="Contacto"
          description="¿Tienes preguntas o sugerencias? Escríbenos y te responderemos a la brevedad."
        />
      </PageHero>

      <section className="py-10 md:py-16">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Contact form — takes more space */}
            <div className="lg:col-span-3">
              <div className="bg-cream rounded-2xl border border-stone/10 overflow-hidden shadow-sm">
                <div className="bg-primary px-4 sm:px-6 py-4">
                  <h2 className="font-heading font-semibold text-white text-lg">
                    Envíanos un mensaje
                  </h2>
                  <p className="text-white/70 text-sm mt-0.5">
                    Te respondemos en menos de 48 horas.
                  </p>
                </div>
                <div className="p-4 sm:p-6">
                  <ContactForm />
                </div>
              </div>
            </div>

            {/* Contact info */}
            <div className="lg:col-span-2 space-y-5">
              <h2 className="font-heading font-semibold text-text-primary text-xl sm:text-2xl">
                Información de contacto
              </h2>

              <div className="space-y-4">
                {contactItems.map((item) => {
                  const Icon = item.icon
                  const content = (
                    <div className="bg-cream rounded-2xl border border-stone/10 p-4 sm:p-5 flex items-start gap-4 hover:shadow-sm hover:border-stone/20 transition-all">
                      <div className={`flex-shrink-0 w-11 h-11 rounded-xl ${item.colorClass} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${item.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold text-primary text-sm">{item.title}</h3>
                        <p className="text-stone text-sm mt-0.5 leading-relaxed">{item.content}</p>
                      </div>
                    </div>
                  )

                  return item.href ? (
                    <a key={item.title} href={item.href} className="block">
                      {content}
                    </a>
                  ) : (
                    <div key={item.title}>{content}</div>
                  )
                })}
              </div>

              {/* CTA panel */}
              <div className="bg-primary/5 rounded-2xl border border-primary/15 p-5">
                <p className="text-sm text-stone/80 leading-relaxed">
                  También puedes explorar nuestra plataforma para conocer los{' '}
                  <Link href="/lugares" className="text-primary font-medium hover:underline underline-offset-4">
                    lugares turísticos
                  </Link>
                  ,{' '}
                  <Link href="/gastronomia" className="text-accent font-medium hover:underline underline-offset-4">
                    gastronomía
                  </Link>{' '}
                  y{' '}
                  <Link href="/cultura" className="text-primary font-medium hover:underline underline-offset-4">
                    cultura
                  </Link>{' '}
                  de Tepexi de Rodríguez.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
