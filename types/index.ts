export interface Player {
  id: string
  name: string
  role: string
  country: string
  basePrice: number
  currentBid: number
  currentBidder?: string
  status: 'available' | 'sold' | 'unsold' | 'retained'
  soldPrice?: number
  previousTeam?: string
  retainedAmount?: number
  set?: string
  categoryOrder?: number
  stats: {
    matches: number
    runs?: number
    wickets?: number
    average: number
    strikeRate?: number
    economy?: number
  }
}

export interface Team {
  id: string
  name: string
  budget: number
  players: Player[]
  color: string
  logo: string
  rtmAvailable: number
  retentionsUsed: number
}

export interface Bid {
  id: string
  playerId: string
  playerName: string
  teamId: string
  teamName: string
  amount: number
  timestamp: number
}
