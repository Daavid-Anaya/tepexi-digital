'use server'

import 'server-only'
import { Resend } from 'resend'
import { headers } from 'next/headers'
import { rateLimit } from '@/lib/rate-limit'
import { SITE_URL } from '@/lib/constants'

const resend = new Resend(process.env.RESEND_API_KEY)

// 5 emails per 15 minutes per IP
const CONTACT_RATE_LIMIT = { limit: 5, windowSeconds: 900 }

export async function sendContactMessage(
  prevState: { success: boolean; error: string | null },
  formData: FormData,
) {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { allowed } = rateLimit(`contact:${ip}`, CONTACT_RATE_LIMIT)
  if (!allowed) {
    return {
      success: false,
      error: 'Demasiados mensajes enviados. Intente de nuevo más tarde.',
    }
  }

  const name = (formData.get('name') as string)?.slice(0, 100)
  const email = (formData.get('email') as string)?.slice(0, 254)
  const subject = (formData.get('subject') as string)?.slice(0, 200)
  const message = (formData.get('message') as string)?.slice(0, 5000)

  // Server-side validation
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return {
      success: false,
      error: 'Todos los campos obligatorios deben ser completados.',
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'El correo electrónico no es válido.' }
  }

  try {
    await resend.emails.send({
      from: `Tepexi Digital <noreply@${new URL(SITE_URL).hostname}>`,
      to: process.env.CONTACT_RECIPIENT_EMAIL!,
      replyTo: `${name} <${email}>`,
      subject: subject ? `Contacto: ${subject}` : `Contacto de ${name}`,
      text: [
        `De: ${name} <${email}>`,
        `Asunto: ${subject || 'Sin asunto'}`,
        '',
        '─────────────────────────────',
        '',
        message,
        '',
        '─────────────────────────────',
        `Este mensaje fue enviado desde el formulario de contacto de ${new URL(SITE_URL).hostname}`,
      ].join('\n'),
    })
    return { success: true, error: null }
  } catch {
    return {
      success: false,
      error: 'Error al enviar el mensaje. Intente más tarde.',
    }
  }
}
