import { MobileAwareLayout } from '@/components/layout/mobile-aware-layout'

export default function CampaignsLayout({ children }: { children: React.ReactNode }) {
  return <MobileAwareLayout>{children}</MobileAwareLayout>
}
