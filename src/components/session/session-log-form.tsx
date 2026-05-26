'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, CheckCircle, AlertCircle, BookOpen } from 'lucide-react'
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
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (!notes.trim()) return
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
          analysis: null,
          currentWorldState: null,
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
        <Button onClick={handleSave} disabled={saving || !notes.trim()} className="gap-1.5">
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
        <Button variant="ghost" onClick={onCancel}>Annulla</Button>
      </div>
    </div>
  )
}
