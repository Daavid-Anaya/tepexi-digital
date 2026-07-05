import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sendEmailMock = vi.fn()
const headersMock = vi.fn()
const rateLimitMock = vi.fn(() => ({ allowed: true }))

vi.mock('resend', () => ({
  Resend: vi.fn(() => ({
    emails: {
      send: sendEmailMock,
    },
  })),
}))

vi.mock('next/headers', () => ({
  headers: headersMock,
}))

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: rateLimitMock,
}))

describe('sendContactMessage', () => {
  beforeEach(() => {
    headersMock.mockResolvedValue(new Headers({ 'x-forwarded-for': '203.0.113.5' }))
    sendEmailMock.mockResolvedValue({ id: 'email-1' })
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    process.env.CONTACT_RECIPIENT_EMAIL = 'destino@example.com'
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  it('sanitizes control characters before using name and subject in email headers', async () => {
    const { sendContactMessage } = await import('@/actions/contact')
    const formData = new FormData()
    formData.set('name', 'María\r\nBecerril')
    formData.set('email', 'maria@example.com')
    formData.set('subject', 'Hola\n\tTepexi')
    formData.set('message', 'Mensaje legítimo')

    const result = await sendContactMessage({ success: true, error: null }, formData)

    expect(result).toEqual({ success: true, error: null, fieldErrors: {} })
    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        replyTo: 'María Becerril <maria@example.com>',
        subject: 'Contacto: Hola Tepexi',
        text: expect.stringContaining('De: María Becerril <maria@example.com>'),
      }),
    )
  })

  it('logs minimal context and returns a generic error when Resend fails', async () => {
    sendEmailMock.mockRejectedValueOnce(new Error('provider unavailable'))
    const { sendContactMessage } = await import('@/actions/contact')
    const formData = new FormData()
    formData.set('name', 'Ana')
    formData.set('email', 'ana@example.com')
    formData.set('subject', 'Consulta')
    formData.set('message', 'Hola')

    const result = await sendContactMessage({ success: true, error: null }, formData)

    expect(result).toEqual({
      success: false,
      error: 'Error al enviar el mensaje. Intente más tarde.',
      fieldErrors: {},
    })
    expect(console.error).toHaveBeenCalledWith('[contact] sendContactMessage failed', {
      source: 'sendContactMessage',
      hasSubject: true,
      error: {
        name: 'Error',
        message: 'provider unavailable',
      },
    })
  })
})
