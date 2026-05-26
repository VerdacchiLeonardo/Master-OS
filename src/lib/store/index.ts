import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Campaign, TimelineEvent, SessionLog, WorldState,
  Faction, FactionRelationship, NPC, Objective, MapRecord, Location,
} from '@/types'

function now() { return new Date().toISOString() }
function uid() { return crypto.randomUUID() }

interface AppState {
  campaigns: Record<string, Campaign>
  timelineEvents: Record<string, TimelineEvent>
  sessionLogs: Record<string, SessionLog>
  worldStates: Record<string, WorldState>
  factions: Record<string, Faction>
  factionRelationships: Record<string, FactionRelationship>
  npcs: Record<string, NPC>
  objectives: Record<string, Objective>
  maps: Record<string, MapRecord>
  locations: Record<string, Location>

  // Campaigns
  createCampaign: (data: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>) => Campaign
  updateCampaign: (id: string, data: Partial<Campaign>) => void
  deleteCampaign: (id: string) => void

  // Timeline events
  createTimelineEvent: (data: Omit<TimelineEvent, 'id' | 'created_at' | 'updated_at'>) => TimelineEvent
  updateTimelineEvent: (id: string, data: Partial<TimelineEvent>) => void
  deleteTimelineEvent: (id: string) => void

  // Session logs
  createSessionLog: (data: Omit<SessionLog, 'id' | 'created_at' | 'updated_at'>) => SessionLog
  updateSessionLog: (id: string, data: Partial<SessionLog>) => void

  // World states
  createWorldState: (data: Omit<WorldState, 'id' | 'created_at'>) => WorldState
  updateWorldState: (id: string, data: Partial<WorldState>) => void

  // Factions
  createFaction: (data: Omit<Faction, 'id' | 'created_at' | 'updated_at'>) => Faction
  updateFaction: (id: string, data: Partial<Faction>) => void
  deleteFaction: (id: string) => void

  // Faction relationships
  createFactionRelationship: (data: Omit<FactionRelationship, 'id' | 'updated_at'>) => FactionRelationship
  deleteFactionRelationship: (id: string) => void

  // NPCs
  createNPC: (data: Omit<NPC, 'id' | 'created_at' | 'updated_at'>) => NPC
  updateNPC: (id: string, data: Partial<NPC>) => void
  deleteNPC: (id: string) => void

  // Objectives
  createObjective: (data: Omit<Objective, 'id' | 'created_at' | 'updated_at'>) => Objective
  updateObjective: (id: string, data: Partial<Objective>) => void
  deleteObjective: (id: string) => void

  // Maps
  createMap: (data: Omit<MapRecord, 'id' | 'created_at'>) => MapRecord
  deleteMap: (id: string) => void

  // Locations
  createLocation: (data: Omit<Location, 'id' | 'created_at'>) => Location
  deleteLocation: (id: string) => void

  // Selectors
  getCampaignById: (id: string) => Campaign | undefined
  getEventsByCampaign: (cid: string) => TimelineEvent[]
  getSessionsByCampaign: (cid: string) => SessionLog[]
  getLatestWorldState: (cid: string) => WorldState | null
  getAllWorldStates: (cid: string) => WorldState[]
  getFactionsByCampaign: (cid: string) => Faction[]
  getRelsByCampaign: (cid: string) => FactionRelationship[]
  getNPCsByCampaign: (cid: string) => NPC[]
  getObjectivesByCampaign: (cid: string) => Objective[]
  getMapsByCampaign: (cid: string) => MapRecord[]
  getLocationsByCampaign: (cid: string) => Location[]

  // Export / Import
  exportData: () => void
  importData: (json: string) => boolean
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      campaigns: {},
      timelineEvents: {},
      sessionLogs: {},
      worldStates: {},
      factions: {},
      factionRelationships: {},
      npcs: {},
      objectives: {},
      maps: {},
      locations: {},

