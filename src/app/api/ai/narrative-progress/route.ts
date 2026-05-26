import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeProgress } from '@/lib/ai/narrative-engine'
import type { CampaignContext } from '@/lib/ai/prompts'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { campaignId } = await req.json()
    if (!campaignId) return NextResponse.json({ error: 'Missing campaignId' }, { status: 400 })

    const [
      { data: campaign },
      { data: worldStates },
      { data: recentEvents },
      { data: factions },
      { data: npcs },
      { data: sessions },
    ] = await Promise.all([
      supabase.from('campaigns').select('*').eq('id', campaignId).eq('owner_id', user.id).single(),
      supabase.from('world_states').select('*').eq('campaign_id', campaignId).order('session_number', { ascending: false }).limit(1),
      supabase.from('timeline_events').select('*').eq('campaign_id', campaignId).order('created_at', { ascending: false }).limit(10),
      supabase.from('factions').select('*').eq('campaign_id', campaignId),
      supabase.from('npcs').select('*').eq('campaign_id', campaignId).in('role', ['villain', 'major']),
      supabase.from('session_logs').select('id').eq('campaign_id', campaignId),
    ])

    if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })

    const ctx: CampaignContext = {
      campaign,
      worldState: worldStates?.[0] ?? null,
      recentEvents: recentEvents ?? [],
      activeFactions: factions ?? [],
      keyNPCs: npcs ?? [],
      sessionCount: sessions?.length ?? 0,
    }

    const progress = await analyzeProgress(ctx, sessions?.length ?? 0)

    return NextResponse.json({ progress })
  } catch (error) {
    console.error('AI narrative-progress error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    )
  }
}
