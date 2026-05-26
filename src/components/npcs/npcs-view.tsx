'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Users, Skull, Heart, Eye, EyeOff, Shield } from 'lucide-react'
import { cn, generateInitials } from '@/lib/utils'
import type { NPC } from '@/types'

const ROLES = ['villain', 'ally', 'neutral', 'minor', 'major', 'mentor', 'unknown']
const STATUSES = ['alive', 'dead', 'missing', 'imprisoned', 'transformed', 'unknown']

const ROLE_COLORS: Record<string, string> = {
  villain: 'destructive',
  ally: 'emerald',
  neutral: 'ghost',
  minor: 'ghost',
  major: 'default',
  mentor: 'arcane',
  unknown: 'secondary',
}

const STATUS_ICONS: Record<string, React.ElementType> = {
  alive: Heart,
  dead: Skull,
  missing: Eye,
  imprisoned: Shield,
  transformed: Eye,
  unknown: EyeOff,
}

interface NPCsViewProps {
  npcs: NPC[]
  factions: Array<{ id: string; name: string; color: string | null }>
  campaignId: string
}

export function NPCsView({ npcs: initial, factions, campaignId }: NPCsViewProps) {
  const [npcs, setNpcs] = useState<NPC[]>(initial)
  const [filter, setFilter] = useState<string>('all')

  const filtered = filter === 'all' ? npcs : npcs.filter(n => n.role === filter || n.status === filter)

  function onCreated(npc: NPC) {
    setNpcs(prev => [...prev, npc])
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-1">
          {['all', 'villain', 'ally', 'major', 'minor'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-2.5 py-1.5 rounded-md text-xs transition-all',
                filter === f
                  ? 'bg-[hsl(var(--gold)/0.15)] text-[hsl(var(--gold))] border border-[hsl(var(--gold)/0.3)]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              {f === 'all' ? 'Tutti' : f}
            </button>
          ))}
        </div>

        <CreateNPCDialog campaignId={campaignId} factions={factions} onCreated={onCreated}>
          <Button size="sm" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Aggiungi NPC
          </Button>
        </CreateNPCDialog>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm">Nessun NPC trovato</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((npc) => (
            <NPCCard key={npc.id} npc={npc} factions={factions} />
          ))}
        </div>
      )}
    </div>
  )
}

function NPCCard({ npc, factions }: { npc: NPC; factions: Array<{ id: string; name: string; color: string | null }> }) {
  const StatusIcon = STATUS_ICONS[npc.status] ?? Eye
  const faction = factions.find(f => f.id === npc.faction_id)

  return (
    <div className={cn(
      'card-fantasy border rounded-xl p-4 space-y-3',
      npc.role === 'villain' ? 'border-red-500/20' :
      npc.role === 'ally' ? 'border-emerald-500/20' :
      'border-border'
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
          npc.role === 'villain' ? 'bg-red-500/15 text-red-400' :
          npc.role === 'ally' ? 'bg-emerald-500/15 text-emerald-400' :
          'bg-muted text-muted-foreground'
        )}>
          {generateInitials(npc.name)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <div>
              <p className="text-sm font-medium text-foreground truncate">{npc.name}</p>
              {npc.title && <p className="text-xs text-muted-foreground">{npc.title}</p>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Badge variant={ROLE_COLORS[npc.role] as 'default' ?? 'ghost'} className="text-[10px]">
                {npc.role}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {npc.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{npc.description}</p>
      )}

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-muted-foreground">
          <StatusIcon className="w-3 h-3" />
          <span>{npc.status}</span>
        </div>
        {faction && (
          <span className="text-muted-foreground truncate max-w-24" title={faction.name}>
            {faction.name}
          </span>
        )}
      </div>

      {!npc.is_player_known && (
        <div className="flex items-center gap-1 text-xs text-yellow-500/70">
          <EyeOff className="w-3 h-3" />
          Nascosto ai giocatori
        </div>
      )}
    </div>
  )
}

function CreateNPCDialog({
  campaignId, factions, onCreated, children,
}: {
  campaignId: string
  factions: Array<{ id: string; name: string; color: string | null }>
  onCreated: (npc: NPC) => void
  children: React.ReactNode
}) {
  const createNPC = useStore(s => s.createNPC)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: '', title: '', description: '', role: 'minor', status: 'alive',
    faction_id: '', alignment: '', motivation: '', secrets: '', is_player_known: true,
  })

  function set(k: string, v: string | boolean) {
    setForm(p => ({ ...p, [k]: v }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return

    const npc = createNPC({
      campaign_id: campaignId,
      name: form.name,
      title: form.title || null,
      description: form.description || null,
      role: form.role as 'minor',
      status: form.status as 'alive',
      faction_id: form.faction_id || null,
      alignment: form.alignment || null,
      motivation: form.motivation || null,
      secrets: form.secrets || null,
      is_player_known: form.is_player_known,
      current_location_id: null,
      ai_notes: null,
    })

    onCreated(npc)
    setOpen(false)
    setForm({ name: '', title: '', description: '', role: 'minor', status: 'alive', faction_id: '', alignment: '', motivation: '', secrets: '', is_player_known: true })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuovo NPC</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-foreground/80 mb-1">Nome *</label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Kael il Traditore" className="input-fantasy w-full" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground/80 mb-1">Titolo</label>
              <input type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Generale, Mago..." className="input-fantasy w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground/80 mb-1">Allineamento</label>
              <input type="text" value={form.alignment} onChange={e => set('alignment', e.target.value)} placeholder="Caotico Malvagio" className="input-fantasy w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground/80 mb-1">Ruolo</label>
              <Select value={form.role} onValueChange={v => set('role', v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
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

          {factions.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-foreground/80 mb-1">Fazione</label>
              <Select value={form.faction_id} onValueChange={v => set('faction_id', v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Nessuna" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nessuna</SelectItem>
                  {factions.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-foreground/80 mb-1">Descrizione</label>
            <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Aspetto, personalità, storia..." className="h-20" />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground/80 mb-1">Motivazione</label>
            <input type="text" value={form.motivation} onChange={e => set('motivation', e.target.value)} placeholder="Cosa vuole davvero..." className="input-fantasy w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground/80 mb-1">Segreti <span className="text-muted-foreground font-normal">(solo DM)</span></label>
            <Textarea value={form.secrets} onChange={e => set('secrets', e.target.value)} placeholder="Quello che i giocatori non sanno..." className="h-16" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_player_known" checked={form.is_player_known} onChange={e => set('is_player_known', e.target.checked)} className="rounded border-border" />
            <label htmlFor="is_player_known" className="text-xs text-foreground/80">Visibile ai giocatori</label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annulla</Button>
            <Button type="submit" disabled={!form.name.trim()}>Crea NPC</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
