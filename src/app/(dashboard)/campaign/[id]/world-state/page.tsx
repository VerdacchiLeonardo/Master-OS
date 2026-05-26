import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { WorldStateDetailView } from '@/components/world-state/world-state-detail'

export const metadata = { title: 'World State' }

export default async function WorldStatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single()

  if (!campaign) notFound()

  const { data: worldStates } = await supabase
    .from('world_states')
    .select('*')
    .eq('campaign_id', id)
    .order('session_number', { ascending: false })
    .limit(10)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold mb-1">World State</h1>
        <p className="text-muted-foreground text-sm">
          Evoluzione del mondo sessione per sessione
        </p>
      </div>
      <WorldStateDetailView worldStates={worldStates ?? []} campaignId={id} />
    </div>
  )
}
