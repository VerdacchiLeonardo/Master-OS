'use client'

import { useParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { useShallow } from 'zustand/shallow'
import { TimelineView } from '@/components/timeline/timeline-view'

export default function TimelinePage() {
  const { id } = useParams<{ id: string }>()
  const events = useStore(useShallow(s => s.getEventsByCampaign(id)))

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold mb-1">Timeline Narrativa</h1>
        <p className="text-muted-foreground text-sm">Il cuore della campagna — eventi passati, presenti e futuri</p>
      </div>
      <TimelineView events={events} campaignId={id} />
    </div>
  )
}
