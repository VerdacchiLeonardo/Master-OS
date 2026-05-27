'use client'

import { useState, useRef } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Map, MapPin, ZoomIn, ZoomOut, Plus, Link, Waves, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MapRecord, Location } from '@/types'

const MAP_TYPES = ['world', 'region', 'city', 'dungeon', 'building', 'encounter']

const LAND_TYPES = ['city', 'dungeon', 'landmark', 'poi', 'region', 'ruin', 'wilderness']
const WATER_TYPES = ['sea', 'ocean']
const ALL_LOC_TYPES = [...LAND_TYPES, ...WATER_TYPES]

const LOC_TYPE_LABELS: Record<string, string> = {
  city: 'Città', dungeon: 'Dungeon', landmark: 'Landmark', poi: 'Punto di interesse',
  region: 'Regione', ruin: 'Rovina', wilderness: 'Natura selvaggia',
  sea: 'Mare', ocean: 'Oceano',
}

function isWater(type: string) { return WATER_TYPES.includes(type) }

function pinColor(type: string) {
  switch (type) {
    case 'city': return 'text-[hsl(var(--gold))]'
    case 'dungeon': return 'text-red-400'
    case 'ruin': return 'text-orange-400'
    case 'landmark': return 'text-purple-400'
    case 'sea': case 'ocean': return 'text-blue-400'
    default: return 'text-muted-foreground'
  }
}

interface MapsViewProps {
  maps: MapRecord[]
  locations: Location[]
  campaignId: string
}

