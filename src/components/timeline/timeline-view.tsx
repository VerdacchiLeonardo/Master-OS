'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { TimelineEventCard } from './event-card'
import { CreateEventDialog } from './create-event-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Filter } from 'lucide-react'
import type { TimelineEvent } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_FILTERS = [
  { value: 'all', label: 'Tutti' },
  { value: 'past', label: 'Passati' },
  { value: 'present', label: 'Presenti' },
  { value: 'future', label: 'Futuri' },
  { value: 'inevitable', label: 'Inevitabili' },
  { value: 'conditional', label: 'Condizionati' },
]

interface TimelineViewProps {
  events: TimelineEvent[]
  campaignId: string
}

export function TimelineView({ events: initialEvents, campaignId }: TimelineViewProps) {
  const [events, setEvents] = useState<TimelineEvent[]>(initialEvents)
  const [filter, setFilter] = useState('all')
  const router = useRouter()

  const filtered = filter === 'all' ? events : events.filter(e => e.status === filter)

  const grouped = {
    past: filtered.filter(e => e.status === 'past'),
    present: filtered.filter(e => e.status === 'present'),
    future: filtered.filter(e => ['future', 'inevitable', 'conditional'].includes(e.status)),
    averted: filtered.filter(e => e.status === 'averted'),
  }

  function onEventCreated(event: TimelineEvent) {
    setEvents(prev => [event, ...prev])
  }

  function onEventUpdated(event: TimelineEvent) {
    setEvents(prev => prev.map(e => e.id === event.id ? event : e))
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                filter === f.value
                  ? 'bg-[hsl(var(--gold)/0.15)] text-[hsl(var(--gold))] border border-[hsl(var(--gold)/0.3)]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              {f.label}
              {f.value !== 'all' && (
                <span className="ml-1 opacity-60">
                  ({events.filter(e => e.status === f.value).length})
                </span>
              )}
            </button>
          ))}
        </div>

        <CreateEventDialog campaignId={campaignId} onCreated={onEventCreated}>
          <Button size="sm" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Aggiungi Evento
          </Button>
        </CreateEventDialog>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm mb-4">Nessun evento nella timeline</p>
          <CreateEventDialog campaignId={campaignId} onCreated={onEventCreated}>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Crea il primo evento
            </Button>
          </CreateEventDialog>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.present.length > 0 && (
            <TimelineSection title="Ora" color="text-emerald-400 border-emerald-400/30" events={grouped.present} onUpdate={onEventUpdated} />
          )}
          {grouped.past.length > 0 && (
            <TimelineSection title="Passato" color="text-muted-foreground border-muted/30" events={grouped.past} onUpdate={onEventUpdated} />
          )}
          {grouped.future.length > 0 && (
            <TimelineSection title="Futuro" color="text-blue-400 border-blue-400/30" events={grouped.future} onUpdate={onEventUpdated} />
          )}
          {grouped.averted.length > 0 && (
            <TimelineSection title="Sventati" color="text-slate-600 border-slate-600/30" events={grouped.averted} onUpdate={onEventUpdated} />
          )}
        </div>
      )}
    </div>
  )
}

function TimelineSection({
  title,
  color,
  events,
  onUpdate,
}: {
  title: string
  color: string
  events: TimelineEvent[]
  onUpdate: (e: TimelineEvent) => void
}) {
  return (
    <div>
      <div className="divider-fantasy mb-4">
        <span className={cn('text-xs font-medium font-display tracking-wider uppercase px-2', color)}>
          {title}
        </span>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px timeline-line" />
        <div className="space-y-3 pl-10">
          {events.map((event, i) => (
            <div
              key={event.id}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <TimelineEventCard event={event} onUpdate={onUpdate} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
