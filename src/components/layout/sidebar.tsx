'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Sword, ScrollText, Globe, Map, Users, Shield, Target, BookOpen, ChevronLeft, Download, Upload, Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/lib/store'

interface SidebarProps {
  campaignId?: string
  campaignTitle?: string
  mobileOpen?: boolean
  onMobileClose?: () => void
}

const campaignNavItems = (id: string) => [
  { href: `/campaign?id=${id}`, path: '/campaign', label: 'Dashboard', icon: Sparkles },
  { href: `/campaign/timeline?id=${id}`, path: '/campaign/timeline', label: 'Timeline', icon: ScrollText },
  { href: `/campaign/world-state?id=${id}`, path: '/campaign/world-state', label: 'World State', icon: Globe },
  { href: `/campaign/sessions?id=${id}`, path: '/campaign/sessions', label: 'Session Logs', icon: BookOpen },
  { href: `/campaign/maps?id=${id}`, path: '/campaign/maps', label: 'Mappe', icon: Map },
  { href: `/campaign/npcs?id=${id}`, path: '/campaign/npcs', label: 'NPC', icon: Users },
  { href: `/campaign/factions?id=${id}`, path: '/campaign/factions', label: 'Fazioni', icon: Shield },
  { href: `/campaign/objectives?id=${id}`, path: '/campaign/objectives', label: 'Obiettivi', icon: Target },
]

export function Sidebar({ campaignId, campaignTitle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const exportData = useStore(s => s.exportData)
  const importData = useStore(s => s.importData)
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
              const isActive = pathname === item.path
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
      </div>
    </aside>
  )
}
