'use client'

import { motion } from 'framer-motion'
import { Trophy, Wallet, Plane } from 'lucide-react'
import { useAuctionStore } from '@/store/auctionStore'
import { getPlayerImage, handleImageError } from '@/utils/playerImage'

import { getTeamLogoUrl } from '@/utils/teamLogos'
import { getAssetUrl } from '@/utils/appPaths'

export default function TeamsList() {
  const { teams } = useAuctionStore()

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-effect p-6 rounded-2xl sticky top-4"
    >
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-gold-400" />
        <h3 className="text-2xl font-bold">Teams</h3>
      </div>

      <div className="space-y-4">
        {teams.map((team, idx) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-white/10">
                <img src={getTeamLogoUrl(team.name)} alt={team.name} className="w-10 h-10 object-contain" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg">{team.name}</div>
                <div className="text-sm text-gray-400">
                  {team.players.length}/25 players •
                  <span className="inline-flex items-center gap-0.5 ml-1">
                    <Plane className="w-3 h-3" />
                    {team.players.filter(p => p.country !== 'India').length}/8
                  </span>
                </div>
                <div className="flex gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                    <img
                      src={getAssetUrl('/rtm-card.svg')}
                      alt="RTM"
                      className="w-3 h-3 object-contain"
                    />
                    RTM: {team.rtmAvailable}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
                    <img
                      src={getAssetUrl('/retain-card.svg')}
                      alt="RETAIN"
                      className="w-4 h-2.5 object-contain"
                    />
                    Retained: {team.retentionsUsed}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-gold-400" />
                <span className="text-gray-400">Budget</span>
              </div>
              <span className="font-bold text-gold-400">
                ₹{team.budget.toFixed(2)}Cr
              </span>
            </div>

            {team.players.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="text-xs text-gray-400 mb-2">Squad</div>
                <div className="space-y-2">
                  {team.players.slice(0, 3).map((player) => (
                    <div key={player.id} className="flex items-center gap-2">
                      <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gradient-to-br from-gold-400 to-gold-600 flex-shrink-0">
                        <img
                          src={getPlayerImage(player.name)}
                          alt={player.name}
                          className="w-full h-full object-cover"
                          onError={(e) => handleImageError(e, player.name)}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm truncate">{player.name}</span>
                          {player.status === 'retained' && (
                            <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded text-xs">
                              <img
                                src={getAssetUrl('/retain-card.svg')}
                                alt="RETAIN"
                                className="w-3 h-2 object-contain"
                              />
                              RETAINED
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm">
                        {player.status === 'retained' ? (
                          <span className="text-purple-400 font-bold">RETAINED</span>
                        ) : (
                          <span className="text-gold-400">₹{(player.soldPrice || 0).toFixed(2)}Cr</span>
                        )}
                      </span>
                    </div>
                  ))}
                  {team.players.length > 3 && (
                    <div className="text-xs text-gray-400 pl-8">
                      +{team.players.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
