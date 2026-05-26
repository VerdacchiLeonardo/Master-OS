import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { FactionsView } from '@/components/factions/factions-view'

export const metadata = { title: 'Fazioni' }

export default async function FactionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, title, owner_id')
    .eq('id', id)
    .single()

  if (!campaign) notFound()

  const [{ data: factions }, { data: relationships }] = await Promise.all([
    supabase.from('factions').select('*').eq('campaign_id', id).order('name'),
    supabase.from('faction_relationships').select('*').eq('campaign_id', id),
  ])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold mb-1">Fazioni</h1>
        <p className="text-muted-foreground text-sm">
          Regni, gilde, ordini e organizzazioni del mondo
        </p>
      </div>
      <FactionsView factions={factions ?? []} relationships={relationships ?? []} campaignId={id} />
    </div>
  )
}
