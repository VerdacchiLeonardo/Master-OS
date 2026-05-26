'use client'

import { useParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { NPCsView } from '@/components/npcs/npcs-view'

export default function NPCsPage() {
  const { id } = useParams<{ id: string }>()
  const npcs = useStore(s => s.getNPCsByCampaign(id))
  const factions = useStore(s => s.getFactionsByCampaign(id).map(f => ({ id: f.id, name: f.name, color: f.color })))

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold mb-1">Personaggi Non Giocanti</h1>
        <p className="text-muted-foreground text-sm">Gestisci gli NPC della campagna — alleati, nemici, neutri</p>
      </div>
      <NPCsView npcs={npcs} factions={factions} campaignId={id} />
    </div>
  )
}
