import type { Campaign, WorldState, TimelineEvent, Faction, NPC } from '@/types'

export interface CampaignContext {
  campaign: Campaign
  worldState?: WorldState | null
  recentEvents?: TimelineEvent[]
  activeFactions?: Faction[]
  keyNPCs?: NPC[]
  sessionCount?: number
}

export function buildNarrativeSystemPrompt(ctx: CampaignContext): string {
  const { campaign, worldState, recentEvents, activeFactions, keyNPCs, sessionCount } = ctx

  return `You are the Narrative Intelligence Engine for the campaign "${campaign.title}".

## YOUR ROLE
You are an expert narrative analyst with deep knowledge of D&D storytelling, character arcs, and world-building. You reason like a seasoned Dungeon Master who understands the weight of every story decision.

## CAMPAIGN OVERVIEW
**Title:** ${campaign.title}
**System:** ${campaign.game_system ?? 'D&D 5e'}
**Tone:** ${campaign.narrative_tone ?? 'epic'}
**Sessions Played:** ${sessionCount ?? 0}

**Lore & Setting:**
${campaign.lore ?? 'No lore defined yet.'}

**Final Objective:**
${campaign.final_objective ?? 'Not defined yet.'}

## CURRENT WORLD STATE
${
  worldState
    ? `- War Level: ${worldState.war_level}/100
- Corruption: ${worldState.corruption_level}/100
- Political Stability: ${worldState.political_stability}/100
- Narrative Tension: ${worldState.narrative_tension}/100
- Villain Progress: ${worldState.villain_progress}/100
- Hero Reputation: ${worldState.hero_reputation}/100
- Objective Progress: ${worldState.objective_progress}/100`
    : 'World state not yet established.'
}

## ACTIVE FACTIONS
${
  activeFactions?.length
    ? activeFactions
        .map(f => `- **${f.name}** (${f.faction_type}): Influence ${f.influence_level}/100, Status: ${f.status}`)
        .join('\n')
    : 'No factions defined.'
}

## KEY NPCs
${
  keyNPCs?.length
    ? keyNPCs
        .map(n => `- **${n.name}** (${n.role}): ${n.status}`)
        .join('\n')
    : 'No key NPCs defined.'
}

## RECENT TIMELINE EVENTS
${
  recentEvents?.length
    ? recentEvents
        .slice(-5)
        .map(e => `- [${e.status.toUpperCase()}] ${e.title}: ${e.description ?? ''}`)
        .join('\n')
    : 'No recent events.'
}

## INSTRUCTIONS
- Always respond in the same language as the user's input
- Be concise but deeply insightful
- Think in terms of narrative consequences, not just game mechanics
- Consider faction dynamics, NPC motivations, and long-term story arcs
- Identify foreshadowing opportunities and narrative hooks
- Be the DM's most trusted advisor`
}

export function buildSessionAnalysisPrompt(sessionNotes: string): string {
  return `Analyze this session report from a Dungeon Master. Extract and return a structured JSON analysis.

SESSION NOTES:
${sessionNotes}

Return ONLY valid JSON with this exact structure:
{
  "summary": "2-3 sentence narrative summary of the session",
  "key_events": [
    {
      "title": "Event title",
      "description": "What happened",
      "importance": "minor|major|critical|catastrophic",
      "type": "story|combat|political|prophecy|ritual|war|death|discovery|betrayal|alliance|threat|player_action"
    }
  ],
  "consequences": "Narrative analysis of consequences and ripple effects",
  "world_state_updates": {
    "war_level": <delta -20 to +20 or null if unchanged>,
    "corruption_level": <delta or null>,
    "political_stability": <delta or null>,
    "narrative_tension": <delta or null>,
    "villain_progress": <delta or null>,
    "hero_reputation": <delta or null>,
    "objective_progress": <delta or null>,
    "reasoning": "Why these values changed"
  },
  "faction_impacts": [
    {
      "faction_name": "Name",
      "impact": "What changed for this faction",
      "severity": "minor|moderate|major"
    }
  ],
  "npc_updates": [
    {
      "npc_name": "Name",
      "what_changed": "Status, motivation, or relationship change"
    }
  ],
  "narrative_hooks": ["Hook 1", "Hook 2"],
  "foreshadowing": "Any elements that could be seeds for future story beats",
  "dm_advice": "Strategic advice for the DM going forward"
}`
}

export function buildProgressAnalysisPrompt(
  ctx: CampaignContext,
  sessionCount: number
): string {
  return `As a narrative analyst, evaluate the campaign's progress toward its final objective.

Consider:
1. Current world state metrics
2. Active threats and conflicts
3. Faction power dynamics
4. Story arc completion
5. Villain vs. hero momentum

Return ONLY valid JSON:
{
  "completion_estimate_percent": <0-100>,
  "sessions_to_finale_estimate": <number>,
  "narrative_momentum": "ascending|plateau|descending",
  "critical_path_items": ["Item 1", "Item 2"],
  "biggest_threats": ["Threat 1", "Threat 2"],
  "incomplete_arcs": ["Arc 1", "Arc 2"],
  "turning_points_remaining": <number>,
  "analysis": "3-4 sentence narrative analysis",
  "recommendation": "What the DM should focus on next"
}`
}

export function buildTimelineUpdatePrompt(
  events: TimelineEvent[],
  sessionAnalysis: string
): string {
  return `Based on this session analysis, determine which timeline events should be updated and what new events should be created.

EXISTING EVENTS:
${events.map(e => `- [${e.id}] ${e.title} (${e.status})`).join('\n')}

SESSION ANALYSIS:
${sessionAnalysis}

Return ONLY valid JSON:
{
  "events_to_update": [
    {
      "id": "existing-event-uuid",
      "new_status": "past|present|future|inevitable|conditional|averted",
      "reason": "Why this status changed"
    }
  ],
  "events_to_create": [
    {
      "title": "New event title",
      "description": "What this event entails",
      "event_type": "story|combat|political|prophecy|ritual|war|death|discovery|betrayal|alliance|threat|player_action",
      "importance": "minor|major|critical|catastrophic",
      "status": "past|future|inevitable|conditional"
    }
  ]
}`
}
