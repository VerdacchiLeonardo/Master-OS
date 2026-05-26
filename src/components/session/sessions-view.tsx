'use client'

import { useState } from 'react'
import { SessionLogForm } from './session-log-form'
import { SessionCard } from './session-card'
import { Button } from '@/components/ui/button'
import { Plus, BookOpen } from 'lucide-react'
import type { SessionLog, Campaign, WorldState } from '@/types'

interface SessionsViewProps {
  sessions: SessionLog[]
  campaign: Campaign
  currentWorldState: WorldState | null
}

export function SessionsView({ sessions: initial, campaign, currentWorldState }: SessionsViewProps) {
  const [sessions, setSessions] = useState<SessionLog[]>(initial)
  const [showForm, setShowForm] = useState(false)

  const nextSessionNumber = (sessions[0]?.session_number ?? 0) + 1

  function onSessionSaved(session: SessionLog) {
    setSessions(prev => [session, ...prev.filter(s => s.id !== session.id)])
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      {/* New session button */}
      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="gap-1.5">
          <Plus className="w-4 h-4" />
          Nuova Sessione {nextSessionNumber}
        </Button>
      )}

      {/* Session form */}
      {showForm && (
        <SessionLogForm
          campaign={campaign}
          sessionNumber={nextSessionNumber}
          currentWorldState={currentWorldState}
          onSaved={onSessionSaved}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Session list */}
      {sessions.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <BookOpen className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">Nessuna sessione registrata</p>
          <p className="text-muted-foreground text-xs mt-1">
            Inizia a documentare le tue sessioni per attivare l'analisi AI
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map(session => (
            <SessionCard
              key={session.id}
              session={session}
              campaign={campaign}
              onUpdated={onSessionSaved}
            />
          ))}
        </div>
      )}
    </div>
  )
}
