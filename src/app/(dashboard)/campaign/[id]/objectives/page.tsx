import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ObjectivesView } from '@/components/objectives/objectives-view'

export const metadata = { title: 'Obiettivi' }

export default async function ObjectivesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, title, owner_id, final_objective')
    .eq('id', id)
    .single()

  if (!campaign) notFound()

  const { data: objectives } = await supabase
    .from('objectives')
    .select('*')
    .eq('campaign_id', id)
    .order('objective_type')
    .order('status')

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold mb-1">Obiettivi</h1>
        <p className="text-muted-foreground text-sm">
          Missioni principali, secondarie, segreti e obiettivi personali
        </p>
      </div>
      <ObjectivesView
        objectives={objectives ?? []}
        campaignId={id}
        finalObjective={campaign.final_objective}
      />
    </div>
  )
}
