'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Target, CheckCircle, XCircle, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Objective } from '@/types'

const OBJ_TYPES = ['main', 'side', 'secret', 'faction', 'personal']
const OBJ_STATUSES = ['active', 'completed', 'failed', 'abandoned', 'hidden']

const TYPE_STYLES: Record<string, { badge: string; icon: React.ElementType; color: string }> = {
  main: { badge: 'default', icon: Trophy, color: 'text-[hsl(var(--gold))]' },
  side: { badge: 'secondary', icon: Target, color: 'text-blue-400' },
  secret: { badge: 'arcane', icon: Target, color: 'text-purple-400' },
  faction: { badge: 'crimson', icon: Target, color: 'text-[hsl(var(--crimson))]' },
  personal: { badge: 'emerald', icon: Target, color: 'text-emerald-400' },
}

interface ObjectivesViewProps {
  objectives: Objective[]
  campaignId: string
  finalObjective: string | null
}

export function ObjectivesView({ objectives: initial, campaignId, finalObjective }: ObjectivesViewProps) {
  const [objectives, setObjectives] = useState<Objective[]>(initial)

  function onCreated(obj: Objective) {
    setObjectives(prev => [...prev, obj])
  }

  function onUpdated(obj: Objective) {
    setObjectives(prev => prev.map(o => o.id === obj.id ? obj : o))
  }

  const active = objectives.filter(o => o.status === 'active')
  const completed = objectives.filter(o => o.status === 'completed')
  const failed = objectives.filter(o => ['failed', 'abandoned'].includes(o.status))
  const hidden = objectives.filter(o => o.status === 'hidden')

  return (
    <div className="space-y-6">
      {finalObjective && (
        <div className="card-fantasy border border-[hsl(var(--gold)/0.3)] rounded-xl p-5 bg-[hsl(var(--gold)/0.04)]">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-[hsl(var(--gold))]" />
            <span className="text-xs font-medium text-[hsl(var(--gold))] uppercase tracking-wide">Obiettivo Finale della Campagna</span>
          </div>
          <p className="text-sm text-foreground">{finalObjective}</p>
        </div>
      )}

      <div className="flex justify-end">
        <CreateObjectiveDialog campaignId={campaignId} onCreated={onCreated}>
          <Button size="sm" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Aggiungi Obiettivo
          </Button>
        </CreateObjectiveDialog>
      </div>

      {active.length > 0 && (
        <ObjectiveSection title="Obiettivi Attivi" objectives={active} onUpdate={onUpdated} />
      )}
      {hidden.length > 0 && (
        <ObjectiveSection title="Segreti" objectives={hidden} onUpdate={onUpdated} dimmed />
      )}
      {completed.length > 0 && (
        <ObjectiveSection title="Completati" objectives={completed} onUpdate={onUpdated} dimmed />
      )}
      {failed.length > 0 && (
        <ObjectiveSection title="Falliti / Abbandonati" objectives={failed} onUpdate={onUpdated} dimmed />
      )}

      {objectives.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm">Nessun obiettivo definito</p>
        </div>
      )}
    </div>
  )
}

function ObjectiveSection({
  title, objectives, onUpdate, dimmed,
}: {
  title: string
  objectives: Objective[]
  onUpdate: (o: Objective) => void
  dimmed?: boolean
}) {
  return (
    <div>
      <h3 className={cn('text-sm font-medium mb-3', dimmed ? 'text-muted-foreground' : 'text-foreground')}>
        {title}
      </h3>
      <div className="space-y-2">
        {objectives.map(obj => (
          <ObjectiveCard key={obj.id} objective={obj} onUpdate={onUpdate} />
        ))}
      </div>
    </div>
  )
}

