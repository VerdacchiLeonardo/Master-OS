'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Sword, ScrollText, Globe, Map, Users, Shield, Target, BookOpen, ChevronLeft, Download, Upload, Sparkles, KeyRound, Check
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/lib/store'
import { getGeminiKey, saveGeminiKey } from '@/lib/gemini'

interface SidebarProps {
  campaignId?: string
  campaignTitle?: string
  mobileOpen?: boolean
  onMobileClose?: () => void
}

const campaignNavItems = (id: string) => [
  { href: `/campaign/${id}`, label: 'Dashboard', icon: Sparkles },
  { href: `/campaign/${id}/timeline`, label: 'Timeline', icon: ScrollText },
  { href: `/campaign/${id}/world-state`, label: 'World State', icon: Globe },
  { href: `/campaign/${id}/sessions`, label: 'Session Logs', icon: BookOpen },
  { href: `/campaign/${id}/maps`, label: 'Mappe', icon: Map },
  { href: `/campaign/${id}/npcs`, label: 'NPC', icon: Users },
  { href: `/campaign/${id}/factions`, label: 'Fazioni', icon: Shield },
  { href: `/campaign/${id}/objectives`, label: 'Obiettivi', icon: Target },
]

export function Sidebar({ campaignId, campaignTitle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const exportData = useStore(s => s.exportData)
  const importData = useStore(s => s.importData)
  const [apiKey, setApiKey] = useState('')
  const [keySaved, setKeySaved] = useState(false)

  useEffect(() => { setApiKey(getGeminiKey()) }, [])

  function handleSaveKey() {
    saveGeminiKey(apiKey)
    setKeySaved(true)
    setTimeout(() => setKeySaved(false), 2000)
  }

  function handleImport() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        const ok = importData(ev.target?.result as string)
        if (!ok) alert('File non valido o corrotto.')
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <aside className={cn(
      'fixed left-0 top-0 bottom-0 w-64 flex flex-col bg-[hsl(220,15%,7%)] border-r border-[hsl(var(--gold)/0.12)] z-30',
      'transition-transform duration-300 ease-in-out',
      mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
    )}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[hsl(var(--gold)/0.1)]">
        <Link href="/campaigns" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--gold)/0.1)] border border-[hsl(var(--gold)/0.3)] flex items-center justify-center group-hover:glow-gold transition-all">
            <Sword className="w-4 h-4 text-[hsl(var(--gold))]" />
          </div>
          <div>
            <p className="text-sm font-display font-semibold text-[hsl(var(--gold))] leading-tight">
              Paradox Engine
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight">DM Intelligence</p>
          </div>
        </Link>
      </div>

      {/* Campaign context */}
      {campaignId ? (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Back to campaigns */}
          <div className="px-3 pt-3">
            <Link
              href="/campaigns"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5 px-2 rounded-md hover:bg-muted/50"
            >
              <ChevronLeft className="w-3 h-3" />
              Tutte le Campagne
            </Link>
          </div>

          {/* Campaign title */}
          <div className="px-4 pt-2 pb-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-0.5">
              Campagna attiva
            </p>
            <p className="text-sm font-display font-medium text-foreground truncate" title={campaignTitle}>
              {campaignTitle ?? '—'}
            </p>
          </div>

          <div className="h-px bg-[hsl(var(--gold)/0.08)] mx-4" />

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
            {campaignNavItems(campaignId).map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== `/campaign/${campaignId}` && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all duration-150 group',
                    isActive
                      ? 'bg-[hsl(var(--gold)/0.12)] text-[hsl(var(--gold))] border border-[hsl(var(--gold)/0.2)]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  )}
                >
                  <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-[hsl(var(--gold))]' : 'text-muted-foreground group-hover:text-foreground')} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      ) : (
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <Link
            href="/campaigns"
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all duration-150',
              pathname === '/campaigns'
                ? 'bg-[hsl(var(--gold)/0.12)] text-[hsl(var(--gold))] border border-[hsl(var(--gold)/0.2)]'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            )}
          >
            <ScrollText className="w-4 h-4" />
            Le mie Campagne
          </Link>
        </nav>
      )}

      {/* Bottom actions */}
      <div className="p-3 border-t border-[hsl(var(--gold)/0.1)] space-y-0.5">
        <button
          onClick={exportData}
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all w-full"
        >
          <Download className="w-4 h-4" />
          Esporta JSON
        </button>
        <button
          onClick={handleImport}
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all w-full"
        >
          <Upload className="w-4 h-4" />
          Importa JSON
        </button>

        {/* Gemini API key */}
        <div className="pt-2 mt-1 border-t border-[hsl(var(--gold)/0.08)]">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium px-1 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> AI — Gemini
          </p>
          <div className="flex gap-1">
            <div className="relative flex-1">
              <KeyRound className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveKey()}
                placeholder="Incolla chiave API..."
                className="w-full text-xs bg-muted/40 border border-border rounded pl-6 pr-2 py-1.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-[hsl(var(--gold)/0.4)] transition-colors"
              />
            </div>
            <button
              onClick={handleSaveKey}
              className={cn(
                'px-2 py-1 rounded text-xs border transition-all shrink-0',
                keySaved
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-[hsl(var(--gold)/0.1)] text-[hsl(var(--gold))] border-[hsl(var(--gold)/0.3)] hover:bg-[hsl(var(--gold)/0.2)]'
              )}
            >
              {keySaved ? <Check className="w-3.5 h-3.5" /> : 'Salva'}
            </button>
          </div>
          {apiKey && <p className="text-[10px] text-emerald-500/70 mt-1 px-1">Chiave configurata</p>}
        </div>
      </div>
    </aside>
  )
}