      createCampaign: (data) => {
        const item: Campaign = { ...data, id: uid(), created_at: now(), updated_at: now() }
        set(s => ({ campaigns: { ...s.campaigns, [item.id]: item } }))
        return item
      },
      updateCampaign: (id, data) => set(s => ({
        campaigns: { ...s.campaigns, [id]: { ...s.campaigns[id], ...data, updated_at: now() } },
      })),
      deleteCampaign: (id) => set(s => {
        const { [id]: _c, ...campaigns } = s.campaigns
        const keep = (v: { campaign_id: string }) => v.campaign_id !== id
        return {
          campaigns,
          timelineEvents: Object.fromEntries(Object.entries(s.timelineEvents).filter(([, v]) => keep(v))),
          sessionLogs: Object.fromEntries(Object.entries(s.sessionLogs).filter(([, v]) => keep(v))),
          worldStates: Object.fromEntries(Object.entries(s.worldStates).filter(([, v]) => keep(v))),
          factions: Object.fromEntries(Object.entries(s.factions).filter(([, v]) => keep(v))),
          factionRelationships: Object.fromEntries(Object.entries(s.factionRelationships).filter(([, v]) => keep(v))),
          npcs: Object.fromEntries(Object.entries(s.npcs).filter(([, v]) => keep(v))),
          objectives: Object.fromEntries(Object.entries(s.objectives).filter(([, v]) => keep(v))),
          maps: Object.fromEntries(Object.entries(s.maps).filter(([, v]) => keep(v))),
          locations: Object.fromEntries(Object.entries(s.locations).filter(([, v]) => keep(v))),
        }
      }),

      createTimelineEvent: (data) => {
        const item: TimelineEvent = { ...data, id: uid(), created_at: now(), updated_at: now() }
        set(s => ({ timelineEvents: { ...s.timelineEvents, [item.id]: item } }))
        return item
      },
      updateTimelineEvent: (id, data) => set(s => ({
        timelineEvents: { ...s.timelineEvents, [id]: { ...s.timelineEvents[id], ...data, updated_at: now() } },
      })),
      deleteTimelineEvent: (id) => set(s => { const { [id]: _, ...rest } = s.timelineEvents; return { timelineEvents: rest } }),

      createSessionLog: (data) => {
        const item: SessionLog = { ...data, id: uid(), created_at: now(), updated_at: now() }
        set(s => ({ sessionLogs: { ...s.sessionLogs, [item.id]: item } }))
        return item
      },
      updateSessionLog: (id, data) => set(s => ({
        sessionLogs: { ...s.sessionLogs, [id]: { ...s.sessionLogs[id], ...data, updated_at: now() } },
      })),

      createWorldState: (data) => {
        const item: WorldState = { ...data, id: uid(), created_at: now() }
        set(s => ({ worldStates: { ...s.worldStates, [item.id]: item } }))
        return item
      },
      updateWorldState: (id, data) => set(s => ({
        worldStates: { ...s.worldStates, [id]: { ...s.worldStates[id], ...data } },
      })),

      createFaction: (data) => {
        const item: Faction = { ...data, id: uid(), created_at: now(), updated_at: now() }
        set(s => ({ factions: { ...s.factions, [item.id]: item } }))
        return item
      },
      updateFaction: (id, data) => set(s => ({
        factions: { ...s.factions, [id]: { ...s.factions[id], ...data, updated_at: now() } },
      })),
      deleteFaction: (id) => set(s => { const { [id]: _, ...rest } = s.factions; return { factions: rest } }),

      createFactionRelationship: (data) => {
        const item: FactionRelationship = { ...data, id: uid(), updated_at: now() }
        set(s => ({ factionRelationships: { ...s.factionRelationships, [item.id]: item } }))
        return item
      },
      deleteFactionRelationship: (id) => set(s => { const { [id]: _, ...rest } = s.factionRelationships; return { factionRelationships: rest } }),

      createNPC: (data) => {
        const item: NPC = { ...data, id: uid(), created_at: now(), updated_at: now() }
        set(s => ({ npcs: { ...s.npcs, [item.id]: item } }))
        return item
      },
      updateNPC: (id, data) => set(s => ({
        npcs: { ...s.npcs, [id]: { ...s.npcs[id], ...data, updated_at: now() } },
      })),
      deleteNPC: (id) => set(s => { const { [id]: _, ...rest } = s.npcs; return { npcs: rest } }),

