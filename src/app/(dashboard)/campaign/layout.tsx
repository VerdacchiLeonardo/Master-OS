import { Suspense } from 'react'
import { CampaignLayoutClient } from './layout-client'

export default function CampaignLayout({ children }: { children: React.ReactNode }) {
  return <Suspense><CampaignLayoutClient>{children}</CampaignLayoutClient></Suspense>
}
