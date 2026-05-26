'use client'

import { Progress } from '@/components/ui/progress'
import { Globe, Flame, Shield, Brain, TrendingUp, Star, AlertTriangle } from 'lucide-react'
import type { WorldState } from '@/types'
import { cn } from '@/lib/utils'

interface Metric {
  key: keyof WorldState
  label: string
  icon: React.ElementType
  color: string
  indicatorClass: string
  description: string
  invert?: boolean
}

const METRICS: Metric[] = [
  {
    key: 'war_level',
    label: 'Livello di Guerra',
    icon: Flame,
    color: 'text-red-400',
    indicatorClass: 'bg-gradient-to-r from-red-700 to-red-500',
    description: 'Intensità dei conflitti armati nel mondo',
  },
  {
    key: 'corruption_level',
    label: 'Corruzione',
    icon: AlertTriangle,
    color: 'text-orange-400',
    indicatorClass: 'bg-gradient-to-r from-orange-800 to-orange-500',
    description: 'Diffusione del male e della corruzione',
  },
  {
    key: 'political_stability',
    label: 'Stabilità Politica',
    icon: Shield,
    color: 'text-blue-400',
    indicatorClass: 'bg-gradient-to-r from-blue-800 to-blue-500',
    description: 'Equilibrio dei poteri e governi',
    invert: true,
  },
  {
    key: 'narrative_tension',
    label: 'Tensione Narrativa',
    icon: Brain,
    color: 'text-purple-400',
    indicatorClass: 'bg-gradient-to-r from-purple-800 to-purple-400',
    description: 'Pressione e urgenza della storia',
  },
  {
    key: 'villain_progress',
    label: 'Progresso Villain',
    icon: AlertTriangle,
    color: 'text-red-300',
    indicatorClass: 'bg-gradient-to-r from-red-900 to-red-400',
    description: 'Avanzamento dei piani antagonisti',
  },
  {
    key: 'hero_reputation',
    label: 'Reputazione Eroi',
    icon: Star,
    color: 'text-[hsl(var(--gold))]',
    indicatorClass: 'bg-gradient-to-r from-yellow-700 to-[hsl(var(--gold))]',
    description: 'Come il mondo vede i giocatori',
    invert: true,
  },
]

interface WorldStatePanelProps {
  worldState: WorldState
  campaignId: string
}

export function WorldStatePanel({ worldState }: WorldStatePanelProps) {
  return (
    <div className="card-fantasy border border-border rounded-xl p-5 h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[hsl(var(--gold))]" />
          <h2 className="font-display font-semibold text-sm">World State</h2>
        </div>
        <span className="text-xs text-muted-foreground">
          Sessione {worldState.session_number}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {METRICS.map(metric => {
          const Icon = metric.icon
          const value = worldState[metric.key] as number ?? 0
          const isHigh = metric.invert ? value < 30 : value > 70
          const isMid = metric.invert ? value < 60 : value > 40

          return (
            <div key={metric.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Icon className={cn('w-3.5 h-3.5', metric.color)} />
                  <span className="text-xs text-muted-foreground">{metric.label}</span>
                </div>
                <span
                  className={cn(
                    'text-xs font-semibold font-mono',
                    isHigh ? 'text-red-400' : isMid ? 'text-yellow-400' : 'text-emerald-400'
                  )}
                >
                  {value}
                </span>
              </div>
              <Progress
                value={value}
                className="h-1.5"
                indicatorClassName={metric.indicatorClass}
              />
            </div>
          )
        })}
      </div>

      {worldState.world_summary && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {worldState.world_summary}
          </p>
        </div>
      )}
    </div>
  )
}
