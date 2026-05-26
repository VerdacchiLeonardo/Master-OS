'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sword, Sparkles, AlertCircle } from 'lucide-react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const isConfigured = SUPABASE_URL.startsWith('https://') && !SUPABASE_URL.includes('placeholder')

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setDebugInfo(null)

    try {
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/auth/callback`
      setDebugInfo(`URL: ${SUPABASE_URL.slice(0, 40)}\nRedirect: ${redirectTo}`)

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      })

      if (error) {
        setDebugInfo(prev => `${prev ?? ''}\n---\nCodice: ${error.status ?? 'n/a'} | Status: ${error.name}\nMessaggio: ${error.message}`)
        setError(error.message)
      } else {
        setSent(true)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setDebugInfo(`Eccezione JS: ${message}`)
      setError(`Errore di rete: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[hsl(var(--arcane)/0.06)] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[hsl(var(--gold)/0.04)] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[hsl(var(--crimson)/0.03)] rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[hsl(var(--gold)/0.1)] border border-[hsl(var(--gold)/0.3)] mb-4 glow-gold">
            <Sword className="w-7 h-7 text-[hsl(var(--gold))]" />
          </div>
          <h1 className="text-3xl font-display font-semibold text-gold-gradient mb-1">
            Paradox Engine
          </h1>
          <p className="text-muted-foreground text-sm">
            Narrative Intelligence System
          </p>
        </div>

        {/* Card */}
        <div className="card-fantasy border border-[hsl(var(--gold)/0.2)] p-8 rounded-xl glow-gold">
          {!sent ? (
            <>
              <h2 className="text-lg font-display font-medium text-foreground mb-1">
                Accedi al Grimorio
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                Inserisci la tua email per ricevere il link di accesso
              </p>

              {!isConfigured && (
                <div className="flex items-start gap-2 text-amber-400 text-xs bg-amber-400/10 border border-amber-400/20 rounded-md px-3 py-2 mb-4">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Configurazione Supabase mancante. Imposta le variabili d&apos;ambiente su Vercel e rideploya.</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="il.tuo@dominio.com"
                    required
                    className="input-fantasy w-full"
                  />
                </div>

                {debugInfo && (
                  <div className="text-xs font-mono text-muted-foreground bg-black/40 border border-white/10 rounded-md px-3 py-2 whitespace-pre-wrap break-all">
                    {debugInfo}
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-md px-3 py-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full h-10 bg-[hsl(var(--gold))] text-background font-medium rounded-md text-sm
                    hover:bg-[hsl(var(--gold)/0.9)] transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                    focus:outline-none focus:ring-2 focus:ring-[hsl(var(--gold)/0.5)]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                      Invio in corso...
                    </span>
                  ) : (
                    'Invia Link Magico'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[hsl(var(--gold)/0.1)] border border-[hsl(var(--gold)/0.3)] mb-4">
                <Sparkles className="w-5 h-5 text-[hsl(var(--gold))] animate-glow-pulse" />
              </div>
              <h3 className="font-display text-lg font-medium text-foreground mb-2">
                Controlla la tua Email
              </h3>
              <p className="text-muted-foreground text-sm">
                Un link magico è stato inviato a{' '}
                <span className="text-[hsl(var(--gold))]">{email}</span>
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Paradox Engine — D&D Narrative Intelligence
        </p>
      </div>
    </div>
  )
}
