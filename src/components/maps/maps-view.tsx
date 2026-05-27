'use client'

import { useState, useRef } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Map, MapPin, ZoomIn, ZoomOut, Plus, Link } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MapRecord, Location } from '@/types'

const MAP_TYPES = ['world', 'region', 'city', 'dungeon', 'building', 'encounter']

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
  map, locations, campaignId, onLocationAdded,
}: {
  map: MapRecord
  locations: Location[]
  campaignId: string
  onLocationAdded: (l: Location) => void
}) {
  const [zoom, setZoom] = useState(1)
  const [addingPin, setAddingPin] = useState(false)
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(null)
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
          <LocationPin key={loc.id} location={loc} />
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

      {locations.length > 0 && (
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {locations.map(loc => (
              <div
                key={loc.id}
                className="flex items-center gap-1 text-xs bg-muted/50 rounded-full px-2 py-0.5 text-muted-foreground"
              >
                <MapPin className="w-2.5 h-2.5" />
                {loc.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function LocationPin({ location }: { location: Location }) {
  const [hovered, setHovered] = useState(false)
  if (!location.pin_x || !location.pin_y) return null

  return (
    <div
      style={{ left: `${location.pin_x}%`, top: `${location.pin_y}%`, position: 'absolute' }}
      className="-translate-x-1/2 -translate-y-full group cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <MapPin className="w-5 h-5 text-[hsl(var(--gold))] drop-shadow" />
      {hovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-popover border border-border rounded px-2 py-1 text-xs whitespace-nowrap z-10">
          {location.name}
        </div>
      )}
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
  const [locType, setLocType] = useState('poi')

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
                {['city', 'dungeon', 'landmark', 'poi', 'region', 'ruin', 'wilderness'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
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
