'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Trophy, Star, Users, DollarSign, TrendingUp, Crown, Medal, Award } from 'lucide-react'
import { useAuctionStore } from '@/store/auctionStore'
import { Team, Player } from '@/types'
import { getPlayerRating, loadPlayerRatings } from '@/utils/playerRatings'

interface WinnerDisplayProps {
  isOpen: boolean
  onClose: () => void
}

interface TeamRanking {
  team: Team
  totalValue: number
  averageRating: number
  squadStrength: number
  budgetEfficiency: number
  overallScore: number
  rank: number
}

export default function WinnerDisplay({ isOpen, onClose }: WinnerDisplayProps) {
  const { teams, players } = useAuctionStore()
  const [selectedMetric, setSelectedMetric] = useState<'overall' | 'value' | 'rating' | 'efficiency'>('overall')
  const [ratingsLoaded, setRatingsLoaded] = useState(false)

  // Load player ratings on component mount
  useEffect(() => {
    loadPlayerRatings().then(() => {
      setRatingsLoaded(true)
    })
  }, [])



  // Calculate comprehensive team rankings
  const calculateTeamRankings = (): TeamRanking[] => {
    const rankings = teams.map(team => {
      const teamPlayers = team.players.filter(p => p.status === 'sold' || p.status === 'retained')
      
      // Total squad value (money spent)
      const totalValue = teamPlayers.reduce((sum, player) => {
        return sum + (player.soldPrice || player.retainedAmount || player.basePrice)
      }, 0)

      // Average player rating
      const totalRating = teamPlayers.reduce((sum, player) => {
        return sum + getPlayerRating(player.name, player.basePrice)
      }, 0)
      const averageRating = teamPlayers.length > 0 ? totalRating / teamPlayers.length : 0

      // Squad strength (number of quality players)
      const squadStrength = teamPlayers.length * (averageRating / 10)

      // Budget efficiency (value for money)
      const budgetUsed = 125 - team.budget
      const budgetEfficiency = budgetUsed > 0 ? (averageRating * teamPlayers.length) / budgetUsed : 0

      // Overall score (weighted combination)
      const overallScore = (
        (averageRating * 0.4) +
        (squadStrength * 0.3) +
        (budgetEfficiency * 20 * 0.2) +
        (Math.min(teamPlayers.length / 25, 1) * 10 * 0.1)
      )

      return {
        team,
        totalValue,
        averageRating,
        squadStrength,
        budgetEfficiency,
        overallScore,
        rank: 0 // Will be set after sorting
      }
    })

    // Sort by selected metric and assign ranks
    const sortKey = selectedMetric === 'overall' ? 'overallScore' :
                   selectedMetric === 'value' ? 'totalValue' :
                   selectedMetric === 'rating' ? 'averageRating' : 'budgetEfficiency'

    rankings.sort((a, b) => b[sortKey] - a[sortKey])
    rankings.forEach((ranking, index) => {
      ranking.rank = index + 1
    })

    return rankings
  }

  const rankings = calculateTeamRankings()
  const winner = rankings[0]

  if (!isOpen) return null

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-8 h-8 text-yellow-400" />
      case 2: return <Medal className="w-8 h-8 text-gray-300" />
      case 3: return <Award className="w-8 h-8 text-amber-600" />
      default: return <span className="text-2xl font-bold text-gray-400">#{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600'
      case 2: return 'from-gray-300 to-gray-500'
      case 3: return 'from-amber-500 to-amber-700'
      default: return 'from-gray-600 to-gray-800'
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-y-auto p-4">
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <Trophy className="w-12 h-12 text-yellow-400" />
            </motion.div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                Team Rankings
              </h1>
              <p className="text-xl text-gray-400 mt-2">
                Final auction standings and analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="glass-effect p-3 rounded-xl hover:bg-white/10 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Winner Spotlight */}
        {winner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-12 relative overflow-hidden rounded-3xl"
            style={{
              background: `linear-gradient(135deg, ${winner.team.color}20, ${winner.team.color}40)`,
              border: `3px solid ${winner.team.color}`,
              boxShadow: `0 0 60px ${winner.team.color}40`
            }}
          >
            {/* Animated background */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at center, ${winner.team.color}60, transparent 70%)`
              }}
            />

            <div className="relative z-10 p-12 text-center">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                  scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
                className="mb-6"
              >
                <Crown className="w-24 h-24 text-yellow-400 mx-auto" />
              </motion.div>

              <h2 className="text-6xl font-bold mb-4" style={{ color: winner.team.color }}>
                🏆 CHAMPION 🏆
              </h2>

              <div className="flex items-center justify-center gap-6 mb-6">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative"
                >
                  <div 
                    className="absolute inset-0 rounded-full blur-2xl"
                    style={{ background: winner.team.color, opacity: 0.6 }}
                  />
                  <img 
                    src={winner.team.logo} 
                    alt={winner.team.name} 
                    className="w-32 h-32 object-contain relative z-10" 
                  />
                </motion.div>
                <div className="text-left">
                  <div className="text-5xl font-bold mb-2" style={{ color: winner.team.color }}>
                    {winner.team.name}
                  </div>
                  <div className="text-2xl text-gray-300">
                    Overall Score: <span className="font-bold text-yellow-400">{winner.overallScore.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-6 max-w-4xl mx-auto">
                <div className="bg-white/10 p-4 rounded-xl">
                  <div className="text-3xl font-bold text-yellow-400">{winner.team.players.length}</div>
                  <div className="text-sm text-gray-400">Players</div>
                </div>
                <div className="bg-white/10 p-4 rounded-xl">
                  <div className="text-3xl font-bold text-green-400">₹{winner.totalValue.toFixed(1)}Cr</div>
                  <div className="text-sm text-gray-400">Total Value</div>
                </div>
                <div className="bg-white/10 p-4 rounded-xl">
                  <div className="text-3xl font-bold text-blue-400">{winner.averageRating.toFixed(1)}</div>
                  <div className="text-sm text-gray-400">Avg Rating</div>
                </div>
                <div className="bg-white/10 p-4 rounded-xl">
                  <div className="text-3xl font-bold text-purple-400">₹{(125 - winner.team.budget).toFixed(1)}Cr</div>
                  <div className="text-sm text-gray-400">Spent</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Ranking Metrics Selector */}
        <div className="flex justify-center mb-8">
          <div className="glass-effect p-2 rounded-xl flex gap-2">
            {[
              { key: 'overall', label: 'Overall Score', icon: TrendingUp },
              { key: 'value', label: 'Total Value', icon: DollarSign },
              { key: 'rating', label: 'Avg Rating', icon: Star },
              { key: 'efficiency', label: 'Efficiency', icon: Users }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedMetric(key as any)}
                className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${
                  selectedMetric === key
                    ? 'bg-blue-500/30 text-blue-400 border-2 border-blue-500/50'
                    : 'hover:bg-white/10 text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Team Rankings */}
        <div className="grid gap-4">
          {rankings.map((ranking, index) => (
            <motion.div
              key={ranking.team.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-effect p-6 rounded-2xl border-2 relative overflow-hidden ${
                ranking.rank === 1 ? 'border-yellow-400/50' :
                ranking.rank === 2 ? 'border-gray-300/50' :
                ranking.rank === 3 ? 'border-amber-500/50' :
                'border-white/10'
              }`}
              style={{
                background: ranking.rank <= 3 
                  ? `linear-gradient(135deg, ${ranking.team.color}10, ${ranking.team.color}05)`
                  : undefined
              }}
            >
              {/* Rank indicator */}
              <div className="absolute top-4 right-4">
                {getRankIcon(ranking.rank)}
              </div>

              <div className="flex items-center gap-6">
                {/* Team Logo */}
                <div className="relative">
                  <motion.div
                    animate={ranking.rank <= 3 ? {
                      scale: [1, 1.1, 1],
                    } : {}}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="relative"
                  >
                    {ranking.rank <= 3 && (
                      <div 
                        className="absolute inset-0 rounded-full blur-xl"
                        style={{ background: ranking.team.color, opacity: 0.4 }}
                      />
                    )}
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center relative z-10"
                      style={{ 
                        background: `linear-gradient(135deg, ${ranking.team.color}40, ${ranking.team.color}20)`,
                        border: `2px solid ${ranking.team.color}`
                      }}
                    >
                      <img 
                        src={ranking.team.logo} 
                        alt={ranking.team.name} 
                        className="w-16 h-16 object-contain" 
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Team Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold" style={{ color: ranking.team.color }}>
                      {ranking.team.name}
                    </h3>
                    {ranking.rank <= 3 && (
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className={`px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${getRankColor(ranking.rank)}`}
                      >
                        {ranking.rank === 1 ? '🥇 WINNER' : 
                         ranking.rank === 2 ? '🥈 RUNNER-UP' : 
                         '🥉 THIRD PLACE'}
                      </motion.div>
                    )}
                  </div>

                  <div className="grid grid-cols-5 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Players</div>
                      <div className="font-bold text-lg">{ranking.team.players.length}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Total Value</div>
                      <div className="font-bold text-lg text-green-400">₹{ranking.totalValue.toFixed(1)}Cr</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Avg Rating</div>
                      <div className="font-bold text-lg text-blue-400">{ranking.averageRating.toFixed(1)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Efficiency</div>
                      <div className="font-bold text-lg text-purple-400">{ranking.budgetEfficiency.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Overall Score</div>
                      <div className="font-bold text-lg text-yellow-400">{ranking.overallScore.toFixed(1)}</div>
                    </div>
                  </div>
                </div>

                {/* Budget remaining */}
                <div className="text-right">
                  <div className="text-sm text-gray-400">Budget Left</div>
                  <div className="text-2xl font-bold text-orange-400">
                    ₹{ranking.team.budget.toFixed(1)}Cr
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-400">
          <p className="text-lg mb-4">
            Rankings calculated based on squad value, player ratings, budget efficiency, and overall team strength
          </p>
          <div className="glass-effect p-4 rounded-xl max-w-2xl mx-auto">
            <p className="text-sm font-bold text-gray-300 mb-2">📊 Data Sources & Credits</p>
            <div className="text-xs space-y-1">
              <p>• IPL Legacy Ratings from official auction data</p>
              <p>• Additional player ratings from IPL_Player_Ratings.xlsx</p>
              <p>• Real-time auction data and team budgets</p>
              <p>• Player statistics and performance metrics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}