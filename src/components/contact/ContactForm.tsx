'use client'

import { useActionState, useRef, useEffect } from 'react'
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
  'w-full rounded-xl border border-stone/50 bg-white px-4 py-3 text-sm text-stone',
  'placeholder:text-stone/50',
  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
  'transition-all duration-150',
)

const labelClass = 'block text-xs font-semibold text-stone uppercase tracking-wide mb-1.5'

const REQUIRED_FIELDS_ERROR = 'Todos los campos obligatorios deben ser completados.'
const INVALID_EMAIL_ERROR = 'El correo electrónico no es válido.'
const fieldErrorClass = 'mt-1.5 text-xs font-medium text-accent'

export default function ContactForm() {
  const [state, formAction] = useActionState(sendContactMessage, initialState)
  const successRef = useRef<HTMLHeadingElement>(null)

  const nameError = state.error === REQUIRED_FIELDS_ERROR ? 'Ingresa tu nombre.' : null
  const emailError =
    state.error === REQUIRED_FIELDS_ERROR
      ? 'Ingresa tu correo electrónico.'
      : state.error === INVALID_EMAIL_ERROR
        ? 'Ingresa un correo electrónico válido.'
        : null
  const messageError = state.error === REQUIRED_FIELDS_ERROR ? 'Escribe tu mensaje.' : null

  useEffect(() => {
    if (state.success) successRef.current?.focus()
  }, [state.success])

  if (state.success) {
    return (
      <div className="rounded-2xl bg-secondary/8 border border-secondary/20 p-8 text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-secondary/15 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-secondary" aria-hidden="true" />
        </div>
        <h3 ref={successRef} tabIndex={-1} className="font-heading font-semibold text-primary text-lg">
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
        <div role="alert" className="rounded-xl border border-accent/25 bg-accent/8 px-4 py-3.5 flex items-start gap-3">
          <AlertCircle className="w-4.5 h-4.5 text-accent flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-accent">Error al enviar</p>
            <p className="text-xs text-accent/80 mt-0.5">{state.error}</p>
          </div>
        </div>
      )}

      <fieldset className="space-y-5">
        <legend className="sr-only">Información de contacto (campos requeridos)</legend>

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
              autoComplete="name"
              aria-invalid={!!nameError}
              aria-describedby={nameError ? 'name-error' : undefined}
              placeholder="Tu nombre completo"
              className={inputClass}
            />
            {nameError && (
              <p id="name-error" className={fieldErrorClass}>
                {nameError}
              </p>
            )}
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
              autoComplete="email"
              aria-invalid={!!emailError}
              aria-describedby={emailError ? 'email-error' : undefined}
              placeholder="tu@correo.com"
              className={inputClass}
            />
            {emailError && (
              <p id="email-error" className={fieldErrorClass}>
                {emailError}
              </p>
            )}
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
            aria-invalid={!!messageError}
            aria-describedby={messageError ? 'message-error' : undefined}
            placeholder="Escribe tu mensaje aquí…"
            className={cn(inputClass, 'resize-y min-h-[140px]')}
          />
          {messageError && (
            <p id="message-error" className={fieldErrorClass}>
              {messageError}
            </p>
          )}
        </div>
      </fieldset>

      <p className="text-center text-xs text-stone/50">
        Al enviar este formulario aceptas que utilicemos tus datos únicamente
        para responderte.
      </p>

      <SubmitButton />
    </form>
  )
}
