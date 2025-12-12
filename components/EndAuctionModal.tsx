'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, RotateCcw, Zap, Trophy, TrendingUp, Users } from 'lucide-react'
import { useAuctionStore } from '@/store/auctionStore'
import { getPlayerRating } from '@/utils/playerRatings'
// Removed socketClient for frontend-only version

interface EndAuctionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function EndAuctionModal({ isOpen, onClose, onConfirm }: EndAuctionModalProps) {
  const [step, setStep] = useState<'warning' | 'analysis' | 'final'>('warning')
  const [isProcessing, setIsProcessing] = useState(false)
  const { teams } = useAuctionStore()

  const handleFirstConfirm = () => {
    setStep('analysis')
    
    // Calculate team analysis for frontend display
    const analysisData = calculateTeamAnalysis()
    // Note: Broadcasting removed for frontend-only version
  }

  const handleAnalysisNext = () => {
    setStep('final')
  }

  const handleFinalConfirm = async () => {
    setIsProcessing(true)
    
    // Add a small delay for better UX
    setTimeout(() => {
      onConfirm()
      setIsProcessing(false)
      setStep('warning')
      onClose()
    }, 1500)
  }

  const handleClose = () => {
    if (!isProcessing) {
      setStep('warning')
      onClose()
    }
  }

  // Calculate team analysis
  const calculateTeamAnalysis = () => {
    return teams.map(team => {
      const teamPlayers = team.players.filter(p => p.status === 'sold' || p.status === 'retained')
      
      // Calculate average rating
      const totalRating = teamPlayers.reduce((sum, player) => {
        return sum + getPlayerRating(player.name, player.basePrice)
      }, 0)
      const averageRating = teamPlayers.length > 0 ? totalRating / teamPlayers.length : 0
      
      // Calculate total spent
      const totalSpent = teamPlayers.reduce((sum, player) => {
        return sum + (player.soldPrice || player.retainedAmount || player.basePrice)
      }, 0)

      return {
        team,
        playerCount: teamPlayers.length,
        averageRating,
        totalSpent,
        budgetRemaining: team.budget
      }
    }).sort((a, b) => b.averageRating - a.averageRating)
  }

