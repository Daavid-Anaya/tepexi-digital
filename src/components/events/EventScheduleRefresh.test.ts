import { afterEach, describe, expect, it, vi } from 'vitest'
import { EventScheduleRefresh } from './EventScheduleRefresh'

const { refresh, effect } = vi.hoisted(() => ({ refresh: vi.fn(), effect: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }))
vi.mock('react', () => ({ useEffect: effect }))

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
  vi.clearAllMocks()
})

describe('event clock refresh lifecycle', () => {
  it('refreshes visible pages, pauses hidden pages, resumes on visibility and cleans up', () => {
    vi.useFakeTimers()
    const document = { visibilityState: 'visible', addEventListener: vi.fn(), removeEventListener: vi.fn() }
    vi.stubGlobal('document', document)
    vi.stubGlobal('window', { setInterval, clearInterval })
    expect(EventScheduleRefresh()).toBeNull()
    const cleanup = effect.mock.calls[0][0]() as () => void
    vi.advanceTimersByTime(60_000)
    expect(refresh).toHaveBeenCalledTimes(1)
    document.visibilityState = 'hidden'
    vi.advanceTimersByTime(120_000)
    expect(refresh).toHaveBeenCalledTimes(1)
    document.visibilityState = 'visible'
    const listener = document.addEventListener.mock.calls[0][1] as () => void
    listener()
    expect(refresh).toHaveBeenCalledTimes(2)
    cleanup()
    expect(document.removeEventListener).toHaveBeenCalledWith('visibilitychange', listener)
    vi.advanceTimersByTime(120_000)
    expect(refresh).toHaveBeenCalledTimes(2)
  })
})
