import { describe, expect, it } from 'vitest'
import { DEFAULT_EVENT_TIMEZONE, formatEventDate, resolveEventSchedule, validateEventSchedule } from './event-schedule'

const monday = { _key: 'mon', weekday: 1, startTime: '10:00', endTime: '12:00' }
const wednesday = { _key: 'wed', weekday: 3, startTime: '16:00', endTime: '18:00' }
const weekly = { seriesStart: '2026-01-01', slots: [monday, wednesday] }
const series = { scheduleType: 'weekly', timezone: DEFAULT_EVENT_TIMEZONE, weekly }
const now = new Date('2026-09-07T17:00:00Z') // Monday 11:00 in Tepexi.
const resolve = (value: unknown, clock = now) => resolveEventSchedule(value, clock)

describe('single event schedules and legacy compatibility', () => {
  it.each([
    ['upcoming', '2026-09-07T18:00:00Z', '2026-09-07T19:00:00Z'],
    ['ongoing', '2026-09-07T16:00:00Z', '2026-09-07T18:00:00Z'],
    ['ongoing', '2026-09-07T17:00:00Z', '2026-09-07T18:00:00Z'],
    ['ended', '2026-09-07T16:00:00Z', '2026-09-07T17:00:00Z'],
    ['ended', '2026-09-06T16:00:00Z', '2026-09-06T18:00:00Z'],
  ])('resolves %s using exact instants', (status, date, endDate) => {
    expect(resolve({ date, endDate })?.scheduleStatus).toBe(status)
  })

  it('preserves a legacy unknown end indefinitely until manual closure', () => {
    const legacy = { date: '2020-01-01T10:00:00-06:00', endDate: null }
    expect(resolve(legacy)).toMatchObject({ date: '2020-01-01T16:00:00.000Z', endDate: null, scheduleStatus: 'ongoing', timezone: DEFAULT_EVENT_TIMEZONE, isRecurring: false })
    expect(resolve({ ...legacy, closed: true })?.scheduleStatus).toBe('closed')
  })

  it('allows an upcoming unknown-end event and closure before its start', () => {
    const single = { scheduleType: 'single', date: '2027-01-01T00:00:00Z' }
    expect(resolve(single)?.scheduleStatus).toBe('upcoming')
    expect(resolve({ ...single, closed: true })?.scheduleStatus).toBe('closed')
  })

  it('ignores stale recurrence fields for legacy single documents', () => {
    expect(resolve({ date: '2026-09-07T16:00:00Z', weekly: { invalid: true } })?.isRecurring).toBe(false)
  })
})

describe('weekly occurrence selection', () => {
  it('selects the ongoing session, not the series start', () => {
    expect(resolve(series)).toMatchObject({ date: '2026-09-07T16:00:00.000Z', endDate: '2026-09-07T18:00:00.000Z', scheduleStatus: 'ongoing', isRecurring: true })
  })

  it('selects different weekday hours between sessions', () => {
    expect(resolve(series, new Date('2026-09-07T18:00:00Z'))).toMatchObject({ date: '2026-09-09T22:00:00.000Z', endDate: '2026-09-10T00:00:00.000Z', scheduleStatus: 'upcoming' })
  })

  it('finds the next occurrence before a future series start without a horizon cutoff', () => {
    expect(resolve({ ...series, weekly: { ...weekly, seriesStart: '2036-09-01' } })?.date).toBe('2036-09-01T16:00:00.000Z')
  })

  it('treats the final series date as inclusive and never truncates its ongoing session', () => {
    const bounded = { ...series, weekly: { ...weekly, seriesEnd: '2026-09-07' } }
    expect(resolve(bounded)?.scheduleStatus).toBe('ongoing')
    expect(resolve(bounded, new Date('2026-09-07T18:00:00Z'))).toMatchObject({ date: null, scheduleStatus: 'ended' })
  })

  it('closes the whole series including replacements', () => {
    expect(resolve({ ...series, closed: true })).toMatchObject({ date: null, endDate: null, scheduleStatus: 'closed' })
  })

  it('does not create sessions before the series start', () => {
    expect(resolve({ ...series, weekly: { ...weekly, seriesStart: '2026-09-08' } })?.date).toBe('2026-09-09T22:00:00.000Z')
  })

  it('returns ended for a bounded series containing no matching weekdays', () => {
    expect(resolve({ ...series, weekly: { ...weekly, seriesStart: '2026-09-08', seriesEnd: '2026-09-08' } })?.scheduleStatus).toBe('ended')
  })

  it('uses the local day when UTC has already advanced', () => {
    const lateMonday = { ...series, weekly: { ...weekly, slots: [{ ...monday, startTime: '20:00', endTime: '23:00' }] } }
    expect(resolve(lateMonday, new Date('2026-09-08T03:00:00Z'))).toMatchObject({ date: '2026-09-08T02:00:00.000Z', scheduleStatus: 'ongoing' })
  })

  it('keeps an overnight final session ongoing on the following calendar day', () => {
    const overnight = { ...series, weekly: { ...weekly, seriesEnd: '2026-09-07', slots: [{ ...monday, startTime: '22:00', endTime: '02:00', endsNextDay: true }] } }
    expect(resolve(overnight, new Date('2026-09-08T07:00:00Z'))).toMatchObject({ date: '2026-09-08T04:00:00.000Z', endDate: '2026-09-08T08:00:00.000Z', scheduleStatus: 'ongoing' })
    expect(resolve(overnight, new Date('2026-09-08T08:00:00Z'))?.scheduleStatus).toBe('ended')
  })

  it('deterministically selects the earliest start when sessions overlap', () => {
    expect(resolve({ ...series, weekly: { ...weekly, slots: [monday, { ...monday, _key: 'other', startTime: '09:00' }] } })?.date).toBe('2026-09-07T15:00:00.000Z')
  })
})

