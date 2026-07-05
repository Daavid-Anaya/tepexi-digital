'use server'

import 'server-only'
import { Resend } from 'resend'
import { headers } from 'next/headers'
import { rateLimit } from '@/lib/rate-limit'
import { RATE_LIMITS, SITE_URL } from '@/lib/constants'
import {
  type ContactFormFieldErrors,
  validateContactFormData,
} from '@/actions/contact-form'

const resend = new Resend(process.env.RESEND_API_KEY)

function sanitizeEmailHeaderValue(value: string): string {
  return value.replace(/[\u0000-\u001F\u007F]+/g, ' ').replace(/\s+/g, ' ').trim()
}

function getErrorLogDetails(error: unknown): { name?: string; message: string } {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    }
  }

  return {
    message: 'Unknown error',
  }
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
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { allowed } = rateLimit(`contact:${ip}`, RATE_LIMITS.CONTACT)
  if (!allowed) {
    return {
      success: false,
      error: 'Demasiados mensajes enviados. Intente de nuevo más tarde.',
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

  try {
    await resend.emails.send({
      from: `Tepexi Digital <noreply@${new URL(SITE_URL).hostname}>`,
      to: process.env.CONTACT_RECIPIENT_EMAIL!,
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
    console.error('[contact] sendContactMessage failed', {
      source: 'sendContactMessage',
      hasSubject: !!safeSubject,
      error: getErrorLogDetails(error),
    })

    return {
      success: false,
      error: 'Error al enviar el mensaje. Intente más tarde.',
      fieldErrors: {},
    }
  }
}
