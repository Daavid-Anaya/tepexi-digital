import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import ContactForm from '@/components/contact/ContactForm'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Ponte en contacto con el equipo de Tepexi Digital.',
}

const contactItems = [
  {
    icon: MapPin,
    title: 'Ubicación',
    content: 'Tepexi de Rodríguez, Puebla, México.',
    colorClass: 'bg-primary/10',
    iconColor: 'text-primary',
    href: null as string | null,
  },
  {
    icon: Mail,
    title: 'Correo electrónico',
    content: 'contacto@tepexidigital.com',
    colorClass: 'bg-secondary/10',
    iconColor: 'text-secondary',
    href: 'mailto:contacto@tepexidigital.com',
  },
  {
    icon: Phone,
    title: 'Redes sociales',
    content: 'Próximamente en Instagram y Facebook.',
    colorClass: 'bg-accent/10',
    iconColor: 'text-accent',
    href: null,
  },
]

export default function ContactoPage() {
  return (
    <>
      {/* Page hero */}
      <section className="relative overflow-hidden bg-secondary py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-secondary-light" />
          <div className="absolute bottom-0 left-1/4 w-40 h-40 rounded-full" style={{ backgroundColor: '#1B5E20' }} />
        </div>

        <Container className="relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-white/90">Contacto</span>
          </nav>

          <div className="flex items-start gap-5">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-4xl md:text-5xl text-white leading-tight mb-3">
                Contacto
              </h1>
              <p className="text-white/75 text-lg max-w-2xl leading-relaxed">
                ¿Tienes preguntas o sugerencias? Escríbenos y te responderemos
                a la brevedad.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Contact form — takes more space */}
            <div className="lg:col-span-3">
              <div className="bg-cream rounded-2xl border border-stone/10 overflow-hidden shadow-sm">
                <div className="bg-primary px-6 py-4">
                  <h2 className="font-heading font-semibold text-white text-lg">
                    Envíanos un mensaje
                  </h2>
                  <p className="text-white/70 text-sm mt-0.5">
                    Te respondemos en menos de 48 horas.
                  </p>
                </div>
                <div className="p-6">
                  <ContactForm />
                </div>
              </div>
            </div>

            {/* Contact info */}
            <div className="lg:col-span-2 space-y-5">
              <h2 className="font-heading font-semibold text-primary text-2xl">
                Información de contacto
              </h2>

              <div className="space-y-4">
                {contactItems.map((item) => {
                  const Icon = item.icon
                  const content = (
                    <div className="bg-cream rounded-2xl border border-stone/10 p-5 flex items-start gap-4 hover:shadow-sm hover:border-stone/20 transition-all">
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
