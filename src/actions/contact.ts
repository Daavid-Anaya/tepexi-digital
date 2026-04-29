'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendContactMessage(
  prevState: { success: boolean; error: string | null },
  formData: FormData,
) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const subject = formData.get('subject') as string
  const message = formData.get('message') as string

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
    // TODO: Change to 'Tepexi Digital <noreply@tepexidigital.com.mx>' once domain is verified in Resend
    await resend.emails.send({
      from: 'Tepexi Digital <onboarding@resend.dev>',
      to: process.env.CONTACT_RECIPIENT_EMAIL!,
      subject: subject ? `Contacto: ${subject}` : `Contacto de ${name}`,
      text: `Nombre: ${name}\nEmail: ${email}\nAsunto: ${subject || 'Sin asunto'}\n\nMensaje:\n${message}`,
    })
    return { success: true, error: null }
  } catch {
    return {
      success: false,
      error: 'Error al enviar el mensaje. Intente más tarde.',
    }
  }
}
