'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, Pause, SkipForward, Plus, Settings, Gavel, Shield, Heart, Users, List, X, Check, TrendingUp } from 'lucide-react'
import { useAuctionStore } from '@/store/auctionStore'
// Removed connection-related imports for frontend-only version

import SoldAnimation from './SoldAnimation'
import RTMAnimation from './RTMAnimation'
import RetainedAnimation from './RetainedAnimation'
import UnsoldAnimation from './UnsoldAnimation'
// Removed ConnectedTeamsMonitor for frontend-only version
import EndAuctionModal from './EndAuctionModal'
import TeamAnalysis from './TeamAnalysis'
import AuctionTimer from './AuctionTimer'
import { audioManager } from '@/utils/audioManager'

import SquadsView from './SquadsView'
import AuctionPool from './AuctionPool'
import AddPlayerModal from './AddPlayerModal'
import { getPlayerImage, handleImageError } from '@/utils/playerImage'

interface AdminPanelProps {
  onBack: () => void
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const { 
    currentPlayer, 
    players, 
    teams, 
    isAuctionActive,
    startAuction,
    pauseAuction,
    nextPlayer,
    addPlayer,
    addTeam,
    useRTM,
    pendingActions,
    approvePendingAction,
    rejectPendingAction,
    retentionPhaseActive,
    retentionPhaseComplete,
    limitsConfigured,
    startRetentionPhase,
    teamRetentionStatus,
    completeRetentionPhase,
    resetAuction,
    bringBackUnsoldPlayer
  } = useAuctionStore()

  // Removed connection-related hooks for frontend-only version

  const [showAddPlayer, setShowAddPlayer] = useState(false)
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [showManualAddPlayer, setShowManualAddPlayer] = useState(false)

  const [showRTMTeamSelect, setShowRTMTeamSelect] = useState(false)

  const [selectedRTMTeam, setSelectedRTMTeam] = useState<string>('')

  const [rtmPrice, setRTMPrice] = useState('')

  const [showRTMPriceInput, setShowRTMPriceInput] = useState(false)

  const [showSquads, setShowSquads] = useState(false)
  const [showAuctionPool, setShowAuctionPool] = useState(false)
  const [showRetainedPlayers, setShowRetainedPlayers] = useState(false)
  const [playerSearch, setPlayerSearch] = useState('')
  const [showPendingRequests, setShowPendingRequests] = useState(false)
  const [showAuctionConfig, setShowAuctionConfig] = useState(false)
  const [maxRetentions, setMaxRetentions] = useState(6)
  const [maxRTM, setMaxRTM] = useState(1)
  // Removed connected teams state for frontend-only version
  const [showEndAuctionModal, setShowEndAuctionModal] = useState(false)
  const [showTeamAnalysis, setShowTeamAnalysis] = useState(false)
  const [showUnsoldPlayers, setShowUnsoldPlayers] = useState(false)

  const handleSetCurrentPlayer = (player: any) => {
    useAuctionStore.setState({ currentPlayer: player })
    setShowAddPlayer(false)
    setPlayerSearch('')
  }

  const handleSold = () => {
    if (currentPlayer?.currentBidder) {
      const team = teams.find(t => t.name === currentPlayer.currentBidder)
      if (team) {
        // Animation and next player are handled automatically by the store
        useAuctionStore.getState().sellPlayer(team.name, currentPlayer.currentBid)
      }
    }
  }

  const handleRTMTeamSelect = (teamName: string) => {
    setSelectedRTMTeam(teamName)
    setShowRTMTeamSelect(false)
    setShowRTMPriceInput(true)
    setRTMPrice(currentPlayer?.currentBid.toString() || '')
  }

  const handleRTMConfirm = () => {
    if (currentPlayer && selectedRTMTeam && rtmPrice) {
      const team = teams.find(t => t.name === selectedRTMTeam)
      const amount = parseFloat(rtmPrice)
      if (team && team.rtmAvailable > 0 && amount > 0) {
        // Animation and next player are handled automatically by the store
        useAuctionStore.getState().sellPlayerWithRTM(selectedRTMTeam, amount)
        setShowRTMPriceInput(false)
        setRTMPrice('')
        setSelectedRTMTeam('')
      }
    }
  }



  const handleUnsold = () => {
    if (currentPlayer) {
      // Animation and next player are handled automatically by the store
      useAuctionStore.getState().markUnsold()
    }
  }

  const handleEndAuction = () => {
    resetAuction()
    // Connection reset removed for frontend-only version
    // Redirect to landing page after reset
    setTimeout(() => {
      onBack()
    }, 500)
  }

