import { describe, expect, it } from 'vitest'
import { getClientIp } from '@/lib/client-ip'

describe('getClientIp', () => {
  it('prefers x-real-ip, which the Vercel proxy sets', () => {
    const headers = new Headers({ 'x-real-ip': '203.0.113.5', 'x-forwarded-for': '198.51.100.7' })

    expect(getClientIp(headers)).toBe('203.0.113.5')
  })

  it('falls back to the first x-forwarded-for value', () => {
    const headers = new Headers({ 'x-forwarded-for': ' 198.51.100.7 , 10.0.0.1' })

    expect(getClientIp(headers)).toBe('198.51.100.7')
  })

  it('accepts IPv6 addresses', () => {
    expect(getClientIp(new Headers({ 'x-real-ip': '2001:db8::1' }))).toBe('2001:db8::1')
  })

  it('returns null when no IP header is present', () => {
    expect(getClientIp(new Headers())).toBeNull()
  })

  it('returns null when the header is not a valid IP', () => {
    expect(getClientIp(new Headers({ 'x-real-ip': 'contact:*' }))).toBeNull()
    expect(getClientIp(new Headers({ 'x-forwarded-for': 'unknown' }))).toBeNull()
  })
})
