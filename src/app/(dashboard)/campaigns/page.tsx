import { createClient } from '@/lib/supabase/server'
import { Plus, Sword, ScrollText } from 'lucide-react'
import { CampaignCard } from '@/components/campaign/campaign-card'
import { CreateCampaignDialog } from '@/components/campaign/create-campaign-dialog'

export const metadata = { title: 'Campagne' }

export default async function CampaignsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('owner_id', user!.id)
    .order('updated_at', { ascending: false })

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-semibold text-foreground mb-1">
            Le mie Campagne
          </h1>
          <p className="text-muted-foreground text-sm">
            Gestisci le tue campagne D&D con l'intelligenza narrativa
          </p>
        </div>
        <CreateCampaignDialog userId={user!.id}>
          <button className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--gold))] text-background rounded-md text-sm font-medium hover:bg-[hsl(var(--gold)/0.85)] transition-colors">
            <Plus className="w-4 h-4" />
            Nuova Campagna
          </button>
        </CreateCampaignDialog>
      </div>

      {/* Campaign grid */}
      {campaigns && campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {campaigns.map((campaign, i) => (
            <div
              key={campaign.id}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <CampaignCard campaign={campaign} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-[hsl(var(--gold)/0.08)] border border-[hsl(var(--gold)/0.2)] flex items-center justify-center mb-4">
        <Sword className="w-7 h-7 text-[hsl(var(--gold)/0.6)]" />
      </div>
      <h3 className="font-display text-lg font-medium text-foreground mb-2">
        Nessuna Campagna
      </h3>
      <p className="text-muted-foreground text-sm max-w-xs mb-6">
        Crea la tua prima campagna per iniziare a usare il Narrative Intelligence System
      </p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ScrollText className="w-3.5 h-3.5" />
        Clicca "Nuova Campagna" per iniziare
      </div>
    </div>
  )
}
