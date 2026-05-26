'use client'

import { useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Globe, TrendingUp, Activity, Sparkles, Loader2 } from 'lucide-react'
import type { WorldState, ProgressAnalysis } from '@/types'
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

export function WorldStateDetailView({ worldStates, campaignId }: WorldStateDetailViewProps) {
  const [progressAnalysis, setProgressAnalysis] = useState<ProgressAnalysis | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const current = worldStates[0]
  const previous = worldStates[1]

  function getVal(ws: WorldState, key: WorldStateNumericKey): number {
    return ws[key] ?? 0
  }

  function getDelta(key: WorldStateNumericKey): number | null {
    if (!current || !previous) return null
    return getVal(current, key) - getVal(previous, key)
  }

  async function handleAnalyzeProgress() {
    setAnalyzing(true)
    try {
      const res = await fetch('/api/ai/narrative-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      })
      if (res.ok) {
        const { progress } = await res.json()
        setProgressAnalysis(progress)
      }
    } finally {
      setAnalyzing(false)
    }
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

        {/* AI Progress Analysis */}
        <div className="card-fantasy border border-[hsl(var(--arcane)/0.2)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Analisi Progressione
            </h3>
            <Button
              size="sm"
              variant="arcane"
              onClick={handleAnalyzeProgress}
              disabled={analyzing}
              className="text-xs gap-1.5"
            >
              {analyzing ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" />Analisi...</>
              ) : (
                <><Activity className="w-3.5 h-3.5" />Analizza</>
              )}
            </Button>
          </div>

          {progressAnalysis ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">Completamento Stimato</span>
                  <span className="text-2xl font-display font-bold text-[hsl(var(--gold))]">
                    {progressAnalysis.completion_estimate_percent}%
                  </span>
                </div>
                <Progress
                  value={progressAnalysis.completion_estimate_percent}
                  indicatorClassName="bg-gradient-to-r from-[hsl(var(--gold-dim))] to-[hsl(var(--gold))]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-muted/30 rounded p-2.5">
                  <p className="text-muted-foreground mb-0.5">Sessioni al Finale</p>
                  <p className="font-bold text-foreground text-lg font-display">{progressAnalysis.sessions_to_finale_estimate}</p>
                </div>
                <div className="bg-muted/30 rounded p-2.5">
                  <p className="text-muted-foreground mb-0.5">Momentum</p>
                  <p className={cn(
                    'font-medium capitalize',
                    progressAnalysis.narrative_momentum === 'ascending' ? 'text-emerald-400' :
                    progressAnalysis.narrative_momentum === 'descending' ? 'text-red-400' : 'text-yellow-400'
                  )}>
                    {progressAnalysis.narrative_momentum === 'ascending' ? '↑ Crescente' :
                     progressAnalysis.narrative_momentum === 'descending' ? '↓ Calante' : '→ Stabile'}
                  </p>
                </div>
              </div>

              {progressAnalysis.biggest_threats?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-red-400 mb-1.5">Minacce Principali</p>
                  <div className="space-y-1">
                    {progressAnalysis.biggest_threats.map((t, i) => (
                      <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-red-500 shrink-0">▸</span>
                        {t}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {progressAnalysis.analysis && (
                <div className="bg-[hsl(var(--arcane)/0.08)] rounded p-3">
                  <p className="text-xs text-muted-foreground">{progressAnalysis.analysis}</p>
                </div>
              )}

              {progressAnalysis.recommendation && (
                <div className="bg-[hsl(var(--gold)/0.05)] border border-[hsl(var(--gold)/0.15)] rounded p-3">
                  <p className="text-xs font-medium text-[hsl(var(--gold))] mb-1">Consiglio</p>
                  <p className="text-xs text-foreground/80">{progressAnalysis.recommendation}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">
                Clicca "Analizza" per una valutazione AI della progressione narrativa
              </p>
            </div>
          )}
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
