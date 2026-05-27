'use client'

import { useSearchParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { useShallow } from 'zustand/shallow'
import { MapsView } from '@/components/maps/maps-view'

export default function MapsPage() {
  const id = useSearchParams().get('id') ?? ''
  const maps = useStore(useShallow(s => s.getMapsByCampaign(id)))
  const locations = useStore(useShallow(s => s.getLocationsByCampaign(id)))

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold mb-1">Mappe</h1>
        <p className="text-muted-foreground text-sm">Aggiungi mappe e geotaga i luoghi della campagna</p>
      </div>
      <MapsView maps={maps} locations={locations} campaignId={id} />
    </div>
  )
}
