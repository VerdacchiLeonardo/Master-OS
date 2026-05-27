'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn, getImportanceColor, getStatusColor } from '@/lib/utils'
import {
  Sword, ScrollText, Crown, Star, Eye, Skull, Globe, Zap, AlertTriangle, Clock, ChevronDown, ChevronUp
} from 'lucide-react'
import type { TimelineEvent } from '@/types'

const TYPE_ICONS: Record<string, React.ElementType> = {
  story: ScrollText,
  combat: Sword,
  political: Crown,
  prophecy: Star,
  ritual: Zap,
  war: Globe,
  death: Skull,
  discovery: Eye,
  betrayal: AlertTriangle,
  alliance: Crown,
  threat: AlertTriangle,
  countdown: Clock,
  player_action: Sword,
}

const STATUS_DOT_COLORS: Record<string, string> = {
  past: 'bg-slate-500',
  present: 'bg-emerald-400 shadow-[0_0_6px_#34d399]',
  future: 'bg-blue-400',
  inevitable: 'bg-red-500 shadow-[0_0_6px_#ef4444] animate-pulse',
  conditional: 'bg-yellow-400',
  averted: 'bg-slate-700',
}

interface TimelineEventCardProps {
  event: TimelineEvent
  onUpdate?: (e: TimelineEvent) => void
}

export function TimelineEventCard({ event }: TimelineEventCardProps) {
  const [expanded, setExpanded] = useState(false)
  const Icon = TYPE_ICONS[event.event_type] ?? ScrollText
  const dotColor = STATUS_DOT_COLORS[event.status] ?? 'bg-muted-foreground'

  return (
    <div className="relative">
      {/* Timeline dot */}
      <div
        className={cn(
          'absolute -left-[1.65rem] top-4 w-2.5 h-2.5 rounded-full border-2 border-background',
          dotColor
        )}
      />

      <div
        className={cn(
          'card-fantasy border rounded-lg p-4 transition-all duration-200',
          'hover:border-[hsl(var(--gold)/0.25)]',
          event.importance === 'catastrophic' && 'border-red-500/30 bg-red-500/5',
          event.importance === 'critical' && 'border-orange-500/20',
          event.importance === 'major' && 'border-[hsl(var(--gold)/0.12)]',
          (event.importance !== 'catastrophic' && event.importance !== 'critical' && event.importance !== 'major') && 'border-border',
          event.status === 'averted' && 'opacity-50',
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn(
            'w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5',
            event.importance === 'catastrophic' ? 'bg-red-500/15' :
            event.importance === 'critical' ? 'bg-orange-500/15' :
            event.importance === 'major' ? 'bg-[hsl(var(--gold)/0.12)]' : 'bg-muted'
          )}>
            <Icon className={cn(
              'w-3.5 h-3.5',
              event.importance === 'catastrophic' ? 'text-red-400' :
              event.importance === 'critical' ? 'text-orange-400' :
              event.importance === 'major' ? 'text-[hsl(var(--gold))]' : 'text-muted-foreground'
            )} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h4 className={cn(
                'text-sm font-medium',
                getStatusColor(event.status),
                event.status === 'averted' && 'line-through'
              )}>
                {event.title}
              </h4>

              <div className="flex items-center gap-1.5 shrink-0">
                <Badge
                  variant="ghost"
                  className={cn('text-[10px] border', getImportanceColor(event.importance))}
                >
                  {event.importance}
                </Badge>
                <Badge variant="ghost" className="text-[10px]">
                  {event.event_type}
                </Badge>
              </div>
            </div>

            {event.description && (
              <p className={cn(
                'text-xs text-muted-foreground leading-relaxed',
                !expanded && 'line-clamp-2'
              )}>
                {event.description}
              </p>
            )}

            {event.trigger_condition && expanded && (
              <div className="mt-2 text-xs">
                <span className="text-muted-foreground">Trigger: </span>
                <span className="text-yellow-400">{event.trigger_condition}</span>
              </div>
            )}

            {(event.description?.length ?? 0) > 80 && (
              <div className="mt-1">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {expanded ? 'Meno' : 'Altro'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
