const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

const GEMINI_KEY = 'paradox-engine-gemini-key'

export function getGeminiKey(): string {
  if (typeof localStorage === 'undefined') return ''
  return localStorage.getItem(GEMINI_KEY) ?? ''
}

export function saveGeminiKey(key: string) {
  if (typeof localStorage === 'undefined') return
  if (key.trim()) localStorage.setItem(GEMINI_KEY, key.trim())
  else localStorage.removeItem(GEMINI_KEY)
}

export async function geminiGenerate(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 600, temperature: 0.75 },
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `Errore Gemini: ${res.status}`)
  }
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
}

export function buildNPCPrompt(campaign: { title: string; description?: string | null }, npc: {
  name: string; title?: string | null; role: string; alignment?: string | null
  motivation?: string | null; secrets?: string | null; description?: string | null; status: string
}, factionName?: string): string {
  return `Sei il master di una campagna di gioco di ruolo. Scrivi note utili per il master su questo NPC.

Campagna: ${campaign.title}${campaign.description ? ` — ${campaign.description}` : ''}
NPC: ${npc.name}${npc.title ? ` (${npc.title})` : ''}
Ruolo: ${npc.role} | Status: ${npc.status}${npc.alignment ? ` | Allineamento: ${npc.alignment}` : ''}${factionName ? ` | Fazione: ${factionName}` : ''}
${npc.motivation ? `Motivazione: ${npc.motivation}` : ''}
${npc.secrets ? `Segreti: ${npc.secrets}` : ''}
${npc.description ? `Descrizione: ${npc.description}` : ''}

Suggerisci come usare questo NPC in sessione, possibili sviluppi narrativi e come potrebbe sorprendere i giocatori. Massimo 3 paragrafi brevi. Rispondi in italiano.`
}

export function buildFactionPrompt(campaign: { title: string; description?: string | null }, faction: {
  name: string; faction_type: string; alignment?: string | null; status: string
  influence_level: number; military_strength: number; motivation?: string | null; secrets?: string | null
}): string {
  return `Sei il master di una campagna di gioco di ruolo. Analizza questa fazione.

Campagna: ${campaign.title}${campaign.description ? ` — ${campaign.description}` : ''}
Fazione: ${faction.name} (${faction.faction_type})
Allineamento: ${faction.alignment ?? 'N/D'} | Status: ${faction.status}
Influenza: ${faction.influence_level}/100 | Forza militare: ${faction.military_strength}/100
${faction.motivation ? `Motivazione: ${faction.motivation}` : ''}
${faction.secrets ? `Segreti: ${faction.secrets}` : ''}

Analizza le dinamiche interne, potenziali tradimenti, come potrebbe evolvere nella campagna e le minacce che rappresenta. Massimo 3 paragrafi brevi. Rispondi in italiano.`
}

export function buildTimelineEventPrompt(campaign: { title: string }, event: {
  title: string; event_type: string; importance: string; status: string
  description?: string | null; event_date?: string | null; trigger_condition?: string | null
}): string {
  return `Sei il master di una campagna di gioco di ruolo. Analizza questo evento.

Campagna: ${campaign.title}
Evento: ${event.title} (${event.event_type}, importanza: ${event.importance}, status: ${event.status})
${event.event_date ? `Data/Periodo: ${event.event_date}` : ''}
${event.description ? `Descrizione: ${event.description}` : ''}
${event.trigger_condition ? `Condizione trigger: ${event.trigger_condition}` : ''}

Analizza le conseguenze narrative: chi è coinvolto, come cambia il mondo di gioco, cosa potrebbe succedere dopo. Massimo 2 paragrafi brevi. Rispondi in italiano.`
}

export function buildSessionPrompt(campaign: { title: string }, session: {
  session_number: number; title?: string | null; raw_notes: string; session_date?: string | null
}): string {
  return `Sei il master di una campagna di gioco di ruolo. Elabora il log di questa sessione.

Campagna: ${campaign.title}
Sessione ${session.session_number}${session.title ? `: ${session.title}` : ''}
${session.session_date ? `Data: ${session.session_date}` : ''}

Note grezze:
${session.raw_notes}

Rispondi con ESATTAMENTE questo formato:
SOMMARIO: (2-3 frasi narrative che riassumono la sessione)
CONSEGUENZE: (3-4 conseguenze per il mondo di gioco, una per riga, inizia ogni riga con "- ")

Rispondi in italiano.`
}

export function parseSessionAIResponse(text: string): { summary: string; consequences: string } {
  const summaryMatch = text.match(/SOMMARIO:\s*([\s\S]*?)(?=CONSEGUENZE:|$)/i)
  const consequencesMatch = text.match(/CONSEGUENZE:\s*([\s\S]*?)$/i)
  return {
    summary: summaryMatch?.[1]?.trim() ?? text,
    consequences: consequencesMatch?.[1]?.trim() ?? '',
  }
}
