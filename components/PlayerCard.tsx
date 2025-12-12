'use client'

import { motion } from 'framer-motion'
import { Player } from '@/types'
import { getPlayerImage, handleImageError } from '@/utils/playerImage'
import { useAuctionStore } from '@/store/auctionStore'

interface PlayerCardProps {
  player: Player
}

export default function PlayerCard({ player }: PlayerCardProps) {
  const { teams } = useAuctionStore()
  const bidderTeam = player.currentBidder ? teams.find(t => t.name === player.currentBidder) : null
  
  return (
    <motion.div
      key={player.id}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="p-8 rounded-3xl premium-shadow relative overflow-hidden border-4"
      style={{
        background: bidderTeam 
          ? `linear-gradient(135deg, ${bidderTeam.color}30, ${bidderTeam.color}10, rgba(17, 24, 39, 0.95))`
          : 'linear-gradient(135deg, rgba(51, 65, 85, 0.3), rgba(30, 41, 59, 0.5), rgba(17, 24, 39, 0.95))',
        borderColor: bidderTeam ? `${bidderTeam.color}` : 'rgba(100, 116, 139, 0.5)',
        boxShadow: bidderTeam 
          ? `0 0 40px ${bidderTeam.color}40, 0 20px 60px rgba(0, 0, 0, 0.5)`
          : '0 0 30px rgba(100, 116, 139, 0.2), 0 20px 60px rgba(0, 0, 0, 0.5)'
      }}
    >
      {/* Animated background pulse */}
      {bidderTeam && (
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.05, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded-3xl"
          style={{
            background: `radial-gradient(circle at top right, ${bidderTeam.color}40, transparent 60%)`
          }}
        />
      )}
      
      <div className="relative z-10">
        {/* Player Name and Info */}
        <div className="text-center mb-6">
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-bold mb-3 text-white"
            style={{ 
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)'
            }}
          >
            {player.name}
          </motion.h2>
          <div className="flex items-center justify-center gap-4 text-gray-300">
            <span className="text-lg">{player.role}</span>
            <span className="text-lg">•</span>
            <span className="text-lg">{player.country}</span>
          </div>
        </div>

        {/* Centered Large Avatar with Animated Rings */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Animated outer ring 1 */}
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
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
                border: bidderTeam ? `3px solid ${bidderTeam.color}` : '3px solid rgba(100, 116, 139, 0.4)',
                transform: 'scale(1.2)'
              }}
            />
            
            {/* Animated outer ring 2 */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.4, 0.1, 0.4],
                rotate: [360, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 rounded-full"
              style={{
                border: bidderTeam ? `2px solid ${bidderTeam.color}` : '2px solid rgba(100, 116, 139, 0.3)',
                transform: 'scale(1.15)'
              }}
            />

            {/* Pulsing glow effect */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-full blur-xl"
              style={{
                background: bidderTeam 
                  ? `radial-gradient(circle, ${bidderTeam.color}60, transparent 70%)`
                  : 'radial-gradient(circle, rgba(100, 116, 139, 0.3), transparent 70%)'
              }}
            />
            
            {/* Main photo container */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="relative w-96 h-96 rounded-full overflow-hidden premium-shadow"
              style={{
                background: bidderTeam 
                  ? `linear-gradient(to bottom right, ${bidderTeam.color}, ${bidderTeam.color}80)`
                  : 'linear-gradient(to bottom right, rgba(71, 85, 105, 0.8), rgba(51, 65, 85, 0.9))',
                boxShadow: bidderTeam 
                  ? `0 0 80px ${bidderTeam.color}60, 0 10px 50px rgba(0, 0, 0, 0.6), inset 0 0 40px ${bidderTeam.color}20`
                  : '0 0 40px rgba(100, 116, 139, 0.4), 0 10px 50px rgba(0, 0, 0, 0.6)',
                border: bidderTeam ? `4px solid ${bidderTeam.color}80` : '4px solid rgba(100, 116, 139, 0.5)'
              }}
            >
              <img
                src={getPlayerImage(player.name)}
                alt={player.name}
                className="w-full h-full object-cover"
                onError={(e) => handleImageError(e, player.name)}
              />
            </motion.div>
          </div>
        </div>

        {/* Current Bid */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 150 }}
          className="p-6 rounded-2xl border-2 relative overflow-hidden"
          style={{
            background: bidderTeam 
              ? `linear-gradient(135deg, ${bidderTeam.color}40, ${bidderTeam.color}20)`
              : 'linear-gradient(to right, rgba(51, 65, 85, 0.3), rgba(30, 41, 59, 0.4))',
            borderColor: bidderTeam ? `${bidderTeam.color}80` : 'rgba(100, 116, 139, 0.4)'
          }}
        >
          {/* Animated background pulse */}
          {bidderTeam && (
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-2xl"
              style={{
                background: `radial-gradient(circle at center, ${bidderTeam.color}60, transparent 70%)`
              }}
            />
          )}

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">BASE PRICE</div>
              <motion.div 
                className="text-3xl font-bold"
                style={{ color: bidderTeam ? bidderTeam.color : '#94a3b8' }}
              >
                ₹{player.basePrice.toFixed(2)}Cr
              </motion.div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1">CURRENT BID</div>
              <motion.div
                key={player.currentBid}
                initial={{ scale: 1.3, y: -10 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="text-5xl font-bold"
                style={{ 
                  color: bidderTeam ? bidderTeam.color : '#cbd5e1',
                  textShadow: bidderTeam ? `0 0 20px ${bidderTeam.color}80` : '0 0 15px rgba(100, 116, 139, 0.3)'
                }}
              >
                ₹{player.currentBid.toFixed(2)}Cr
              </motion.div>
            </div>
          </div>
          
          {player.currentBidder && bidderTeam && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative z-10 mt-4 pt-4 border-t"
              style={{ borderColor: `${bidderTeam.color}40` }}
            >
              <div className="text-sm text-gray-400 mb-2">HIGHEST BIDDER</div>
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative"
                >
                  <div 
                    className="absolute inset-0 rounded-full blur-md"
                    style={{ background: bidderTeam.color, opacity: 0.4 }}
                  />
                  <img 
                    src={bidderTeam.logo} 
                    alt={bidderTeam.name} 
                    className="w-12 h-12 object-contain relative z-10" 
                  />
                </motion.div>
                <div className="text-xl font-bold">{player.currentBidder}</div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
