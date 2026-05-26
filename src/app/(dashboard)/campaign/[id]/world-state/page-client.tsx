'use client'

import { useParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { useShallow } from 'zustand/shallow'
import { WorldStateDetailView } from '@/components/world-state/world-state-detail'

export default function WorldStatePage() {
  const { id } = useParams<{ id: string }>()
  const worldStates = useStore(useShallow(s => s.getAllWorldStates(id)))

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold mb-1">World State</h1>
        <p className="text-muted-foreground text-sm">Evoluzione del mondo sessione per sessione</p>
      </div>
      <WorldStateDetailView worldStates={worldStates} campaignId={id} />
    </div>
  )
}