      createObjective: (data) => {
        const item: Objective = { ...data, id: uid(), created_at: now(), updated_at: now() }
        set(s => ({ objectives: { ...s.objectives, [item.id]: item } }))
        return item
      },
      updateObjective: (id, data) => set(s => ({
        objectives: { ...s.objectives, [id]: { ...s.objectives[id], ...data, updated_at: now() } },
      })),
      deleteObjective: (id) => set(s => { const { [id]: _, ...rest } = s.objectives; return { objectives: rest } }),

      createMap: (data) => {
        const item: MapRecord = { ...data, id: uid(), created_at: now() }
        set(s => ({ maps: { ...s.maps, [item.id]: item } }))
        return item
      },
      deleteMap: (id) => set(s => { const { [id]: _, ...rest } = s.maps; return { maps: rest } }),

      createLocation: (data) => {
        const item: Location = { ...data, id: uid(), created_at: now() }
        set(s => ({ locations: { ...s.locations, [item.id]: item } }))
        return item
      },
      deleteLocation: (id) => set(s => { const { [id]: _, ...rest } = s.locations; return { locations: rest } }),

      getCampaignById: (id) => get().campaigns[id],
      getEventsByCampaign: (cid) => Object.values(get().timelineEvents)
        .filter(e => e.campaign_id === cid)
        .sort((a, b) => b.created_at.localeCompare(a.created_at)),
      getSessionsByCampaign: (cid) => Object.values(get().sessionLogs)
        .filter(s => s.campaign_id === cid)
        .sort((a, b) => b.session_number - a.session_number),
      getLatestWorldState: (cid) => {
        const states = Object.values(get().worldStates)
          .filter(w => w.campaign_id === cid)
          .sort((a, b) => b.session_number - a.session_number)
        return states[0] ?? null
      },
      getAllWorldStates: (cid) => Object.values(get().worldStates)
        .filter(w => w.campaign_id === cid)
        .sort((a, b) => a.session_number - b.session_number),
      getFactionsByCampaign: (cid) => Object.values(get().factions).filter(f => f.campaign_id === cid),
      getRelsByCampaign: (cid) => Object.values(get().factionRelationships).filter(r => r.campaign_id === cid),
      getNPCsByCampaign: (cid) => Object.values(get().npcs).filter(n => n.campaign_id === cid),
      getObjectivesByCampaign: (cid) => Object.values(get().objectives).filter(o => o.campaign_id === cid),
      getMapsByCampaign: (cid) => Object.values(get().maps).filter(m => m.campaign_id === cid),
      getLocationsByCampaign: (cid) => Object.values(get().locations).filter(l => l.campaign_id === cid),

      exportData: () => {
        const s = get()
        const data = {
          version: 1,
          exportedAt: now(),
          campaigns: s.campaigns,
          timelineEvents: s.timelineEvents,
          sessionLogs: s.sessionLogs,
          worldStates: s.worldStates,
          factions: s.factions,
          factionRelationships: s.factionRelationships,
          npcs: s.npcs,
          objectives: s.objectives,
          maps: s.maps,
          locations: s.locations,
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `paradox-engine-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json)
          if (!data.campaigns) return false
          set({
            campaigns: data.campaigns ?? {},
            timelineEvents: data.timelineEvents ?? {},
            sessionLogs: data.sessionLogs ?? {},
            worldStates: data.worldStates ?? {},
            factions: data.factions ?? {},
            factionRelationships: data.factionRelationships ?? {},
            npcs: data.npcs ?? {},
            objectives: data.objectives ?? {},
            maps: data.maps ?? {},
            locations: data.locations ?? {},
          })
          return true
        } catch {
          return false
        }
      },
    }),
    {
      name: 'paradox-engine-data',
      skipHydration: true,
    }
  )
)