  return (
    <>
      {/* End Auction Modal */}
      <EndAuctionModal
        isOpen={showEndAuctionModal}
        onClose={() => setShowEndAuctionModal(false)}
        onConfirm={handleEndAuction}
      />

      {/* Squads View */}
      {showSquads && <SquadsView onClose={() => setShowSquads(false)} />}

      {/* Auction Pool */}
      {showAuctionPool && <AuctionPool onClose={() => setShowAuctionPool(false)} />}

      {/* Retained Players Modal */}
      {showRetainedPlayers && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-y-auto p-4">
          <div className="max-w-6xl mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                Retained Players
              </h1>
              <button
                onClick={() => setShowRetainedPlayers(false)}
                className="glass-effect p-3 rounded-xl hover:bg-white/10 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {teams
                .filter(team => team.players.some(p => p.status === 'retained'))
                .map((team, idx) => {
                  const retainedPlayers = team.players.filter(p => p.status === 'retained')
                  const totalSpent = retainedPlayers.reduce((sum, p) => sum + (p.retainedAmount || 0), 0)
                  
                  return (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="glass-effect p-6 rounded-2xl"
                      style={{ borderLeft: `4px solid ${team.color}` }}
                    >
                      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden"
                          style={{ background: `${team.color}20` }}
                        >
                          <img src={team.logo} alt={team.name} className="w-14 h-14 object-contain" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold" style={{ color: team.color }}>
                            {team.name}
                          </h2>
                          <div className="flex gap-4 mt-1 text-sm">
                            <span className="text-gray-400">
                              Retained: <span className="text-purple-400 font-bold">{retainedPlayers.length}</span>
                            </span>
                            <span className="text-gray-400">
                              Spent: <span className="text-gold-400 font-bold">₹{totalSpent.toFixed(2)}Cr</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {retainedPlayers.map((player, pIdx) => (
                          <motion.div
                            key={player.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: pIdx * 0.05 }}
                            className="bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-purple-600 flex-shrink-0">
                                  <img
                                    src={getPlayerImage(player.name)}
                                    alt={player.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => handleImageError(e, player.name)}
                                  />
                                </div>
                                <div>
                                  <div className="font-bold text-lg flex items-center gap-2">
                                    {player.name}
                                    <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full text-xs">
                                      <img 
                                        src="/retain-card.svg" 
                                        alt="RETAIN"
                                        className="w-4 h-2.5 object-contain"
                                      />
                                      RETAINED
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-400">
                                    {player.role} • {player.country}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-purple-400">
                                  ₹{(player.retainedAmount || 0).toFixed(2)}Cr
                                </div>
                                <div className="text-xs text-gray-400">
                                  Retention
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )
                })}
            </div>

            {teams.filter(team => team.players.some(p => p.status === 'retained')).length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">👑</div>
                <h2 className="text-2xl font-bold text-gray-400 mb-2">No Retained Players Yet</h2>
                <p className="text-gray-500">Teams haven't confirmed any retentions yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Connected Teams Monitor - Removed for frontend-only version */}

      {/* Unsold Players Modal */}
      {showUnsoldPlayers && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-y-auto p-4">
          <div className="max-w-6xl mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                Unsold Players
              </h1>
              <button
                onClick={() => setShowUnsoldPlayers(false)}
                className="glass-effect p-3 rounded-xl hover:bg-white/10 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {players
                .filter(player => player.status === 'unsold')
                .map((player, idx) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass-effect p-6 rounded-2xl border-2 border-red-500/30"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-red-400 to-red-600 flex-shrink-0">
                        <img
                          src={getPlayerImage(player.name)}
                          alt={player.name}
                          className="w-full h-full object-cover"
                          onError={(e) => handleImageError(e, player.name)}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-xl flex items-center gap-2">
                          {player.name}
                          <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full text-xs">
                            ❌ UNSOLD
                          </span>
                        </div>
                        <div className="text-sm text-gray-400">
                          {player.role} • {player.country}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {player.set || 'Uncategorized'}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm text-gray-400 mb-1">Base Price</div>
                      <div className="text-2xl font-bold text-red-400">
                        ₹{player.basePrice.toFixed(2)}Cr
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        bringBackUnsoldPlayer(player.id)
                        setShowUnsoldPlayers(false) // Close modal
                        // Show success feedback
                        console.log(`Brought back ${player.name} to auction as current player`)
                      }}
                      className="w-full bg-green-500/20 hover:bg-green-500/30 border-2 border-green-500/50 p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        🔄
                      </motion.div>
                      Set as Current Player
                    </motion.button>
                  </motion.div>
                ))}
            </div>

            {players.filter(player => player.status === 'unsold').length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-gray-400 mb-2">No Unsold Players</h2>
                <p className="text-gray-500">All players have been either sold or are still available for auction.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Team Analysis */}
      {showTeamAnalysis && (
        <TeamAnalysis onClose={() => setShowTeamAnalysis(false)} />
      )}

      {/* Animations - Now handled by global store */}
      <SoldAnimation
        show={useAuctionStore(state => state.showSoldAnimation)}
        team={useAuctionStore(state => state.soldAnimationData?.team || null)}
        playerName={useAuctionStore(state => state.soldAnimationData?.playerName || '')}
        amount={useAuctionStore(state => state.soldAnimationData?.amount || 0)}
        onComplete={() => {}}
      />
      <RTMAnimation
        show={useAuctionStore(state => state.showRTMAnimation)}
        team={useAuctionStore(state => state.rtmAnimationData?.team || null)}
        playerName={useAuctionStore(state => state.rtmAnimationData?.playerName || '')}
        amount={useAuctionStore(state => state.rtmAnimationData?.amount || 0)}
        onComplete={() => {}}
      />
      <RetainedAnimation
        show={useAuctionStore(state => state.showRetainedAnimation)}
        team={useAuctionStore(state => state.retainedAnimationData?.team || null)}
        playerName={useAuctionStore(state => state.retainedAnimationData?.playerName || '')}
        amount={useAuctionStore(state => state.retainedAnimationData?.amount || 0)}
        onComplete={() => {}}
      />
      <UnsoldAnimation
        show={useAuctionStore(state => state.showUnsoldAnimation)}
        playerName={useAuctionStore(state => state.unsoldAnimationData?.playerName || '')}
        onComplete={() => {}}
      />

      {/* Auction Configuration Modal */}
      {showAuctionConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-effect p-8 rounded-3xl max-w-2xl w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <Settings className="w-8 h-8 text-slate-300" />
                Auction Configuration
              </h2>
              <button
                onClick={() => setShowAuctionConfig(false)}
                className="glass-effect p-2 rounded-xl hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6 mb-8">
              {/* Retention Settings */}
              <div className="glass-effect p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="w-6 h-6 text-purple-400" />
                  <h3 className="text-xl font-bold">Retention Settings</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Maximum Retentions per Team
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={maxRetentions}
                        onChange={(e) => setMaxRetentions(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #A855F7 0%, #A855F7 ${maxRetentions * 10}%, #374151 ${maxRetentions * 10}%, #374151 100%)`
                        }}
                      />
                      <div className="w-16 text-center">
                        <span className="text-2xl font-bold text-purple-400">{maxRetentions}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RTM Settings */}
              <div className="glass-effect p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src="/rtm-card.svg" 
                    alt="RTM"
                    className="w-6 h-6 object-contain"
                  />
                  <h3 className="text-xl font-bold">Right to Match Settings</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Maximum RTM per Team
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="5"
                        value={maxRTM}
                        onChange={(e) => setMaxRTM(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${maxRTM * 20}%, #374151 ${maxRTM * 20}%, #374151 100%)`
                        }}
                      />
                      <div className="w-16 text-center">
                        <span className="text-2xl font-bold text-blue-400">{maxRTM}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Settings Summary */}
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <h4 className="font-bold mb-2">Configuration Summary:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-purple-400" />
                    <span>Max Retentions: <strong>{maxRetentions}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <img 
                      src="/rtm-card.svg" 
                      alt="RTM"
                      className="w-4 h-4 object-contain"
                    />
                    <span>Max RTM: <strong>{maxRTM}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowAuctionConfig(false)}
                className="flex-1 glass-effect p-4 rounded-xl hover:bg-white/10 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Apply configuration and start retention phase
                  useAuctionStore.getState().updateTeamLimits(maxRetentions, maxRTM)
                  startRetentionPhase()
                  setShowAuctionConfig(false)
                }}
                className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 border-2 border-purple-500/50 p-4 rounded-xl font-bold"
              >
                Start Retention Phase
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Pending Requests Modal */}
      {showPendingRequests && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-effect p-8 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <Gavel className="w-8 h-8 text-slate-300" />
                Pending Approvals
                {pendingActions.length > 0 && (
                  <span className="bg-slate-500/20 text-slate-300 px-4 py-1 rounded-full text-xl">
                    {pendingActions.length}
                  </span>
                )}
              </h2>
              <button
                onClick={() => setShowPendingRequests(false)}
                className="glass-effect p-2 rounded-xl hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {pendingActions.length === 0 ? (
              <div className="text-center py-12">
                <Gavel className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <p className="text-xl text-gray-400">No pending requests</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingActions.map((action) => {
                  const team = teams.find(t => t.name === action.teamName)
                  return (
                    <motion.div
                      key={action.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-effect p-6 rounded-2xl border-2 border-white/10 hover:border-slate-400/50 transition-all"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        {team && (
                          <div 
                            className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ 
                              background: `linear-gradient(135deg, ${team.color}40, ${team.color}80)`,
                              boxShadow: `0 0 20px ${team.color}40`
                            }}
                          >
                            <img 
                              src={team.logo} 
                              alt={team.name} 
                              className="w-12 h-12 object-contain"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-2xl font-bold mb-1">{action.playerName}</div>
                          <div className="text-sm text-gray-400 mb-2">{action.teamName}</div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg font-bold">
                              {action.type === 'sold' && '💰 Sold'}

                              {action.type === 'rtm' && '🎯 RTM'}
                            </span>
                            <span className="text-2xl font-black text-slate-200">
                              ₹{action.amount.toFixed(2)}Cr
                            </span>
                          </div>
                          {action.rtmData?.hikedAmount && (
                            <div className="text-sm text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-lg inline-block">
                              ⚡ Hiked from ₹{action.rtmData.hikedAmount.toFixed(2)}Cr
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => approvePendingAction(action.id)}
                          className="bg-green-500/20 hover:bg-green-500/30 border-2 border-green-500/50 px-4 py-3 rounded-xl text-lg font-bold flex items-center justify-center gap-2"
                        >
                          <span className="text-2xl">✓</span>
                          Approve
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => rejectPendingAction(action.id)}
                          className="bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500/50 px-4 py-3 rounded-xl text-lg font-bold flex items-center justify-center gap-2"
                        >
                          <span className="text-2xl">✗</span>
                          Reject
                        </motion.button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Pending Requests Button - Fixed position */}
      {pendingActions.length > 0 && !showPendingRequests && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowPendingRequests(true)}
          className="fixed bottom-6 right-6 z-40 bg-slate-500 hover:bg-slate-600 text-white p-4 rounded-full shadow-2xl"
          style={{ boxShadow: '0 0 40px rgba(100, 116, 139, 0.6)' }}
        >
          <div className="relative">
            <Gavel className="w-8 h-8" />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
            >
              {pendingActions.length}
            </motion.div>
          </div>
        </motion.button>
      )}

      {/* Add Player Modal - Select Current Player */}
      {showAddPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-effect p-8 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">Select Player to Set as Current</h2>
              <button
                onClick={() => {
                  setShowAddPlayer(false)
                  setPlayerSearch('')
                }}
                className="glass-effect p-2 rounded-xl hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
                placeholder="Search players..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-slate-400 transition-colors"
                autoFocus
              />
            </div>

            {/* Available Players List */}
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {players
                .filter(p => p.status === 'available')
                .filter(p => 
                  playerSearch === '' || 
                  p.name.toLowerCase().includes(playerSearch.toLowerCase()) ||
                  p.role.toLowerCase().includes(playerSearch.toLowerCase()) ||
                  p.country.toLowerCase().includes(playerSearch.toLowerCase())
                )
                .map((player) => (
                  <motion.button
                    key={player.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSetCurrentPlayer(player)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      currentPlayer?.id === player.id
                        ? 'border-slate-400 bg-slate-500/20'
                        : 'border-white/10 hover:border-slate-400/50 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Player Image */}
                      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-slate-600 to-slate-700 flex-shrink-0">
                        <img
                          src={getPlayerImage(player.name)}
                          alt={player.name}
                          className="w-full h-full object-cover"
                          onError={(e) => handleImageError(e, player.name)}
                        />
                      </div>
                      
                      {/* Player Info */}
                      <div className="flex-1">
                        <div className="text-xl font-bold">{player.name}</div>
                        <div className="text-sm text-gray-400">
                          {player.role} • {player.country}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {player.set || 'Uncategorized'}
                        </div>
                      </div>
                      
                      {/* Price */}
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Base Price</div>
                        <div className="text-xl font-bold text-slate-300">
                          ₹{player.basePrice.toFixed(2)}Cr
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
            </div>

            {players.filter(p => p.status === 'available').length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl">No available players</p>
              </div>
            )}

            <button
              onClick={() => {
                setShowAddPlayer(false)
                setPlayerSearch('')
              }}
              className="w-full glass-effect p-3 rounded-xl hover:bg-white/10 mt-6"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}

      {/* RTM Team Selection Modal */}
      {showRTMTeamSelect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="glass-effect p-8 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-3xl font-bold mb-6 text-center">Select Team for RTM</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {teams.filter(t => t.rtmAvailable > 0).map((team) => (
                <motion.button
                  key={team.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRTMTeamSelect(team.name)}
                  className="p-4 rounded-xl border-2 hover:border-blue-400 transition-all"
                  style={{ borderColor: team.color, background: `${team.color}20` }}
                >
                  <div className="flex items-center gap-3">
                    <img src={team.logo} alt={team.name} className="w-12 h-12 object-contain" />
                    <div className="text-left flex-1">
                      <div className="font-bold">{team.name}</div>
                      <div className="inline-flex items-center gap-1 text-sm text-gray-400">
                        <img 
                          src="/rtm-card.svg" 
                          alt="RTM"
                          className="w-3 h-3 object-contain"
                        />
                        RTM: {team.rtmAvailable}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
            <button
              onClick={() => setShowRTMTeamSelect(false)}
              className="w-full glass-effect p-3 rounded-xl hover:bg-white/10"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}

      {/* RTM Price Input Modal */}
      {showRTMPriceInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="glass-effect p-8 rounded-3xl max-w-md w-full mx-4"
          >
            <h2 className="text-3xl font-bold mb-6 text-center">Enter RTM Price</h2>
            <div className="mb-6">
              <div className="text-center mb-4">
                <div className="text-sm text-gray-400">Player</div>
                <div className="text-2xl font-bold">{currentPlayer?.name}</div>
                <div className="text-sm text-gray-400 mt-2">Team: {selectedRTMTeam}</div>
              </div>
              <label className="block text-sm text-gray-400 mb-2">RTM Amount (Cr)</label>
              <input
                type="number"
                step="0.1"
                value={rtmPrice}
                onChange={(e) => setRTMPrice(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-2xl text-center focus:outline-none focus:border-blue-400 transition-colors"
                placeholder="Enter amount..."
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setShowRTMPriceInput(false)
                  setRTMPrice('')
                }}
                className="glass-effect p-3 rounded-xl hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleRTMConfirm}
                disabled={!rtmPrice || parseFloat(rtmPrice) <= 0}
                className="bg-blue-500/20 hover:bg-blue-500/30 p-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm RTM
              </button>
            </div>
          </motion.div>
        </div>
      )}





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
          Exit
        </button>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-slate-300" />
            <h1 className="text-3xl font-bold text-slate-200">Admin Control Panel</h1>
          </div>
          
          {/* Live Connection Status */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {/* Teams overview removed for frontend-only */}}
            className="glass-effect px-4 py-2 rounded-xl hover:bg-white/10 transition-all flex items-center gap-3"
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 bg-green-400 rounded-full"
              />
              <span className="text-sm font-bold text-green-400">LIVE</span>
            </div>
            <div className="text-sm text-gray-300">
              <span className="font-bold text-blue-400">{teams.length}</span> Teams Available
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* All Teams Confirmed Notification */}
      {retentionPhaseActive && teams.every(team => teamRetentionStatus[team.name] === 'confirmed') && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border-2 border-green-500/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 360]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="bg-green-500 rounded-full p-3"
                >
                  <Check className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold text-green-400">🎉 All Teams Confirmed!</h3>
                  <p className="text-gray-300 text-lg">
                    All {teams.length} teams have completed their retention decisions. Ready to start the auction!
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  completeRetentionPhase()
                  // The start button will become available after retention phase completes
                }}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-xl flex items-center gap-3 shadow-2xl"
                style={{
                  boxShadow: '0 0 30px rgba(34, 197, 94, 0.5)'
                }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                >
                  🚀
                </motion.div>
                START AUCTION
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Auction Controls */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect p-6 rounded-2xl"
          >
            <h2 className="text-2xl font-bold mb-6">Auction Controls</h2>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={
                  isAuctionActive 
                    ? pauseAuction 
                    : retentionPhaseComplete 
                    ? startAuction 
                    : limitsConfigured 
                    ? () => {} // Retention phase is handled by separate component
                    : () => setShowAuctionConfig(true)
                }
                disabled={limitsConfigured && !retentionPhaseComplete && !isAuctionActive}
                className={`p-6 rounded-xl font-bold text-lg flex flex-col items-center gap-3 ${
                  isAuctionActive 
                    ? 'bg-red-500/20 hover:bg-red-500/30' 
                    : retentionPhaseComplete
                    ? 'bg-green-500/20 hover:bg-green-500/30'
                    : limitsConfigured
                    ? 'bg-gray-500/20 cursor-not-allowed opacity-50'
                    : 'bg-green-500/20 hover:bg-green-500/30'
                } ${limitsConfigured && !retentionPhaseComplete && !isAuctionActive ? 'disabled:opacity-50 disabled:cursor-not-allowed' : ''}`}
              >
                {isAuctionActive ? (
                  <>
                    <Pause className="w-8 h-8" />
                    Pause
                  </>
                ) : retentionPhaseComplete ? (
                  <>
                    <Play className="w-8 h-8" />
                    Start Auction
                  </>
                ) : limitsConfigured ? (
                  <>
                    <Heart className="w-8 h-8 text-purple-400" />
                    Retention Phase
                  </>
                ) : (
                  <>
                    <Settings className="w-8 h-8" />
                    Retention Configuration
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSold}
                disabled={!currentPlayer?.currentBidder}
                className="bg-green-500/20 hover:bg-green-500/30 p-6 rounded-xl font-bold text-lg flex flex-col items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Gavel className="w-8 h-8 text-green-400" />
                SOLD
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextPlayer}
                className="glass-effect p-6 rounded-xl font-bold text-lg flex flex-col items-center gap-3 hover:bg-white/10"
              >
                <SkipForward className="w-8 h-8" />
                Next Player
              </motion.button>
            </div>

            <div className="grid grid-cols-5 gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowRTMTeamSelect(true)}
                disabled={!currentPlayer}
                className="bg-blue-500/20 hover:bg-blue-500/30 p-6 rounded-xl font-bold text-lg flex flex-col items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <img 
                  src="/rtm-card.svg" 
                  alt="RTM"
                  className="w-12 h-12 object-contain"
                />
                RTM
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUnsold}
                disabled={!currentPlayer}
                className="bg-red-500/20 hover:bg-red-500/30 p-6 rounded-xl font-bold text-lg flex flex-col items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-8 h-8 text-red-400" />
                UNSOLD
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUnsoldPlayers(true)}
                disabled={players.filter(p => p.status === 'unsold').length === 0}
                className="bg-red-600/20 hover:bg-red-600/30 border-2 border-red-600/50 p-6 rounded-xl font-bold text-lg flex flex-col items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 360]
                  }}
                  transition={{ 
                    rotate: { duration: 4, repeat: Infinity, ease: "linear" }
                  }}
                  className="text-2xl"
                >
                  🔄
                </motion.div>
                <span className="text-red-400">BRING BACK ({players.filter(p => p.status === 'unsold').length})</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowEndAuctionModal(true)}
                className="bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 border-2 border-orange-500/50 p-6 rounded-xl font-bold text-lg flex flex-col items-center gap-3 shadow-lg"
                style={{
                  boxShadow: '0 0 20px rgba(249, 115, 22, 0.3)'
                }}
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="text-2xl"
                >
                  🏁
                </motion.div>
                <span className="text-orange-400">END AUCTION</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddPlayer(true)}
                className="glass-effect p-6 rounded-xl font-bold text-lg flex flex-col items-center gap-3 hover:bg-white/10"
              >
                <Plus className="w-8 h-8" />
                Set Current
              </motion.button>
            </div>
          </motion.div>

          {/* Current Player Display - Centered & Big */}
          {currentPlayer && (() => {
            const bidderTeam = currentPlayer.currentBidder ? teams.find(t => t.name === currentPlayer.currentBidder) : null
            const themeColor = bidderTeam?.color || 'rgba(100, 116, 139, 0.6)'
            
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-effect p-12 rounded-3xl border-4 relative overflow-hidden"
                style={{
                  borderColor: themeColor,
                  boxShadow: `0 0 60px ${themeColor}40, 0 20px 80px rgba(0, 0, 0, 0.6)`
                }}
              >
                {/* Animated background with team color */}
                <motion.div
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.3, 0.1, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0"
                  style={{
                    background: bidderTeam 
                      ? `radial-gradient(circle at center, ${bidderTeam.color}40, ${bidderTeam.color}10, transparent 70%)`
                      : 'radial-gradient(circle at center, rgba(100, 116, 139, 0.2), transparent 70%)'
                  }}
                />

                {/* Rotating rings animation */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: `conic-gradient(from 0deg, transparent, ${themeColor}, transparent)`
                  }}
                />

                <div className="relative z-10">
                  {/* Centered Content */}
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-bold mb-8" style={{ color: bidderTeam ? bidderTeam.color : '#cbd5e1' }}>
                      CURRENT PLAYER
                    </h3>

                    {/* Large Centered Player Image */}
                    <div className="flex justify-center mb-8">
                      <motion.div
                        animate={{
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="relative"
                      >
                        {/* Outer animated ring */}
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.6, 0.2, 0.6],
                            rotate: [0, 360]
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                          className="absolute inset-0 rounded-full"
                          style={{
                            border: `4px solid ${themeColor}`,
                            transform: 'scale(1.25)'
                          }}
                        />

                        {/* Player photo */}
                        <div 
                          className="relative w-64 h-64 rounded-full overflow-hidden flex-shrink-0 border-8"
                          style={{
                            borderColor: themeColor,
                            boxShadow: `0 0 80px ${themeColor}80, 0 20px 60px rgba(0, 0, 0, 0.7)`,
                            background: bidderTeam 
                              ? `linear-gradient(135deg, ${bidderTeam.color}60, ${bidderTeam.color}30)`
                              : 'linear-gradient(135deg, rgba(71, 85, 105, 0.6), rgba(51, 65, 85, 0.8))'
                          }}
                        >
                          <img
                            src={getPlayerImage(currentPlayer.name)}
                            alt={currentPlayer.name}
                            className="w-full h-full object-cover"
                            onError={(e) => handleImageError(e, currentPlayer.name)}
                          />
                        </div>
                      </motion.div>
                    </div>

                    {/* Player Name */}
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-6xl font-bold mb-4"
                      style={{ 
                        color: bidderTeam ? bidderTeam.color : '#e2e8f0',
                        textShadow: `0 0 30px ${themeColor}60`
                      }}
                    >
                      {currentPlayer.name}
                    </motion.div>
                    
                    <div className="text-2xl text-gray-300 mb-8">
                      {currentPlayer.role} • {currentPlayer.country}
                    </div>

                    {/* Bid Info - Large Cards */}
                    <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
                      {/* Current Bid */}
                      <motion.div 
                        className="p-8 rounded-2xl border-4 relative overflow-hidden"
                        style={{
                          borderColor: `${themeColor}60`,
                          background: bidderTeam 
                            ? `linear-gradient(135deg, ${bidderTeam.color}20, ${bidderTeam.color}10)`
                            : 'linear-gradient(135deg, rgba(51, 65, 85, 0.3), rgba(30, 41, 59, 0.4))'
                        }}
                      >
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.2, 0.05, 0.2],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="absolute inset-0"
                          style={{
                            background: `radial-gradient(circle, ${themeColor}40, transparent 70%)`
                          }}
                        />
                        <div className="relative z-10">
                          <div className="text-lg text-gray-400 mb-3">CURRENT BID</div>
                          <motion.div 
                            key={currentPlayer.currentBid}
                            initial={{ scale: 1.3, y: -15 }}
                            animate={{ scale: 1, y: 0 }}
                            className="text-6xl font-black"
                            style={{ 
                              color: bidderTeam ? bidderTeam.color : '#cbd5e1',
                              textShadow: `0 0 30px ${themeColor}60`
                            }}
                          >
                            ₹{currentPlayer.currentBid.toFixed(2)}Cr
                          </motion.div>
                        </div>
                      </motion.div>

                      {/* Bidder */}
                      {currentPlayer.currentBidder && bidderTeam ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-8 rounded-2xl border-4 relative overflow-hidden"
                          style={{
                            borderColor: `${bidderTeam.color}60`,
                            background: `linear-gradient(135deg, ${bidderTeam.color}20, ${bidderTeam.color}10)`
                          }}
                        >
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                              opacity: [0.2, 0.05, 0.2],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="absolute inset-0"
                            style={{
                              background: `radial-gradient(circle, ${bidderTeam.color}40, transparent 70%)`
                            }}
                          />
                          <div className="relative z-10">
                            <div className="text-lg text-gray-400 mb-4">HIGHEST BIDDER</div>
                            <div className="flex flex-col items-center gap-4">
                              <motion.div
                                animate={{
                                  rotate: [0, 10, -10, 0],
                                  scale: [1, 1.15, 1]
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
                                  style={{ background: bidderTeam.color, opacity: 0.5 }}
                                />
                                <img 
                                  src={bidderTeam.logo} 
                                  alt={bidderTeam.name} 
                                  className="w-24 h-24 object-contain relative z-10" 
                                />
                              </motion.div>
                              <div 
                                className="text-3xl font-bold"
                                style={{ color: bidderTeam.color }}
                              >
                                {currentPlayer.currentBidder}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <div 
                          className="p-8 rounded-2xl border-4 flex items-center justify-center"
                          style={{
                            borderColor: 'rgba(100, 116, 139, 0.3)',
                            background: 'rgba(51, 65, 85, 0.2)'
                          }}
                        >
                          <div className="text-2xl text-gray-500">No Bidder Yet</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })()}
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Auction Timer */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <AuctionTimer isAdmin={true} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-effect p-6 rounded-2xl"
          >
            <h3 className="text-xl font-bold mb-4">Statistics</h3>
            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="text-3xl font-bold text-slate-300">{players.length}</div>
                <div className="text-sm text-gray-400">Total Players</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="text-3xl font-bold text-blue-400">{teams.length}</div>
                <div className="text-sm text-gray-400">Teams</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="text-3xl font-bold text-green-400">
                  {players.filter(p => p.status === 'sold').length}
                </div>
                <div className="text-sm text-gray-400">Players Sold</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="text-3xl font-bold text-purple-400">
                  {players.filter(p => p.status === 'retained').length}
                </div>
                <div className="text-sm text-gray-400">Players Retained</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="text-3xl font-bold text-red-400">
                  {players.filter(p => p.status === 'unsold').length}
                </div>
                <div className="text-sm text-gray-400">Players Unsold</div>
              </div>
              {retentionPhaseActive && (
                <div className="bg-white/5 p-4 rounded-xl border-2 border-purple-400/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl font-bold text-purple-400">
                      {teams.filter(team => teamRetentionStatus[team.name] === 'confirmed').length}/{teams.length}
                    </div>
                    {teams.every(team => teamRetentionStatus[team.name] === 'confirmed') && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="bg-green-500 rounded-full p-1"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">Teams Confirmed</div>
                  {teams.every(team => teamRetentionStatus[team.name] === 'confirmed') && (
                    <div className="text-xs text-green-400 font-bold mt-1">
                      🎉 Ready to Start!
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>



          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAuctionPool(true)}
            className="w-full bg-green-500/20 hover:bg-green-500/30 p-4 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <List className="w-5 h-5" />
            Auction Pool
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSquads(true)}
            className="w-full bg-blue-500/20 hover:bg-blue-500/30 p-4 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            View Squads
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTeamAnalysis(true)}
            className="w-full bg-purple-500/20 hover:bg-purple-500/30 p-4 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <TrendingUp className="w-5 h-5" />
            Analyse Teams
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {/* Teams overview removed for frontend-only */}}
            className="w-full bg-green-500/20 hover:bg-green-500/30 p-4 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            Connected Teams
          </motion.button>

          {players.filter(p => p.status === 'retained').length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowRetainedPlayers(true)}
              className="w-full bg-purple-500/20 hover:bg-purple-500/30 p-4 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <img 
                src="/retain-card.svg" 
                alt="RETAIN"
                className="w-5 h-3 object-contain"
              />
              View Retained Players
            </motion.button>
          )}

          {players.filter(p => p.status === 'unsold').length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUnsoldPlayers(true)}
              className="w-full bg-red-500/20 hover:bg-red-500/30 p-4 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5 text-red-400" />
              Unsold Players ({players.filter(p => p.status === 'unsold').length})
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowManualAddPlayer(true)}
            className="w-full bg-green-600/30 hover:bg-green-600/40 p-4 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Player
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              console.log('🧪 Testing audio system...')
              audioManager.testAudio()
              setTimeout(() => audioManager.playBidSound(), 500)
              setTimeout(() => audioManager.playRTMSound(), 1000)
              setTimeout(() => audioManager.playSoldSound(), 1500)
            }}
            className="w-full bg-yellow-600/30 hover:bg-yellow-600/40 p-4 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            🔊 Test Audio
          </motion.button>


        </div>
      </div>
    </div>

    {/* Add Player Modal */}
    <AddPlayerModal 
      show={showManualAddPlayer} 
      onClose={() => setShowManualAddPlayer(false)} 
    />



    </>
  )
}
