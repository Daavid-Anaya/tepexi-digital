'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { sendContactMessage } from '@/actions/contact'
import { cn } from '@/lib/utils'
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

const initialState = { success: false, error: null }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        'w-full flex items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-white font-semibold text-sm',
        'bg-primary hover:bg-primary-dark transition-colors',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        'shadow-sm hover:shadow-md',
      )}
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Enviando mensaje…
        </>
      ) : (
        <>
          <Send className="w-4 h-4" />
          Enviar mensaje
        </>
      )}
    </button>
  )
}

const inputClass = cn(
  'w-full rounded-xl border border-stone/25 bg-white px-4 py-3 text-sm text-stone',
  'placeholder:text-stone/50',
  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
  'transition-all duration-150',
)

const labelClass = 'block text-xs font-semibold text-stone/70 uppercase tracking-wide mb-1.5'

export default function ContactForm() {
  const [state, formAction] = useActionState(sendContactMessage, initialState)

  if (state.success) {
    return (
      <div className="rounded-2xl bg-secondary/8 border border-secondary/20 p-8 text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-secondary/15 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-secondary" />
        </div>
        <h3 className="font-heading font-semibold text-primary text-lg">
          ¡Mensaje enviado!
        </h3>
        <p className="text-stone text-sm leading-relaxed">
          Gracias por escribirnos. Nos pondremos en contacto contigo a la brevedad.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-5">
      {/* Error state */}
      {state.error && (
        <div className="rounded-xl border border-accent/25 bg-accent/8 px-4 py-3.5 flex items-start gap-3">
          <AlertCircle className="w-4.5 h-4.5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-accent">Error al enviar</p>
            <p className="text-xs text-accent/80 mt-0.5">{state.error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className={labelClass}>
            Nombre <span className="text-accent">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Tu nombre completo"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Correo electrónico <span className="text-accent">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="tu@correo.com"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className={labelClass}>
          Asunto
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          placeholder="¿En qué podemos ayudarte?"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Mensaje <span className="text-accent">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder="Escribe tu mensaje aquí…"
          className={cn(inputClass, 'resize-y min-h-[140px]')}
        />
      </div>

      <SubmitButton />

      <p className="text-center text-xs text-stone/50">
        Al enviar este formulario aceptas que utilicemos tus datos únicamente
        para responderte.
      </p>
    </form>
  )
}
