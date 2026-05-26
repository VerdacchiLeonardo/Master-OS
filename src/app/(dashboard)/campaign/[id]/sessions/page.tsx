import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { SessionsView } from '@/components/session/sessions-view'

export const metadata = { title: 'Session Logs' }

export default async function SessionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single()

  if (!campaign) notFound()

  const { data: sessions } = await supabase
    .from('session_logs')
    .select('*')
    .eq('campaign_id', id)
    .order('session_number', { ascending: false })

  const { data: worldStates } = await supabase
    .from('world_states')
    .select('*')
    .eq('campaign_id', id)
    .order('session_number', { ascending: false })
    .limit(1)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold mb-1">Session Logs</h1>
        <p className="text-muted-foreground text-sm">
          Documenta le sessioni — l'AI analizzerà gli eventi e aggiornerà il mondo
        </p>
      </div>

      <SessionsView
        sessions={sessions ?? []}
        campaign={campaign}
        currentWorldState={worldStates?.[0] ?? null}
      />
    </div>
  )
}
