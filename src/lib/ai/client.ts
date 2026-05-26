import Anthropic from '@anthropic-ai/sdk'

let client: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return client
}

export const AI_MODEL = 'claude-sonnet-4-6'
export const AI_MODEL_FAST = 'claude-haiku-4-5-20251001'
