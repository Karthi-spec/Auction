'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, Users, X, Crown, Zap, UserPlus, TrendingUp, Award, Medal } from 'lucide-react'
import { useAuctionStore } from '@/store/auctionStore'
import { Player, Team } from '@/types'
import { getPlayerImage, handleImageError } from '@/utils/playerImage'
import playerRatingsData from '@/data/playerRatings.json'

interface TeamAnalysisProps {
  onClose: () => void
}

interface TeamAnalysisData {
  team: Team
  totalCredits: number
  playing11Credits: number
  impactCredits: number
  benchCredits: number
  averageRating: number
  squadComposition: {
    playing11: Player[]
    impact: Player[]
    bench: Player[]
  }
}

export default function TeamAnalysis({ onClose }: TeamAnalysisProps) {
  const { teams } = useAuctionStore()
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

  // Get player ratings from JSON
  const playerRatings = playerRatingsData.playerRatings as { [key: string]: number }

  // Calculate team analysis data
  const teamAnalysisData = useMemo(() => {
    const analysisData: TeamAnalysisData[] = teams.map(team => {
      // For now, we'll simulate squad composition since SquadManager is per-team
      // In a real implementation, this would come from saved squad data
      const teamPlayers = team.players.filter(p => p.status === 'sold' || p.status === 'retained')
      
      // Simulate squad composition (in real app, this would be saved data)
      const playing11 = teamPlayers.slice(0, Math.min(11, teamPlayers.length))
      const impact = teamPlayers.slice(11, Math.min(12, teamPlayers.length))
      const bench = teamPlayers.slice(12)

      // Calculate credits
      const getPlayerCredits = (player: Player, isFullCredit: boolean = true) => {
        const rating = playerRatings[player.name] || 5.0 // Default rating if not found
        return isFullCredit ? rating : rating / 2
      }

      const playing11Credits = playing11.reduce((sum, player) => sum + getPlayerCredits(player, true), 0)
      const impactCredits = impact.reduce((sum, player) => sum + getPlayerCredits(player, true), 0)
      const benchCredits = bench.reduce((sum, player) => sum + getPlayerCredits(player, false), 0)
      
      const totalCredits = playing11Credits + impactCredits + benchCredits
      const averageRating = teamPlayers.length > 0 
        ? teamPlayers.reduce((sum, player) => sum + (playerRatings[player.name] || 5.0), 0) / teamPlayers.length
        : 0

      return {
        team,
        totalCredits,
        playing11Credits,
        impactCredits,
        benchCredits,
        averageRating,
        squadComposition: {
          playing11,
          impact,
          bench
        }
      }
    })

    // Sort by total credits (highest first)
    return analysisData.sort((a, b) => b.totalCredits - a.totalCredits)
  }, [teams, playerRatings])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-8 h-8 text-yellow-400" />
      case 2: return <Medal className="w-8 h-8 text-gray-300" />
      case 3: return <Award className="w-8 h-8 text-amber-600" />
      default: return <div className="w-8 h-8 flex items-center justify-center text-2xl font-bold text-gray-400">#{rank}</div>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-500/30 to-yellow-600/20 border-yellow-500/50'
      case 2: return 'from-gray-400/30 to-gray-500/20 border-gray-400/50'
      case 3: return 'from-amber-600/30 to-amber-700/20 border-amber-600/50'
      default: return 'from-gray-600/20 to-gray-700/20 border-gray-600/30'
    }
  }

  const PlayerCard = ({ player, isFullCredit }: { player: Player, isFullCredit: boolean }) => {
    const rating = playerRatings[player.name] || 5.0
    const credits = isFullCredit ? rating : rating / 2

    return (
      <div className="bg-white/5 p-3 rounded-xl border border-white/10 hover:border-white/20 transition-all">
        <div className="flex items-center gap-3">
          <img
            src={getPlayerImage(player.name)}
            alt={player.name}
            onError={(e) => handleImageError(e, player.name)}
            className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
          />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm truncate">{player.name}</div>
            <div className="text-xs text-gray-400">{player.role}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-purple-400">{credits.toFixed(1)}</div>
            <div className="text-xs text-gray-500">credits</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-y-auto p-4">
      <div className="max-w-7xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <TrendingUp className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Team Analysis & Rankings
            </h1>
          </div>
          <button
            onClick={onClose}
            className="glass-effect p-3 rounded-xl hover:bg-white/10 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Analysis Overview */}
        <div className="glass-effect p-6 rounded-2xl mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400" />
            Credit System Overview
          </h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-green-400" />
                <span className="font-bold text-green-400">Playing 11 & Impact</span>
              </div>
              <p className="text-gray-300">Get full credits based on their rating</p>
            </div>
            <div className="bg-orange-500/10 p-4 rounded-xl border border-orange-500/20">
              <div className="flex items-center gap-2 mb-2">
                <UserPlus className="w-4 h-4 text-orange-400" />
                <span className="font-bold text-orange-400">Bench Players</span>
              </div>
              <p className="text-gray-300">Get half credits (50% of their rating)</p>
            </div>
            <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-purple-400">Total Score</span>
              </div>
              <p className="text-gray-300">Sum of all player credits in the squad</p>
            </div>
          </div>
        </div>

        {/* Team Rankings */}
        <div className="space-y-4">
          <AnimatePresence>
            {teamAnalysisData.map((data, index) => {
              const rank = index + 1
              const isSelected = selectedTeam === data.team.name

              return (
                <motion.div
                  key={data.team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`glass-effect p-6 rounded-2xl border-2 cursor-pointer transition-all ${getRankColor(rank)} ${
                    isSelected ? 'ring-2 ring-purple-400' : 'hover:border-white/30'
                  }`}
                  onClick={() => setSelectedTeam(isSelected ? null : data.team.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      {/* Rank */}
                      <div className="flex items-center gap-3">
                        {getRankIcon(rank)}
                        <div className="text-2xl font-bold text-gray-300">#{rank}</div>
                      </div>

                      {/* Team Info */}
                      <div className="flex items-center gap-4">
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden"
                          style={{ background: `${data.team.color}20` }}
                        >
                          <img src={data.team.logo} alt={data.team.name} className="w-14 h-14 object-contain" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold" style={{ color: data.team.color }}>
                            {data.team.name}
                          </h3>
                          <div className="flex gap-4 text-sm text-gray-400">
                            <span>Players: {data.team.players.length}</span>
                            <span>Avg Rating: {data.averageRating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Credits Breakdown */}
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-400">{data.totalCredits.toFixed(1)}</div>
                        <div className="text-sm text-gray-400">Total Credits</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-400">{data.playing11Credits.toFixed(1)}</div>
                        <div className="text-xs text-gray-400">Playing 11</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-yellow-400">{data.impactCredits.toFixed(1)}</div>
                        <div className="text-xs text-gray-400">Impact</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-orange-400">{data.benchCredits.toFixed(1)}</div>
                        <div className="text-xs text-gray-400">Bench</div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Squad View */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 pt-6 border-t border-white/10"
                      >
                        <div className="grid lg:grid-cols-3 gap-6">
                          {/* Playing 11 */}
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <Crown className="w-5 h-5 text-green-400" />
                              <h4 className="text-lg font-bold text-green-400">
                                Playing 11 ({data.squadComposition.playing11.length})
                              </h4>
                            </div>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {data.squadComposition.playing11.map(player => (
                                <PlayerCard key={player.id} player={player} isFullCredit={true} />
                              ))}
                            </div>
                          </div>

                          {/* Impact Players */}
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <Zap className="w-5 h-5 text-yellow-400" />
                              <h4 className="text-lg font-bold text-yellow-400">
                                Impact Player ({data.squadComposition.impact.length})
                              </h4>
                            </div>
                            <div className="space-y-2">
                              {data.squadComposition.impact.map(player => (
                                <PlayerCard key={player.id} player={player} isFullCredit={true} />
                              ))}
                            </div>
                          </div>

                          {/* Bench */}
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <UserPlus className="w-5 h-5 text-orange-400" />
                              <h4 className="text-lg font-bold text-orange-400">
                                Bench ({data.squadComposition.bench.length})
                              </h4>
                            </div>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {data.squadComposition.bench.map(player => (
                                <PlayerCard key={player.id} player={player} isFullCredit={false} />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Team Summary */}
                        <div className="mt-6 pt-4 border-t border-white/10">
                          <div className="grid grid-cols-4 gap-4 text-center">
                            <div className="bg-white/5 p-3 rounded-xl">
                              <div className="text-2xl font-bold text-purple-400">{data.totalCredits.toFixed(1)}</div>
                              <div className="text-sm text-gray-400">Total Credits</div>
                            </div>
                            <div className="bg-white/5 p-3 rounded-xl">
                              <div className="text-2xl font-bold text-blue-400">{data.averageRating.toFixed(1)}</div>
                              <div className="text-sm text-gray-400">Avg Rating</div>
                            </div>
                            <div className="bg-white/5 p-3 rounded-xl">
                              <div className="text-2xl font-bold text-green-400">{data.team.players.length}</div>
                              <div className="text-sm text-gray-400">Squad Size</div>
                            </div>
                            <div className="bg-white/5 p-3 rounded-xl">
                              <div className="text-2xl font-bold text-orange-400">₹{(125 - data.team.budget).toFixed(1)}Cr</div>
                              <div className="text-sm text-gray-400">Money Spent</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* No Teams Message */}
        {teamAnalysisData.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-400 mb-2">No Teams to Analyze</h2>
            <p className="text-gray-500">Teams need to have players before analysis can be performed.</p>
          </div>
        )}
      </div>
    </div>
  )
}