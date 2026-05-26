export type NarrativeTone = 'epic' | 'dark' | 'mystery' | 'horror' | 'political' | 'adventure'
export type EventStatus = 'past' | 'present' | 'future' | 'inevitable' | 'conditional' | 'averted'
export type EventImportance = 'minor' | 'major' | 'critical' | 'catastrophic'
export type FactionStatus = 'active' | 'weakened' | 'destroyed' | 'hidden' | 'dormant'
export type NPCRole = 'villain' | 'ally' | 'neutral' | 'minor' | 'major' | 'mentor' | 'unknown'
export type NPCStatus = 'alive' | 'dead' | 'missing' | 'imprisoned' | 'transformed' | 'unknown'

export interface Campaign {
  id: string
  title: string
  description: string | null
  lore: string | null
  final_objective: string | null
  narrative_tone: NarrativeTone
  game_system: string
  estimated_sessions: number | null
  status: 'active' | 'paused' | 'completed' | 'archived'
  cover_image_url: string | null
  created_at: string
  updated_at: string
}

export interface TimelineEvent {
  id: string
  campaign_id: string
  title: string
  description: string | null
  event_type: string
  importance: EventImportance
  status: EventStatus
  trigger_condition: string | null
  event_date: string | null
  session_number: number | null
  ai_analysis: string | null
  created_at: string
  updated_at: string
}

export interface SessionLog {
  id: string
  campaign_id: string
  session_number: number
  title: string | null
  raw_notes: string
  ai_summary: string | null
  ai_consequences: string | null
  key_events: Array<unknown>
  session_date: string | null
  duration_hours: number | null
  status: 'draft' | 'processed' | 'archived'
  created_at: string
  updated_at: string
}

export interface WorldState {
  id: string
  campaign_id: string
  session_number: number
  war_level: number
  corruption_level: number
  political_stability: number
  narrative_tension: number
  villain_progress: number
  hero_reputation: number
  objective_progress: number
  active_threats: Array<unknown>
  active_conflicts: Array<unknown>
  custom_metrics: Record<string, unknown>
  world_summary: string | null
  created_at: string
}

export interface Faction {
  id: string
  campaign_id: string
  name: string
  description: string | null
  faction_type: string
  alignment: string | null
  motivation: string | null
  influence_level: number
  military_strength: number
  status: FactionStatus
  leader_npc_id: string | null
  color: string | null
  secrets: string | null
  ai_analysis: string | null
  created_at: string
  updated_at: string
}

export interface FactionRelationship {
  id: string
  campaign_id: string
  faction_a_id: string
  faction_b_id: string
  relationship_type: string
  description: string | null
  updated_at: string
}

export interface NPC {
  id: string
  campaign_id: string
  name: string
  title: string | null
  description: string | null
  role: NPCRole
  faction_id: string | null
  current_location_id: string | null
  status: NPCStatus
  alignment: string | null
  motivation: string | null
  secrets: string | null
  is_player_known: boolean
  ai_notes: string | null
  created_at: string
  updated_at: string
}

export interface Objective {
  id: string
  campaign_id: string
  title: string
  description: string | null
  objective_type: string
  status: 'active' | 'completed' | 'failed' | 'abandoned' | 'hidden'
  progress_percent: number
  rewards: string | null
  consequences_if_failed: string | null
  created_at: string
  updated_at: string
}

export interface MapRecord {
  id: string
  campaign_id: string
  title: string
  description: string | null
  map_type: string
  image_url: string
  is_primary: boolean
  created_at: string
}

export interface Location {
  id: string
  campaign_id: string
  map_id: string | null
  name: string
  description: string | null
  location_type: string
  pin_x: number | null
  pin_y: number | null
  status: string
  lore: string | null
  created_at: string
}
