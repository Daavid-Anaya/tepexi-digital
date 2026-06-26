import { Clock } from 'lucide-react'
import { Container } from '@/components/ui/Container'

interface Step {
  title: string
  description: string
  duration: string | null
}

interface PreparationTimelineProps {
  steps: Step[]
}

export function PreparationTimeline({ steps }: PreparationTimelineProps) {
  return (
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

          {steps.map((step, index) => {
            const isLeft = index % 2 === 0
            return (
              <div key={index} className="relative mb-12 last:mb-0">
                {/* Step circle — centered on the line (desktop), left-aligned (mobile) */}
                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 z-10">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-white text-sm shadow-md bg-accent">
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
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border flex-shrink-0 text-accent border-accent/20 bg-accent/5">
                          <Clock className="w-3 h-3" />
                          {step.duration}
                        </span>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-stone">{step.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
