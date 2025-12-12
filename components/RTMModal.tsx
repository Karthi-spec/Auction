'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Shield, X } from 'lucide-react'
import { useAuctionStore } from '@/store/auctionStore'
import { getPlayerImage, handleImageError } from '@/utils/playerImage'

export default function RTMModal() {
  const { showRTMModal, rtmTeam, currentPlayer, useRTM, setShowRTMModal } = useAuctionStore()

  if (!rtmTeam || !currentPlayer) return null

  const handleUseRTM = () => {
    useRTM(rtmTeam.name)
    // Animation will be triggered by parent component
  }

  const handleDecline = () => {
    setShowRTMModal(false)
  }

  return (
    <AnimatePresence>
      {showRTMModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            className="relative max-w-2xl w-full mx-4"
          >
            <div 
              className="glass-effect p-8 rounded-3xl border-4 relative overflow-hidden"
              style={{ 
                borderColor: rtmTeam.color,
                boxShadow: `0 0 60px ${rtmTeam.color}80`
              }}
            >
              {/* Background glow */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{ background: rtmTeam.color }}
              />

              <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-6">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <img 
                      src="/rtm-card.svg" 
                      alt="RTM Card"
                      className="w-32 h-32 mx-auto mb-4 object-contain"
                      style={{ 
                        filter: `drop-shadow(0 0 20px ${rtmTeam.color})`
                      }}
                    />
                  </motion.div>
                  
                  <h2 
                    className="text-4xl font-bold mb-2"
                    style={{ color: rtmTeam.color }}
                  >
                    RIGHT TO MATCH
                  </h2>
                  <p className="text-gray-300">RTM Card Available!</p>
                </div>

                {/* Team Info */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div 
                    className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden"
                    style={{ 
                      background: `linear-gradient(135deg, ${rtmTeam.color}40, ${rtmTeam.color}80)`,
                      boxShadow: `0 0 30px ${rtmTeam.color}`
                    }}
                  >
                    <img 
                      src={rtmTeam.logo} 
                      alt={rtmTeam.name} 
                      className="w-20 h-20 object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{rtmTeam.name}</h3>
                    <p className="text-gray-400">RTM Available: {rtmTeam.rtmAvailable}</p>
                  </div>
                </div>

                {/* Player Info */}
                <div className="bg-white/5 p-6 rounded-2xl mb-6">
                  <div className="flex flex-col items-center">
                    <p className="text-sm text-gray-400 mb-3">Player</p>
                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-gold-400 to-gold-600 flex-shrink-0 mb-3">
                      <img
                        src={getPlayerImage(currentPlayer.name)}
                        alt={currentPlayer.name}
                        className="w-full h-full object-cover"
                        onError={(e) => handleImageError(e, currentPlayer.name)}
                      />
                    </div>
                    <h4 className="text-3xl font-bold mb-2">{currentPlayer.name}</h4>
                    <p className="text-xl text-gold-400">
                      Current Bid: ₹{currentPlayer.currentBid.toFixed(2)}Cr
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      by {currentPlayer.currentBidder}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleUseRTM}
                    className="p-6 rounded-xl font-bold text-lg"
                    style={{ 
                      background: `linear-gradient(135deg, ${rtmTeam.color}, ${rtmTeam.color}CC)`,
                      boxShadow: `0 0 20px ${rtmTeam.color}60`
                    }}
                  >
                    <img 
                      src="/rtm-card.svg" 
                      alt="RTM"
                      className="w-8 h-8 mx-auto mb-2 object-contain"
                    />
                    USE RTM
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDecline}
                    className="glass-effect p-6 rounded-xl font-bold text-lg hover:bg-white/10"
                  >
                    <X className="w-6 h-6 mx-auto mb-2" />
                    DECLINE
                  </motion.button>
                </div>

                {/* Info text */}
                <p className="text-center text-sm text-gray-400 mt-4">
                  Using RTM will match the current bid and acquire the player
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
