import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { StoreHydration } from '@/components/store-hydration'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Paradox Engine',
    template: '%s | Paradox Engine',
  },
  description: 'Narrative Intelligence System for Dungeon Masters',
  keywords: ['D&D', 'Dungeon Master', 'Campaign Manager', 'AI', 'Narrative'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var r = sessionStorage.getItem('spa_redirect');
            if (r) {
              sessionStorage.removeItem('spa_redirect');
              history.replaceState(null, '', r);
            }
          })();
        `}} />
        <StoreHydration />
        {children}
      </body>
    </html>
  )
}
