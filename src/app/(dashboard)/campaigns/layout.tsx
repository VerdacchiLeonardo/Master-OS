import { Sidebar } from '@/components/layout/sidebar'

export default function CampaignsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 ml-60 min-h-screen">{children}</main>
    </div>
  )
}
