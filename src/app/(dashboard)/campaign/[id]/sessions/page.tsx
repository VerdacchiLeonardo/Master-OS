'use client'

import { useParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { SessionsView } from '@/components/session/sessions-view'

export default function SessionsPage() {
  const { id } = useParams<{ id: string }>()
  const campaign = useStore(s => s.campaigns[id])
  const sessions = useStore(s => s.getSessionsByCampaign(id))
  const worldState = useStore(s => s.getLatestWorldState(id))

  if (!campaign) return null

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold mb-1">Session Logs</h1>
        <p className="text-muted-foreground text-sm">Documenta le sessioni della campagna</p>
      </div>
      <SessionsView sessions={sessions} campaign={campaign} currentWorldState={worldState} />
    </div>
  )
}