  const teamAnalysis = calculateTeamAnalysis()

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="glass-effect p-8 rounded-3xl max-w-2xl w-full border-2 border-red-500/30"
            style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(249, 115, 22, 0.1))',
              boxShadow: '0 0 50px rgba(239, 68, 68, 0.3)'
            }}
          >
            {/* Close Button */}
            {!isProcessing && (
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 glass-effect p-2 rounded-xl hover:bg-white/10 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            )}

            {step === 'warning' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {/* Header */}
                <div className="text-center mb-8">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-500 mb-4"
                  >
                    <AlertTriangle className="w-10 h-10 text-white" />
                  </motion.div>
                  
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-2">
                    🚨 END AUCTION CONFIRMATION 🚨
                  </h1>
                  <p className="text-gray-300 text-lg">
                    This action will completely reset the auction system
                  </p>
                </div>

                {/* Warning List */}
                <div className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-6 mb-8">
                  <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    What will be reset:
                  </h3>
                  <div className="space-y-3">
                    {[
                      'All player bids will be cleared',
                      'All team retentions will be removed', 
                      'All team connections will be disconnected',
                      'All squad formations will be reset',
                      'Auction will return to initial state',
                      'All users will need to reconnect'
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 text-gray-300"
                      >
                        <div className="w-2 h-2 bg-red-400 rounded-full" />
                        <span>{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClose}
                    className="flex-1 glass-effect p-4 rounded-xl hover:bg-white/10 font-bold text-lg"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleFirstConfirm}
                    className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 p-4 rounded-xl font-bold text-lg text-white"
                  >
                    Show Team Analysis →
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 'analysis' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Analysis Header */}
                <div className="text-center mb-8">
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 mb-4"
                  >
                    <Trophy className="w-10 h-10 text-white" />
                  </motion.div>
                  
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
                    🏆 FINAL TEAM ANALYSIS 🏆
                  </h1>
                  <p className="text-gray-300 text-lg">
                    Overall team ratings based on squad performance
                  </p>
                </div>

                {/* Team Rankings */}
                <div className="bg-white/5 border-2 border-purple-500/30 rounded-2xl p-6 mb-8 max-h-96 overflow-y-auto">
                  <h3 className="text-xl font-bold text-purple-400 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Team Rankings by Overall Rating
                  </h3>
                  
                  <div className="space-y-4">
                    {teamAnalysis.map((analysis, index) => (
                      <motion.div
                        key={analysis.team.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-xl border-2 ${
                          index === 0 ? 'border-yellow-400/50 bg-yellow-400/10' :
                          index === 1 ? 'border-gray-300/50 bg-gray-300/10' :
                          index === 2 ? 'border-amber-500/50 bg-amber-500/10' :
                          'border-white/10 bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Rank */}
                          <div className="flex items-center justify-center w-12 h-12 rounded-full font-bold text-xl"
                               style={{ 
                                 background: index === 0 ? 'linear-gradient(135deg, #FCD34D, #F59E0B)' :
                                           index === 1 ? 'linear-gradient(135deg, #D1D5DB, #9CA3AF)' :
                                           index === 2 ? 'linear-gradient(135deg, #F59E0B, #D97706)' :
                                           'linear-gradient(135deg, #6B7280, #4B5563)',
                                 color: 'white'
                               }}>
                            #{index + 1}
                          </div>

                          {/* Team Logo */}
                          <div className="relative">
                            <div
                              className="w-16 h-16 rounded-full flex items-center justify-center"
                              style={{ 
                                background: `linear-gradient(135deg, ${analysis.team.color}40, ${analysis.team.color}20)`,
                                border: `2px solid ${analysis.team.color}`
                              }}
                            >
                              <img 
                                src={analysis.team.logo} 
                                alt={analysis.team.name} 
                                className="w-12 h-12 object-contain" 
                              />
                            </div>
                          </div>

                          {/* Team Info */}
                          <div className="flex-1">
                            <h4 className="text-xl font-bold mb-1" style={{ color: analysis.team.color }}>
                              {analysis.team.name}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{analysis.playerCount} players</span>
                              </div>
                              <div>
                                <span>Spent: ₹{analysis.totalSpent.toFixed(1)}Cr</span>
                              </div>
                              <div>
                                <span>Left: ₹{analysis.budgetRemaining.toFixed(1)}Cr</span>
                              </div>
                            </div>
                          </div>

                          {/* Overall Rating */}
                          <div className="text-right">
                            <div className="text-sm text-gray-400 mb-1">Overall Rating</div>
                            <div className={`text-3xl font-bold ${
                              analysis.averageRating >= 8.5 ? 'text-green-400' :
                              analysis.averageRating >= 7.5 ? 'text-yellow-400' :
                              analysis.averageRating >= 6.5 ? 'text-orange-400' :
                              'text-red-400'
                            }`}>
                              {analysis.averageRating.toFixed(1)}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStep('warning')}
                    className="flex-1 glass-effect p-4 rounded-xl hover:bg-white/10 font-bold text-lg"
                  >
                    ← Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAnalysisNext}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 p-4 rounded-xl font-bold text-lg text-white"
                  >
                    Continue to End Auction →
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 'final' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Final Warning Header */}
                <div className="text-center mb-8">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 360]
                    }}
                    transition={{ 
                      scale: { duration: 1, repeat: Infinity },
                      rotate: { duration: 2, repeat: Infinity, ease: "linear" }
                    }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-500 mb-4"
                  >
                    <RotateCcw className="w-10 h-10 text-white" />
                  </motion.div>
                  
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
                    ⚠️ FINAL CONFIRMATION ⚠️
                  </h1>
                  <p className="text-gray-300 text-lg">
                    Last chance to cancel this action
                  </p>
                </div>

                {/* Final Warning */}
                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-2 border-orange-500/50 rounded-2xl p-8 mb-8 text-center">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-6xl mb-4"
                  >
                    🔥
                  </motion.div>
                  <h3 className="text-2xl font-bold text-orange-400 mb-4">
                    THIS ACTION CANNOT BE UNDONE!
                  </h3>
                  <p className="text-gray-300 text-lg">
                    Once you click "RESET EVERYTHING", all auction data will be permanently lost and the system will return to the initial state.
                  </p>
                </div>

                {/* Final Action Buttons */}
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStep('analysis')}
                    disabled={isProcessing}
                    className="flex-1 glass-effect p-4 rounded-xl hover:bg-white/10 font-bold text-lg disabled:opacity-50"
                  >
                    ← Back to Analysis
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleFinalConfirm}
                    disabled={isProcessing}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 p-4 rounded-xl font-bold text-lg text-white disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isProcessing ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          🔄
                        </motion.div>
                        Resetting...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-5 h-5" />
                        RESET EVERYTHING
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}