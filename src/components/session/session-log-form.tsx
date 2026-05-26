'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, AlertCircle, BookOpen } from 'lucide-react'
import { useStore } from '@/lib/store'
import type { Campaign, SessionLog, WorldState } from '@/types'

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
  onSaved,
  onCancel,
}: SessionLogFormProps) {
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const createSessionLog = useStore(s => s.createSessionLog)

  function handleSave() {
    if (!notes.trim()) return
    setError(null)

    const session = createSessionLog({
      campaign_id: campaign.id,
      session_number: sessionNumber,
      title: title || null,
      raw_notes: notes,
      ai_summary: null,
      ai_consequences: null,
      key_events: [],
      session_date: null,
      duration_hours: null,
      status: 'draft',
    })

    onSaved(session)
  }

  return (
    <div className="card-fantasy border border-[hsl(var(--gold)/0.2)] rounded-xl p-6 space-y-5">
      <div className="flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-[hsl(var(--gold))]" />
        <h3 className="font-display font-medium">Sessione {sessionNumber}</h3>
      </div>

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
- Combattimento nella Torre del Mago
- Kael si è alleato con la Fratellanza del Buio
- Trovata la prima pagina del Codice Eterno`}
          className="h-48 font-mono text-xs"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-md px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button onClick={handleSave} disabled={!notes.trim()} className="gap-1.5">
          <CheckCircle className="w-4 h-4" />
          Salva Sessione
        </Button>
        <Button variant="ghost" onClick={onCancel}>Annulla</Button>
      </div>
    </div>
  )
}
