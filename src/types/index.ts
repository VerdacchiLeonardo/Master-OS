import type { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Campaign = Database['public']['Tables']['campaigns']['Row']
export type TimelineEvent = Database['public']['Tables']['timeline_events']['Row']
export type SessionLog = Database['public']['Tables']['session_logs']['Row']
export type WorldState = Database['public']['Tables']['world_states']['Row']
export type MapRecord = Database['public']['Tables']['maps']['Row']
export type Location = Database['public']['Tables']['locations']['Row']
export type Faction = Database['public']['Tables']['factions']['Row']
export type NPC = Database['public']['Tables']['npcs']['Row']
export type Objective = Database['public']['Tables']['objectives']['Row']

export type NarrativeTone = 'epic' | 'dark' | 'mystery' | 'horror' | 'political' | 'adventure'
export type EventStatus = 'past' | 'present' | 'future' | 'inevitable' | 'conditional' | 'averted'
export type EventImportance = 'minor' | 'major' | 'critical' | 'catastrophic'
export type FactionStatus = 'active' | 'weakened' | 'destroyed' | 'hidden' | 'dormant'
export type NPCRole = 'villain' | 'ally' | 'neutral' | 'minor' | 'major' | 'mentor' | 'unknown'
export type NPCStatus = 'alive' | 'dead' | 'missing' | 'imprisoned' | 'transformed' | 'unknown'

export interface CampaignWithStats extends Campaign {
  session_count?: number
  latest_world_state?: WorldState | null
  event_count?: number
  npc_count?: number
}

export interface SessionAnalysis {
  summary: string
  key_events: Array<{
    title: string
    description: string
    importance: EventImportance
    type: string
  }>
  consequences: string
  world_state_updates: {
    war_level?: number | null
    corruption_level?: number | null
    political_stability?: number | null
    narrative_tension?: number | null
    villain_progress?: number | null
    hero_reputation?: number | null
    objective_progress?: number | null
    reasoning?: string
  }
  faction_impacts: Array<{
    faction_name: string
    impact: string
    severity: 'minor' | 'moderate' | 'major'
  }>
  npc_updates: Array<{
    npc_name: string
    what_changed: string
  }>
  narrative_hooks: string[]
  foreshadowing: string
  dm_advice: string
}

export interface ProgressAnalysis {
  completion_estimate_percent: number
  sessions_to_finale_estimate: number
  narrative_momentum: 'ascending' | 'plateau' | 'descending'
  critical_path_items: string[]
  biggest_threats: string[]
  incomplete_arcs: string[]
  turning_points_remaining: number
  analysis: string
  recommendation: string
}
