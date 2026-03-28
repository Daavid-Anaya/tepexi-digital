'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { sendContactMessage } from '@/actions/contact'
import { cn } from '@/lib/utils'

const initialState = { success: false, error: null }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        'w-full rounded-md bg-primary px-6 py-3 text-white font-medium',
        'hover:bg-primary-dark transition-colors',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
      )}
    >
      {pending ? 'Enviando…' : 'Enviar mensaje'}
    </button>
  )
}

const inputClass = cn(
  'w-full rounded-md border border-stone/30 bg-white px-4 py-2.5 text-sm',
  'placeholder:text-stone/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
)

export default function ContactForm() {
  const [state, formAction] = useActionState(sendContactMessage, initialState)

  if (state.success) {
    return (
      <div className="rounded-lg bg-secondary/10 border border-secondary/20 p-6 text-center">
        <p className="text-secondary font-medium text-lg">
          ¡Mensaje enviado! Nos pondremos en contacto pronto.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="bg-cream rounded-lg p-6 space-y-5">
      {state.error && (
        <div className="rounded-md bg-accent/10 border border-accent/20 px-4 py-3">
          <p className="text-accent text-sm">{state.error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-sm font-medium text-stone">
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

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-stone">
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

      <div className="space-y-1.5">
        <label htmlFor="subject" className="block text-sm font-medium text-stone">
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

      <div className="space-y-1.5">
        <label htmlFor="message" className="block text-sm font-medium text-stone">
          Mensaje <span className="text-accent">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder="Escribe tu mensaje aquí…"
          className={cn(inputClass, 'resize-y min-h-[120px]')}
        />
      </div>

      <SubmitButton />
    </form>
  )
}
