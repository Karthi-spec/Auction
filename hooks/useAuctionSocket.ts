import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuctionStore } from '@/store/auctionStore'

export const useAuctionSocket = () => {
    const socketRef = useRef<Socket | null>(null)

    // Get actions from store
    const {
        setSocket,
        handleSocketBid,
        sellPlayer, // We need a way to handle this without loop
        markUnsold,
        currentPlayer
    } = useAuctionStore()

    useEffect(() => {
        // Only connect if not already connected
        if (!socketRef.current) {
            const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'
            console.log('Connecting to socket server:', serverUrl)

            socketRef.current = io(serverUrl, {
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                autoConnect: true
            })

            const socket = socketRef.current

            socket.on('connect', () => {
                console.log('Socket connected:', socket.id)
                setSocket(socket)

                // Join as spectator or relevant role (could be configurable)
                socket.emit('join-auction', {
                    role: 'spectator', // Default role
                    sessionId: 1 // Default session
                })
            })

            socket.on('disconnect', () => {
                console.log('Socket disconnected')
            })

            socket.on('new-bid', (data: { teamName: string; amount: number; playerId: string }) => {
                console.log('Socket: new-bid', data)
                handleSocketBid(data)
            })

            socket.on('timer-update', ({ seconds, isActive }) => {
                useAuctionStore.setState({
                    timer: seconds,
                    isTimerRunning: isActive,
                    isTimerPaused: !isActive
                })
            })

            socket.on('player-sold', ({ teamName, amount }) => {
                console.log('Socket: player-sold', { teamName, amount })
                // NOTE: This might cause a loop if sellPlayer emits. 
                // But we haven't added emission to sellPlayer yet.
                // Also, store.sellPlayer relies on currentPlayer.
                // We should implement handleSocketSold in store to be safe.
                // For now, let's assume manual sync or we will add handleSocketSold.
                useAuctionStore.getState().handleSocketSold?.(teamName, amount)
            })

            socket.on('player-unsold', ({ playerId }) => {
                console.log('Socket: player-unsold')
                useAuctionStore.getState().handleSocketUnsold?.()
            })

            socket.on('auction-state', (state) => {
                // Sync initial state if needed
                if (state.timer) {
                    useAuctionStore.setState({ timer: state.timer })
                }
            })
        }

        return () => {
            // Cleanup? Maybe keep connection alive for SPA navigation?
            // Usually we want to keep it alive.
        }
    }, [])

    return socketRef.current
}
