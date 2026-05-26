import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { MapsView } from '@/components/maps/maps-view'

export const metadata = { title: 'Mappe' }

export default async function MapsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, title, owner_id')
    .eq('id', id)
    .single()

  if (!campaign) notFound()

  const [{ data: maps }, { data: locations }] = await Promise.all([
    supabase.from('maps').select('*').eq('campaign_id', id).order('is_primary', { ascending: false }),
    supabase.from('locations').select('*').eq('campaign_id', id),
  ])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold mb-1">Mappe</h1>
        <p className="text-muted-foreground text-sm">
          Carica mappe e geotaga i luoghi della campagna
        </p>
      </div>
      <MapsView maps={maps ?? []} locations={locations ?? []} campaignId={id} />
    </div>
  )
}
