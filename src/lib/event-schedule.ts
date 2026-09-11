export const DEFAULT_EVENT_TIMEZONE = 'America/Mexico_City'
export const EVENT_STATUS = { UPCOMING: 'upcoming', ONGOING: 'ongoing', ENDED: 'ended', CLOSED: 'closed' } as const
export type EventStatus = (typeof EVENT_STATUS)[keyof typeof EVENT_STATUS]
const SCHEDULE_TYPE = { SINGLE: 'single', WEEKLY: 'weekly' } as const

interface WeeklySlot {
  _key: string
  weekday: number
  startTime: string
  endTime: string
  endsNextDay: boolean
}

interface WeeklySchedule {
  seriesStart: string
  seriesEnd?: string
  slots: WeeklySlot[]
}

interface EventSchedule {
  scheduleType: (typeof SCHEDULE_TYPE)[keyof typeof SCHEDULE_TYPE]
  timezone: string
  closed: boolean
  date?: string
  endDate?: string
  weekly?: WeeklySchedule
}

export interface ResolvedEventSchedule {
  date: string | null
  endDate: string | null
  timezone: string
  scheduleStatus: EventStatus
  isRecurring: boolean
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Invalid schedule object.')
  }
  return value as Record<string, unknown>
}

function text(value: unknown): string {
  if (typeof value !== 'string' || !value) throw new Error('Required schedule field is missing.')
  return value
}

function flag(value: unknown): boolean {
  if (value == null) return false
  if (typeof value !== 'boolean') throw new Error('Schedule flags must be boolean.')
  return value
}

function calendarDate(value: unknown): string {
  const date = text(value)
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date)
    || Number(date.slice(0, 4)) < 1
    || Number(date.slice(0, 4)) > 9998
    || !Number.isFinite(Date.parse(date))
    || new Date(date).toISOString().slice(0, 10) !== date
  ) {
    throw new Error('Use a valid calendar date (year 0001–9998).')
  }
  return date
}

function instant(value: unknown): string {
  const date = text(value)
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(date)) {
    throw new Error('Use a datetime with an explicit timezone offset.')
  }
  calendarDate(date.slice(0, 10))
  if (!Number.isFinite(Date.parse(date)) || Number(date.slice(11, 13)) > 23 || Number(date.slice(14, 16)) > 59) {
    throw new Error('Invalid datetime.')
  }
  return new Date(date).toISOString()
}

function time(value: unknown): string {
  const result = text(value)
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(result)) throw new Error('Use a time in HH:mm format.')
  return result
}

function validateHours(start: string, end: string, nextDay: boolean) {
  if ((!nextDay && end <= start) || (nextDay && end >= start)) {
    throw new Error('End must follow start; select next day only for overnight sessions shorter than 24 hours.')
  }
}

function parseSchedule(value: unknown): EventSchedule {
  const input = record(value)
  const scheduleType = input.scheduleType ?? SCHEDULE_TYPE.SINGLE
  if (scheduleType !== SCHEDULE_TYPE.SINGLE && scheduleType !== SCHEDULE_TYPE.WEEKLY) throw new Error('Invalid schedule type.')
  const timezone = input.timezone == null ? DEFAULT_EVENT_TIMEZONE : text(input.timezone)
  new Intl.DateTimeFormat('en', { timeZone: timezone }).format(0)
  const closed = flag(input.closed)
  if (scheduleType === SCHEDULE_TYPE.SINGLE) {
    const date = instant(input.date)
    const endDate = input.endDate == null ? undefined : instant(input.endDate)
    if (endDate && endDate <= date) throw new Error('End date must follow start date.')
    return { scheduleType, timezone, closed, date, endDate }
  }

  const source = record(input.weekly)
  const seriesStart = calendarDate(source.seriesStart)
  const seriesEnd = source.seriesEnd == null ? undefined : calendarDate(source.seriesEnd)
  if (seriesEnd && seriesEnd < seriesStart) throw new Error('Series end cannot precede series start.')
  if (!Array.isArray(source.slots) || !source.slots.length || source.slots.length > 21) {
    throw new Error('Provide 1–21 weekly slots.')
  }
  const keys = new Set<string>()
  const slots = source.slots.map((value): WeeklySlot => {
    const slot = record(value)
    const _key = text(slot._key)
    if (keys.has(_key)) throw new Error('Weekly slot keys must be unique.')
    keys.add(_key)
    if (typeof slot.weekday !== 'number' || !Number.isInteger(slot.weekday) || slot.weekday < 0 || slot.weekday > 6) {
      throw new Error('Select a weekday (0–6).')
    }
    const startTime = time(slot.startTime)
    const endTime = time(slot.endTime)
    const endsNextDay = flag(slot.endsNextDay)
    validateHours(startTime, endTime, endsNextDay)
    return { _key, weekday: slot.weekday, startTime, endTime, endsNextDay }
  })
  return { scheduleType, timezone, closed, weekly: { seriesStart, seriesEnd, slots } }
}

