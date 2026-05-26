import Link from 'next/link'
import { ArrowRight, Clock, Flame, Sword } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn, formatDate } from '@/lib/utils'
import type { Campaign } from '@/types'

const toneColors: Record<string, string> = {
  epic: 'default',
  dark: 'crimson',
  mystery: 'arcane',
  horror: 'destructive',
  political: 'secondary',
  adventure: 'emerald',
}

const statusLabels: Record<string, string> = {
  active: 'Attiva',
  paused: 'In Pausa',
  completed: 'Completata',
  archived: 'Archiviata',
}

interface CampaignCardProps {
  campaign: Campaign
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <Link href={`/campaign/${campaign.id}`} className="group block">
      <div
        className={cn(
          'card-fantasy border border-[hsl(var(--gold)/0.12)] rounded-xl p-5 h-full',
          'hover:border-[hsl(var(--gold)/0.3)] hover:glow-gold transition-all duration-300',
          'relative overflow-hidden'
        )}
      >
        {/* Ambient gradient top */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[hsl(var(--arcane)/0.04)] rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[hsl(var(--gold)/0.08)] border border-[hsl(var(--gold)/0.2)] flex items-center justify-center shrink-0">
              <Sword className="w-4 h-4 text-[hsl(var(--gold))]" />
            </div>
            <div>
              <Badge variant={toneColors[campaign.narrative_tone ?? 'epic'] as 'default'} className="text-[10px] mb-0.5">
                {campaign.narrative_tone ?? 'epic'}
              </Badge>
            </div>
          </div>

          <Badge variant={campaign.status === 'active' ? 'emerald' : 'ghost'} className="text-[10px]">
            {statusLabels[campaign.status] ?? campaign.status}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="font-display font-semibold text-foreground mb-1.5 group-hover:text-[hsl(var(--gold))] transition-colors line-clamp-1">
          {campaign.title}
        </h3>

        {/* Description */}
        {campaign.description && (
          <p className="text-muted-foreground text-xs line-clamp-2 mb-4">
            {campaign.description}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-3 border-t border-border/50">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(campaign.updated_at)}
          </div>

          <div className="flex items-center gap-1 text-[hsl(var(--gold)/0.7)] group-hover:text-[hsl(var(--gold))] transition-colors">
            Apri
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {campaign.game_system && (
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[9px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
              {campaign.game_system}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
