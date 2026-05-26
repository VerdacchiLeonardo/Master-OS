import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { NPCsView } from '@/components/npcs/npcs-view'

export const metadata = { title: 'NPC' }

export default async function NPCsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, title, owner_id')
    .eq('id', id)
    .single()

  if (!campaign) notFound()

  const [{ data: npcs }, { data: factions }] = await Promise.all([
    supabase.from('npcs').select('*').eq('campaign_id', id).order('name'),
    supabase.from('factions').select('id, name, color').eq('campaign_id', id),
  ])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold mb-1">Personaggi Non Giocanti</h1>
        <p className="text-muted-foreground text-sm">
          Gestisci gli NPC della campagna — alleati, nemici, neutri
        </p>
      </div>
      <NPCsView npcs={npcs ?? []} factions={factions ?? []} campaignId={id} />
    </div>
  )
}
