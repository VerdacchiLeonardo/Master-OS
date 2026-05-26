'use client'

import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Globe, TrendingUp, Target } from 'lucide-react'
import type { WorldState } from '@/types'
import { cn } from '@/lib/utils'

type WorldStateNumericKey =
  | 'war_level'
  | 'corruption_level'
  | 'political_stability'
  | 'narrative_tension'
  | 'villain_progress'
  | 'hero_reputation'
  | 'objective_progress'

const METRICS: Array<{
  key: WorldStateNumericKey
  label: string
  color: string
  indicator: string
  invert?: boolean
}> = [
  { key: 'war_level', label: 'Guerra', color: '#ef4444', indicator: 'bg-red-500' },
  { key: 'corruption_level', label: 'Corruzione', color: '#f97316', indicator: 'bg-orange-500' },
  { key: 'political_stability', label: 'Stabilità Politica', color: '#3b82f6', indicator: 'bg-blue-500', invert: true },
  { key: 'narrative_tension', label: 'Tensione', color: '#a855f7', indicator: 'bg-purple-500' },
  { key: 'villain_progress', label: 'Villain', color: '#dc2626', indicator: 'bg-red-700' },
  { key: 'hero_reputation', label: 'Reputazione', color: '#eab308', indicator: 'bg-yellow-500', invert: true },
  { key: 'objective_progress', label: 'Obiettivo', color: '#22c55e', indicator: 'bg-emerald-500', invert: true },
]

interface WorldStateDetailViewProps {
  worldStates: WorldState[]
  campaignId: string
}

export function WorldStateDetailView({ worldStates }: WorldStateDetailViewProps) {
  const current = worldStates[0]
  const previous = worldStates[1]

  function getVal(ws: WorldState, key: WorldStateNumericKey): number {
    return ws[key] ?? 0
  }

  function getDelta(key: WorldStateNumericKey): number | null {
    if (!current || !previous) return null
    return getVal(current, key) - getVal(previous, key)
  }

  if (worldStates.length === 0) {
    return (
      <div className="text-center py-12">
        <Globe className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground text-sm">Nessun world state disponibile</p>
        <p className="text-xs text-muted-foreground mt-1">Processa una sessione per aggiornare il world state</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current state */}
        <div className="card-fantasy border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-medium flex items-center gap-2">
              <Globe className="w-4 h-4 text-[hsl(var(--gold))]" />
              Stato Corrente
            </h3>
            <Badge variant="ghost" className="text-xs">
              Sessione {current.session_number}
            </Badge>
          </div>

          <div className="space-y-3">
            {METRICS.map(metric => {
              const value = getVal(current, metric.key)
              const delta = getDelta(metric.key)

              return (
                <div key={metric.key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{metric.label}</span>
                    <div className="flex items-center gap-1.5">
                      {delta !== null && delta !== 0 && (
                        <span className={cn(
                          'text-[10px] font-mono',
                          metric.invert
                            ? delta > 0 ? 'text-emerald-400' : 'text-red-400'
                            : delta > 0 ? 'text-red-400' : 'text-emerald-400'
                        )}>
                          {delta > 0 ? '+' : ''}{delta}
                        </span>
                      )}
                      <span className="text-xs font-mono font-semibold" style={{ color: metric.color }}>
                        {value}
                      </span>
                    </div>
                  </div>
                  <Progress value={value} className="h-1.5" indicatorClassName={metric.indicator} />
                </div>
              )
            })}
          </div>

          {current.world_summary && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground">{current.world_summary}</p>
            </div>
          )}
        </div>

        {/* Objective progress manual */}
        <div className="card-fantasy border border-border rounded-xl p-5">
          <h3 className="font-display font-medium flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-[hsl(var(--gold))]" />
            Progresso Obiettivo
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completamento</span>
              <span className="text-2xl font-display font-bold text-[hsl(var(--gold))]">
                {current.objective_progress}%
              </span>
            </div>
            <Progress
              value={current.objective_progress}
              indicatorClassName="bg-gradient-to-r from-[hsl(var(--gold-dim))] to-[hsl(var(--gold))]"
            />
            <p className="text-xs text-muted-foreground">
              Aggiornato manualmente tramite la sezione Obiettivi, o automaticamente quando elabori una sessione con AI.
            </p>
          </div>
        </div>
      </div>

      {/* History table */}
      {worldStates.length > 1 && (
        <div className="card-fantasy border border-border rounded-xl p-5">
          <h3 className="font-display font-medium mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[hsl(var(--gold))]" />
            Evoluzione Storica
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-muted-foreground font-medium pb-2 pr-4">Sessione</th>
                  {METRICS.map(m => (
                    <th key={m.key} className="text-center text-muted-foreground font-medium pb-2 px-2">
                      {m.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {worldStates.slice(0, 8).map((ws, i) => {
                  const prev = worldStates[i + 1]
                  return (
                    <tr key={ws.id} className="border-b border-border/50 last:border-0">
                      <td className="py-2 pr-4 text-foreground font-medium">{ws.session_number}</td>
                      {METRICS.map(m => {
                        const val = getVal(ws, m.key)
                        const prevVal = prev ? getVal(prev, m.key) : val
                        const diff = val - prevVal
                        return (
                          <td key={m.key} className="text-center py-2 px-2">
                            <span className="font-mono" style={{ color: m.color }}>{val}</span>
                            {diff !== 0 && (
                              <span className={cn('ml-1 text-[9px]', diff > 0 ? 'text-red-400' : 'text-emerald-400')}>
                                {diff > 0 ? '▲' : '▼'}
                              </span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
