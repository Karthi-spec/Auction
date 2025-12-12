'use client'

import { motion } from 'framer-motion'
import { Users, X, Filter, Search, Trophy, Ban } from 'lucide-react'
import { useAuctionStore } from '@/store/auctionStore'
import { useState } from 'react'
import { getPlayerImage, handleImageError } from '@/utils/playerImage'
import { getAssetUrl } from '@/utils/appPaths'
import { getTeamLogoUrl } from '@/utils/teamLogos'

interface AuctionPoolProps {
  onClose: () => void
}

export default function AuctionPool({ onClose }: AuctionPoolProps) {
  const { players, teams } = useAuctionStore()
  const [filter, setFilter] = useState<'all' | 'available' | 'sold' | 'retained' | 'unsold'>('all')
  const [search, setSearch] = useState('')

  const filteredPlayers = players.filter(player => {
    const matchesFilter = filter === 'all' || player.status === filter
    const matchesSearch = player.name.toLowerCase().includes(search.toLowerCase()) ||
      player.role.toLowerCase().includes(search.toLowerCase()) ||
      player.country.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Group players by set
  const playersBySet = filteredPlayers.reduce((acc, player) => {
    const set = player.set || 'Uncategorized'
    if (!acc[set]) {
      acc[set] = []
    }
    acc[set].push(player)
    return acc
  }, {} as Record<string, typeof filteredPlayers>)

  // Sort sets by priority (new order: Mega Stars -> Next Superstars -> Established -> Marquee -> Emerging Talent)
  const sortedSets = Object.keys(playersBySet).sort((a, b) => {
    const getSetPriority = (set: string) => {
      if (set === 'Mega Stars') return 1
      if (set === 'Next Superstars') return 2
      if (set === 'Established') return 3
      if (set === 'Marquee') return 4
      if (set === 'Emerging Talent') return 5
      return 99
    }
    return getSetPriority(a) - getSetPriority(b)
  })

  const getStatusBadge = (player: any) => {
    switch (player.status) {
      case 'sold':
        return (
          <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-bold">
            <Trophy className="w-4 h-4" />
            SOLD
          </span>
        )
      case 'retained':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-bold">
            <img
              src={getAssetUrl('/retain-card.svg')}
              alt="RETAIN"
              className="w-5 h-3 object-contain"
            />
            RETAINED
          </span>
        )
      case 'unsold':
        return (
          <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-bold">
            <Ban className="w-4 h-4" />
            UNSOLD
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-bold">
            <Users className="w-4 h-4" />
            AVAILABLE
          </span>
        )
    }
  }

  const getTeamInfo = (player: any) => {
    if (player.status === 'sold' || player.status === 'retained') {
      const team = teams.find(t => t.players.some(p => p.id === player.id))
      if (team) {
        return (
          <div className="flex items-center gap-2">
            <img src={getTeamLogoUrl(team.name)} alt={team.name} className="w-8 h-8 object-contain" />
            <div>
              <div className="text-sm font-bold" style={{ color: team.color }}>
                {team.name}
              </div>
              <div className="text-xs text-gray-400">
                ₹{(player.soldPrice || player.retainedAmount || 0).toFixed(2)}Cr
              </div>
            </div>
          </div>
        )
      }
    }
    return null
  }

  const stats = {
    total: players.length,
    available: players.filter(p => p.status === 'available').length,
    sold: players.filter(p => p.status === 'sold').length,
    retained: players.filter(p => p.status === 'retained').length,
    unsold: players.filter(p => p.status === 'unsold').length
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-y-auto p-4">
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-200 mb-2">
              Auction Pool
            </h1>
            <p className="text-gray-400">Complete list of all players</p>
          </div>
          <button
            onClick={onClose}
            className="glass-effect p-3 rounded-xl hover:bg-white/10 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="glass-effect p-4 rounded-xl text-center cursor-pointer"
            onClick={() => setFilter('all')}
          >
            <div className="text-3xl font-bold text-slate-300">{stats.total}</div>
            <div className="text-sm text-gray-400">Total</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="glass-effect p-4 rounded-xl text-center cursor-pointer"
            onClick={() => setFilter('available')}
          >
            <div className="text-3xl font-bold text-blue-400">{stats.available}</div>
            <div className="text-sm text-gray-400">Available</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="glass-effect p-4 rounded-xl text-center cursor-pointer"
            onClick={() => setFilter('sold')}
          >
            <div className="text-3xl font-bold text-green-400">{stats.sold}</div>
            <div className="text-sm text-gray-400">Sold</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="glass-effect p-4 rounded-xl text-center cursor-pointer"
            onClick={() => setFilter('retained')}
          >
            <div className="text-3xl font-bold text-purple-400">{stats.retained}</div>
            <div className="text-sm text-gray-400">Retained</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="glass-effect p-4 rounded-xl text-center cursor-pointer"
            onClick={() => setFilter('unsold')}
          >
            <div className="text-3xl font-bold text-red-400">{stats.unsold}</div>
            <div className="text-sm text-gray-400">Unsold</div>
          </motion.div>
        </div>

        {/* Search and Filter */}
        <div className="glass-effect p-4 rounded-xl mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search players by name, role, or country..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-slate-400 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-slate-400 transition-colors"
              >
                <option value="all">All Players</option>
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="retained">Retained</option>
                <option value="unsold">Unsold</option>
              </select>
            </div>
          </div>
        </div>

        {/* Players List - Grouped by Set */}
        <div className="space-y-6">
          {filteredPlayers.length === 0 ? (
            <div className="glass-effect p-6 rounded-2xl">
              <div className="text-center py-12 text-gray-400">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl">No players found</p>
              </div>
            </div>
          ) : (
            sortedSets.map((setName) => (
              <div key={setName} className="glass-effect p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                  <h2 className="text-2xl font-bold text-slate-200">
                    {setName}
                  </h2>
                  <span className="text-sm text-gray-400 bg-white/5 px-3 py-1 rounded-full">
                    {playersBySet[setName].length} players
                  </span>
                </div>
                <div className="space-y-3">
                  {playersBySet[setName].map((player, idx) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {/* Player Image */}
                          <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-slate-600 to-slate-700 flex-shrink-0">
                            <img
                              src={getPlayerImage(player.name)}
                              alt={player.name}
                              className="w-full h-full object-cover"
                              onError={(e) => handleImageError(e, player.name)}
                            />
                          </div>
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-xl font-bold">{player.name}</h3>
                              {getStatusBadge(player)}
                              {player.previousTeam && player.status === 'sold' && (
                                <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-xs">
                                  <img
                                    src={getAssetUrl('/rtm-card.svg')}
                                    alt="RTM"
                                    className="w-3 h-3 object-contain"
                                  />
                                  RTM
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span>{player.role}</span>
                              <span>•</span>
                              <span>{player.country}</span>
                              <span>•</span>
                              <span>Base: ₹{player.basePrice.toFixed(2)}Cr</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {getTeamInfo(player)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
