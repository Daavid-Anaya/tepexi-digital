import { describe, expect, it } from 'vitest'
import { getClientIp, getClientIpBucket } from '@/lib/client-ip'

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

describe('getClientIpBucket', () => {
  function bucketFor(ip: string): string {
    return getClientIpBucket(new Headers({ 'x-real-ip': ip }))
  }

  it('keeps the full address for IPv4', () => {
    expect(bucketFor('203.0.113.5')).toBe('203.0.113.5')
    expect(bucketFor('203.0.113.6')).not.toBe(bucketFor('203.0.113.5'))
  })

  it('groups IPv6 addresses of the same /64 into one bucket', () => {
    expect(bucketFor('2001:db8:1:2::1')).toBe('2001:db8:1:2::/64')
    expect(bucketFor('2001:db8:1:2:ffff:ffff:ffff:ffff')).toBe('2001:db8:1:2::/64')
  })

  it('keeps IPv6 addresses of different /64 prefixes apart', () => {
    expect(bucketFor('2001:db8:1:3::1')).not.toBe(bucketFor('2001:db8:1:2::1'))
  })

  it('produces the same bucket for compressed and expanded forms of an address', () => {
    expect(bucketFor('2001:0DB8:0000:0000:0000:0000:0000:0001')).toBe(bucketFor('2001:db8::1'))
    expect(bucketFor('2001:db8::1')).toBe('2001:db8:0:0::/64')
  })

  it('maps IPv4-mapped IPv6 addresses to their IPv4 bucket', () => {
    expect(bucketFor('::ffff:203.0.113.5')).toBe('203.0.113.5')
    expect(bucketFor('::ffff:cb00:7105')).toBe('203.0.113.5')
  })

  it('groups IPv6 addresses with an embedded IPv4 tail that is not IPv4-mapped by their /64', () => {
    expect(bucketFor('64:ff9b::203.0.113.5')).toBe('64:ff9b:0:0::/64')
    expect(bucketFor('2001:db8:1:2:3:4:198.51.100.7')).toBe('2001:db8:1:2::/64')
    expect(bucketFor('2001:db8:1:2:3:4:198.51.100.7')).toBe(bucketFor('2001:db8:1:2::1'))
  })

  it('ignores an IPv6 zone identifier', () => {
    expect(bucketFor('fe80::1%eth0')).toBe('fe80:0:0:0::/64')
  })

  it('returns the shared unknown bucket without a valid IP', () => {
    expect(getClientIpBucket(new Headers())).toBe('unknown')
    expect(getClientIpBucket(new Headers({ 'x-real-ip': 'not-an-ip' }))).toBe('unknown')
  })
})
