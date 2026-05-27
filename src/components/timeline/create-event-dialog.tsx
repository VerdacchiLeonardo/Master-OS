'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import type { TimelineEvent } from '@/types'

const EVENT_TYPES = [
  'story', 'combat', 'political', 'prophecy', 'ritual', 'war', 'death',
  'discovery', 'betrayal', 'alliance', 'threat', 'countdown', 'player_action',
]
const IMPORTANCES = ['minor', 'major', 'critical', 'catastrophic']
const STATUSES = ['past', 'present', 'future', 'inevitable', 'conditional']

interface CreateEventDialogProps {
  children: React.ReactNode
  campaignId: string
  onCreated: (event: TimelineEvent) => void
}

export function CreateEventDialog({ children, campaignId, onCreated }: CreateEventDialogProps) {
  const createTimelineEvent = useStore(s => s.createTimelineEvent)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    event_type: 'story',
    importance: 'major',
    status: 'future',
    trigger_condition: '',
    event_date: '',
  })

  function set(key: string, value: string) {
    setForm(p => ({ ...p, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    setLoading(true)

    const event = createTimelineEvent({
      campaign_id: campaignId,
      title: form.title,
      description: form.description || null,
      event_type: form.event_type,
      importance: form.importance as 'major',
      status: form.status as 'future',
      trigger_condition: form.trigger_condition || null,
      event_date: form.event_date || null,
      session_number: null,
    })

    onCreated(event)
    setOpen(false)
    setForm({ title: '', description: '', event_type: 'story', importance: 'major', status: 'future', trigger_condition: '', event_date: '' })
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuovo Evento Timeline</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground/80 mb-1.5">Titolo *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="L'assassinio del Re..."
              className="input-fantasy w-full"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-foreground/80 mb-1.5">Tipo</label>
              <Select value={form.event_type} onValueChange={v => set('event_type', v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground/80 mb-1.5">Importanza</label>
              <Select value={form.importance} onValueChange={v => set('importance', v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {IMPORTANCES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground/80 mb-1.5">Stato</label>
              <Select value={form.status} onValueChange={v => set('status', v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/80 mb-1.5">Descrizione</label>
            <Textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Cosa accade, chi è coinvolto, le conseguenze..."
              className="h-24"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/80 mb-1.5">
              Condizione Trigger <span className="text-muted-foreground font-normal">(per eventi condizionali)</span>
            </label>
            <input
              type="text"
              value={form.trigger_condition}
              onChange={e => set('trigger_condition', e.target.value)}
              placeholder="Se i giocatori non fermano il rituale entro..."
              className="input-fantasy w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/80 mb-1.5">Data / Periodo</label>
            <input
              type="text"
              value={form.event_date}
              onChange={e => set('event_date', e.target.value)}
              placeholder="Anno 847, Sessione 5, Luna di Sangue..."
              className="input-fantasy w-full"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annulla</Button>
            <Button type="submit" disabled={loading || !form.title.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crea Evento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
