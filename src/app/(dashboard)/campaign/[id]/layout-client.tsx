'use client'

import { useParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { MobileAwareLayout } from '@/components/layout/mobile-aware-layout'
import Link from 'next/link'

export function CampaignLayoutClient({ children }: { children: React.ReactNode }) {
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
    <MobileAwareLayout campaignId={campaign.id} campaignTitle={campaign.title}>
      {children}
    </MobileAwareLayout>
  )
}