describe('occurrence exceptions', () => {
  const cancellation = { date: '2026-09-07', slotKey: 'mon', action: 'cancel' }
  const replacement = { ...cancellation, action: 'replace', replacementDate: '2026-09-08', startTime: '09:00', endTime: '11:00' }
  const withExceptions = (exceptions: unknown[], extra = {}) => ({ ...series, weekly: { ...weekly, ...extra, exceptions } })

  it('cancels only the selected occurrence', () => {
    expect(resolve(withExceptions([cancellation]))?.date).toBe('2026-09-09T22:00:00.000Z')
    expect(resolve(withExceptions([cancellation]), new Date('2026-09-10T00:00:00Z'))?.date).toBe('2026-09-14T16:00:00.000Z')
  })

  it('replaces the original occurrence rather than adding a duplicate', () => {
    expect(resolve(withExceptions([replacement]))?.date).toBe('2026-09-08T15:00:00.000Z')
    expect(resolve(withExceptions([replacement]), new Date('2026-09-08T16:00:00Z'))?.scheduleStatus).toBe('ongoing')
  })

  it('finds replacements moved from a distant original date into the present', () => {
    const moved = { ...replacement, date: '2026-12-07', replacementDate: '2026-09-07', startTime: '08:00', endTime: '13:00' }
    expect(resolve(withExceptions([moved]))?.date).toBe('2026-09-07T14:00:00.000Z')
  })

  it('honors a replacement outside series bounds and deliberate overnight hours', () => {
    const moved = { ...replacement, replacementDate: '2026-10-01', startTime: '23:00', endTime: '01:00', endsNextDay: true }
    expect(resolve(withExceptions([moved], { seriesEnd: '2026-09-07' }), new Date('2026-09-08T10:00:00Z'))).toMatchObject({ date: '2026-10-02T05:00:00.000Z', endDate: '2026-10-02T07:00:00.000Z' })
  })

  it('keeps an explicit old unknown-end session open until per-occurrence closure', () => {
    const open = { ...replacement, date: '2026-01-05', replacementDate: '2026-01-05', unknownEnd: true, endTime: undefined }
    expect(resolve(withExceptions([open]))).toMatchObject({ date: '2026-01-05T15:00:00.000Z', endDate: null, scheduleStatus: 'ongoing' })
    expect(resolve(withExceptions([{ ...open, closed: true }]))?.date).toBe('2026-09-07T16:00:00.000Z')
  })

  it('skips arbitrarily long cancellation runs in work bounded by exception count', () => {
    const start = Date.parse('2026-09-07T00:00:00Z')
    const exceptions = Array.from({ length: 100 }, (_, i) => ({ ...cancellation, date: new Date(start + i * 7 * 86_400_000).toISOString().slice(0, 10) }))
    expect(resolve(withExceptions(exceptions, { slots: [monday] }))?.date).toBe(new Date(start + 100 * 7 * 86_400_000 + 16 * 3_600_000).toISOString())
  })
})

