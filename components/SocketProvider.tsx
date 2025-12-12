'use client'
import { useAuctionSocket } from '@/hooks/useAuctionSocket'

export default function SocketProvider({ children }: { children: React.ReactNode }) {
    useAuctionSocket()
    return <>{children}</>
}
