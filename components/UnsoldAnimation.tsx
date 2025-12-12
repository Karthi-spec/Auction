'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, XCircle } from 'lucide-react'
import { getPlayerImage, handleImageError } from '@/utils/playerImage'
import { audioManager } from '@/utils/audioManager'

interface UnsoldAnimationProps {
  show: boolean
  playerName: string
  onComplete: () => void
}

export default function UnsoldAnimation({ show, playerName, onComplete }: UnsoldAnimationProps) {
  React.useEffect(() => {
    if (show) {
      // Play unsold sound effect
      audioManager.playUnsoldSound()
      
      // Complete animation after 6 seconds
      const completeTimer = setTimeout(() => {
        onComplete()
      }, 6000)

      return () => clearTimeout(completeTimer)
    }
  }, [show, onComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80"
        >
          {/* Red particles explosion */}
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: '50vw', 
                y: '50vh',
                scale: 0,
                opacity: 1
              }}
              animate={{ 
                x: `${Math.random() * 100}vw`,
                y: `${Math.random() * 100}vh`,
                scale: [0, 1, 0],
                opacity: [1, 0.8, 0]
              }}
              transition={{ 
                duration: 2,
                ease: 'easeOut',
                delay: i * 0.03
              }}
              className="absolute w-4 h-4 bg-red-500 rounded-full"
            />
          ))}

          {/* Main UNSOLD text */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: [0, 1.5, 1],
              rotate: [180, 0, 0]
            }}
            transition={{ 
              duration: 0.8,
              ease: 'easeOut'
            }}
            className="relative"
          >
            {/* Glowing background */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute inset-0 bg-red-500 blur-3xl"
            />

            {/* UNSOLD text with 3D effect */}
            <div className="relative">
              {/* Shadow layers for 3D effect */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    transform: `translate(${i * 2}px, ${i * 2}px)`,
                    opacity: 0.2 - i * 0.02,
                  }}
                >
                  <div 
                    className="font-black"
                    style={{
                      fontSize: '8rem',
                      color: '#7F1D1D',
                      fontFamily: 'Impact, sans-serif',
                      letterSpacing: '0.1em'
                    }}
                  >
                    UNSOLD
                  </div>
                </div>
              ))}

              {/* Main text */}
              <motion.div
                animate={{
                  textShadow: [
                    '0 0 30px rgba(239, 68, 68, 1), 0 0 60px rgba(239, 68, 68, 0.8), 0 0 90px rgba(239, 68, 68, 0.6)',
                    '0 0 50px rgba(239, 68, 68, 1), 0 0 100px rgba(239, 68, 68, 1), 0 0 150px rgba(239, 68, 68, 0.8)',
                    '0 0 30px rgba(239, 68, 68, 1), 0 0 60px rgba(239, 68, 68, 0.8), 0 0 90px rgba(239, 68, 68, 0.6)',
                  ]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="relative font-black"
                style={{
                  fontSize: '8rem',
                  color: '#FF4444',
                  WebkitTextStroke: '5px rgba(139, 0, 0, 1)',
                  fontFamily: 'Impact, sans-serif',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}
              >
                UNSOLD
              </motion.div>
            </div>
          </motion.div>

          {/* Player name */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-32 text-center flex flex-col items-center"
          >
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-gray-400 to-gray-600 flex-shrink-0 mb-3">
              <img
                src={getPlayerImage(playerName)}
                alt={playerName}
                className="w-full h-full object-cover grayscale"
                onError={(e) => handleImageError(e, playerName)}
              />
            </div>
            <div 
              className="text-4xl font-black mb-2"
              style={{
                color: '#FFFFFF',
                textShadow: '0 0 20px rgba(0, 0, 0, 0.8), 0 4px 8px rgba(0, 0, 0, 0.6)',
                fontFamily: 'Impact, sans-serif'
              }}
            >
              {playerName}
            </div>
            <div 
              className="text-xl font-bold"
              style={{
                color: '#FF6B6B',
                textShadow: '0 0 15px rgba(0, 0, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.6)'
              }}
            >
              Did not receive any bids
            </div>
          </motion.div>

          {/* X marks */}
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: 0 }}
              animate={{ 
                scale: [0, 1.5, 1],
                rotate: [0, 180, 180]
              }}
              transition={{ 
                delay: 0.3 + i * 0.2,
                duration: 0.6
              }}
              className="absolute"
              style={{
                left: i === 0 ? '20%' : '80%',
                top: '50%',
              }}
            >
              <XCircle className="w-24 h-24 text-red-500" strokeWidth={3} />
            </motion.div>
          ))}

          {/* Expanding red ring */}
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 2, ease: 'easeOut' }}
            className="absolute w-64 h-64 border-8 border-red-500 rounded-full"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
