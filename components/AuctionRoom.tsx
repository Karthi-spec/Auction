'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, TrendingUp, Users, Eye, X } from 'lucide-react'
import { useAuctionStore } from '@/store/auctionStore'
import PlayerCard from './PlayerCard'
import BiddingPanel from './BiddingPanel'
import TeamsList from './TeamsList'
import SoldAnimation from './SoldAnimation'
import RTMModal from './RTMModal'
import RTMAnimation from './RTMAnimation'
import RetainedAnimation from './RetainedAnimation'
import UnsoldAnimation from './UnsoldAnimation'
import SquadManager from './SquadManager'
// Removed TeamsConnectionBar for frontend-only version
import TeamAnalysisDisplay from './TeamAnalysisDisplay'
import AuctionTimer from './AuctionTimer'
// Removed connection-related imports for frontend-only version
import { getTeamLogoUrl } from '@/utils/teamLogos'
import { getPlayerRating } from '@/utils/playerRatings'


interface AuctionRoomProps {
  onBack: () => void
  selectedTeam?: string | null
  isSpectator?: boolean
}

export default function AuctionRoom({ onBack, selectedTeam: userSelectedTeam, isSpectator = false }: AuctionRoomProps) {
  const {
    currentPlayer,
    teams,
    bids,
    showRTMAnimation,
    rtmAnimationData,
    setShowRTMAnimation,
    showSoldAnimation,
    soldAnimationData,
    setShowSoldAnimation,
    showRetainedAnimation,
    retainedAnimationData,
    setShowRetainedAnimation,
    showUnsoldAnimation,
    unsoldAnimationData,
    setShowUnsoldAnimation
  } = useAuctionStore()
  const [selectedTeam, setSelectedTeam] = useState<string>(userSelectedTeam || '')
  const [showSquadManager, setShowSquadManager] = useState<boolean>(false)
  const [showTeamAnalysis, setShowTeamAnalysis] = useState<boolean>(false)
  const [teamAnalysisData, setTeamAnalysisData] = useState<any[]>([])

  // Lock team selection if user joined as specific team
  useEffect(() => {
    if (userSelectedTeam) {
      setSelectedTeam(userSelectedTeam)
    }
  }, [userSelectedTeam])



  // Handle ESC key to close squad manager
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showSquadManager) {
        setShowSquadManager(false)
      }
      if (event.key === 'Escape' && showTeamAnalysis) {
        setShowTeamAnalysis(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showSquadManager, showTeamAnalysis])

  // Listen for team analysis broadcast
  useEffect(() => {
    const handleTeamAnalysis = (analysisData: any[]) => {
      setTeamAnalysisData(analysisData)
      setShowTeamAnalysis(true)
    }

    // Removed socket listeners for frontend-only version
  }, [])



  // Animations are now handled automatically by the animation manager

  return (
    <>
      {/* RTM Modal */}
      <RTMModal />

      {/* All Animations - Synced with Admin Actions */}
      <SoldAnimation
        show={showSoldAnimation}
        team={soldAnimationData?.team || null}
        playerName={soldAnimationData?.playerName || ''}
        amount={soldAnimationData?.amount || 0}
        onComplete={() => { }}
      />

      <RTMAnimation
        show={showRTMAnimation}
        team={rtmAnimationData?.team || null}
        playerName={rtmAnimationData?.playerName || ''}
        amount={rtmAnimationData?.amount || 0}
        onComplete={() => { }}
      />

      <RetainedAnimation
        show={showRetainedAnimation}
        team={retainedAnimationData?.team || null}
        playerName={retainedAnimationData?.playerName || ''}
        amount={retainedAnimationData?.amount || 0}
        onComplete={() => { }}
      />

      <UnsoldAnimation
        show={showUnsoldAnimation}
        playerName={unsoldAnimationData?.playerName || ''}
        onComplete={() => { }}
      />

      {/* Team Analysis Display */}
      <TeamAnalysisDisplay
        isVisible={showTeamAnalysis}
        analysisData={teamAnalysisData}
        onClose={() => setShowTeamAnalysis(false)}
      />

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
            {selectedTeam && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSquadManager(true)}
                className="glass-effect px-6 py-3 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-all border border-blue-500/30"
              >
                {(() => {
                  const team = teams.find(t => t.name === selectedTeam)
                  const squadSize = team?.players?.length || 0
                  return (
                    <>
                      {team ? (
                        <img src={getTeamLogoUrl(team.name)} alt={team.name} className="w-6 h-6 object-contain" />
                      ) : (
                        <Users className="w-5 h-5 text-blue-400" />
                      )}
                      <div className="text-left">
                        <div className="font-bold text-blue-400 flex items-center gap-2">
                          Squad Management
                          {squadSize > 0 && (
                            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs">
                              {squadSize}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">{selectedTeam}</div>
                      </div>
                    </>
                  )
                })()}
              </motion.button>
            )}
            <div className="glass-effect px-6 py-3 rounded-xl flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-400" />
              <span className="font-bold">{teams.length} Teams</span>
            </div>
          </div>
        </motion.div>

        {/* Teams Connection Bar - Removed for frontend-only version */}

        {/* Squad Management Modal */}
        <AnimatePresence>
          {showSquadManager && selectedTeam && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-y-auto p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowSquadManager(false)
                }
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="max-w-7xl mx-auto py-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    {(() => {
                      const team = teams.find(t => t.name === selectedTeam)
                      return team && (
                        <img src={getTeamLogoUrl(team.name)} alt={team.name} className="w-12 h-12 object-contain" />
                      )
                    })()}
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                        Squad Management
                      </h1>
                      <p className="text-gray-400">{selectedTeam}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-400">Press ESC to close</div>
                    <button
                      onClick={() => setShowSquadManager(false)}
                      className="glass-effect p-3 rounded-xl hover:bg-white/10 transition-all"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                <SquadManager teamName={selectedTeam} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Auction Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Player */}
            <AnimatePresence mode="wait">
              {currentPlayer && (
                <PlayerCard player={currentPlayer} />
              )}
            </AnimatePresence>

            {/* Bidding Panel - Hidden for Spectators */}
            {!isSpectator && (
              <BiddingPanel
                selectedTeam={selectedTeam}
                onTeamSelect={setSelectedTeam}
                isTeamLocked={!!userSelectedTeam}
              />
            )}

            {/* Spectator Notice */}
            {isSpectator && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-effect p-6 rounded-2xl border-2 border-purple-500/50"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Eye className="w-6 h-6 text-purple-400" />
                  <h3 className="text-xl font-bold text-purple-400">Spectator Mode</h3>
                </div>
                <p className="text-gray-300">
                  You're watching the auction live. You can see all bidding activity but cannot place bids.
                </p>
              </motion.div>
            )}

            {/* Recent Bids */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-effect p-6 rounded-2xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-gold-400" />
                <h3 className="text-xl font-bold">Live Bidding Activity</h3>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {bids.slice(0, 10).map((bid, idx) => {
                  const team = teams.find(t => t.name === bid.teamName)
                  return (
                    <motion.div
                      key={bid.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                          {team && <img src={getTeamLogoUrl(team.name)} alt={team.name} className="w-8 h-8 object-contain" />}
                        </div>
                        <div>
                          <div className="font-semibold">{bid.teamName}</div>
                          <div className="text-sm text-gray-400">{bid.playerName}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gold-400">
                          ₹{bid.amount.toFixed(2)}Cr
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(bid.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </div>

          {/* Teams Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Auction Timer */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <AuctionTimer isAdmin={false} />
            </motion.div>

            <TeamsList />
          </div>
        </div>
      </div>



      {/* User Connection Status - Removed for frontend-only version */}

    </>
  )
}
