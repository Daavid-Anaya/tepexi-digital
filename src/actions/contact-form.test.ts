import { describe, expect, it } from 'vitest'
import { CONTACT_FIELD_LIMITS } from '@/lib/constants'
import { getContactFormTextValue, validateContactFormData } from '@/actions/contact-form'

describe('contact form helpers', () => {
  it('returns null for missing or non-string values without throwing', () => {
    const formData = new FormData()
    formData.set('name', new Blob(['Ana']), 'name.txt')

    expect(getContactFormTextValue(formData, 'name', CONTACT_FIELD_LIMITS.NAME)).toBeNull()
    expect(getContactFormTextValue(formData, 'email', CONTACT_FIELD_LIMITS.EMAIL)).toBeNull()
  })

  it('trims values, clips them to the configured limits, and keeps optional subject nullable', () => {
    const formData = new FormData()
    formData.set('name', '  Ana  ')
    formData.set('email', 'ana@example.com')
    formData.set('subject', 'x'.repeat(CONTACT_FIELD_LIMITS.SUBJECT + 10))
    formData.set('message', 'y'.repeat(CONTACT_FIELD_LIMITS.MESSAGE + 25))

    const result = validateContactFormData(formData)

    expect(result.success).toBe(true)
    if (!result.success) {
      throw new Error('Expected success result')
    }

    expect(result.data.name).toBe('Ana')
    expect(result.data.subject).toHaveLength(CONTACT_FIELD_LIMITS.SUBJECT)
    expect(result.data.message).toHaveLength(CONTACT_FIELD_LIMITS.MESSAGE)
  })

  it('reports missing required fields after safe extraction', () => {
    const formData = new FormData()
    formData.set('name', '   ')
    formData.set('email', '  ')

    const result = validateContactFormData(formData)

    expect(result).toEqual({
      success: false,
      error: 'Todos los campos obligatorios deben ser completados.',
      fieldErrors: {
        name: 'Ingresa tu nombre.',
        email: 'Ingresa tu correo electrónico.',
        message: 'Escribe tu mensaje.',
      },
    })
  })

  it('rejects invalid emails after trimming', () => {
    const formData = new FormData()
    formData.set('name', 'Ana')
    formData.set('email', ' invalid-email ')
    formData.set('message', 'Hola')

    const result = validateContactFormData(formData)

    expect(result).toEqual({
      success: false,
      error: 'El correo electrónico no es válido.',
      fieldErrors: { email: 'Ingresa un correo electrónico válido.' },
    })
  })
})