describe('timezone transitions', () => {
  const dstSeries = {
    scheduleType: 'weekly', timezone: 'America/New_York',
    weekly: { seriesStart: '2026-03-01', slots: [{ _key: 'sun', weekday: 0, startTime: '02:30', endTime: '03:30' }] },
  }

  it('skips a nonexistent DST wall time and still finds the next valid week', () => {
    expect(resolve(dstSeries, new Date('2026-03-07T12:00:00Z'))?.date).toBe('2026-03-15T06:30:00.000Z')
  })

  it('chooses the earlier instant for a repeated wall time', () => {
    const repeated = { ...dstSeries, weekly: { ...dstSeries.weekly, slots: [{ _key: 'sun', weekday: 0, startTime: '01:30', endTime: '02:30' }] } }
    expect(resolve(repeated, new Date('2026-11-01T05:45:00Z'))).toMatchObject({ date: '2026-11-01T05:30:00.000Z', endDate: '2026-11-01T07:30:00.000Z', scheduleStatus: 'ongoing' })
  })

  it('formats the Tepexi calendar date and hour, not the server-local date', () => {
    const formatted = formatEventDate('2026-09-08T03:00:00Z')
    expect(formatted).toContain('7 de septiembre de 2026')
    expect(formatted).toContain('21:00')
  })
})

describe('shared schedule validation', () => {
  it.each([
    null,
    { scheduleType: 'other', date: '2026-09-07T16:00:00Z' },
    { date: '2026-02-30T16:00:00Z' },
    { date: '2026-09-07T16:00:00' },
    { date: '2026-09-07T24:00:00Z' },
    { date: '2026-09-07T16:00:00Z', endDate: '2026-09-07T15:00:00Z' },
    { date: '2026-09-07T16:00:00Z', closed: 'true' },
    { ...series, timezone: 'Not/AZone' },
    { scheduleType: 'weekly' },
    { ...series, weekly: { ...weekly, seriesStart: '2026-02-30' } },
    { ...series, weekly: { ...weekly, seriesEnd: '2025-12-31' } },
    { ...series, weekly: { ...weekly, slots: [] } },
    { ...series, weekly: { ...weekly, slots: [{ ...monday, weekday: 7 }] } },
    { ...series, weekly: { ...weekly, slots: [{ ...monday, weekday: 1.5 }] } },
    { ...series, weekly: { ...weekly, slots: [{ ...monday, startTime: '25:00' }] } },
    { ...series, weekly: { ...weekly, slots: [{ ...monday, endTime: '09:00' }] } },
    { ...series, weekly: { ...weekly, slots: [{ ...monday, endTime: '10:00' }] } },
    { ...series, weekly: { ...weekly, slots: [{ ...monday, endTime: undefined }] } },
    { ...series, weekly: { ...weekly, slots: [{ ...monday, endsNextDay: true }] } },
    { ...series, weekly: { ...weekly, slots: [monday, monday] } },
  ])('rejects malformed or inverted schedule %#', (input) => {
    expect(validateEventSchedule(input)).not.toBe(true)
    expect(resolve(input)).toBeNull()
  })

  const exception = { date: '2026-09-07', slotKey: 'mon', action: 'replace', replacementDate: '2026-09-08', startTime: '10:00', endTime: '12:00' }
  it.each([
    { ...exception, date: '2026-09-08' },
    { ...exception, date: '2025-12-29' },
    { ...exception, slotKey: 'missing' },
    { ...exception, action: 'other' },
    { ...exception, action: 'cancel' },
    { ...exception, replacementDate: '2026-02-30' },
    { ...exception, endTime: undefined },
    { ...exception, endTime: '09:00' },
    { ...exception, unknownEnd: true },
    { ...exception, closed: true },
  ])('rejects invalid exception %#', (invalid) => {
    expect(validateEventSchedule({ ...series, weekly: { ...weekly, exceptions: [invalid] } })).not.toBe(true)
  })

  it('rejects duplicate exceptions and oversized exception input', () => {
    expect(validateEventSchedule({ ...series, weekly: { ...weekly, exceptions: [exception, exception] } })).not.toBe(true)
    expect(validateEventSchedule({ ...series, weekly: { ...weekly, exceptions: Array(501).fill(exception) } })).not.toBe(true)
  })

  it('rejects oversized weekly slot input', () => {
    const slots = Array.from({ length: 22 }, (_, index) => ({ ...monday, _key: String(index) }))
    expect(validateEventSchedule({ ...series, weekly: { ...weekly, slots } })).not.toBe(true)
  })

  it('accepts a weekly schedule with no series end and uses the default timezone', () => {
    expect(validateEventSchedule({ scheduleType: 'weekly', weekly })).toBe(true)
    expect(resolve({ scheduleType: 'weekly', weekly })?.timezone).toBe(DEFAULT_EVENT_TIMEZONE)
  })
})
