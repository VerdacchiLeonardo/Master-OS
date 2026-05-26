'use client'

import { useParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { useShallow } from 'zustand/shallow'
import { FactionsView } from '@/components/factions/factions-view'

export default function FactionsPage() {
  const { id } = useParams<{ id: string }>()
  const factions = useStore(useShallow(s => s.getFactionsByCampaign(id)))
  const relationships = useStore(useShallow(s => s.getRelsByCampaign(id)))

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold mb-1">Fazioni</h1>
        <p className="text-muted-foreground text-sm">Regni, gilde, ordini e organizzazioni del mondo</p>
      </div>
      <FactionsView factions={factions} relationships={relationships} campaignId={id} />
    </div>
  )
}
