'use client'

import { useParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { useShallow } from 'zustand/shallow'
import { ObjectivesView } from '@/components/objectives/objectives-view'

export default function ObjectivesPage() {
  const { id } = useParams<{ id: string }>()
  const objectives = useStore(useShallow(s => s.getObjectivesByCampaign(id)))
  const finalObjective = useStore(s => s.campaigns[id]?.final_objective ?? null)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold mb-1">Obiettivi</h1>
        <p className="text-muted-foreground text-sm">Missioni principali, secondarie, segreti e obiettivi personali</p>
      </div>
      <ObjectivesView objectives={objectives} campaignId={id} finalObjective={finalObjective} />
    </div>
  )
}
