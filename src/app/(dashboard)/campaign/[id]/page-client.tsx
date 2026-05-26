'use client'

import { useParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { useShallow } from 'zustand/shallow'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { WorldStatePanel } from '@/components/world-state/world-state-panel'
import { truncate } from '@/lib/utils'
import {
  ScrollText, Globe, Users, Shield, Target, BookOpen, Sword, TrendingUp, Map,
} from 'lucide-react'
import Link from 'next/link'

export default function CampaignDashboard() {
  const { id } = useParams<{ id: string }>()
  const campaign = useStore(s => s.campaigns[id])
  const worldState = useStore(s => s.getLatestWorldState(id))
  const recentEvents = useStore(useShallow(s => s.getEventsByCampaign(id).slice(0, 5)))
  const sessions = useStore(useShallow(s => s.getSessionsByCampaign(id).slice(0, 3)))
  const factionCount = useStore(useShallow(s => s.getFactionsByCampaign(id))).length
  const npcCount = useStore(useShallow(s => s.getNPCsByCampaign(id))).length

  if (!campaign) return null

  const quickLinks = [
    { href: `/campaign/${id}/timeline`, icon: ScrollText, label: 'Timeline', count: recentEvents.length },
    { href: `/campaign/${id}/sessions`, icon: BookOpen, label: 'Sessioni', count: sessions.length },
    { href: `/campaign/${id}/npcs`, icon: Users, label: 'NPC', count: npcCount },
    { href: `/campaign/${id}/factions`, icon: Shield, label: 'Fazioni', count: factionCount },
    { href: `/campaign/${id}/maps`, icon: Map, label: 'Mappe', count: undefined },
    { href: `/campaign/${id}/objectives`, icon: Target, label: 'Obiettivi', count: undefined },
  ]

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute -top-4 -left-4 w-48 h-48 bg-[hsl(var(--arcane)/0.04)] rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[hsl(var(--gold)/0.1)] border border-[hsl(var(--gold)/0.3)] flex items-center justify-center shrink-0">
            <Sword className="w-5 h-5 text-[hsl(var(--gold))]" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-display font-semibold">{campaign.title}</h1>
              <Badge variant={campaign.status === 'active' ? 'emerald' : 'ghost'}>
                {campaign.status}
              </Badge>
            </div>
            {campaign.description && (
              <p className="text-muted-foreground text-sm max-w-2xl">{campaign.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Objective progress */}
      {campaign.final_objective && (
        <div className="card-fantasy border border-[hsl(var(--gold)/0.15)] p-5 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[hsl(var(--gold))]" />
              <span className="text-sm font-medium font-display">Obiettivo Finale</span>
            </div>
            <span className="text-lg font-display font-semibold text-[hsl(var(--gold))]">
              {worldState?.objective_progress ?? 0}%
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{truncate(campaign.final_objective, 120)}</p>
          <Progress
            value={worldState?.objective_progress ?? 0}
            indicatorClassName="bg-gradient-to-r from-[hsl(var(--gold-dim))] to-[hsl(var(--gold))]"
          />
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* World State */}
        <div className="col-span-12 lg:col-span-7">
          {worldState ? (
            <WorldStatePanel worldState={worldState} campaignId={id} />
          ) : (
            <div className="card-fantasy border border-border rounded-xl p-6 text-center">
              <Globe className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">World state non inizializzato</p>
            </div>
          )}
        </div>

        {/* Quick stats + recent */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          {/* Quick nav grid */}
          <div className="grid grid-cols-3 gap-2">
            {quickLinks.map(({ href, icon: Icon, label, count }) => (
              <Link
                key={href}
                href={href}
                className="card-fantasy border border-border rounded-lg p-3 text-center hover:border-[hsl(var(--gold)/0.3)] transition-all group"
              >
                <Icon className="w-4 h-4 mx-auto mb-1 text-muted-foreground group-hover:text-[hsl(var(--gold))] transition-colors" />
                <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{label}</p>
                {count !== undefined && (
                  <p className="text-sm font-semibold text-foreground mt-0.5">{count}</p>
                )}
              </Link>
            ))}
          </div>

          {/* Recent events */}
          <div className="card-fantasy border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[hsl(var(--gold))]" />
                Eventi Recenti
              </h3>
              <Link href={`/campaign/${id}/timeline`} className="text-xs text-[hsl(var(--gold)/0.7)] hover:text-[hsl(var(--gold))] transition-colors">
                Vedi tutti →
              </Link>
            </div>

            {recentEvents.length > 0 ? (
              <div className="space-y-2">
                {recentEvents.map(event => (
                  <div key={event.id} className="flex items-start gap-2 py-1.5 border-b border-border/50 last:border-0">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                      event.importance === 'catastrophic' ? 'bg-red-400' :
                      event.importance === 'critical' ? 'bg-orange-400' :
                      event.importance === 'major' ? 'bg-[hsl(var(--gold))]' : 'bg-muted-foreground'
                    }`} />
                    <div>
                      <p className="text-xs font-medium text-foreground">{event.title}</p>
                      <p className="text-[10px] text-muted-foreground">{event.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-2">Nessun evento ancora</p>
            )}
          </div>

          {/* Recent sessions */}
          {sessions.length > 0 && (
            <div className="card-fantasy border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[hsl(var(--gold))]" />
                  Ultime Sessioni
                </h3>
                <Link href={`/campaign/${id}/sessions`} className="text-xs text-[hsl(var(--gold)/0.7)] hover:text-[hsl(var(--gold))] transition-colors">
                  Vedi tutte →
                </Link>
              </div>
              <div className="space-y-1.5">
                {sessions.map(s => (
                  <div key={s.id} className="flex items-center justify-between py-1 text-xs">
                    <span className="text-foreground">
                      Sessione {s.session_number}{s.title ? ` — ${s.title}` : ''}
                    </span>
                    <Badge variant={s.status === 'processed' ? 'emerald' : 'ghost'} className="text-[10px]">
                      {s.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
