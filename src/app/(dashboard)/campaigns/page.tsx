'use client'

import { useStore } from '@/lib/store'
import { useShallow } from 'zustand/shallow'
import { Plus, Sword, ScrollText } from 'lucide-react'
import { CampaignCard } from '@/components/campaign/campaign-card'
import { CreateCampaignDialog } from '@/components/campaign/create-campaign-dialog'

export default function CampaignsPage() {
  const campaigns = useStore(useShallow(s =>
    Object.values(s.campaigns).sort((a, b) => b.updated_at.localeCompare(a.updated_at))
  ))
  const exportData = useStore(s => s.exportData)
  const importData = useStore(s => s.importData)

  function handleImport() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        const ok = importData(ev.target?.result as string)
        if (!ok) alert('File non valido o corrotto.')
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-semibold text-foreground mb-1">Le mie Campagne</h1>
          <p className="text-muted-foreground text-sm">Gestisci le tue campagne D&D</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleImport} className="px-3 py-2 border border-border text-muted-foreground rounded-md text-sm hover:text-foreground hover:bg-muted/60 transition-colors">
            Importa
          </button>
          <button onClick={exportData} className="px-3 py-2 border border-border text-muted-foreground rounded-md text-sm hover:text-foreground hover:bg-muted/60 transition-colors">
            Esporta JSON
          </button>
          <CreateCampaignDialog>
            <button className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--gold))] text-background rounded-md text-sm font-medium hover:bg-[hsl(var(--gold)/0.85)] transition-colors">
              <Plus className="w-4 h-4" />
              Nuova Campagna
            </button>
          </CreateCampaignDialog>
        </div>
      </div>

      {campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {campaigns.map((campaign, i) => (
            <div key={campaign.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <CampaignCard campaign={campaign} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-[hsl(var(--gold)/0.08)] border border-[hsl(var(--gold)/0.2)] flex items-center justify-center mb-4">
            <Sword className="w-7 h-7 text-[hsl(var(--gold)/0.6)]" />
          </div>
          <h3 className="font-display text-lg font-medium text-foreground mb-2">Nessuna Campagna</h3>
          <p className="text-muted-foreground text-sm max-w-xs mb-6">Crea la tua prima campagna per iniziare</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ScrollText className="w-3.5 h-3.5" />
            Clicca &quot;Nuova Campagna&quot; per iniziare
          </div>
        </div>
      )}
    </div>
  )
}
