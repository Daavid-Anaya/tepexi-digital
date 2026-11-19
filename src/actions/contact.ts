'use server'

import 'server-only'
import { Resend } from 'resend'
import { headers } from 'next/headers'
import { getClientIp, UNKNOWN_CLIENT_IP } from '@/lib/client-ip'
import { RATE_LIMIT_STATUS, rateLimit } from '@/lib/rate-limit'
import { RATE_LIMITS, SITE_URL } from '@/lib/constants'
import { logError } from '@/lib/observability'
import {
  type ContactFormFieldErrors,
  validateContactFormData,
} from '@/actions/contact-form'

const resend = new Resend(process.env.RESEND_API_KEY)

function sanitizeEmailHeaderValue(value: string): string {
  return value.replace(/[\u0000-\u001F\u007F]+/g, ' ').replace(/\s+/g, ' ').trim()
}

export interface ContactFormState {
  success: boolean
  error: string | null
  fieldErrors?: ContactFormFieldErrors
}

export async function sendContactMessage(
  _prevState: ContactFormState,
  formData: FormData,
) {
  const ip = getClientIp(await headers()) ?? UNKNOWN_CLIENT_IP
  const limitResult = await rateLimit(`contact:${ip}`, RATE_LIMITS.CONTACT)

  // Fail closed: without a working limiter the form could be used to send
  // unlimited mail, so it stays unavailable until the store recovers.
  if (limitResult.status === RATE_LIMIT_STATUS.UNAVAILABLE) {
    return {
      success: false,
      error: 'El formulario no está disponible en este momento. Intente más tarde.',
    }
  }

  if (limitResult.status === RATE_LIMIT_STATUS.BLOCKED) {
    const minutes = Math.max(1, Math.ceil(limitResult.retryAfterSeconds / 60))
    return {
      success: false,
      error: `Demasiados mensajes enviados. Intente de nuevo en ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}.`,
    }
  }
  const validationResult = validateContactFormData(formData)

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error,
      fieldErrors: validationResult.fieldErrors,
    }
  }

  const { name, email, subject, message } = validationResult.data
  const safeName = sanitizeEmailHeaderValue(name) || 'Visitante'
  const safeSubject = subject ? sanitizeEmailHeaderValue(subject) || null : null
  const hasResendApiKey = Boolean(process.env.RESEND_API_KEY)
  const contactRecipientEmail = process.env.CONTACT_RECIPIENT_EMAIL

  if (!hasResendApiKey || !contactRecipientEmail) {
    logError('[contact] contact form configuration is incomplete', {
      source: 'sendContactMessage',
      route: '/contacto',
      metadata: {
        hasContactRecipientEmail: Boolean(contactRecipientEmail),
        hasResendApiKey,
        provider: 'resend',
      },
      statusCode: 500,
    })

    return {
      success: false,
      error: 'Error al enviar el mensaje. Intente más tarde.',
      fieldErrors: {},
    }
  }

  try {
    await resend.emails.send({
      from: `Tepexi Digital <noreply@${new URL(SITE_URL).hostname}>`,
      to: contactRecipientEmail,
      replyTo: `${safeName} <${email}>`,
      subject: safeSubject ? `Contacto: ${safeSubject}` : `Contacto de ${safeName}`,
      text: [
        `De: ${safeName} <${email}>`,
        `Asunto: ${safeSubject || 'Sin asunto'}`,
        '',
        '─────────────────────────────',
        '',
        message,
        '',
        '─────────────────────────────',
        `Este mensaje fue enviado desde el formulario de contacto de ${new URL(SITE_URL).hostname}`,
      ].join('\n'),
    })
    return { success: true, error: null, fieldErrors: {} }
  } catch (error) {
    logError('[contact] sendContactMessage failed', {
      source: 'sendContactMessage',
      route: '/contacto',
      metadata: {
        hasSubject: Boolean(safeSubject),
        provider: 'resend',
      },
      error,
      statusCode: 502,
    })

    return {
      success: false,
      error: 'Error al enviar el mensaje. Intente más tarde.',
      fieldErrors: {},
    }
  }
}
