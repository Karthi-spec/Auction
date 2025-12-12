'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Star, ArrowRight, Globe, Crown, Zap, UserPlus } from 'lucide-react'
import { useAuctionStore } from '@/store/auctionStore'
import { Player } from '@/types'
import { getPlayerImage, handleImageError } from '@/utils/playerImage'
import { getTeamLogoUrl } from '@/utils/teamLogos'

interface SquadManagerProps {
  teamName: string
}

type SquadCategory = 'playing11' | 'impact' | 'substitutes'

interface SquadState {
  playing11: Player[]
  impact: Player[]
  substitutes: Player[]
}

export default function SquadManager({ teamName }: SquadManagerProps) {
  const { teams } = useAuctionStore()

  const team = teams.find(t => t.name === teamName)
  const teamPlayers = team?.players || []

  // Initialize squad state
  const [squad, setSquad] = useState<SquadState>({
    playing11: [],
    impact: [],
    substitutes: teamPlayers
  })

  // Calculate overseas players count
  const overseasCount = useMemo(() => {
    const allSquadPlayers = [...squad.playing11, ...squad.impact, ...squad.substitutes]
    return allSquadPlayers.filter(player => player.country !== 'India').length
  }, [squad])

  const movePlayer = (player: Player, from: SquadCategory, to: SquadCategory) => {
    if (from === to) return

    // Check total squad size limit (25 players max)
    const totalPlayers = [...squad.playing11, ...squad.impact, ...squad.substitutes].length
    if (totalPlayers >= 25) {
      alert('Squad is full! Maximum 25 players allowed in total squad.')
      return
    }

    // Check limits
    if (to === 'playing11' && squad.playing11.length >= 11) {
      alert('Playing 11 is full! Maximum 11 players allowed.')
      return
    }

    if (to === 'impact' && squad.impact.length >= 1) {
      alert('Impact player slot is full! Maximum 1 impact player allowed.')
      return
    }

    // Check overseas limit (max 4 overseas players in playing 11)
    if (to === 'playing11' && player.country !== 'India') {
      const overseasInPlaying11 = squad.playing11.filter(p => p.country !== 'India').length
      if (overseasInPlaying11 >= 4) {
        alert('Maximum 4 overseas players allowed in Playing 11!')
        return
      }
    }

    // Check total overseas limit (max 8 overseas players in squad)
    if (player.country !== 'India') {
      const totalOverseas = [...squad.playing11, ...squad.impact, ...squad.substitutes]
        .filter(p => p.country !== 'India').length
      if (totalOverseas >= 8) {
        alert('Maximum 8 overseas players allowed in total squad!')
        return
      }
    }

    setSquad(prev => ({
      ...prev,
      [from]: prev[from].filter(p => p.id !== player.id),
      [to]: [...prev[to], player]
    }))
  }

  const getPlayersByRole = (players: Player[]) => {
    const roles = {
      'Wicket-Keeper': players.filter(p => p.role === 'Wicket-Keeper'),
      'Batsman': players.filter(p => p.role === 'Batsman'),
      'All-Rounder': players.filter(p => p.role === 'All-Rounder'),
      'Bowler': players.filter(p => p.role === 'Bowler')
    }
    return roles
  }

  const PlayerCard = ({ player, category, showMoveButtons = true }: {
    player: Player,
    category: SquadCategory,
    showMoveButtons?: boolean
  }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="glass-effect p-3 rounded-xl border border-white/10 hover:border-white/20 transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={getPlayerImage(player.name)}
            alt={player.name}
            onError={(e) => handleImageError(e, player.name)}
            className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
          />
          {player.country !== 'India' && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <Globe className="w-2 h-2 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm truncate">{player.name}</div>
          <div className="text-xs text-gray-400">{player.role}</div>
          <div className="text-xs text-gray-500">{player.country}</div>
        </div>

        {showMoveButtons && (
          <div className="flex flex-col gap-1">
            {category !== 'playing11' && squad.playing11.length < 11 && (
              <button
                onClick={() => movePlayer(player, category, 'playing11')}
                className="bg-green-500/20 hover:bg-green-500/30 p-1 rounded text-xs flex items-center gap-1"
                title="Add to Playing 11"
              >
                <Crown className="w-3 h-3" />
              </button>
            )}
            {category !== 'impact' && squad.impact.length < 5 && (
              <button
                onClick={() => movePlayer(player, category, 'impact')}
                className="bg-yellow-500/20 hover:bg-yellow-500/30 p-1 rounded text-xs flex items-center gap-1"
                title="Add to Impact Players"
              >
                <Zap className="w-3 h-3" />
              </button>
            )}
            {category !== 'substitutes' && (
              <button
                onClick={() => movePlayer(player, category, 'substitutes')}
                className="bg-gray-500/20 hover:bg-gray-500/30 p-1 rounded text-xs flex items-center gap-1"
                title="Move to Substitutes"
              >
                <UserPlus className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )

  if (!team) {
    return (
      <div className="glass-effect p-6 rounded-2xl text-center">
        <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-400">No team selected</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Squad Header */}
      <div className="glass-effect p-6 rounded-2xl">
        <div className="flex items-center gap-4 mb-4">
          <img src={getTeamLogoUrl(team.name)} alt={team.name} className="w-16 h-16 object-contain" />
          <div>
            <h2 className="text-2xl font-bold">{team.name}</h2>
            <p className="text-gray-400">Squad Management</p>
          </div>
        </div>

        {/* Squad Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${squad.playing11.length === 11 ? 'text-green-400' :
                squad.playing11.length > 8 ? 'text-yellow-400' : 'text-gray-400'
              }`}>
              {squad.playing11.length}/11
            </div>
            <div className="text-xs text-gray-400">Playing 11</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${squad.impact.length === 1 ? 'text-yellow-400' : 'text-gray-400'
              }`}>
              {squad.impact.length}/1
            </div>
            <div className="text-xs text-gray-400">Impact Player</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${overseasCount >= 8 ? 'text-red-400' :
                overseasCount >= 6 ? 'text-orange-400' :
                  overseasCount >= 4 ? 'text-yellow-400' : 'text-blue-400'
              }`}>
              {overseasCount}/8
            </div>
            <div className="text-xs text-gray-400">Overseas</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${teamPlayers.length >= 25 ? 'text-red-400' :
                teamPlayers.length >= 20 ? 'text-orange-400' :
                  teamPlayers.length >= 15 ? 'text-yellow-400' : 'text-purple-400'
              }`}>
              {teamPlayers.length}/25
            </div>
            <div className="text-xs text-gray-400">Total Squad</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{squad.substitutes.length}</div>
            <div className="text-xs text-gray-400">Bench Players</div>
          </div>
        </div>

        {/* Squad Composition Summary */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-white/5 p-4 rounded-xl">
            <h4 className="text-sm font-bold text-gray-300 mb-3">Squad Composition</h4>
            <div className="space-y-2 text-sm">
              {Object.entries(getPlayersByRole([...squad.playing11, ...squad.impact, ...squad.substitutes])).map(([role, players]) => (
                <div key={role} className="flex justify-between">
                  <span className="text-gray-400">{role}s:</span>
                  <span className="text-white font-bold">{players.length}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-xl">
            <h4 className="text-sm font-bold text-gray-300 mb-3">Squad Limits</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Playing 11:</span>
                <span className={`font-bold ${squad.playing11.length === 11 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {squad.playing11.length}/11
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Impact Player:</span>
                <span className={`font-bold ${squad.impact.length === 1 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {squad.impact.length}/1
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Overseas (Playing 11):</span>
                <span className={`font-bold ${squad.playing11.filter(p => p.country !== 'India').length > 4 ? 'text-red-400' : 'text-green-400'
                  }`}>
                  {squad.playing11.filter(p => p.country !== 'India').length}/4
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Squad:</span>
                <span className={`font-bold ${teamPlayers.length >= 25 ? 'text-red-400' : 'text-green-400'}`}>
                  {teamPlayers.length}/25
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Playing 11 */}
      <div className="glass-effect p-6 rounded-2xl border-2 border-green-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-green-400" />
            <h3 className="text-xl font-bold text-green-400">Playing 11 ({squad.playing11.length}/11)</h3>
          </div>
          {squad.playing11.length > 0 && (
            <div className="text-sm text-gray-400">
              Overseas: {squad.playing11.filter(p => p.country !== 'India').length}/4
            </div>
          )}
        </div>

        {squad.playing11.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No players in Playing 11</p>
            <p className="text-sm">Add players from your squad below</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Role-wise organization */}
            {Object.entries(getPlayersByRole(squad.playing11)).map(([role, players]) =>
              players.length > 0 && (
                <div key={role}>
                  <div className="text-sm font-bold text-gray-300 mb-2">{role}s ({players.length})</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <AnimatePresence>
                      {players.map(player => (
                        <PlayerCard key={player.id} player={player} category="playing11" />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Impact Players */}
      <div className="glass-effect p-6 rounded-2xl border-2 border-yellow-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h3 className="text-xl font-bold text-yellow-400">Impact Player ({squad.impact.length}/1)</h3>
          </div>
          <div className="text-xs text-gray-400 text-right">
            <div>Can substitute during match</div>
            <div>Strategic game changer</div>
          </div>
        </div>

        {squad.impact.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No impact player selected</p>
            <p className="text-sm">Choose 1 strategic substitute</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence>
              {squad.impact.map(player => (
                <PlayerCard key={player.id} player={player} category="impact" />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Substitutes/Bench */}
      <div className="glass-effect p-6 rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-5 h-5 text-gray-400" />
          <h3 className="text-xl font-bold text-gray-400">Squad Players ({squad.substitutes.length})</h3>
        </div>

        {squad.substitutes.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>All players assigned to Playing 11 or Impact</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence>
              {squad.substitutes.map(player => (
                <PlayerCard key={player.id} player={player} category="substitutes" />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}