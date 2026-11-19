import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sendEmailMock = vi.fn()
const headersMock = vi.fn()
const rateLimitMock = vi.fn()

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

vi.mock('@/lib/rate-limit', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/rate-limit')>()),
  rateLimit: rateLimitMock,
}))

describe('sendContactMessage', () => {
  beforeEach(() => {
    headersMock.mockResolvedValue(new Headers({ 'x-forwarded-for': '203.0.113.5' }))
    sendEmailMock.mockResolvedValue({ id: 'email-1' })
    rateLimitMock.mockResolvedValue({ status: 'allowed', remaining: 4, retryAfterSeconds: 0 })
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    process.env.CONTACT_RECIPIENT_EMAIL = 'destino@example.com'
    process.env.RESEND_API_KEY = 'test-api-key'
  })

  afterEach(() => {
    vi.resetModules()
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
      route: '/contacto',
      runtime: 'server',
      source: 'sendContactMessage',
      statusCode: 502,
      timestamp: expect.any(String),
      metadata: {
        hasSubject: true,
        provider: 'resend',
      },
      error: {
        digest: null,
        name: 'Error',
        message: 'provider unavailable',
      },
    })
  })

  it('rate limits by the client IP before validating or sending mail', async () => {
    headersMock.mockResolvedValue(new Headers({ 'x-real-ip': '198.51.100.7', 'x-forwarded-for': '203.0.113.5' }))
    const { sendContactMessage } = await import('@/actions/contact')
    const formData = new FormData()
    formData.set('name', 'Ana')
    formData.set('email', 'ana@example.com')
    formData.set('message', 'Hola')

    await sendContactMessage({ success: true, error: null }, formData)

    expect(rateLimitMock).toHaveBeenCalledWith('contact:198.51.100.7', { limit: 5, windowSeconds: 900 })
    expect(sendEmailMock).toHaveBeenCalledTimes(1)
  })

  it('groups requests without a trusted IP under a shared key', async () => {
    headersMock.mockResolvedValue(new Headers({ 'x-forwarded-for': 'not-an-ip' }))
    const { sendContactMessage } = await import('@/actions/contact')

    await sendContactMessage({ success: true, error: null }, new FormData())

    expect(rateLimitMock).toHaveBeenCalledWith('contact:unknown', { limit: 5, windowSeconds: 900 })
  })

  it('tells the visitor how long to wait and skips validation and mail when blocked', async () => {
    rateLimitMock.mockResolvedValueOnce({ status: 'blocked', remaining: 0, retryAfterSeconds: 840 })
    const { sendContactMessage } = await import('@/actions/contact')

    const result = await sendContactMessage({ success: true, error: null }, new FormData())

    expect(result).toEqual({
      success: false,
      error: 'Demasiados mensajes enviados. Intente de nuevo en 14 minutos.',
    })
    expect(sendEmailMock).not.toHaveBeenCalled()
  })

  it('uses the singular form when less than a minute remains', async () => {
    rateLimitMock.mockResolvedValueOnce({ status: 'blocked', remaining: 0, retryAfterSeconds: 30 })
    const { sendContactMessage } = await import('@/actions/contact')

    const result = await sendContactMessage({ success: true, error: null }, new FormData())

    expect(result.error).toBe('Demasiados mensajes enviados. Intente de nuevo en 1 minuto.')
  })

  it('fails closed without sending mail when the rate limit store is unavailable', async () => {
    rateLimitMock.mockResolvedValueOnce({ status: 'unavailable', remaining: 0, retryAfterSeconds: 0 })
    const { sendContactMessage } = await import('@/actions/contact')
    const formData = new FormData()
    formData.set('name', 'Ana')
    formData.set('email', 'ana@example.com')
    formData.set('message', 'Hola')

    const result = await sendContactMessage({ success: true, error: null }, formData)

    expect(result).toEqual({
      success: false,
      error: 'El formulario no está disponible en este momento. Intente más tarde.',
    })
    expect(sendEmailMock).not.toHaveBeenCalled()
  })

  it('returns a generic error and does not send mail when contact env configuration is missing', async () => {
    delete process.env.RESEND_API_KEY
    delete process.env.CONTACT_RECIPIENT_EMAIL
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
    expect(sendEmailMock).not.toHaveBeenCalled()
    expect(console.error).toHaveBeenCalledWith('[contact] contact form configuration is incomplete', {
      route: '/contacto',
      runtime: 'server',
      source: 'sendContactMessage',
      statusCode: 500,
      timestamp: expect.any(String),
      metadata: {
        hasContactRecipientEmail: false,
        hasResendApiKey: false,
        provider: 'resend',
      },
    })
  })
})
