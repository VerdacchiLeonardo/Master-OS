-- ============================================================
-- PARADOX ENGINE — Supabase Schema
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- CAMPAIGNS
-- ============================================================
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  lore TEXT,
  final_objective TEXT,
  narrative_tone TEXT DEFAULT 'epic' CHECK (narrative_tone IN ('epic', 'dark', 'mystery', 'horror', 'political', 'adventure')),
  game_system TEXT DEFAULT 'D&D 5e',
  estimated_sessions INT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaigns_owner_all" ON campaigns
  FOR ALL USING (auth.uid() = owner_id);

CREATE INDEX idx_campaigns_owner ON campaigns(owner_id);

-- ============================================================
-- TIMELINE EVENTS
-- ============================================================
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'story' CHECK (event_type IN (
    'story', 'combat', 'political', 'prophecy', 'ritual', 'war', 'death',
    'discovery', 'betrayal', 'alliance', 'threat', 'countdown', 'player_action'
  )),
  importance TEXT DEFAULT 'major' CHECK (importance IN ('minor', 'major', 'critical', 'catastrophic')),
  status TEXT DEFAULT 'future' CHECK (status IN ('past', 'present', 'future', 'inevitable', 'conditional', 'averted')),
  trigger_condition TEXT,
  event_date TEXT,
  session_number INT,
  linked_npc_ids UUID[],
  linked_location_ids UUID[],
  linked_faction_ids UUID[],
  linked_event_ids UUID[],
  ai_analysis TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "timeline_events_campaign_owner" ON timeline_events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_id AND campaigns.owner_id = auth.uid())
  );

CREATE INDEX idx_timeline_events_campaign ON timeline_events(campaign_id);
CREATE INDEX idx_timeline_events_status ON timeline_events(campaign_id, status);

-- ============================================================
-- SESSION LOGS
-- ============================================================
CREATE TABLE session_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  session_number INT NOT NULL,
  title TEXT,
  raw_notes TEXT NOT NULL,
  ai_summary TEXT,
  ai_consequences TEXT,
  ai_world_updates JSONB DEFAULT '{}',
  ai_timeline_updates JSONB DEFAULT '{}',
  key_events JSONB DEFAULT '[]',
  players_present TEXT[],
  session_date DATE,
  duration_hours FLOAT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processed', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "session_logs_campaign_owner" ON session_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_id AND campaigns.owner_id = auth.uid())
  );

CREATE INDEX idx_session_logs_campaign ON session_logs(campaign_id);
CREATE INDEX idx_session_logs_number ON session_logs(campaign_id, session_number);

-- ============================================================
-- WORLD STATE
-- ============================================================
CREATE TABLE world_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  session_number INT NOT NULL DEFAULT 0,
  war_level INT DEFAULT 0 CHECK (war_level BETWEEN 0 AND 100),
  corruption_level INT DEFAULT 0 CHECK (corruption_level BETWEEN 0 AND 100),
  political_stability INT DEFAULT 100 CHECK (political_stability BETWEEN 0 AND 100),
  narrative_tension INT DEFAULT 0 CHECK (narrative_tension BETWEEN 0 AND 100),
  villain_progress INT DEFAULT 0 CHECK (villain_progress BETWEEN 0 AND 100),
  hero_reputation INT DEFAULT 50 CHECK (hero_reputation BETWEEN 0 AND 100),
  objective_progress INT DEFAULT 0 CHECK (objective_progress BETWEEN 0 AND 100),
  active_threats JSONB DEFAULT '[]',
  active_conflicts JSONB DEFAULT '[]',
  custom_metrics JSONB DEFAULT '{}',
  world_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE world_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "world_states_campaign_owner" ON world_states
  FOR ALL USING (
    EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_id AND campaigns.owner_id = auth.uid())
  );

CREATE INDEX idx_world_states_campaign ON world_states(campaign_id);

-- ============================================================
-- MAPS
-- ============================================================
CREATE TABLE maps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  map_type TEXT DEFAULT 'world' CHECK (map_type IN ('world', 'region', 'city', 'dungeon', 'building', 'encounter')),
  image_url TEXT NOT NULL,
  image_width INT,
  image_height INT,
  is_primary BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE maps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "maps_campaign_owner" ON maps
  FOR ALL USING (
    EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_id AND campaigns.owner_id = auth.uid())
  );

-- ============================================================
-- LOCATIONS (map pins)
-- ============================================================
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  map_id UUID REFERENCES maps(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  location_type TEXT DEFAULT 'poi' CHECK (location_type IN ('city', 'dungeon', 'landmark', 'poi', 'region', 'ruin', 'wilderness')),
  pin_x FLOAT,
  pin_y FLOAT,
  status TEXT DEFAULT 'unknown' CHECK (status IN ('unknown', 'discovered', 'explored', 'controlled', 'destroyed')),
  controlling_faction_id UUID,
  linked_event_ids UUID[],
  lore TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "locations_campaign_owner" ON locations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_id AND campaigns.owner_id = auth.uid())
  );

CREATE INDEX idx_locations_campaign ON locations(campaign_id);

