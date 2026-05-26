import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { clampInt } from '@/lib/utils'
import type { SessionAnalysis, WorldState } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json() as {
      campaignId: string
      sessionNumber: number
      title: string | null
      rawNotes: string
      analysis: SessionAnalysis | null
      currentWorldState: WorldState | null
    }
    const { campaignId, sessionNumber, title, rawNotes, analysis, currentWorldState } = body

    const { data: campaign } = await supabase
      .from('campaigns')
      .select('id, owner_id')
      .eq('id', campaignId)
      .eq('owner_id', user.id)
      .single()

    if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })

    const { data: session, error: sessionError } = await supabase
      .from('session_logs')
      .insert({
        campaign_id: campaignId,
        session_number: sessionNumber,
        title: title ?? null,
        raw_notes: rawNotes,
        ai_summary: analysis?.summary ?? null,
        ai_consequences: analysis?.consequences ?? null,
        ai_world_updates: (analysis?.world_state_updates as Record<string, unknown>) ?? {},
        key_events: (analysis?.key_events ?? []) as unknown[],
        status: analysis ? 'processed' : 'draft',
      })
      .select()
      .single()

    if (sessionError) throw sessionError

    if (analysis?.world_state_updates && currentWorldState) {
      const u = analysis.world_state_updates
      const b = currentWorldState

      await supabase.from('world_states').insert({
        campaign_id: campaignId,
        session_number: sessionNumber,
        war_level: clampInt((b.war_level ?? 0) + (u.war_level ?? 0), 0, 100),
        corruption_level: clampInt((b.corruption_level ?? 0) + (u.corruption_level ?? 0), 0, 100),
        political_stability: clampInt((b.political_stability ?? 100) + (u.political_stability ?? 0), 0, 100),
        narrative_tension: clampInt((b.narrative_tension ?? 0) + (u.narrative_tension ?? 0), 0, 100),
        villain_progress: clampInt((b.villain_progress ?? 0) + (u.villain_progress ?? 0), 0, 100),
        hero_reputation: clampInt((b.hero_reputation ?? 50) + (u.hero_reputation ?? 0), 0, 100),
        objective_progress: clampInt((b.objective_progress ?? 0) + (u.objective_progress ?? 0), 0, 100),
        active_threats: b.active_threats,
        active_conflicts: b.active_conflicts,
      })
    }

    if (analysis?.key_events?.length) {
      await supabase.from('timeline_events').insert(
        analysis.key_events.map(e => ({
          campaign_id: campaignId,
          title: e.title,
          description: e.description,
          event_type: e.type ?? 'player_action',
          importance: e.importance ?? 'major',
          status: 'past',
          session_number: sessionNumber,
        }))
      )
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error('POST /api/sessions error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const campaignId = req.nextUrl.searchParams.get('campaignId')
    if (!campaignId) return NextResponse.json({ error: 'Missing campaignId' }, { status: 400 })

    const { data: sessions } = await supabase
      .from('session_logs')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('session_number', { ascending: false })

    return NextResponse.json({ sessions: sessions ?? [] })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
