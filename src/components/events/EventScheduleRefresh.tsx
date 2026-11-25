'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** El tiempo avanza sin cambios en el CMS. Actualiza los horarios visibles una vez por minuto. */
export function EventScheduleRefresh() {
  const router = useRouter()
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') router.refresh()
    }
    const timer = window.setInterval(refresh, 60_000)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [router])
  return null
}
