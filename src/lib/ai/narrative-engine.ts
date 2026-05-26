import { getAnthropicClient, AI_MODEL } from './client'
import {
  buildNarrativeSystemPrompt,
  buildSessionAnalysisPrompt,
  buildProgressAnalysisPrompt,
  buildTimelineUpdatePrompt,
  type CampaignContext,
} from './prompts'
import type { TimelineEvent } from '@/types'

export interface SessionAnalysisResult {
  summary: string
  key_events: Array<{
    title: string
    description: string
    importance: string
    type: string
  }>
  consequences: string
  world_state_updates: Record<string, number | string | null>
  faction_impacts: Array<{ faction_name: string; impact: string; severity: string }>
  npc_updates: Array<{ npc_name: string; what_changed: string }>
  narrative_hooks: string[]
  foreshadowing: string
  dm_advice: string
}

export async function analyzeSession(
  ctx: CampaignContext,
  sessionNotes: string
): Promise<SessionAnalysisResult> {
  const client = getAnthropicClient()

  const response = await client.messages.create({
    model: AI_MODEL,
    max_tokens: 2048,
    system: [
      {
        type: 'text',
        text: buildNarrativeSystemPrompt(ctx),
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: buildSessionAnalysisPrompt(sessionNotes),
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('AI returned invalid JSON')

  return JSON.parse(jsonMatch[0]) as SessionAnalysisResult
}

export async function analyzeProgress(ctx: CampaignContext, sessionCount: number) {
  const client = getAnthropicClient()

  const response = await client.messages.create({
    model: AI_MODEL,
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: buildNarrativeSystemPrompt(ctx),
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: buildProgressAnalysisPrompt(ctx, sessionCount),
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('AI returned invalid JSON')

  return JSON.parse(jsonMatch[0])
}

export async function suggestTimelineUpdates(
  ctx: CampaignContext,
  events: TimelineEvent[],
  sessionAnalysis: string
) {
  const client = getAnthropicClient()

  const response = await client.messages.create({
    model: AI_MODEL,
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: buildNarrativeSystemPrompt(ctx),
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: buildTimelineUpdatePrompt(events, sessionAnalysis),
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('AI returned invalid JSON')

  return JSON.parse(jsonMatch[0])
}

export async function* streamNarrativeChat(
  ctx: CampaignContext,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
) {
  const client = getAnthropicClient()

  const stream = await client.messages.create({
    model: AI_MODEL,
    max_tokens: 1024,
    stream: true,
    system: [
      {
        type: 'text',
        text: buildNarrativeSystemPrompt(ctx),
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages,
  })

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield event.delta.text
    }
  }
}
