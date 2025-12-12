'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Star, Sparkles } from 'lucide-react'
import { Team } from '@/types'
import { getPlayerImage, handleImageError } from '@/utils/playerImage'
import { audioManager } from '@/utils/audioManager'
import React from 'react'

interface RetainedAnimationProps {
  show: boolean
  team: Team | null
  playerName: string
  amount: number
  onComplete: () => void
}

export default function RetainedAnimation({ show, team, playerName, amount, onComplete }: RetainedAnimationProps) {
  React.useEffect(() => {
    if (show) {
      // Play retained sound effect
      audioManager.playRetainedSound()
      
      // Complete animation after 8 seconds
      const completeTimer = setTimeout(() => {
        onComplete()
      }, 8000)

      return () => clearTimeout(completeTimer)
    }
  }, [show, onComplete])

  if (!team) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
        >
          {/* Subtle team color overlay */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{ background: `radial-gradient(circle at center, ${team.color}40, transparent 70%)` }}
          />
          {/* Floating hearts and stars */}
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: '50vw', 
                y: '100vh',
                scale: 0,
                opacity: 0
              }}
              animate={{ 
                x: `${20 + Math.random() * 60}vw`,
                y: `${-20 + Math.random() * 40}vh`,
                scale: [0, 1, 0.8],
                opacity: [0, 1, 0],
                rotate: Math.random() * 360
              }}
              transition={{ 
                duration: 3,
                ease: 'easeOut',
                delay: i * 0.08
              }}
              className="absolute"
            >
              {i % 3 === 0 ? (
                <Heart 
                  className="w-6 h-6" 
                  style={{ color: team.color, fill: team.color }}
                />
              ) : (
                <Star 
                  className="w-6 h-6" 
                  style={{ color: '#FFD700', fill: '#FFD700' }}
                />
              )}
            </motion.div>
          ))}

          {/* Main content - Centered */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Centered Player Photo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: 'spring',
                stiffness: 100,
                damping: 15,
                delay: 0.2
              }}
              className="relative mb-12"
            >
              {/* Rotating ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full"
                style={{
                  border: `6px solid #A855F7`,
                  transform: 'scale(1.3)',
                  opacity: 0.6
                }}
              />

              {/* Player photo */}
              <div 
                className="relative w-80 h-80 rounded-full overflow-hidden border-8"
                style={{ 
                  borderColor: '#A855F7',
                  boxShadow: `0 0 100px #A855F780, 0 0 200px #A855F740`,
                  background: `linear-gradient(135deg, #A855F760, #A855F730)`
                }}
              >
                <img
                  src={getPlayerImage(playerName)}
                  alt={playerName}
                  className="w-full h-full object-cover"
                  onError={(e) => handleImageError(e, playerName)}
                />
              </div>

              {/* Flowing RETAINED text on LEFT side */}
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ 
                  x: [-400, -420, -400],
                  opacity: 1
                }}
                transition={{
                  x: {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  },
                  opacity: { duration: 0.5 }
                }}
                className="absolute top-1/2 -translate-y-1/2 left-0"
              >
                <div 
                  className="font-black px-8 py-4 rounded-2xl transform -rotate-12"
                  style={{ 
                    fontSize: '4rem',
                    color: '#A855F7',
                    textShadow: '0 0 40px #A855F7, 0 0 80px #A855F7, 0 4px 10px rgba(0,0,0,0.9)',
                    fontFamily: 'Impact, sans-serif',
                    WebkitTextStroke: '3px #7C3AED',
                    letterSpacing: '0.1em',
                    background: 'rgba(168, 85, 247, 0.2)',
                    border: '4px solid #A855F7'
                  }}
                >
                  RETAINED
                </div>
              </motion.div>

              {/* Flowing RETAINED text on RIGHT side */}
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ 
                  x: [400, 420, 400],
                  opacity: 1
                }}
                transition={{
                  x: {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  },
                  opacity: { duration: 0.5 }
                }}
                className="absolute top-1/2 -translate-y-1/2 right-0"
              >
                <div 
                  className="font-black px-8 py-4 rounded-2xl transform rotate-12"
                  style={{ 
                    fontSize: '4rem',
                    color: '#A855F7',
                    textShadow: '0 0 40px #A855F7, 0 0 80px #A855F7, 0 4px 10px rgba(0,0,0,0.9)',
                    fontFamily: 'Impact, sans-serif',
                    WebkitTextStroke: '3px #7C3AED',
                    letterSpacing: '0.1em',
                    background: 'rgba(168, 85, 247, 0.2)',
                    border: '4px solid #A855F7'
                  }}
                >
                  RETAINED
                </div>
              </motion.div>
            </motion.div>

            <div 
              className="text-center"
            >
              {/* Player Name */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-7xl font-black mb-6"
                style={{ 
                  color: '#FFFFFF',
                  textShadow: `0 0 40px #A855F7, 0 0 80px #A855F7, 0 6px 15px rgba(0,0,0,0.9)`,
                  fontFamily: 'Impact, sans-serif',
                  WebkitTextStroke: `3px #A855F7`,
                  letterSpacing: '0.05em'
                }}
              >
                {playerName.toUpperCase()}
              </motion.div>

              {/* Retained By Team */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: 'spring', stiffness: 150 }}
                className="flex items-center gap-6 mb-8"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="relative"
                >
                  <div 
                    className="absolute inset-0 rounded-full blur-2xl"
                    style={{ background: team.color, opacity: 0.6 }}
                  />
                  <div 
                    className="relative w-32 h-32 rounded-full flex items-center justify-center"
                    style={{ 
                      background: `linear-gradient(135deg, ${team.color}60, ${team.color}90)`,
                      boxShadow: `0 0 60px ${team.color}`
                    }}
                  >
                    <img 
                      src={team.logo} 
                      alt={team.name} 
                      className="w-24 h-24 object-contain"
                    />
                  </div>
                </motion.div>

                <div className="text-center">
                  <div className="text-2xl text-gray-300 mb-2">RETAINED BY</div>
                  <div 
                    className="text-6xl font-black"
                    style={{ 
                      color: team.color,
                      textShadow: `0 0 30px ${team.color}, 0 4px 10px rgba(0,0,0,0.8)`,
                      fontFamily: 'Impact, sans-serif'
                    }}
                  >
                    {team.name.toUpperCase()}
                  </div>
                </div>
              </motion.div>

              {/* Price */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="px-12 py-6 rounded-3xl"
                style={{ 
                  background: `linear-gradient(135deg, ${team.color}60, ${team.color}40)`,
                  border: `4px solid ${team.color}`,
                  boxShadow: `0 0 60px ${team.color}80`
                }}
              >
                <div 
                  className="text-xl font-bold mb-2 text-white"
                  style={{ letterSpacing: '0.3em' }}
                >
                  RETENTION AMOUNT
                </div>
                <motion.div 
                  animate={{
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="font-black"
                  style={{
                    fontSize: '5rem',
                    color: '#FFD700',
                    textShadow: '0 0 40px rgba(255, 215, 0, 0.9), 0 0 80px rgba(255, 215, 0, 0.6)',
                    WebkitTextStroke: '3px rgba(184, 134, 11, 0.9)'
                  }}
                >
                  ₹{amount.toFixed(2)}Cr
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Particle burst */}
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 5, opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute rounded-full"
            style={{ 
              background: `radial-gradient(circle, ${team.color}40, transparent)`,
              width: '200px',
              height: '200px',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