export function MapsView({ maps: initial, locations: initialLocations, campaignId }: MapsViewProps) {
  const [maps, setMaps] = useState<MapRecord[]>(initial)
  const [selectedMapId, setSelectedMapId] = useState<string | null>(initial.find(m => m.is_primary)?.id ?? initial[0]?.id ?? null)
  const [locations, setLocations] = useState<Location[]>(initialLocations)

  const selectedMap = maps.find(m => m.id === selectedMapId)

  function onMapCreated(map: MapRecord) {
    setMaps(prev => [...prev, map])
    setSelectedMapId(map.id)
  }

  function onLocationAdded(location: Location) {
    setLocations(prev => [...prev, location])
  }

  function onLocationUpdated(location: Location) {
    setLocations(prev => prev.map(l => l.id === location.id ? location : l))
  }

  function onLocationDeleted(id: string) {
    setLocations(prev => prev.filter(l => l.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {maps.map(map => (
            <button
              key={map.id}
              onClick={() => setSelectedMapId(map.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border transition-all',
                selectedMapId === map.id
                  ? 'bg-[hsl(var(--gold)/0.12)] text-[hsl(var(--gold))] border-[hsl(var(--gold)/0.3)]'
                  : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              <Map className="w-3 h-3" />
              {map.title}
              {map.is_primary && <Badge variant="ghost" className="text-[9px] ml-0.5">Primary</Badge>}
            </button>
          ))}
        </div>

        <AddMapDialog campaignId={campaignId} onCreated={onMapCreated}>
          <Button size="sm" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Aggiungi Mappa
          </Button>
        </AddMapDialog>
      </div>

      {selectedMap ? (
        <MapViewer
          map={selectedMap}
          locations={locations.filter(l => l.map_id === selectedMap.id || !l.map_id)}
          campaignId={campaignId}
          onLocationAdded={onLocationAdded}
          onLocationUpdated={onLocationUpdated}
          onLocationDeleted={onLocationDeleted}
        />
      ) : (
        <div className="card-fantasy border border-border rounded-xl p-12 text-center">
          <Map className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm mb-4">Nessuna mappa aggiunta</p>
          <AddMapDialog campaignId={campaignId} onCreated={onMapCreated}>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi la prima mappa
            </Button>
          </AddMapDialog>
        </div>
      )}
    </div>
  )
}

function MapViewer({
  map, locations, campaignId, onLocationAdded, onLocationUpdated, onLocationDeleted,
}: {
  map: MapRecord
  locations: Location[]
  campaignId: string
  onLocationAdded: (l: Location) => void
  onLocationUpdated: (l: Location) => void
  onLocationDeleted: (id: string) => void
}) {
  const [zoom, setZoom] = useState(1)
  const [addingPin, setAddingPin] = useState(false)
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(null)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  function handleMapClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!addingPin) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setPendingPin({ x, y })
  }

  return (
    <div className="card-fantasy border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Map className="w-3.5 h-3.5" />
          <span>{map.title}</span>
          <Badge variant="ghost" className="text-[10px]">{map.map_type}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{locations.length} luoghi</span>
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { setAddingPin(!addingPin); setPendingPin(null) }}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded text-xs transition-all',
              addingPin
                ? 'bg-[hsl(var(--gold)/0.15)] text-[hsl(var(--gold))] border border-[hsl(var(--gold)/0.3)]'
                : 'text-muted-foreground hover:text-foreground border border-border'
            )}
          >
            <MapPin className="w-3 h-3" />
            {addingPin ? 'Clicca sulla mappa' : 'Aggiungi Luogo'}
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className={cn('relative overflow-auto bg-[hsl(220,15%,5%)]', addingPin && 'cursor-crosshair')}
        style={{ height: '60vh' }}
        onClick={handleMapClick}
      >
        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', display: 'inline-block', minWidth: '100%' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={map.image_url}
            alt={map.title}
            className="max-w-full block"
            draggable={false}
          />
        </div>

        {locations.map(loc => (
          <LocationPin
            key={loc.id}
            location={loc}
            onEdit={() => setEditingLocation(loc)}
          />
        ))}

        {pendingPin && (
          <AddLocationPinDialog
            mapId={map.id}
            campaignId={campaignId}
            pinX={pendingPin.x}
            pinY={pendingPin.y}
            onCreated={(loc) => { onLocationAdded(loc); setPendingPin(null); setAddingPin(false) }}
            onCancel={() => { setPendingPin(null); setAddingPin(false) }}
          >
            <div
              style={{ left: `${pendingPin.x}%`, top: `${pendingPin.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-full animate-fade-in"
            >
              <MapPin className="w-6 h-6 text-[hsl(var(--gold))] drop-shadow-lg animate-glow-pulse" />
            </div>
          </AddLocationPinDialog>
        )}
      </div>

      {/* Location list below map */}
      {locations.length > 0 && (
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {locations.map(loc => (
              <button
                key={loc.id}
                onClick={() => setEditingLocation(loc)}
                className={cn(
                  'flex items-center gap-1 text-xs rounded-full px-2.5 py-1 border transition-all group',
                  isWater(loc.location_type)
                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-300 hover:bg-blue-500/20'
                    : 'bg-muted/50 border-border text-muted-foreground hover:text-foreground hover:bg-muted/80'
                )}
              >
                {isWater(loc.location_type)
                  ? <Waves className="w-2.5 h-2.5" />
                  : <MapPin className="w-2.5 h-2.5" />}
                {loc.name}
                <Pencil className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 transition-opacity ml-0.5" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Edit dialog */}
      {editingLocation && (
        <EditLocationDialog
          location={editingLocation}
          onUpdated={(updated) => { onLocationUpdated(updated); setEditingLocation(null) }}
          onDeleted={(id) => { onLocationDeleted(id); setEditingLocation(null) }}
          onClose={() => setEditingLocation(null)}
        />
      )}
    </div>
  )
}

function LocationPin({ location, onEdit }: { location: Location; onEdit: () => void }) {
  const [hovered, setHovered] = useState(false)
  if (!location.pin_x || !location.pin_y) return null

  const water = isWater(location.location_type)

  return (
    <button
      style={{ left: `${location.pin_x}%`, top: `${location.pin_y}%`, position: 'absolute' }}
      className={cn(
        'group -translate-x-1/2 cursor-pointer transition-transform hover:scale-110',
        water ? '-translate-y-1/2' : '-translate-y-full'
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); onEdit() }}
    >
      {water
        ? <Waves className={cn('w-5 h-5 drop-shadow', pinColor(location.location_type))} />
        : <MapPin className={cn('w-5 h-5 drop-shadow', pinColor(location.location_type))} />
      }
      {hovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-popover border border-border rounded px-2 py-1 text-xs whitespace-nowrap z-10 pointer-events-none">
          <span className="text-foreground font-medium">{location.name}</span>
          {location.location_type && (
            <span className="text-muted-foreground ml-1">· {LOC_TYPE_LABELS[location.location_type] ?? location.location_type}</span>
          )}
        </div>
      )}
    </button>
  )
}

function EditLocationDialog({
  location: initial, onUpdated, onDeleted, onClose,
}: {
  location: Location
  onUpdated: (l: Location) => void
  onDeleted: (id: string) => void
  onClose: () => void
}) {
  const updateLocation = useStore(s => s.updateLocation)
  const deleteLocation = useStore(s => s.deleteLocation)
  const [form, setForm] = useState({
    name: initial.name,
    location_type: initial.location_type,
    description: initial.description ?? '',
    lore: initial.lore ?? '',
    status: initial.status,
  })
  const [confirmDelete, setConfirmDelete] = useState(false)

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })) }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    updateLocation(initial.id, {
      name: form.name,
      location_type: form.location_type,
      description: form.description || null,
      lore: form.lore || null,
      status: form.status,
    })
    onUpdated({ ...initial, ...form, description: form.description || null, lore: form.lore || null })
  }

  function handleDelete() {
    deleteLocation(initial.id)
    onDeleted(initial.id)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="card-fantasy border border-border rounded-xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            {isWater(initial.location_type)
              ? <Waves className={cn('w-4 h-4', pinColor(initial.location_type))} />
              : <MapPin className={cn('w-4 h-4', pinColor(initial.location_type))} />
            }
            <span className="text-sm font-medium">{initial.name}</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
        </div>

        <form onSubmit={handleSave} className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-foreground/80 mb-1">Nome *</label>
            <input
              autoFocus
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className="input-fantasy w-full"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground/80 mb-1">Tipo</label>
              <Select value={form.location_type} onValueChange={v => set('location_type', v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1 text-[10px] text-muted-foreground uppercase tracking-wider">Terra</div>
                  {LAND_TYPES.map(t => <SelectItem key={t} value={t}>{LOC_TYPE_LABELS[t]}</SelectItem>)}
                  <div className="px-2 py-1 text-[10px] text-muted-foreground uppercase tracking-wider border-t border-border mt-1 pt-2">Acqua</div>
                  {WATER_TYPES.map(t => <SelectItem key={t} value={t}>{LOC_TYPE_LABELS[t]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground/80 mb-1">Stato</label>
              <Select value={form.status} onValueChange={v => set('status', v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['known', 'unknown', 'discovered', 'dangerous', 'safe'].map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/80 mb-1">Descrizione</label>
            <Textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Note su questo luogo..."
              className="h-16 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/80 mb-1">
              Lore <span className="text-muted-foreground font-normal">(storia, leggende, segreti)</span>
            </label>
            <Textarea
              value={form.lore}
              onChange={e => set('lore', e.target.value)}
              placeholder="Storia e lore del luogo..."
              className="h-16 text-xs"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-400">Confermi l'eliminazione?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                >
                  Elimina
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Annulla
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1 text-xs text-red-400/60 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Elimina
              </button>
            )}

            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>Annulla</Button>
              <Button type="submit" size="sm" disabled={!form.name.trim()}>Salva</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

function AddMapDialog({
  campaignId, onCreated, children,
}: {
  campaignId: string
  onCreated: (map: MapRecord) => void
  children: React.ReactNode
}) {
  const createMap = useStore(s => s.createMap)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', map_type: 'world', image_url: '' })

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })) }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.image_url.trim()) return

    const map = createMap({
      campaign_id: campaignId,
      title: form.title,
      description: null,
      map_type: form.map_type,
      image_url: form.image_url,
      is_primary: false,
    })

    onCreated(map)
    setOpen(false)
    setForm({ title: '', map_type: 'world', image_url: '' })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aggiungi Mappa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-foreground/80 mb-1">Titolo *</label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Mondo di Aethoria" className="input-fantasy w-full" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground/80 mb-1">Tipo</label>
            <Select value={form.map_type} onValueChange={v => set('map_type', v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{MAP_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground/80 mb-1 flex items-center gap-1">
              <Link className="w-3 h-3" />
              URL Immagine *
            </label>
            <input
              type="url"
              value={form.image_url}
              onChange={e => set('image_url', e.target.value)}
              placeholder="https://esempio.com/mappa.jpg"
              className="input-fantasy w-full"
              required
            />
            <p className="text-[10px] text-muted-foreground mt-1">Carica l'immagine su Imgur, Discord o altro servizio e incolla l'URL qui.</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annulla</Button>
            <Button type="submit" disabled={!form.title.trim() || !form.image_url.trim()}>Aggiungi</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AddLocationPinDialog({
  mapId, campaignId, pinX, pinY, onCreated, onCancel, children,
}: {
  mapId: string
  campaignId: string
  pinX: number
  pinY: number
  onCreated: (loc: Location) => void
  onCancel: () => void
  children: React.ReactNode
}) {
  const createLocation = useStore(s => s.createLocation)
  const [open, setOpen] = useState(true)
  const [name, setName] = useState('')
  const [locType, setLocType] = useState('city')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    const loc = createLocation({
      campaign_id: campaignId,
      map_id: mapId,
      name,
      location_type: locType,
      description: null,
      pin_x: pinX,
      pin_y: pinY,
      status: 'known',
      lore: null,
    })

    onCreated(loc)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setOpen(false); onCancel() } }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Aggiungi Luogo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">Nome *</label>
            <input autoFocus type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Città di Arenfall..." className="input-fantasy w-full" required />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Tipo</label>
            <Select value={locType} onValueChange={setLocType}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1 text-[10px] text-muted-foreground uppercase tracking-wider">Terra</div>
                {LAND_TYPES.map(t => <SelectItem key={t} value={t}>{LOC_TYPE_LABELS[t]}</SelectItem>)}
                <div className="px-2 py-1 text-[10px] text-muted-foreground uppercase tracking-wider border-t border-border mt-1 pt-2">Acqua</div>
                {WATER_TYPES.map(t => <SelectItem key={t} value={t}>{LOC_TYPE_LABELS[t]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => { setOpen(false); onCancel() }}>Annulla</Button>
            <Button type="submit" disabled={!name.trim()}>Aggiungi</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
