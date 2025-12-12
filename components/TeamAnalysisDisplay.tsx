'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, X, Users, TrendingUp } from 'lucide-react'
import { getPlayerRating } from '@/utils/playerRatings'

interface TeamAnalysisData {
  team: {
    id: string
    name: string
    color: string
    logo: string
    budget: number
    players: any[]
  }
  playerCount: number
  averageRating: number
  totalSpent: number
  budgetRemaining: number
}

interface TeamAnalysisDisplayProps {
  isVisible: boolean
  analysisData: TeamAnalysisData[]
  onClose: () => void
}

export default function TeamAnalysisDisplay({ isVisible, analysisData, onClose }: TeamAnalysisDisplayProps) {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (isVisible) {
      // Delay content appearance for dramatic effect
      const timer = setTimeout(() => setShowContent(true), 500)
      return () => clearTimeout(timer)
    } else {
      setShowContent(false)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm overflow-y-auto">
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            className="w-full max-w-6xl"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-12"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                  scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
                className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-6"
              >
                <Trophy className="w-12 h-12 text-white" />
              </motion.div>
              
              <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4">
                🏆 FINAL TEAM RANKINGS 🏆
              </h1>
              <p className="text-2xl text-gray-300">
                Auction Complete - Final Team Analysis
              </p>
            </motion.div>

            {/* Team Rankings */}
            <AnimatePresence>
              {showContent && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-6"
                >
                  {analysisData.map((analysis, index) => (
                    <motion.div
                      key={analysis.team.id}
                      initial={{ opacity: 0, x: -100, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ 
                        delay: 0.7 + (index * 0.2),
                        type: "spring",
                        stiffness: 100
                      }}
                      className={`relative overflow-hidden rounded-3xl p-8 border-4 ${
                        index === 0 ? 'border-yellow-400 bg-gradient-to-r from-yellow-400/20 to-orange-500/20' :
                        index === 1 ? 'border-gray-300 bg-gradient-to-r from-gray-300/20 to-gray-500/20' :
                        index === 2 ? 'border-amber-500 bg-gradient-to-r from-amber-500/20 to-amber-700/20' :
                        'border-white/20 bg-gradient-to-r from-white/10 to-white/5'
                      }`}
                      style={{
                        boxShadow: index <= 2 ? `0 0 40px ${
                          index === 0 ? 'rgba(251, 191, 36, 0.4)' :
                          index === 1 ? 'rgba(209, 213, 219, 0.4)' :
                          'rgba(245, 158, 11, 0.4)'
                        }` : '0 0 20px rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      {/* Animated background */}
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.1, 0.3, 0.1],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute inset-0"
                        style={{
                          background: `radial-gradient(circle at center, ${analysis.team.color}40, transparent 70%)`
                        }}
                      />

                      <div className="relative z-10 flex items-center gap-8">
                        {/* Rank */}
                        <motion.div
                          animate={index <= 2 ? {
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                          } : {}}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="flex items-center justify-center w-20 h-20 rounded-full font-bold text-3xl text-white"
                          style={{ 
                            background: index === 0 ? 'linear-gradient(135deg, #FCD34D, #F59E0B)' :
                                       index === 1 ? 'linear-gradient(135deg, #D1D5DB, #9CA3AF)' :
                                       index === 2 ? 'linear-gradient(135deg, #F59E0B, #D97706)' :
                                       'linear-gradient(135deg, #6B7280, #4B5563)',
                            boxShadow: index <= 2 ? '0 0 20px rgba(0, 0, 0, 0.5)' : 'none'
                          }}
                        >
                          #{index + 1}
                        </motion.div>

                        {/* Team Logo */}
                        <motion.div
                          animate={index <= 2 ? {
                            scale: [1, 1.05, 1],
                          } : {}}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="relative"
                        >
                          {index <= 2 && (
                            <div 
                              className="absolute inset-0 rounded-full blur-xl"
                              style={{ background: analysis.team.color, opacity: 0.6 }}
                            />
                          )}
                          <div
                            className="w-24 h-24 rounded-full flex items-center justify-center relative z-10 border-4"
                            style={{ 
                              background: `linear-gradient(135deg, ${analysis.team.color}60, ${analysis.team.color}30)`,
                              borderColor: analysis.team.color,
                              boxShadow: `0 0 30px ${analysis.team.color}40`
                            }}
                          >
                            <img 
                              src={analysis.team.logo} 
                              alt={analysis.team.name} 
                              className="w-20 h-20 object-contain" 
                            />
                          </div>
                        </motion.div>

                        {/* Team Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <h3 className="text-4xl font-bold" style={{ color: analysis.team.color }}>
                              {analysis.team.name}
                            </h3>
                            {index <= 2 && (
                              <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className={`px-4 py-2 rounded-full text-lg font-bold bg-gradient-to-r ${
                                  index === 0 ? 'from-yellow-400 to-yellow-600 text-black' :
                                  index === 1 ? 'from-gray-300 to-gray-500 text-black' :
                                  'from-amber-500 to-amber-700 text-white'
                                }`}
                              >
                                {index === 0 ? '🥇 CHAMPION' : 
                                 index === 1 ? '🥈 RUNNER-UP' : 
                                 '🥉 THIRD PLACE'}
                              </motion.div>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-6 text-lg">
                            <div className="flex items-center gap-2">
                              <Users className="w-5 h-5 text-gray-400" />
                              <span className="text-gray-400">Players:</span>
                              <span className="font-bold text-white">{analysis.playerCount}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Spent:</span>
                              <span className="font-bold text-green-400 ml-2">₹{analysis.totalSpent.toFixed(1)}Cr</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Remaining:</span>
                              <span className="font-bold text-orange-400 ml-2">₹{analysis.budgetRemaining.toFixed(1)}Cr</span>
                            </div>
                          </div>
                        </div>

                        {/* Overall Rating */}
                        <div className="text-right">
                          <div className="text-lg text-gray-400 mb-2">Overall Rating</div>
                          <motion.div 
                            animate={index === 0 ? {
                              scale: [1, 1.1, 1],
                              textShadow: [
                                '0 0 20px rgba(34, 197, 94, 0.5)',
                                '0 0 40px rgba(34, 197, 94, 0.8)',
                                '0 0 20px rgba(34, 197, 94, 0.5)'
                              ]
                            } : {}}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className={`text-6xl font-black ${
                              analysis.averageRating >= 8.5 ? 'text-green-400' :
                              analysis.averageRating >= 7.5 ? 'text-yellow-400' :
                              analysis.averageRating >= 6.5 ? 'text-orange-400' :
                              'text-red-400'
                            }`}
                          >
                            {analysis.averageRating.toFixed(1)}
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
              className="text-center mt-12"
            >
              <div className="glass-effect p-6 rounded-2xl max-w-2xl mx-auto">
                <p className="text-xl text-gray-300 mb-4">
                  🎉 Congratulations to all teams! 🎉
                </p>
                <p className="text-gray-400">
                  Rankings based on squad quality, player ratings, and team performance
                </p>
              </div>
            </motion.div>

            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3 }}
              onClick={onClose}
              className="fixed top-8 right-8 glass-effect p-4 rounded-xl hover:bg-white/10 transition-all z-60"
            >
              <X className="w-6 h-6" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}