/** Shared validation for schedule producers and consumers: malformed values fail closed. */
export function validateEventSchedule(value: unknown): true | string {
  try {
    parseSchedule(value)
    return true
  } catch (error) {
    return error instanceof Error ? error.message : 'Invalid event schedule.'
  }
}

function addDays(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10)
}

function wallClock(timezone: string) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  })
  const local = (epoch: number) => {
    const parts = Object.fromEntries(formatter.formatToParts(epoch).map(({ type, value }) => [type, value]))
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`
  }
  const toInstant = (date: string, time: string): number | null => {
    const wall = `${date}T${time}:00`
    const nominal = Date.parse(`${wall}Z`)
    const candidates = new Set<number>()
    // Inspect offsets on both sides of DST transitions. Gaps are skipped;
    // repeated wall times use the earlier instant, independent of server TZ.
    for (const hours of [-36, -12, 0, 12, 36]) {
      const sample = nominal + hours * 3_600_000
      const offset = Date.parse(`${local(sample)}Z`) - sample
      const candidate = nominal - offset
      if (local(candidate) === wall) candidates.add(candidate)
    }
    return candidates.size ? Math.min(...candidates) : null
  }
  return { local, toInstant }
}

interface Occurrence {
  start: number
  end: number | null
}

/** One ongoing session (earliest start) or the next session; never expand a series. */
export function resolveEventSchedule(value: unknown, now: Date): ResolvedEventSchedule | null {
  let schedule: EventSchedule
  try {
    schedule = parseSchedule(value)
  } catch {
    return null
  }
  const epoch = now.getTime()
  if (!Number.isFinite(epoch)) throw new Error('A valid evaluation clock is required.')
  const base = { timezone: schedule.timezone, isRecurring: schedule.scheduleType === SCHEDULE_TYPE.WEEKLY }
  if (schedule.scheduleType === SCHEDULE_TYPE.SINGLE) {
    const date = schedule.date!
    const endDate = schedule.endDate ?? null
    const scheduleStatus = schedule.closed ? EVENT_STATUS.CLOSED
      : endDate && Date.parse(endDate) <= epoch ? EVENT_STATUS.ENDED
        : Date.parse(date) <= epoch ? EVENT_STATUS.ONGOING : EVENT_STATUS.UPCOMING
    return { ...base, date, endDate, scheduleStatus }
  }
  const empty = {
    ...base,
    date: null,
    endDate: null,
    scheduleStatus: schedule.closed ? EVENT_STATUS.CLOSED : EVENT_STATUS.ENDED,
  }
  if (schedule.closed) return empty
  const weekly = schedule.weekly!
  const clock = wallClock(schedule.timezone)
  const today = clock.local(epoch).slice(0, 10)
  let selected: Occurrence | null = null
  function consider(startDate: string, startTime: string, endTime: string | undefined, nextDay: boolean) {
    const start = clock.toInstant(startDate, startTime)
    const end = endTime ? clock.toInstant(nextDay ? addDays(startDate, 1) : startDate, endTime) : null
    if (start == null || (endTime && end == null) || (end != null && (end <= epoch || end <= start))) return false
    const candidate = { start, end }
    if (!selected || candidate.start < selected.start) selected = candidate
    return true
  }
  const from = [addDays(today, -1), weekly.seriesStart].sort().at(-1)!
  for (const slot of weekly.slots) {
    const weekday = new Date(`${from}T00:00:00Z`).getUTCDay()
    let date = addDays(from, (slot.weekday - weekday + 7) % 7)
    // Extra iterations cover yesterday's ended slot and a DST gap.
    for (let attempt = 0; attempt < 4; attempt++, date = addDays(date, 7)) {
      if (weekly.seriesEnd && date > weekly.seriesEnd) break
      const available = consider(date, slot.startTime, slot.endTime, slot.endsNextDay)
      if (date > today && available) break
    }
  }
  const occurrence = selected as Occurrence | null
  if (!occurrence) return empty
  return {
    ...base,
    date: new Date(occurrence.start).toISOString(),
    endDate: occurrence.end == null ? null : new Date(occurrence.end).toISOString(),
    scheduleStatus: occurrence.start <= epoch ? EVENT_STATUS.ONGOING : EVENT_STATUS.UPCOMING,
  }
}

export function formatEventDate(date: string, timezone = DEFAULT_EVENT_TIMEZONE): string {
  return new Date(date).toLocaleString('es-MX', {
    timeZone: timezone, year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    hourCycle: 'h23',
  })
}
