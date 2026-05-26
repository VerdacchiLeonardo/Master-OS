import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'

export default async function CampaignLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, title, owner_id')
    .eq('id', id)
    .single()

  if (!campaign || campaign.owner_id !== user.id) notFound()

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar campaignId={campaign.id} campaignTitle={campaign.title} />
      <main className="flex-1 ml-60 min-h-screen">{children}</main>
    </div>
  )
}
