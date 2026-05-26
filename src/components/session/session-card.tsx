'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { BookOpen, ChevronDown, ChevronUp, Sparkles, Loader2 } from 'lucide-react'
import type { SessionLog, Campaign } from '@/types'
import { useStore } from '@/lib/store'
import { getGeminiKey, geminiGenerate, buildSessionPrompt, parseSessionAIResponse } from '@/lib/gemini'

interface SessionCardProps {
  session: SessionLog
  campaign: Campaign
  onUpdated: (s: SessionLog) => void
}

export function SessionCard({ session: initial, campaign }: SessionCardProps) {
  const [session, setSession] = useState(initial)
  const [expanded, setExpanded] = useState(false)
  const [generating, setGenerating] = useState(false)
  const updateSessionLog = useStore(s => s.updateSessionLog)
  const keyEvents = (session.key_events as Array<{ title: string; importance: string }>) ?? []

  async function handleAI(e: React.MouseEvent) {
    e.stopPropagation()
    const key = getGeminiKey()
    if (!key) { alert('Configura prima la chiave API Gemini nella sidebar.'); return }
    setGenerating(true)
    try {
      const raw = await geminiGenerate(key, buildSessionPrompt(campaign, session))
      const { summary, consequences } = parseSessionAIResponse(raw)
      updateSessionLog(session.id, { ai_summary: summary, ai_consequences: consequences, status: 'processed' })
      setSession(s => ({ ...s, ai_summary: summary, ai_consequences: consequences, status: 'processed' }))
      setExpanded(true)
    } catch (err) {
      alert(`Errore AI: ${err instanceof Error ? err.message : 'Errore sconosciuto'}`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="card-fantasy border border-border rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/20 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                Sessione {session.session_number}
                {session.title && ` — ${session.title}`}
              </span>
              <Badge
                variant={session.status === 'processed' ? 'emerald' : session.status === 'draft' ? 'ghost' : 'secondary'}
                className="text-[10px]"
              >
                {session.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span>{formatDate(session.session_date ?? session.created_at)}</span>
              {keyEvents.length > 0 && (
                <>
                  <span>·</span>
                  <span>{keyEvents.length} eventi chiave</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {session.ai_summary && (
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          )}
          <button
            onClick={handleAI}
            disabled={generating}
            className="flex items-center gap-1 text-[10px] text-purple-400/70 hover:text-purple-300 transition-colors disabled:opacity-50 px-1.5 py-0.5 rounded border border-purple-500/20 hover:border-purple-500/40"
          >
            {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {generating ? '' : session.ai_summary ? 'Rigenera' : 'Elabora AI'}
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
          {session.ai_summary && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span className="text-xs font-medium text-purple-300">Sommario AI</span>
              </div>
              <p className="text-xs text-muted-foreground">{session.ai_summary}</p>
            </div>
          )}

          {keyEvents.length > 0 && (
            <div>
              <p className="text-xs font-medium text-foreground/80 mb-1.5">Eventi Chiave</p>
              <div className="space-y-1">
                {keyEvents.map((e, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      e.importance === 'catastrophic' ? 'bg-red-400' :
                      e.importance === 'critical' ? 'bg-orange-400' :
                      e.importance === 'major' ? 'bg-[hsl(var(--gold))]' : 'bg-muted-foreground'
                    }`} />
                    <span className="text-foreground/80">{e.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {session.ai_consequences && (
            <div className="bg-muted/20 rounded p-3">
              <p className="text-xs font-medium text-foreground/80 mb-1">Conseguenze</p>
              <p className="text-xs text-muted-foreground">{session.ai_consequences}</p>
            </div>
          )}

          <details>
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
              Note originali
            </summary>
            <div className="mt-2 bg-muted/30 rounded p-3">
              <p className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">{session.raw_notes}</p>
            </div>
          </details>
        </div>
      )}
    </div>
  )
}
