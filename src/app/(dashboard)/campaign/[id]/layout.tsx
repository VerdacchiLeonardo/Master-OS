'use client'

import { useParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { Sidebar } from '@/components/layout/sidebar'
import Link from 'next/link'

export default function CampaignLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>()
  const campaign = useStore(s => s.campaigns[id])

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Campagna non trovata</p>
          <Link href="/campaigns" className="text-[hsl(var(--gold))] hover:underline text-sm">
            ← Torna alle campagne
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar campaignId={campaign.id} campaignTitle={campaign.title} />
      <main className="flex-1 ml-60 min-h-screen">{children}</main>
    </div>
  )
}
