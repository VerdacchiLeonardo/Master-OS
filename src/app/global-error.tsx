'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="it" className="dark">
      <body style={{ background: '#0f0f14', color: '#fff', fontFamily: 'monospace', padding: '2rem' }}>
        <h2 style={{ color: '#f87171', marginBottom: '1rem' }}>Errore client</h2>
        <pre style={{ background: '#1a1a2e', padding: '1rem', borderRadius: '8px', overflow: 'auto', fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
          {error?.message || 'Errore sconosciuto'}
          {'\n\n'}
          {error?.stack}
        </pre>
        <button
          onClick={reset}
          style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          Riprova
        </button>
      </body>
    </html>
  )
}
