'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

const TONES = [
  { value: 'epic', label: 'Epico' },
  { value: 'dark', label: 'Dark' },
  { value: 'mystery', label: 'Mistero' },
  { value: 'horror', label: 'Horror' },
  { value: 'political', label: 'Politico' },
  { value: 'adventure', label: 'Avventura' },
]

const SYSTEMS = ['D&D 5e', 'Pathfinder 2e', 'Call of Cthulhu', 'Savage Worlds', 'Other']

interface CreateCampaignDialogProps {
  children: React.ReactNode
}

export function CreateCampaignDialog({ children }: CreateCampaignDialogProps) {
  const router = useRouter()
  const createCampaign = useStore(s => s.createCampaign)
  const createWorldState = useStore(s => s.createWorldState)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    lore: '',
    final_objective: '',
    narrative_tone: 'epic',
    game_system: 'D&D 5e',
    estimated_sessions: '',
  })

  function handleChange(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    setLoading(true)

    const campaign = createCampaign({
      title: form.title,
      description: form.description || null,
      lore: form.lore || null,
      final_objective: form.final_objective || null,
      narrative_tone: form.narrative_tone as 'epic',
      game_system: form.game_system,
      estimated_sessions: form.estimated_sessions ? parseInt(form.estimated_sessions) : null,
      status: 'active',
      cover_image_url: null,
    })

    createWorldState({
      campaign_id: campaign.id,
      session_number: 0,
      war_level: 0,
      corruption_level: 0,
      political_stability: 100,
      narrative_tension: 0,
      villain_progress: 0,
      hero_reputation: 50,
      objective_progress: 0,
      active_threats: [],
      active_conflicts: [],
      custom_metrics: {},
      world_summary: null,
    })

    setOpen(false)
    setLoading(false)
    router.push(`/campaign/${campaign.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gold-gradient">Crea Nuova Campagna</DialogTitle>
          <DialogDescription>
            Definisci la tua campagna. L'AI userà queste informazioni come base narrativa.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground/80 mb-1.5">
              Titolo *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => handleChange('title', e.target.value)}
              placeholder="Il Nome del Tradimento..."
              className="input-fantasy w-full"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground/80 mb-1.5">Tono Narrativo</label>
              <Select value={form.narrative_tone} onValueChange={v => handleChange('narrative_tone', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground/80 mb-1.5">Sistema</label>
              <Select value={form.game_system} onValueChange={v => handleChange('game_system', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SYSTEMS.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/80 mb-1.5">Descrizione</label>
            <Textarea
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="Breve descrizione della campagna..."
              className="h-20"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/80 mb-1.5">
              Lore & Ambientazione
              <span className="text-muted-foreground font-normal ml-1">(l'AI userà questo per capire il mondo)</span>
            </label>
            <Textarea
              value={form.lore}
              onChange={e => handleChange('lore', e.target.value)}
              placeholder="Descrivi il mondo, la storia, i grandi eventi passati, le forze in gioco..."
              className="h-32"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/80 mb-1.5">
              Obiettivo Finale
              <span className="text-muted-foreground font-normal ml-1">(l'AI misurerà la progressione verso questo)</span>
            </label>
            <Textarea
              value={form.final_objective}
              onChange={e => handleChange('final_objective', e.target.value)}
              placeholder="Sconfiggere il Lich, riunire i frammenti del cristallo, impedire l'ascesa del dio del caos..."
              className="h-20"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/80 mb-1.5">
              Sessioni Stimate <span className="text-muted-foreground font-normal">(opzionale)</span>
            </label>
            <input
              type="number"
              value={form.estimated_sessions}
              onChange={e => handleChange('estimated_sessions', e.target.value)}
              placeholder="30"
              min="1"
              className="input-fantasy w-32"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={loading || !form.title.trim()}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creazione...
                </>
              ) : (
                'Crea Campagna'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
