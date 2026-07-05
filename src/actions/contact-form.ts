import { CONTACT_FIELD_LIMITS } from '@/lib/constants'

export interface ContactFormFieldErrors {
  name?: string
  email?: string
  message?: string
}

export interface ContactFormSubmission {
  name: string
  email: string
  subject: string | null
  message: string
}

export type ContactFormValidationResult =
  | { success: true; data: ContactFormSubmission }
  | {
      success: false
      error: string
      fieldErrors: ContactFormFieldErrors
    }

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function getContactFormTextValue(
  formData: FormData,
  field: string,
  maxLength: number,
): string | null {
  const value = formData.get(field)

  if (typeof value !== 'string') {
    return null
  }

  return value.slice(0, maxLength).trim()
}

export function validateContactFormData(formData: FormData): ContactFormValidationResult {
  const name = getContactFormTextValue(formData, 'name', CONTACT_FIELD_LIMITS.NAME)
  const email = getContactFormTextValue(formData, 'email', CONTACT_FIELD_LIMITS.EMAIL)
  const subject = getContactFormTextValue(formData, 'subject', CONTACT_FIELD_LIMITS.SUBJECT)
  const message = getContactFormTextValue(formData, 'message', CONTACT_FIELD_LIMITS.MESSAGE)

  if (!name || !email || !message) {
    return {
      success: false,
      error: 'Todos los campos obligatorios deben ser completados.',
      fieldErrors: {
        ...(name ? {} : { name: 'Ingresa tu nombre.' }),
        ...(email ? {} : { email: 'Ingresa tu correo electrónico.' }),
        ...(message ? {} : { message: 'Escribe tu mensaje.' }),
      },
    }
  }

  if (!EMAIL_PATTERN.test(email)) {
    return {
      success: false,
      error: 'El correo electrónico no es válido.',
      fieldErrors: { email: 'Ingresa un correo electrónico válido.' },
    }
  }

  return {
    success: true,
    data: {
      name,
      email,
      subject: subject || null,
      message,
    },
  }
}
