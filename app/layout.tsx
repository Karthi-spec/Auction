import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import IPLBackground from '@/components/IPLBackground'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'IPL Auction System',
  description: 'Professional IPL-style real-time auction platform',
}

import SocketProvider from '@/components/SocketProvider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SocketProvider>
          <IPLBackground />
          <div className="relative z-10">
            {children}
          </div>
        </SocketProvider>
      </body>
    </html>
  )
}
