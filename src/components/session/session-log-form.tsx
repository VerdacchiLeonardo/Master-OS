'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Loader2, Sparkles, CheckCircle, AlertCircle, BookOpen } from 'lucide-react'
import type { Campaign, SessionLog, WorldState, SessionAnalysis } from '@/types'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'

interface SessionLogFormProps {
  campaign: Campaign
  sessionNumber: number
  currentWorldState: WorldState | null
  onSaved: (session: SessionLog) => void
  onCancel: () => void
}

export function SessionLogForm({
  campaign,
  sessionNumber,
  currentWorldState,
  onSaved,
  onCancel,
}: SessionLogFormProps) {
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [analysis, setAnalysis] = useState<SessionAnalysis | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'write' | 'review'>('write')

  async function handleAnalyze() {
    if (!notes.trim()) return
    setAnalyzing(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/analyze-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign.id,
          sessionNotes: notes,
          sessionNumber,
        }),
      })

      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setAnalysis(data.analysis)
      setStep('review')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore durante l\'analisi')
    }
    setAnalyzing(false)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign.id,
          sessionNumber,
          title: title || null,
          rawNotes: notes,
          analysis,
          currentWorldState,
        }),
      })

      if (!res.ok) throw new Error(await res.text())
      const { session } = await res.json()
      onSaved(session)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore durante il salvataggio')
    }
    setSaving(false)
  }

  return (
    <div className="card-fantasy border border-[hsl(var(--gold)/0.2)] rounded-xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[hsl(var(--gold))]" />
          <h3 className="font-display font-medium">Sessione {sessionNumber}</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={cn('w-2 h-2 rounded-full', step === 'write' ? 'bg-[hsl(var(--gold))]' : 'bg-muted')} />
          <div className={cn('w-2 h-2 rounded-full', step === 'review' ? 'bg-[hsl(var(--gold))]' : 'bg-muted')} />
        </div>
      </div>

      {step === 'write' ? (
        <>
          <div>
            <label className="block text-xs font-medium text-foreground/80 mb-1.5">
              Titolo <span className="text-muted-foreground font-normal">(opzionale)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Il tradimento di Kael..."
              className="input-fantasy w-full"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-foreground/80">
                Note di Sessione *
              </label>
              <span className="text-xs text-muted-foreground">{notes.length} caratteri</span>
            </div>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={`Descrivi cosa è successo in questa sessione...

Esempio:
- I giocatori hanno scoperto che il generale era un traditore
- Combattimento nella Torre del Mago, sconfitto il golem guardiano
- Kael ha tradito il gruppo e si è alleato con la Fratellanza del Buio
- Trovata la prima pagina del Codice Eterno nel laboratorio segreto
- Liorah è quasi morta, ora è in debito con la strega della palude`}
              className="h-48 font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Scrivi liberamente — l'AI capirà e strutturerà tutto
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-md px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              onClick={handleAnalyze}
              disabled={!notes.trim() || analyzing}
              className="gap-1.5"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  L'AI sta analizzando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analizza con AI
                </>
              )}
            </Button>
            <Button variant="ghost" onClick={onCancel}>Annulla</Button>
          </div>
        </>
      ) : (
        <>
          {analysis && (
            <AIAnalysisView analysis={analysis} />
          )}

          {error && (
            <div className="flex items-start gap-2 text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-md px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={saving} className="gap-1.5">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Salva Sessione
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setStep('write')}>Modifica Note</Button>
            <Button variant="ghost" onClick={onCancel}>Annulla</Button>
          </div>
        </>
      )}
    </div>
  )
}

function AIAnalysisView({ analysis }: { analysis: SessionAnalysis }) {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-[hsl(var(--arcane)/0.08)] border border-[hsl(var(--arcane)/0.2)] rounded-lg p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs font-medium text-purple-300">Sommario AI</span>
        </div>
        <p className="text-sm text-foreground/90">{analysis.summary}</p>
      </div>

      {/* Key events */}
      {analysis.key_events?.length > 0 && (
        <div>
          <p className="text-xs font-medium text-foreground/80 mb-2">Eventi Chiave Identificati</p>
          <div className="space-y-2">
            {analysis.key_events.map((event, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <Badge
                  variant={
                    event.importance === 'catastrophic' ? 'destructive' :
                    event.importance === 'critical' ? 'crimson' :
                    event.importance === 'major' ? 'default' : 'ghost'
                  }
                  className="text-[10px] shrink-0 mt-0.5"
                >
                  {event.importance}
                </Badge>
                <div>
                  <span className="font-medium text-foreground">{event.title}</span>
                  {event.description && (
                    <span className="text-muted-foreground"> — {event.description}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* World state delta */}
      {analysis.world_state_updates && (
        <div>
          <p className="text-xs font-medium text-foreground/80 mb-2">Variazioni World State</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(analysis.world_state_updates)
              .filter(([k, v]) => k !== 'reasoning' && v !== null && v !== undefined)
              .map(([key, delta]) => (
                <div key={key} className="flex items-center justify-between text-xs bg-muted/50 rounded px-2.5 py-1.5">
                  <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className={cn(
                    'font-mono font-medium',
                    (delta as number) > 0 ? 'text-red-400' : 'text-emerald-400'
                  )}>
                    {(delta as number) > 0 ? '+' : ''}{delta as number}
                  </span>
                </div>
              ))}
          </div>
          {analysis.world_state_updates.reasoning && (
            <p className="text-xs text-muted-foreground mt-2">{analysis.world_state_updates.reasoning}</p>
          )}
        </div>
      )}

      {/* Consequences */}
      {analysis.consequences && (
        <div className="bg-muted/30 rounded-lg p-3">
          <p className="text-xs font-medium text-foreground/80 mb-1">Conseguenze Narrative</p>
          <p className="text-xs text-muted-foreground">{analysis.consequences}</p>
        </div>
      )}

      {/* DM Advice */}
      {analysis.dm_advice && (
        <div className="bg-[hsl(var(--gold)/0.05)] border border-[hsl(var(--gold)/0.15)] rounded-lg p-3">
          <p className="text-xs font-medium text-[hsl(var(--gold))] mb-1">Consiglio per il DM</p>
          <p className="text-xs text-foreground/80">{analysis.dm_advice}</p>
        </div>
      )}
    </div>
  )
}
