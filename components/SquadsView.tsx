'use client'

import { motion } from 'framer-motion'
import { Trophy, Shield, Heart, X, Plane } from 'lucide-react'
import { useAuctionStore } from '@/store/auctionStore'
import { getPlayerImage, handleImageError } from '@/utils/playerImage'

import { getTeamLogoUrl } from '@/utils/teamLogos'
import { getAssetUrl } from '@/utils/appPaths'

interface SquadsViewProps {
  onClose: () => void
}

export default function SquadsView({ onClose }: SquadsViewProps) {
  const { teams } = useAuctionStore()

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-y-auto p-4">
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
            Team Squads
          </h1>
          <button
            onClick={onClose}
            className="glass-effect p-3 rounded-xl hover:bg-white/10 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Teams Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {teams.map((team, idx) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-effect p-6 rounded-2xl"
              style={{ borderLeft: `4px solid ${team.color}` }}
            >
              {/* Team Header */}
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden"
                  style={{ background: `${team.color}20` }}
                >
                  <img src={getTeamLogoUrl(team.name)} alt={team.name} className="w-14 h-14 object-contain" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold" style={{ color: team.color }}>
                    {team.name}
                  </h2>
                  <div className="flex gap-4 mt-1 text-sm">
                    <span className="text-gray-400">
                      Budget: <span className="text-gold-400 font-bold">₹{team.budget.toFixed(2)}Cr</span>
                    </span>
                    <span className="text-gray-400">
                      Players: <span className="text-white font-bold">{team.players.length}</span>
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <div className="bg-green-500/20 px-3 py-1 rounded-full text-sm">
                    <span className="text-green-400">
                      Squad: {team.players.length}/25
                    </span>
                  </div>
                  <div className="bg-orange-500/20 px-3 py-1 rounded-full text-sm">
                    <span className="inline-flex items-center gap-1 text-orange-400">
                      <Plane className="w-3 h-3" />
                      Overseas: {team.players.filter(p => p.country !== 'India').length}/8
                    </span>
                  </div>
                  <div className="bg-blue-500/20 px-3 py-1 rounded-full text-sm">
                    <span className="inline-flex items-center gap-1 text-blue-400">
                      <img
                        src={getAssetUrl('/rtm-card.svg')}
                        alt="RTM"
                        className="w-4 h-4 object-contain"
                      />
                      RTM: {team.rtmAvailable}
                    </span>
                  </div>
                  <div className="bg-purple-500/20 px-3 py-1 rounded-full text-sm">
                    <span className="inline-flex items-center gap-1 text-purple-400">
                      <img
                        src={getAssetUrl('/retain-card.svg')}
                        alt="RETAIN"
                        className="w-5 h-3 object-contain"
                      />
                      Retained: {team.retentionsUsed}
                    </span>
                  </div>
                </div>
              </div>

              {/* Players List */}
              <div className="space-y-2">
                {team.players.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No players yet
                  </div>
                ) : (
                  team.players.map((player, pIdx) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: pIdx * 0.05 }}
                      className="bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Player Image */}
                          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-gold-400 to-gold-600 flex-shrink-0">
                            <img
                              src={getPlayerImage(player.name)}
                              alt={player.name}
                              className="w-full h-full object-cover"
                              onError={(e) => handleImageError(e, player.name)}
                            />
                          </div>
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm">
                            {pIdx + 1}
                          </div>
                          <div>
                            <div className="font-bold text-lg flex items-center gap-2">
                              {player.name}
                              {player.status === 'retained' && (
                                <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full text-xs">
                                  <img
                                    src={getAssetUrl('/retain-card.svg')}
                                    alt="RETAIN"
                                    className="w-4 h-2.5 object-contain"
                                  />
                                  RETAINED
                                </span>
                              )}
                              {player.previousTeam === team.name && player.status === 'sold' && (
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
                            <div className="text-sm text-gray-400">
                              {player.role} • {player.country}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gold-400">
                            ₹{(player.soldPrice || player.retainedAmount || 0).toFixed(2)}Cr
                          </div>
                          <div className="text-xs text-gray-400">
                            {player.status === 'retained' ? 'Retention' : 'Auction'}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Team Summary */}
              {team.players.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Spent:</span>
                    <span className="font-bold text-gold-400">
                      ₹{team.players.reduce((sum, p) => sum + (p.soldPrice || p.retainedAmount || 0), 0).toFixed(2)}Cr
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
