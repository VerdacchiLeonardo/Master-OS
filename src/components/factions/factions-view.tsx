'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Shield, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Faction } from '@/types'

const FACTION_TYPES = ['kingdom', 'city', 'guild', 'cult', 'army', 'organization', 'order', 'criminal', 'nomadic']
const STATUSES = ['active', 'weakened', 'destroyed', 'hidden', 'dormant']

const REL_COLORS: Record<string, string> = {
  allied: 'emerald', friendly: 'emerald', neutral: 'ghost', tense: 'default',
  hostile: 'crimson', war: 'destructive', vassal: 'secondary', rival: 'arcane',
}

interface FactionsViewProps {
  factions: Faction[]
  relationships: Array<{ id: string; faction_a_id: string; faction_b_id: string; relationship_type: string; description: string | null }>
  campaignId: string
}

export function FactionsView({ factions: initial, relationships: initialRels, campaignId }: FactionsViewProps) {
  const [factions, setFactions] = useState<Faction[]>(initial)

  function onCreated(faction: Faction) {
    setFactions(prev => [...prev, faction])
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted-foreground">{factions.length} fazioni attive</p>
        <CreateFactionDialog campaignId={campaignId} onCreated={onCreated}>
          <Button size="sm" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Aggiungi Fazione
          </Button>
        </CreateFactionDialog>
      </div>

      {factions.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm">Nessuna fazione definita</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {factions.map(faction => (
            <FactionCard key={faction.id} faction={faction} relationships={initialRels} factions={factions} />
          ))}
        </div>
      )}
    </div>
  )
}

function FactionCard({
  faction: initial, relationships, factions,
}: {
  faction: Faction
  relationships: Array<{ faction_a_id: string; faction_b_id: string; relationship_type: string }>
  factions: Faction[]
}) {
  const faction = initial

  const myRelationships = relationships.filter(
    r => r.faction_a_id === faction.id || r.faction_b_id === faction.id
  )

  return (
    <div
      className="card-fantasy border rounded-xl p-4 space-y-3"
      style={{ borderColor: faction.color ? `${faction.color}30` : undefined }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: faction.color ? `${faction.color}20` : undefined }}
          >
            <Crown
              className="w-4 h-4"
              style={{ color: faction.color ?? 'hsl(var(--gold))' }}
            />
          </div>
          <div>
            <p className="text-sm font-medium">{faction.name}</p>
            <p className="text-xs text-muted-foreground">{faction.faction_type}</p>
          </div>
        </div>
        <Badge variant={faction.status === 'active' ? 'emerald' : faction.status === 'destroyed' ? 'destructive' : 'ghost'} className="text-[10px]">
          {faction.status}
        </Badge>
      </div>

      {faction.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{faction.description}</p>
      )}

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Influenza</span>
          <span className="font-mono">{faction.influence_level}</span>
        </div>
        <Progress value={faction.influence_level} className="h-1" indicatorClassName="bg-[hsl(var(--gold))]" />

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Forza Militare</span>
          <span className="font-mono">{faction.military_strength}</span>
        </div>
        <Progress value={faction.military_strength} className="h-1" indicatorClassName="bg-red-500" />
      </div>

      {myRelationships.length > 0 && (
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Relazioni</p>
          <div className="flex flex-wrap gap-1">
            {myRelationships.slice(0, 3).map(rel => {
              const otherId = rel.faction_a_id === faction.id ? rel.faction_b_id : rel.faction_a_id
              const other = factions.find(f => f.id === otherId)
              return other ? (
                <div key={rel.faction_a_id + rel.faction_b_id} className="flex items-center gap-1 text-[10px]">
                  <Badge variant={REL_COLORS[rel.relationship_type] as 'default' ?? 'ghost'} className="text-[9px]">
                    {rel.relationship_type}
                  </Badge>
                  <span className="text-muted-foreground">{other.name}</span>
                </div>
              ) : null
            })}
          </div>
        </div>
      )}

      {faction.motivation && (
        <div className="text-xs">
          <span className="text-muted-foreground">Obiettivo: </span>
          <span className="text-foreground/70">{faction.motivation}</span>
        </div>
      )}

    </div>
  )
}

function CreateFactionDialog({
  campaignId, onCreated, children,
}: {
  campaignId: string
  onCreated: (f: Faction) => void
  children: React.ReactNode
}) {
  const createFaction = useStore(s => s.createFaction)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', faction_type: 'organization', alignment: '',
    motivation: '', status: 'active', influence_level: '50', military_strength: '50', color: '#8B5CF6',
  })

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })) }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return

    const faction = createFaction({
      campaign_id: campaignId,
      name: form.name,
      description: form.description || null,
      faction_type: form.faction_type,
      alignment: form.alignment || null,
      motivation: form.motivation || null,
      status: form.status as 'active',
      influence_level: parseInt(form.influence_level),
      military_strength: parseInt(form.military_strength),
      color: form.color || null,
      leader_npc_id: null,
      secrets: null,
    })

    onCreated(faction)
    setOpen(false)
    setForm({ name: '', description: '', faction_type: 'organization', alignment: '', motivation: '', status: 'active', influence_level: '50', military_strength: '50', color: '#8B5CF6' })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuova Fazione</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-foreground/80 mb-1">Nome *</label>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ordine del Crepuscolo..." className="input-fantasy w-full" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground/80 mb-1">Tipo</label>
              <Select value={form.faction_type} onValueChange={v => set('faction_type', v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{FACTION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground/80 mb-1">Status</label>
              <Select value={form.status} onValueChange={v => set('status', v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground/80 mb-1">Influenza (0-100)</label>
              <input type="number" min="0" max="100" value={form.influence_level} onChange={e => set('influence_level', e.target.value)} className="input-fantasy w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground/80 mb-1">Forza Militare (0-100)</label>
              <input type="number" min="0" max="100" value={form.military_strength} onChange={e => set('military_strength', e.target.value)} className="input-fantasy w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground/80 mb-1">Descrizione</label>
            <Textarea value={form.description} onChange={e => set('description', e.target.value)} className="h-16" />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground/80 mb-1">Motivazione / Obiettivo</label>
            <input type="text" value={form.motivation} onChange={e => set('motivation', e.target.value)} placeholder="Dominare il commercio magico..." className="input-fantasy w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground/80 mb-1">Colore identificativo</label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.color} onChange={e => set('color', e.target.value)} className="h-8 w-12 rounded cursor-pointer bg-transparent" />
              <span className="text-xs text-muted-foreground">{form.color}</span>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annulla</Button>
            <Button type="submit" disabled={!form.name.trim()}>
              Crea Fazione
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