-- ============================================================
-- FACTIONS
-- ============================================================
CREATE TABLE factions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  faction_type TEXT DEFAULT 'organization' CHECK (faction_type IN (
    'kingdom', 'city', 'guild', 'cult', 'army', 'organization', 'order', 'criminal', 'nomadic'
  )),
  alignment TEXT,
  motivation TEXT,
  resources JSONB DEFAULT '{}',
  influence_level INT DEFAULT 50 CHECK (influence_level BETWEEN 0 AND 100),
  military_strength INT DEFAULT 50 CHECK (military_strength BETWEEN 0 AND 100),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'weakened', 'destroyed', 'hidden', 'dormant')),
  leader_npc_id UUID,
  territory_location_ids UUID[],
  symbol_url TEXT,
  color TEXT,
  secrets TEXT,
  ai_analysis TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE factions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "factions_campaign_owner" ON factions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_id AND campaigns.owner_id = auth.uid())
  );

CREATE INDEX idx_factions_campaign ON factions(campaign_id);

-- ============================================================
-- FACTION RELATIONSHIPS
-- ============================================================
CREATE TABLE faction_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  faction_a_id UUID NOT NULL REFERENCES factions(id) ON DELETE CASCADE,
  faction_b_id UUID NOT NULL REFERENCES factions(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN (
    'allied', 'friendly', 'neutral', 'tense', 'hostile', 'war', 'vassal', 'rival'
  )),
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(faction_a_id, faction_b_id)
);

ALTER TABLE faction_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "faction_relationships_campaign_owner" ON faction_relationships
  FOR ALL USING (
    EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_id AND campaigns.owner_id = auth.uid())
  );

-- ============================================================
-- NPCs
-- ============================================================
CREATE TABLE npcs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  description TEXT,
  role TEXT DEFAULT 'minor' CHECK (role IN ('villain', 'ally', 'neutral', 'minor', 'major', 'mentor', 'unknown')),
  faction_id UUID REFERENCES factions(id) ON DELETE SET NULL,
  current_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'alive' CHECK (status IN ('alive', 'dead', 'missing', 'imprisoned', 'transformed', 'unknown')),
  alignment TEXT,
  motivation TEXT,
  secrets TEXT,
  objectives JSONB DEFAULT '[]',
  relationships JSONB DEFAULT '[]',
  personality_traits TEXT[],
  avatar_url TEXT,
  is_player_known BOOLEAN DEFAULT true,
  ai_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE npcs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "npcs_campaign_owner" ON npcs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_id AND campaigns.owner_id = auth.uid())
  );

CREATE INDEX idx_npcs_campaign ON npcs(campaign_id);
CREATE INDEX idx_npcs_faction ON npcs(faction_id);

-- ============================================================
-- OBJECTIVES
-- ============================================================
CREATE TABLE objectives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  objective_type TEXT DEFAULT 'main' CHECK (objective_type IN ('main', 'side', 'secret', 'faction', 'personal')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'abandoned', 'hidden')),
  progress_percent INT DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  deadline_event_id UUID REFERENCES timeline_events(id) ON DELETE SET NULL,
  linked_npc_ids UUID[],
  linked_faction_ids UUID[],
  rewards TEXT,
  consequences_if_failed TEXT,
  ai_analysis TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "objectives_campaign_owner" ON objectives
  FOR ALL USING (
    EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_id AND campaigns.owner_id = auth.uid())
  );

-- ============================================================
-- AI NARRATIVE MEMORY
-- ============================================================
CREATE TABLE ai_narrative_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  session_id UUID REFERENCES session_logs(id) ON DELETE SET NULL,
  memory_type TEXT NOT NULL CHECK (memory_type IN (
    'fact', 'relationship', 'event', 'consequence', 'foreshadowing', 'arc', 'character_development'
  )),
  content TEXT NOT NULL,
  importance TEXT DEFAULT 'normal' CHECK (importance IN ('low', 'normal', 'high', 'critical')),
  embedding vector(1536),
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE ai_narrative_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_memory_campaign_owner" ON ai_narrative_memory
  FOR ALL USING (
    EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_id AND campaigns.owner_id = auth.uid())
  );

CREATE INDEX idx_ai_memory_campaign ON ai_narrative_memory(campaign_id);
CREATE INDEX idx_ai_memory_type ON ai_narrative_memory(campaign_id, memory_type);

-- Function for semantic memory search
CREATE OR REPLACE FUNCTION search_narrative_memory(
  p_campaign_id UUID,
  p_query_embedding vector(1536),
  p_match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  memory_type TEXT,
  importance TEXT,
  similarity FLOAT
)
LANGUAGE sql STABLE AS $$
  SELECT
    id, content, memory_type, importance,
    1 - (embedding <=> p_query_embedding) AS similarity
  FROM ai_narrative_memory
  WHERE campaign_id = p_campaign_id
    AND embedding IS NOT NULL
  ORDER BY embedding <=> p_query_embedding
  LIMIT p_match_count;
$$;

-- ============================================================
-- UPDATED_AT triggers
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER timeline_events_updated_at BEFORE UPDATE ON timeline_events FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER session_logs_updated_at BEFORE UPDATE ON session_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER factions_updated_at BEFORE UPDATE ON factions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER npcs_updated_at BEFORE UPDATE ON npcs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER objectives_updated_at BEFORE UPDATE ON objectives FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Supabase Storage buckets (run via dashboard or CLI)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('maps', 'maps', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
--
-- CREATE POLICY "maps_upload" ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'maps' AND auth.uid() IS NOT NULL);
-- CREATE POLICY "maps_public_read" ON storage.objects FOR SELECT
--   USING (bucket_id = 'maps');
