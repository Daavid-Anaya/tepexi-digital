import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getEventoBySlug, getUpcomingEventos, getUpcomingEventosPreview } from './data'
import { buildEventJsonLd } from './structured-data'
import { eventoBySlugQuery, featuredEventosQuery, upcomingEventosPreviewQuery, upcomingEventosQuery } from '@/sanity/queries/eventos'

const { sanityFetch, connection } = vi.hoisted(() => ({ sanityFetch: vi.fn(), connection: vi.fn() }))
vi.mock('@/sanity/lib/live', () => ({ sanityFetch }))
vi.mock('next/server', () => ({ connection }))

const base = { _id: 'weekly', title: 'Weekly activity', slug: { current: 'weekly' }, isFeatured: true }
const recurring = {
  ...base,
  scheduleType: 'weekly',
  weekly: { seriesStart: '2026-01-01', slots: [{ _key: 'mon', weekday: 1, startTime: '10:00', endTime: '12:00' }] },
}
const now = new Date('2026-09-07T17:00:00Z')

describe('event data consumer integration', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
    sanityFetch.mockReset()
    connection.mockReset().mockResolvedValue(undefined)
  })
  afterEach(() => vi.useRealTimers())

  it('filters ended/closed/malformed rows, sorts resolved sessions, then limits only the preview', async () => {
    const future = Array.from({ length: 60 }, (_, i) => ({ ...base, _id: `future-${i}`, slug: { current: `future-${i}` }, date: '2027-01-01T00:00:00Z' }))
    sanityFetch.mockResolvedValue({ data: [
      ...future,
      { ...base, _id: 'ended', date: '2026-09-07T12:00:00Z', endDate: '2026-09-07T13:00:00Z' },
      { ...base, _id: 'closed', date: '2026-09-07T12:00:00Z', closed: true },
      { ...base, _id: 'invalid', scheduleType: 'weekly' },
      recurring,
      { ...base, _id: 'unknown', date: '2026-09-07T15:00:00Z' },
    ] })
    const list = await getUpcomingEventos()
    const preview = await getUpcomingEventosPreview()
    expect(list).toHaveLength(62)
    expect(list.slice(0, 2).map((event) => event._id)).toEqual(['unknown', 'weekly'])
    expect(list.filter((event) => event._id === 'weekly')).toHaveLength(1)
    expect(preview).toEqual(list.slice(0, 3))
    expect(connection).toHaveBeenCalledTimes(2)
  })

  it('reevaluates identical cached CMS data after time advances', async () => {
    sanityFetch.mockResolvedValue({ data: [recurring] })
    expect((await getUpcomingEventos())[0].scheduleStatus).toBe('ongoing')
    vi.setSystemTime(new Date('2026-09-07T18:00:00Z'))
    expect((await getUpcomingEventos())[0]).toMatchObject({ date: '2026-09-14T16:00:00.000Z', scheduleStatus: 'upcoming' })
    expect(connection).toHaveBeenCalledTimes(2)
  })

  it('uses the same resolved occurrence on detail and in JSON-LD', async () => {
    sanityFetch.mockResolvedValue({ data: recurring })
    const detail = await getEventoBySlug('weekly')
    expect(detail).toMatchObject({ date: '2026-09-07T16:00:00.000Z', endDate: '2026-09-07T18:00:00.000Z', isRecurring: true })
    expect(buildEventJsonLd(detail!, { canonicalPath: '/agenda/weekly' })).toMatchObject({ startDate: detail?.date, endDate: detail?.endDate })
    expect(connection).toHaveBeenCalledOnce()
  })

  it('keeps ended single details available and omits fabricated unknown end from JSON-LD', async () => {
    sanityFetch.mockResolvedValueOnce({ data: { ...base, date: '2020-01-01T00:00:00Z' } })
    const unknown = await getEventoBySlug('weekly')
    expect(unknown?.endDate).toBeNull()
    expect(buildEventJsonLd(unknown!, { canonicalPath: '/agenda/weekly' })).not.toHaveProperty('endDate')
    sanityFetch.mockResolvedValueOnce({ data: { ...base, date: '2020-01-01T00:00:00Z', endDate: '2020-01-02T00:00:00Z' } })
    expect(await getEventoBySlug('weekly')).toMatchObject({ date: '2020-01-01T00:00:00.000Z', scheduleStatus: 'ended' })
  })

  it.each([
    { ...recurring, closed: true },
    { ...recurring, weekly: { ...recurring.weekly, seriesEnd: '2026-09-01' } },
  ])('retains exhausted/closed series content without advertising a nonexistent session', async (event) => {
    sanityFetch.mockResolvedValue({ data: event })
    const detail = await getEventoBySlug('weekly')
    expect(detail).not.toBeNull()
    expect(detail?.date).toBeNull()
    expect(buildEventJsonLd(detail!, { canonicalPath: '/agenda/weekly' })).toBeNull()
  })

  it('returns an empty real agenda rather than substituting mock events', async () => {
    sanityFetch.mockResolvedValue({ data: [] })
    expect(await getUpcomingEventos()).toEqual([])
    expect(await getUpcomingEventosPreview()).toEqual([])
  })

  it('projects schedule inputs in every event query without premature list limits', () => {
    for (const query of [eventoBySlugQuery, featuredEventosQuery, upcomingEventosPreviewQuery, upcomingEventosQuery]) {
      expect(query).toContain('scheduleType, timezone, closed, weekly')
    }
    for (const query of [upcomingEventosPreviewQuery, upcomingEventosQuery]) {
      expect(query).not.toContain('$now')
      expect(query).not.toMatch(/\[0\.\.\./)
      expect(query).toContain('closed != true')
    }
  })
})
