export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

type EmptyRecord = { [_ in never]: never }

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          display_name?: string | null
          avatar_url?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          id: string
          owner_id: string
          title: string
          description: string | null
          lore: string | null
          final_objective: string | null
          narrative_tone: string | null
          game_system: string | null
          estimated_sessions: number | null
          status: string
          cover_image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          description?: string | null
          lore?: string | null
          final_objective?: string | null
          narrative_tone?: string | null
          game_system?: string | null
          estimated_sessions?: number | null
          status?: string
          cover_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          description?: string | null
          lore?: string | null
          final_objective?: string | null
          narrative_tone?: string | null
          game_system?: string | null
          estimated_sessions?: number | null
          status?: string
          cover_image_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      timeline_events: {
        Row: {
          id: string
          campaign_id: string
          title: string
          description: string | null
          event_type: string
          importance: string
          status: string
          trigger_condition: string | null
          event_date: string | null
          session_number: number | null
          linked_npc_ids: string[] | null
          linked_location_ids: string[] | null
          linked_faction_ids: string[] | null
          linked_event_ids: string[] | null
          ai_analysis: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          title: string
          description?: string | null
          event_type?: string
          importance?: string
          status?: string
          trigger_condition?: string | null
          event_date?: string | null
          session_number?: number | null
          linked_npc_ids?: string[] | null
          linked_location_ids?: string[] | null
          linked_faction_ids?: string[] | null
          linked_event_ids?: string[] | null
          ai_analysis?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          event_type?: string
          importance?: string
          status?: string
          trigger_condition?: string | null
          event_date?: string | null
          session_number?: number | null
          linked_npc_ids?: string[] | null
          linked_location_ids?: string[] | null
          linked_faction_ids?: string[] | null
          linked_event_ids?: string[] | null
          ai_analysis?: string | null
          metadata?: Json
        }
        Relationships: []
      }
      session_logs: {
        Row: {
          id: string
          campaign_id: string
          session_number: number
          title: string | null
          raw_notes: string
          ai_summary: string | null
          ai_consequences: string | null
          ai_world_updates: Json
          ai_timeline_updates: Json
          key_events: Json
          players_present: string[] | null
          session_date: string | null
          duration_hours: number | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          session_number: number
          title?: string | null
          raw_notes: string
          ai_summary?: string | null
          ai_consequences?: string | null
          ai_world_updates?: Json
          ai_timeline_updates?: Json
          key_events?: Json
          players_present?: string[] | null
          session_date?: string | null
          duration_hours?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string | null
          raw_notes?: string
          ai_summary?: string | null
          ai_consequences?: string | null
          ai_world_updates?: Json
          ai_timeline_updates?: Json
          key_events?: Json
          players_present?: string[] | null
          session_date?: string | null
          duration_hours?: number | null
          status?: string
        }
        Relationships: []
      }
      world_states: {
        Row: {
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
          active_threats: Json
          active_conflicts: Json
          custom_metrics: Json
          world_summary: string | null
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          session_number?: number
          war_level?: number
          corruption_level?: number
          political_stability?: number
          narrative_tension?: number
          villain_progress?: number
          hero_reputation?: number
          objective_progress?: number
          active_threats?: Json
          active_conflicts?: Json
          custom_metrics?: Json
          world_summary?: string | null
          created_at?: string
        }
        Update: {
          session_number?: number
          war_level?: number
          corruption_level?: number
          political_stability?: number
          narrative_tension?: number
          villain_progress?: number
          hero_reputation?: number
          objective_progress?: number
          active_threats?: Json
          active_conflicts?: Json
          custom_metrics?: Json
          world_summary?: string | null
        }
        Relationships: []
      }
      maps: {
        Row: {
          id: string
          campaign_id: string
          title: string
          description: string | null
          map_type: string
          image_url: string
          image_width: number | null
          image_height: number | null
          is_primary: boolean
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          title: string
          description?: string | null
          map_type?: string
          image_url: string
          image_width?: number | null
          image_height?: number | null
          is_primary?: boolean
          metadata?: Json
          created_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          map_type?: string
          image_url?: string
          image_width?: number | null
          image_height?: number | null
          is_primary?: boolean
          metadata?: Json
        }
        Relationships: []
      }
      locations: {
        Row: {
          id: string
          campaign_id: string
          map_id: string | null
          name: string
          description: string | null
          location_type: string
          pin_x: number | null
          pin_y: number | null
          status: string
          controlling_faction_id: string | null
          linked_event_ids: string[] | null
          lore: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          map_id?: string | null
          name: string
          description?: string | null
          location_type?: string
          pin_x?: number | null
          pin_y?: number | null
          status?: string
          controlling_faction_id?: string | null
          linked_event_ids?: string[] | null
          lore?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          location_type?: string
          pin_x?: number | null
          pin_y?: number | null
          status?: string
          controlling_faction_id?: string | null
          linked_event_ids?: string[] | null
          lore?: string | null
          metadata?: Json
        }
        Relationships: []
      }
      factions: {
        Row: {
          id: string
          campaign_id: string
          name: string
          description: string | null
          faction_type: string
          alignment: string | null
          motivation: string | null
          resources: Json
          influence_level: number
          military_strength: number
          status: string
          leader_npc_id: string | null
          territory_location_ids: string[] | null
          symbol_url: string | null
          color: string | null
          secrets: string | null
          ai_analysis: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          name: string
          description?: string | null
          faction_type?: string
          alignment?: string | null
          motivation?: string | null
          resources?: Json
          influence_level?: number
          military_strength?: number
          status?: string
          leader_npc_id?: string | null
          territory_location_ids?: string[] | null
          symbol_url?: string | null
          color?: string | null
          secrets?: string | null
          ai_analysis?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          faction_type?: string
          alignment?: string | null
          motivation?: string | null
          resources?: Json
          influence_level?: number
          military_strength?: number
          status?: string
          leader_npc_id?: string | null
          territory_location_ids?: string[] | null
          symbol_url?: string | null
          color?: string | null
          secrets?: string | null
          ai_analysis?: string | null
        }
        Relationships: []
      }
      faction_relationships: {
        Row: {
          id: string
          campaign_id: string
          faction_a_id: string
          faction_b_id: string
          relationship_type: string
          description: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          faction_a_id: string
          faction_b_id: string
          relationship_type: string
          description?: string | null
          updated_at?: string
        }
        Update: {
          relationship_type?: string
          description?: string | null
        }
        Relationships: []
      }
      npcs: {
        Row: {
          id: string
          campaign_id: string
          name: string
          title: string | null
          description: string | null
          role: string
          faction_id: string | null
          current_location_id: string | null
          status: string
          alignment: string | null
          motivation: string | null
          secrets: string | null
          objectives: Json
          relationships: Json
          personality_traits: string[] | null
          avatar_url: string | null
          is_player_known: boolean
          ai_notes: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          name: string
          title?: string | null
          description?: string | null
          role?: string
          faction_id?: string | null
          current_location_id?: string | null
          status?: string
          alignment?: string | null
          motivation?: string | null
          secrets?: string | null
          objectives?: Json
          relationships?: Json
          personality_traits?: string[] | null
          avatar_url?: string | null
          is_player_known?: boolean
          ai_notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          title?: string | null
          description?: string | null
          role?: string
          faction_id?: string | null
          current_location_id?: string | null
          status?: string
          alignment?: string | null
          motivation?: string | null
          secrets?: string | null
          objectives?: Json
          personality_traits?: string[] | null
          avatar_url?: string | null
          is_player_known?: boolean
          ai_notes?: string | null
          metadata?: Json
        }
        Relationships: []
      }
      objectives: {
        Row: {
          id: string
          campaign_id: string
          title: string
          description: string | null
          objective_type: string
          status: string
          progress_percent: number
          deadline_event_id: string | null
          linked_npc_ids: string[] | null
          linked_faction_ids: string[] | null
          rewards: string | null
          consequences_if_failed: string | null
          ai_analysis: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          title: string
          description?: string | null
          objective_type?: string
          status?: string
          progress_percent?: number
          deadline_event_id?: string | null
          linked_npc_ids?: string[] | null
          linked_faction_ids?: string[] | null
          rewards?: string | null
          consequences_if_failed?: string | null
          ai_analysis?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          objective_type?: string
          status?: string
          progress_percent?: number
          deadline_event_id?: string | null
          linked_npc_ids?: string[] | null
          linked_faction_ids?: string[] | null
          rewards?: string | null
          consequences_if_failed?: string | null
          ai_analysis?: string | null
        }
        Relationships: []
      }
      ai_narrative_memory: {
        Row: {
          id: string
          campaign_id: string
          session_id: string | null
          memory_type: string
          content: string
          importance: string
          tags: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          session_id?: string | null
          memory_type: string
          content: string
          importance?: string
          tags?: string[] | null
          created_at?: string
        }
        Update: {
          memory_type?: string
          content?: string
          importance?: string
          tags?: string[] | null
        }
        Relationships: []
      }
    }
    Views: EmptyRecord
    Functions: EmptyRecord
    Enums: EmptyRecord
    CompositeTypes: EmptyRecord
  }
}
