'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sword, ScrollText, Globe, Map, Users, Shield, Target, BookOpen, ChevronLeft, LogOut, Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  campaignId?: string
  campaignTitle?: string
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

export function Sidebar({ campaignId, campaignTitle }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 flex flex-col bg-[hsl(220,15%,7%)] border-r border-[hsl(var(--gold)/0.12)] z-30">
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
      <div className="p-3 border-t border-[hsl(var(--gold)/0.1)]">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          Esci
        </button>
      </div>
    </aside>
  )
}