function ObjectiveCard({ objective: obj, onUpdate }: { objective: Objective; onUpdate: (o: Objective) => void }) {
  const updateObjective = useStore(s => s.updateObjective)
  const style = TYPE_STYLES[obj.objective_type] ?? TYPE_STYLES.side
  const Icon = style.icon

  function updateProgress(delta: number) {
    const newProgress = Math.max(0, Math.min(100, obj.progress_percent + delta))
    updateObjective(obj.id, { progress_percent: newProgress })
    onUpdate({ ...obj, progress_percent: newProgress })
  }

  function updateStatus(status: string) {
    const progress_percent = status === 'completed' ? 100 : obj.progress_percent
    updateObjective(obj.id, { status: status as Objective['status'], progress_percent })
    onUpdate({ ...obj, status: status as Objective['status'], progress_percent })
  }

  return (
    <div className={cn(
      'card-fantasy border rounded-xl p-4',
      obj.status === 'completed' ? 'border-emerald-500/20 opacity-70' :
      obj.status === 'failed' ? 'border-red-500/20 opacity-60' :
      obj.status === 'hidden' ? 'border-[hsl(var(--arcane)/0.3)]' :
      'border-border'
    )}>
      <div className="flex items-start gap-3">
        <Icon className={cn('w-4 h-4 shrink-0 mt-0.5', style.color)} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className={cn('text-sm font-medium', obj.status === 'failed' ? 'line-through text-muted-foreground' : 'text-foreground')}>
              {obj.title}
            </p>
            <div className="flex items-center gap-1 shrink-0">
              <Badge variant={style.badge as 'default'} className="text-[10px]">{obj.objective_type}</Badge>
              <Badge
                variant={
                  obj.status === 'completed' ? 'emerald' :
                  obj.status === 'failed' ? 'destructive' :
                  obj.status === 'hidden' ? 'arcane' : 'ghost'
                }
                className="text-[10px]"
              >
                {obj.status}
              </Badge>
            </div>
          </div>

          {obj.description && (
            <p className="text-xs text-muted-foreground mb-2">{obj.description}</p>
          )}

          {obj.status === 'active' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progresso</span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => updateProgress(-10)} className="text-muted-foreground hover:text-foreground">−</button>
                  <span className="font-mono w-8 text-center text-[hsl(var(--gold))]">{obj.progress_percent}%</span>
                  <button onClick={() => updateProgress(10)} className="text-muted-foreground hover:text-foreground">+</button>
                </div>
              </div>
              <Progress value={obj.progress_percent} className="h-1.5" indicatorClassName="bg-emerald-500" />
            </div>
          )}

          {obj.status === 'active' && (
            <div className="flex items-center gap-1.5 mt-2">
              <button
                onClick={() => updateStatus('completed')}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                <CheckCircle className="w-3 h-3" />
                Completa
              </button>
              <span className="text-border">|</span>
              <button
                onClick={() => updateStatus('failed')}
                className="text-xs text-red-400/70 hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <XCircle className="w-3 h-3" />
                Fallito
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CreateObjectiveDialog({
  campaignId, onCreated, children,
}: {
  campaignId: string
  onCreated: (o: Objective) => void
  children: React.ReactNode
}) {
  const createObjective = useStore(s => s.createObjective)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', objective_type: 'main', status: 'active',
    rewards: '', consequences_if_failed: '',
  })

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })) }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return

    const obj = createObjective({
      campaign_id: campaignId,
      title: form.title,
      description: form.description || null,
      objective_type: form.objective_type as 'main',
      status: form.status as 'active',
      progress_percent: 0,
      rewards: form.rewards || null,
      consequences_if_failed: form.consequences_if_failed || null,
    })

    onCreated(obj)
    setOpen(false)
    setForm({ title: '', description: '', objective_type: 'main', status: 'active', rewards: '', consequences_if_failed: '' })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuovo Obiettivo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">Titolo *</label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Distruggere il Phylactery..." className="input-fantasy w-full" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Tipo</label>
              <Select value={form.objective_type} onValueChange={v => set('objective_type', v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{OBJ_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Status</label>
              <Select value={form.status} onValueChange={v => set('status', v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{OBJ_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Descrizione</label>
            <Textarea value={form.description} onChange={e => set('description', e.target.value)} className="h-16" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Ricompense</label>
            <input type="text" value={form.rewards} onChange={e => set('rewards', e.target.value)} placeholder="Accesso alla biblioteca proibita..." className="input-fantasy w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Conseguenze se Fallisce</label>
            <input type="text" value={form.consequences_if_failed} onChange={e => set('consequences_if_failed', e.target.value)} placeholder="Il Lich ottiene un frammento..." className="input-fantasy w-full" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annulla</Button>
            <Button type="submit" disabled={!form.title.trim()}>Crea Obiettivo</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
