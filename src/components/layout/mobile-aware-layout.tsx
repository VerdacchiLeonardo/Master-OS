'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Sidebar } from './sidebar'

interface MobileAwareLayoutProps {
  children: React.ReactNode
  campaignId?: string
  campaignTitle?: string
}

export function MobileAwareLayout({ children, campaignId, campaignTitle }: MobileAwareLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background flex">
      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        campaignId={campaignId}
        campaignTitle={campaignTitle}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 h-12 bg-[hsl(220,15%,7%)] border-b border-[hsl(var(--gold)/0.12)] flex items-center justify-between px-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
          aria-label="Apri menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-sm font-display text-[hsl(var(--gold))] truncate px-2 max-w-[60vw]">
          {campaignTitle ?? 'Paradox Engine'}
        </span>
        <div className="w-7" />
      </div>

      <main className="flex-1 md:ml-64 min-h-screen pt-12 md:pt-0">
        {children}
      </main>
    </div>
  )
}
