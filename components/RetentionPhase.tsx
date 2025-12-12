'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, ArrowLeft, Check, X, Users, Crown, Search } from 'lucide-react'
import { useAuctionStore } from '@/store/auctionStore'
import { getPlayerImage, handleImageError } from '@/utils/playerImage'
import { getTeamLogoUrl } from '@/utils/teamLogos'


interface RetentionPhaseProps {
  onBack: () => void
  userRole?: 'admin' | 'team'
  userTeam?: string
}

export default function RetentionPhase({ onBack, userRole = 'admin', userTeam }: RetentionPhaseProps) {
  const {
    teams,
    players,
    maxRetentions,
    retainPlayer,
    completeRetentionPhase,
    teamRetentionStatus,
    confirmTeamRetentions,
    undoRetention
  } = useAuctionStore()

  const [selectedTeam, setSelectedTeam] = useState<string>(userTeam || '')
  const [retentionPrices, setRetentionPrices] = useState<{ [key: string]: string }>({})
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false)
  const [playerToRetain, setPlayerToRetain] = useState<{ player: any; team: string; price: number } | null>(null)
  const [showRetentionAnimation, setShowRetentionAnimation] = useState<boolean>(false)
  const [retentionAnimationData, setRetentionAnimationData] = useState<{ player: any; team: any; price: number } | null>(null)

  // Get selected team object for theming
  const selectedTeamObj = teams.find(t => t.name === selectedTeam)

  // Get all available players in the pool (for retention selection)
  const getAvailablePlayersForRetention = () => {
    return players.filter(p => p.status === 'available')
      .filter(p =>
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.set?.toLowerCase().includes(searchQuery.toLowerCase())
      )
  }

  // Get already retained players for a team
  const getRetainedPlayers = (teamName: string) => {
    return players.filter(p =>
      p.status === 'retained' &&
      p.previousTeam === teamName
    )
  }

  const handleRetainPlayer = (player: any, teamName: string) => {
    const price = parseFloat(retentionPrices[player.name] || '0')
    if (price > 0) {
      setPlayerToRetain({ player, team: teamName, price })
      setShowConfirmModal(true)
    }
  }

  const confirmRetention = () => {
    if (playerToRetain) {
      const team = teams.find(t => t.name === playerToRetain.team)

      // Set animation data
      setRetentionAnimationData({
        player: playerToRetain.player,
        team: team,
        price: playerToRetain.price
      })

      // Direct retention for all users - show animation first, then retain
      setShowRetentionAnimation(true)

      // Retain player after animation completes
      setTimeout(() => {
        retainPlayer(playerToRetain.team, playerToRetain.player.name, playerToRetain.price)
        setShowRetentionAnimation(false)
        setRetentionAnimationData(null)
      }, 3000)

      setRetentionPrices(prev => ({ ...prev, [playerToRetain.player.name]: '' }))
      setShowConfirmModal(false)
      setPlayerToRetain(null)
    }
  }

  const canCompleteRetention = () => {
    // Only admin can complete retention phase
    if (userRole !== 'admin') return false

    // All teams must have confirmed their retentions
    return teams.every(team =>
      teamRetentionStatus[team.name] === 'confirmed' ||
      teamRetentionStatus[team.name] === 'completed'
    )
  }

  const canConfirmTeam = (teamName: string) => {
    // Team can confirm anytime if status is pending
    return teamRetentionStatus[teamName] === 'pending'
  }



  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between mb-8"
      >
        <button
          onClick={onBack}
          className="glass-effect px-6 py-3 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Centered Team Logo and Title */}
        <div className="flex flex-col items-center gap-4">
          {selectedTeamObj && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="relative"
            >
              {/* Animated ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-4 opacity-60"
                style={{
                  borderColor: selectedTeamObj.color,
                  transform: 'scale(1.3)'
                }}
              />

              {/* Team logo */}
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center border-4 relative z-10"
                style={{
                  borderColor: selectedTeamObj.color,
                  background: `linear-gradient(135deg, ${selectedTeamObj.color}20, ${selectedTeamObj.color}40)`,
                  boxShadow: `0 0 30px ${selectedTeamObj.color}60`
                }}
              >
                <img
                  src={getTeamLogoUrl(selectedTeamObj.name)}
                  alt={selectedTeamObj.name}
                  className="w-16 h-16 object-contain"
                />
              </div>
            </motion.div>
          )}

          <div className="text-center">
            <div className="flex items-center gap-3 justify-center mb-2">
              <Heart className="w-8 h-8" style={{ color: selectedTeamObj?.color || '#A855F7' }} />
              <h1
                className="text-4xl font-bold"
                style={{ color: selectedTeamObj?.color || '#A855F7' }}
              >
                RETENTION PHASE
              </h1>
            </div>
            {selectedTeamObj && (
              <div
                className="text-xl font-bold"
                style={{ color: selectedTeamObj.color }}
              >
                {selectedTeamObj.name}
              </div>
            )}
          </div>
        </div>

        {canCompleteRetention() && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              completeRetentionPhase()
              // Show success message or redirect
              setTimeout(() => {
                onBack() // Go back to landing page so admin can start auction
              }, 1000)
            }}
            className="bg-green-500/20 hover:bg-green-500/30 border-2 border-green-500/50 px-8 py-4 rounded-xl font-bold text-xl flex items-center gap-3"
          >
            <Check className="w-6 h-6" />
            Start Auction
          </motion.button>
        )}
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect p-6 rounded-2xl mb-8 text-center"
      >
        <h2 className="text-2xl font-bold mb-4">Retention Instructions</h2>
        <p className="text-gray-300 text-lg">
          Each team can retain up to <span className="text-purple-400 font-bold">{maxRetentions} players</span> from their previous squad.
          <br />
          Unused retention slots will become <span className="text-blue-400 font-bold">RTM (Right to Match)</span> cards for the auction.
        </p>
      </motion.div>

      {/* Team Selection */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {teams
          .filter(team => userRole === 'admin' || team.name === userTeam)
          .map((team) => {
            const retainedCount = getRetainedPlayers(team.name).length
            const isDisabled = userRole === 'team' && team.name !== userTeam

            return (
              <motion.button
                key={team.id}
                whileHover={!isDisabled ? { scale: 1.05 } : {}}
                whileTap={!isDisabled ? { scale: 0.95 } : {}}
                onClick={() => !isDisabled && setSelectedTeam(team.name)}
                disabled={isDisabled}
                className={`p-4 rounded-xl border-2 transition-all ${selectedTeam === team.name
                    ? `bg-opacity-20`
                    : isDisabled
                      ? 'border-gray-600 bg-gray-800/20 opacity-50 cursor-not-allowed'
                      : 'border-white/20 hover:border-opacity-50'
                  }`}
                style={{
                  borderColor: selectedTeam === team.name
                    ? team.color
                    : isDisabled
                      ? '#4B5563'
                      : 'rgba(255, 255, 255, 0.2)',
                  backgroundColor: selectedTeam === team.name
                    ? `${team.color}20`
                    : isDisabled
                      ? 'rgba(31, 41, 55, 0.2)'
                      : 'transparent',
                  boxShadow: selectedTeam === team.name
                    ? `0 0 20px ${team.color}40`
                    : 'none'
                }}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <img
                      src={getTeamLogoUrl(team.name)}
                      alt={team.name}
                      className="w-12 h-12 object-contain"
                    />
                    {teamRetentionStatus[team.name] === 'confirmed' && (
                      <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-bold">{team.name}</div>
                  <div className="text-xs text-gray-400">
                    {retainedCount}/{maxRetentions} retained
                  </div>
                  {teamRetentionStatus[team.name] === 'confirmed' && (
                    <div className="text-xs text-green-400">
                      ✓ Confirmed
                    </div>
                  )}
                  {teamRetentionStatus[team.name] === 'pending' && (
                    <div className="text-xs text-orange-400">
                      Ready to confirm
                    </div>
                  )}
                </div>
              </motion.button>
            )
          })}
      </div>

      {/* Selected Team's Players */}
      {selectedTeam && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect p-6 rounded-2xl border-2"
          style={{
            borderColor: selectedTeamObj?.color || 'rgba(255, 255, 255, 0.1)',
            boxShadow: selectedTeamObj ? `0 0 30px ${selectedTeamObj.color}20` : 'none'
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <img
              src={getTeamLogoUrl(selectedTeam)}
              alt={selectedTeam}
              className="w-8 h-8 object-contain"
            />
            <h3
              className="text-2xl font-bold"
              style={{ color: selectedTeamObj?.color || '#ffffff' }}
            >
              {selectedTeam} - Retention Decisions
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Player Pool for Retention */}
            <div>
              <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Player Pool
              </h4>

              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search players..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {getAvailablePlayersForRetention().map((player) => {
                  const team = teams.find(t => t.name === selectedTeam)
                  const canRetain = team && team.retentionsUsed < maxRetentions

                  return (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white/5 p-4 rounded-xl border border-white/10"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-600 to-purple-700 flex-shrink-0">
                          <img
                            src={getPlayerImage(player.name)}
                            alt={player.name}
                            className="w-full h-full object-cover"
                            onError={(e) => handleImageError(e, player.name)}
                          />
                        </div>

                        <div className="flex-1">
                          <div className="font-bold">{player.name}</div>
                          <div className="text-sm text-gray-400">
                            {player.role} • {player.country}
                          </div>
                          <div className="text-xs text-gray-500">
                            {player.set} • Base: ₹{player.basePrice}Cr
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.25"
                            min="0.25"
                            placeholder="Price (Cr)"
                            value={retentionPrices[player.name] || ''}
                            onChange={(e) => setRetentionPrices(prev => ({
                              ...prev,
                              [player.name]: e.target.value
                            }))}
                            className="w-24 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-sm"
                            disabled={!canRetain}
                          />
                          <button
                            onClick={() => handleRetainPlayer(player, selectedTeam)}
                            disabled={!canRetain || !retentionPrices[player.name] || parseFloat(retentionPrices[player.name]) <= 0}
                            className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 px-3 py-1 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Retain
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}

                {getAvailablePlayersForRetention().length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No players found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Already Retained */}
            <div>
              <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-green-400" />
                Retained Players
              </h4>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {getRetainedPlayers(selectedTeam).map((player) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-green-500/10 p-4 rounded-xl border border-green-500/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-green-600 to-green-700 flex-shrink-0">
                        <img
                          src={getPlayerImage(player.name)}
                          alt={player.name}
                          className="w-full h-full object-cover"
                          onError={(e) => handleImageError(e, player.name)}
                        />
                      </div>

                      <div className="flex-1">
                        <div className="font-bold">{player.name}</div>
                        <div className="text-sm text-gray-400">
                          {player.role} • {player.country}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-gray-400">Retained for</div>
                        <div className="text-lg font-bold text-green-400">
                          ₹{player.retainedAmount?.toFixed(2)}Cr
                        </div>
                      </div>

                      {/* Undo Retention Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => undoRetention(selectedTeam, player.name)}
                        className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 p-2 rounded-lg text-red-400 hover:text-red-300 transition-all"
                        title="Undo Retention"
                      >
                        <motion.div
                          animate={{ rotate: [0, -15, 15, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                        >
                          ↶
                        </motion.div>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}

                {getRetainedPlayers(selectedTeam).length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Crown className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No players retained yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Team Summary */}
          <div className="mt-6 p-4 bg-white/5 rounded-xl">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {getRetainedPlayers(selectedTeam).length}
                </div>
                <div className="text-sm text-gray-400">Players Retained</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">
                  {maxRetentions - getRetainedPlayers(selectedTeam).length}
                </div>
                <div className="text-sm text-gray-400">RTM Cards Available</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  ₹{teams.find(t => t.name === selectedTeam)?.budget.toFixed(2)}Cr
                </div>
                <div className="text-sm text-gray-400">Remaining Budget</div>
              </div>
            </div>

            {/* Team Confirmation Button */}
            {userRole === 'team' && selectedTeam && (
              <div className="mt-6 text-center">
                {teamRetentionStatus[selectedTeam] === 'pending' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => confirmTeamRetentions(selectedTeam)}
                    disabled={!canConfirmTeam(selectedTeam)}
                    className="bg-green-500/20 hover:bg-green-500/30 border-2 border-green-500/50 px-8 py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ✓ Confirm Team Retentions
                  </motion.button>
                )}
                {teamRetentionStatus[selectedTeam] === 'confirmed' && (
                  <div className="bg-green-500/20 border-2 border-green-500/50 px-8 py-4 rounded-xl font-bold text-lg text-green-400">
                    ✓ Team Retentions Confirmed
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Admin Team Status Overview */}
      {userRole === 'admin' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect p-6 rounded-2xl mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-400" />
              Team Confirmation Status
            </h3>
            <div className="flex items-center gap-3">
              <div className="text-lg font-bold">
                <span className="text-green-400">
                  {teams.filter(team => teamRetentionStatus[team.name] === 'confirmed').length}
                </span>
                <span className="text-gray-400">/{teams.length}</span>
              </div>
              <div className="text-sm text-gray-400">Teams Confirmed</div>
              {canCompleteRetention() && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold"
                >
                  READY!
                </motion.div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            {teams.map((team) => {
              const status = teamRetentionStatus[team.name] || 'pending'
              const retainedCount = getRetainedPlayers(team.name).length

              return (
                <div
                  key={team.id}
                  className={`p-4 rounded-xl border-2 ${status === 'confirmed'
                      ? 'border-green-400 bg-green-500/10'
                      : 'border-gray-400 bg-gray-500/10'
                    }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                      <img
                        src={getTeamLogoUrl(team.name)}
                        alt={team.name}
                        className="w-10 h-10 object-contain"
                      />
                      {status === 'confirmed' && (
                        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-4 h-4 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-bold text-center">{team.name}</div>
                    <div className="text-xs text-gray-400">
                      {retainedCount} retained
                    </div>
                    <div className={`text-xs font-bold ${status === 'confirmed'
                        ? 'text-green-400'
                        : 'text-gray-400'
                      }`}>
                      {status === 'confirmed'
                        ? '✓ Confirmed'
                        : 'Pending'
                      }
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}



      {/* Confirmed Teams Retentions Display */}
      {userRole === 'admin' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect p-6 rounded-2xl mb-8"
        >
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Crown className="w-6 h-6 text-purple-400" />
            Confirmed Team Retentions
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams
              .filter(team => teamRetentionStatus[team.name] === 'confirmed')
              .map((team) => {
                const retainedPlayers = getRetainedPlayers(team.name)

                return (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border-2 rounded-xl p-4"
                    style={{
                      borderColor: team.color,
                      background: `${team.color}10`,
                      boxShadow: `0 0 20px ${team.color}20`
                    }}
                  >
                    {/* Team Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={getTeamLogoUrl(team.name)}
                        alt={team.name}
                        className="w-8 h-8 object-contain"
                      />
                      <div className="flex-1">
                        <div
                          className="font-bold text-lg"
                          style={{ color: team.color }}
                        >
                          {team.name}
                        </div>
                        <div className="text-sm text-gray-400">
                          {retainedPlayers.length} players retained
                        </div>
                      </div>
                      <div className="bg-green-500 rounded-full p-1">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    {/* Retained Players List */}
                    <div className="space-y-3">
                      {retainedPlayers.length > 0 ? (
                        retainedPlayers.map((player) => (
                          <div
                            key={player.id}
                            className="flex items-center gap-3 p-3 rounded-lg"
                            style={{ background: `${team.color}15` }}
                          >
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-600 to-purple-700 flex-shrink-0">
                              <img
                                src={getPlayerImage(player.name)}
                                alt={player.name}
                                className="w-full h-full object-cover"
                                onError={(e) => handleImageError(e, player.name)}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-sm">{player.name}</div>
                              <div className="text-xs text-gray-400">
                                {player.role} • {player.country}
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className="font-bold text-sm"
                                style={{ color: team.color }}
                              >
                                ₹{player.retainedAmount?.toFixed(2)}Cr
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-400">
                          <Crown className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No players retained</p>
                        </div>
                      )}
                    </div>

                    {/* Team Summary */}
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div
                            className="text-lg font-bold"
                            style={{ color: team.color }}
                          >
                            {maxRetentions - retainedPlayers.length}
                          </div>
                          <div className="text-xs text-gray-400">RTM Available</div>
                        </div>
                        <div>
                          <div
                            className="text-lg font-bold"
                            style={{ color: team.color }}
                          >
                            ₹{team.budget.toFixed(1)}Cr
                          </div>
                          <div className="text-xs text-gray-400">Budget Left</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
          </div>

          {/* Summary Stats */}
          {teams.filter(team => teamRetentionStatus[team.name] === 'confirmed').length > 0 && (
            <div className="mt-6 p-4 bg-white/5 rounded-xl">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {teams.filter(team => teamRetentionStatus[team.name] === 'confirmed').length}
                  </div>
                  <div className="text-sm text-gray-400">Teams Confirmed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">
                    {teams
                      .filter(team => teamRetentionStatus[team.name] === 'confirmed')
                      .reduce((total, team) => total + getRetainedPlayers(team.name).length, 0)
                    }
                  </div>
                  <div className="text-sm text-gray-400">Total Retentions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">
                    {teams
                      .filter(team => teamRetentionStatus[team.name] === 'confirmed')
                      .reduce((total, team) => total + (maxRetentions - getRetainedPlayers(team.name).length), 0)
                    }
                  </div>
                  <div className="text-sm text-gray-400">Total RTM Cards</div>
                </div>
              </div>
            </div>
          )}

          {/* Start Auction Button - When All Teams Confirmed */}
          {canCompleteRetention() && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-8"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  completeRetentionPhase()
                  setTimeout(() => {
                    onBack()
                  }, 1000)
                }}
                className="bg-gradient-to-r from-green-500/30 to-blue-500/30 hover:from-green-500/40 hover:to-blue-500/40 border-2 border-green-500/50 px-12 py-6 rounded-2xl font-black text-2xl flex items-center gap-4 mx-auto"
                style={{
                  boxShadow: '0 0 40px rgba(34, 197, 94, 0.4), 0 20px 60px rgba(0, 0, 0, 0.3)'
                }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Check className="w-8 h-8" />
                </motion.div>
                🚀 START AUCTION 🚀
              </motion.button>
              <p className="text-gray-300 mt-4 text-lg">
                All teams have confirmed their retentions. Ready to begin the auction!
              </p>
            </motion.div>
          )}

          {/* No Confirmed Teams Message */}
          {teams.filter(team => teamRetentionStatus[team.name] === 'confirmed').length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Crown className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl">No teams have confirmed their retentions yet</p>
              <p className="text-sm mt-2">Teams must confirm their retention decisions to appear here</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && playerToRetain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-effect p-8 rounded-3xl max-w-md w-full"
          >
            <div className="text-center mb-6">
              <Heart className="w-16 h-16 mx-auto mb-4 text-purple-400" />
              <h2 className="text-2xl font-bold mb-2">Confirm Retention</h2>
              <p className="text-gray-300">
                Are you sure you want to retain this player?
              </p>
            </div>

            {/* Player Details */}
            <div className="bg-white/5 p-4 rounded-xl mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-600 to-purple-700 flex-shrink-0">
                  <img
                    src={getPlayerImage(playerToRetain.player.name)}
                    alt={playerToRetain.player.name}
                    className="w-full h-full object-cover"
                    onError={(e) => handleImageError(e, playerToRetain.player.name)}
                  />
                </div>
                <div className="flex-1">
                  <div className="text-xl font-bold">{playerToRetain.player.name}</div>
                  <div className="text-sm text-gray-400">
                    {playerToRetain.player.role} • {playerToRetain.player.country}
                  </div>
                  <div className="text-lg font-bold text-purple-400 mt-1">
                    ₹{playerToRetain.price.toFixed(2)}Cr
                  </div>
                </div>
              </div>
            </div>

            {/* Team Info */}
            <div className="bg-white/5 p-4 rounded-xl mb-6">
              <div className="flex items-center gap-3">
                <img
                  src={teams.find(t => t.name === playerToRetain.team)?.logo}
                  alt={playerToRetain.team}
                  className="w-8 h-8 object-contain"
                />
                <div>
                  <div className="text-sm text-gray-400">Retaining for</div>
                  <div className="font-bold">{playerToRetain.team}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setShowConfirmModal(false)
                  setPlayerToRetain(null)
                }}
                className="glass-effect p-3 rounded-xl hover:bg-white/10 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={confirmRetention}
                className="bg-purple-500/20 hover:bg-purple-500/30 border-2 border-purple-500/50 p-3 rounded-xl font-bold"
              >
                Confirm Retention
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Retention Animation */}
      {showRetentionAnimation && retentionAnimationData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="text-center"
          >
            {/* Team Logo with Animation */}
            <motion.div
              initial={{ scale: 0, rotate: -360 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, type: "spring", bounce: 0.6 }}
              className="relative mb-8"
            >
              {/* Pulsing rings */}
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.8, 0.2, 0.8]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-8"
                style={{
                  borderColor: retentionAnimationData.team?.color || '#A855F7',
                  transform: 'scale(2)'
                }}
              />

              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.6, 0.1, 0.6]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="absolute inset-0 rounded-full border-8"
                style={{
                  borderColor: retentionAnimationData.team?.color || '#A855F7',
                  transform: 'scale(1.5)'
                }}
              />

              {/* Team Logo */}
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center border-8 relative z-10"
                style={{
                  borderColor: retentionAnimationData.team?.color || '#A855F7',
                  background: `linear-gradient(135deg, ${retentionAnimationData.team?.color || '#A855F7'}40, ${retentionAnimationData.team?.color || '#A855F7'}20)`,
                  boxShadow: `0 0 60px ${retentionAnimationData.team?.color || '#A855F7'}80`
                }}
              >
                <img
                  src={retentionAnimationData.team?.logo}
                  alt={retentionAnimationData.team?.name}
                  className="w-20 h-20 object-contain"
                />
              </div>
            </motion.div>

            {/* Player Image */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mb-6"
            >
              <div
                className="w-40 h-40 rounded-full overflow-hidden mx-auto border-8"
                style={{
                  borderColor: retentionAnimationData.team?.color || '#A855F7',
                  boxShadow: `0 0 40px ${retentionAnimationData.team?.color || '#A855F7'}60`
                }}
              >
                <img
                  src={getPlayerImage(retentionAnimationData.player.name)}
                  alt={retentionAnimationData.player.name}
                  className="w-full h-full object-cover"
                  onError={(e) => handleImageError(e, retentionAnimationData.player.name)}
                />
              </div>
            </motion.div>

            {/* Text Animation */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="text-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl font-black mb-4"
                style={{
                  color: retentionAnimationData.team?.color || '#A855F7',
                  textShadow: `0 0 30px ${retentionAnimationData.team?.color || '#A855F7'}60`
                }}
              >
                {userRole === 'admin' ? 'RETAINED!' : 'SUBMITTED!'}
              </motion.div>

              <div className="text-4xl font-bold text-white mb-2">
                {retentionAnimationData.player.name}
              </div>

              <div className="text-2xl text-gray-300 mb-4">
                {retentionAnimationData.team?.name}
              </div>

              <div
                className="text-3xl font-black"
                style={{ color: retentionAnimationData.team?.color || '#A855F7' }}
              >
                ₹{retentionAnimationData.price.toFixed(2)}Cr
              </div>

              {userRole !== 'admin' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="mt-4 text-yellow-400 text-lg"
                >
                  Waiting for admin approval...
                </motion.div>
              )}
            </motion.div>

            {/* Floating particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: 0,
                  y: 0,
                  scale: 0,
                  opacity: 0
                }}
                animate={{
                  x: Math.cos(i * 45 * Math.PI / 180) * 200,
                  y: Math.sin(i * 45 * Math.PI / 180) * 200,
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  delay: 1.2 + i * 0.1,
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className="absolute w-4 h-4 rounded-full"
                style={{
                  background: retentionAnimationData.team?.color || '#A855F7',
                  left: '50%',
                  top: '50%'
                }}
              />
            ))}
          </motion.div>
        </div>
      )}


    </div>
  )
}