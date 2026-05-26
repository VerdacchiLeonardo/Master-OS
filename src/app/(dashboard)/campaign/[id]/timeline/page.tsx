import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { TimelineView } from '@/components/timeline/timeline-view'

export const metadata = { title: 'Timeline' }

export default async function TimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, title, owner_id')
    .eq('id', id)
    .single()

  if (!campaign) notFound()

  const { data: events } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('campaign_id', id)
    .order('created_at', { ascending: true })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold mb-1">Timeline Narrativa</h1>
        <p className="text-muted-foreground text-sm">
          Il cuore della campagna — eventi passati, presenti e futuri
        </p>
      </div>

      <TimelineView events={events ?? []} campaignId={id} />
    </div>
  )
}
