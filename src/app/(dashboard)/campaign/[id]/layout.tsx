import { CampaignLayoutClient } from './layout-client'

export default function CampaignLayout({ children }: { children: React.ReactNode }) {
  return <CampaignLayoutClient>{children}</CampaignLayoutClient>
}
