'use client'

import dynamic from 'next/dynamic'
import { Map } from 'lucide-react'
import type { LeafletMapProps } from '@/types'

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-sand animate-pulse rounded-xl flex flex-col items-center justify-center gap-3">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center animate-bounce">
        <Map className="w-6 h-6 text-primary/40" />
      </div>
      <span className="text-stone/60 text-sm font-medium">Cargando mapa...</span>
    </div>
  ),
})

export default function DynamicLeafletMap(props: LeafletMapProps) {
  return <LeafletMap {...props} />
}
