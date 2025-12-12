'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Team } from '@/types'
import { getPlayerImage, handleImageError } from '@/utils/playerImage'
import { audioManager } from '@/utils/audioManager'

interface RTMAnimationProps {
  show: boolean
  team: Team | null
  playerName: string
  amount: number
  onComplete: () => void
}

export default function RTMAnimation({ show, team, playerName, amount, onComplete }: RTMAnimationProps) {
  const [showRTMCard, setShowRTMCard] = React.useState(true)
  const [showMatchedCard, setShowMatchedCard] = React.useState(false)

  React.useEffect(() => {
    if (show) {
      setShowRTMCard(true)
      setShowMatchedCard(false)
      
      // Play RTM success sound effect
      audioManager.playSuccessSound()
      
      // Show RTM card for 2 seconds, then show matched card
      const cardTimer = setTimeout(() => {
        setShowRTMCard(false)
        setShowMatchedCard(true)
      }, 2000)

      // Complete animation after 8 seconds total
      const completeTimer = setTimeout(() => {
        onComplete()
      }, 8000)

      return () => {
        clearTimeout(cardTimer)
        clearTimeout(completeTimer)
      }
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
          {/* RTM Card Animation */}
          <AnimatePresence>
            {showRTMCard && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {/* RTM Card Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -45, y: -200 }}
                  animate={{ 
                    scale: [0, 1.5, 1.2],
                    rotate: [-45, 0, 0],
                    y: [-200, 0, 0]
                  }}
                  transition={{ 
                    duration: 1.2,
                    times: [0, 0.7, 1],
                    ease: 'easeOut'
                  }}
                  className="relative"
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, -10, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      delay: 1.2,
                      duration: 0.8,
                      times: [0, 0.25, 0.5, 0.75, 1]
                    }}
                  >
                    <img 
                      src="/rtm-card.svg" 
                      alt="RTM Card"
                      className="w-64 h-64 object-contain"
                      style={{ 
                        filter: `drop-shadow(0 0 40px ${team.color})`
                      }}
                    />
                  </motion.div>
                </motion.div>

                {/* Impact effect */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 2, 3], opacity: [0, 1, 0] }}
                  transition={{ delay: 1.2, duration: 1 }}
                  className="absolute w-32 h-32 rounded-full"
                  style={{ 
                    background: `radial-gradient(circle, ${team.color}80, transparent)`,
                  }}
                />

                {/* Sound wave rings */}
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0.8 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ 
                      delay: 1.2 + i * 0.2,
                      duration: 1.5,
                      ease: 'easeOut'
                    }}
                    className="absolute w-32 h-32 rounded-full border-4"
                    style={{ borderColor: team.color }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Horizontal RTM Matched Card Animation */}
          <AnimatePresence>
            {showMatchedCard && (
              <>
                {/* Confetti particles */}
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      x: '50vw', 
                      y: '50vh',
                      scale: 0,
                      rotate: 0
                    }}
                    animate={{ 
                      x: `${Math.random() * 100}vw`,
                      y: `${Math.random() * 100}vh`,
                      scale: [0, 1, 0.5],
                      rotate: Math.random() * 360
                    }}
                    transition={{ 
                      duration: 3,
                      ease: 'easeOut',
                      delay: i * 0.05
                    }}
                    className="absolute w-3 h-3 rounded-full"
                    style={{ 
                      background: i % 2 === 0 ? team.color : '#3B82F6',
                      boxShadow: `0 0 20px ${team.color}`
                    }}
                  />
                ))}

          {/* Centered RTM Content */}
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
                  border: `6px solid #3B82F6`,
                  transform: 'scale(1.3)',
                  opacity: 0.6
                }}
              />

              {/* Player photo */}
              <div 
                className="relative w-80 h-80 rounded-full overflow-hidden border-8"
                style={{ 
                  borderColor: '#3B82F6',
                  boxShadow: `0 0 100px #3B82F680, 0 0 200px #3B82F640`,
                  background: `linear-gradient(135deg, #3B82F660, #3B82F630)`
                }}
              >
                <img
                  src={getPlayerImage(playerName)}
                  alt={playerName}
                  className="w-full h-full object-cover"
                  onError={(e) => handleImageError(e, playerName)}
                />
              </div>

              {/* Flowing RTM text on LEFT side */}
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
                    fontSize: '5rem',
                    color: '#3B82F6',
                    textShadow: '0 0 40px #3B82F6, 0 0 80px #3B82F6, 0 4px 10px rgba(0,0,0,0.9)',
                    fontFamily: 'Impact, sans-serif',
                    WebkitTextStroke: '3px #2563EB',
                    letterSpacing: '0.1em',
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '4px solid #3B82F6'
                  }}
                >
                  RTM
                </div>
              </motion.div>

              {/* Flowing RTM text on RIGHT side */}
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
                    fontSize: '5rem',
                    color: '#3B82F6',
                    textShadow: '0 0 40px #3B82F6, 0 0 80px #3B82F6, 0 4px 10px rgba(0,0,0,0.9)',
                    fontFamily: 'Impact, sans-serif',
                    WebkitTextStroke: '3px #2563EB',
                    letterSpacing: '0.1em',
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '4px solid #3B82F6'
                  }}
                >
                  RTM
                </div>
              </motion.div>
            </motion.div>

            {/* Player Name */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-7xl font-black mb-6 text-center"
              style={{ 
                color: '#FFFFFF',
                textShadow: `0 0 40px #3B82F6, 0 0 80px #3B82F6, 0 6px 15px rgba(0,0,0,0.9)`,
                fontFamily: 'Impact, sans-serif',
                WebkitTextStroke: `3px #3B82F6`,
                letterSpacing: '0.05em'
              }}
            >
              {playerName.toUpperCase()}
            </motion.div>

            {/* RTM By Team */}
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
                <div className="text-2xl text-gray-300 mb-2">RIGHT TO MATCH</div>
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
              className="px-12 py-6 rounded-3xl text-center"
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
                MATCHED AT
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
              </>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
