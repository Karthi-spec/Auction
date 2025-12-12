'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, SkipForward } from 'lucide-react'

interface FirstTimeIntroProps {
  onComplete: () => void
  show: boolean
}

export default function FirstTimeIntro({ onComplete, show }: FirstTimeIntroProps) {
  const [showSkip, setShowSkip] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (show) {
      // Show skip button after 3 seconds
      const timer = setTimeout(() => {
        setShowSkip(true)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [show])

  const handleVideoEnd = () => {
    // Mark as seen in localStorage
    localStorage.setItem('ipl-auction-intro-seen', 'true')
    onComplete()
  }

  const handleSkip = () => {
    // Mark as seen in localStorage
    localStorage.setItem('ipl-auction-intro-seen', 'true')
    onComplete()
  }

  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      >
        {/* Welcome Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)'
          }}
        >
          {/* Animated Background Elements */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 8,
              ease: "easeInOut",
              repeat: Infinity
            }}
            className="absolute inset-0 opacity-20"
            style={{
              background: 'radial-gradient(circle, #ff6b35, transparent 70%)'
            }}
          />

          {/* IPL Logo Animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              duration: 2,
              ease: "easeOut",
              type: "spring",
              stiffness: 100
            }}
            className="relative z-10 mb-8"
          >
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full flex items-center justify-center shadow-2xl bg-gradient-to-br from-orange-500 to-blue-600">
              <div className="text-6xl md:text-8xl font-black text-white">
                IPL
              </div>
            </div>
          </motion.div>

          {/* Welcome Text Animation */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="text-center relative z-10"
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2, duration: 0.8 }}
              className="text-5xl md:text-8xl font-black text-white mb-6 drop-shadow-2xl"
            >
              WELCOME TO
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 2.8, duration: 1 }}
              className="text-6xl md:text-9xl font-black drop-shadow-2xl bg-gradient-to-r from-orange-400 to-blue-500 bg-clip-text text-transparent"
            >
              IPL AUCTION
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3.8, duration: 0.8 }}
              className="text-2xl md:text-4xl text-white/80 mt-6 font-bold"
            >
              2025 MEGA AUCTION
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 4.5, duration: 0.8 }}
              className="text-lg md:text-2xl text-orange-300 mt-4 font-semibold"
            >
              Build Your Dream Team
            </motion.p>
          </motion.div>

          {/* Particle Effects */}
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 0,
                scale: 0,
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080)
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                y: [
                  Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080), 
                  -100
                ]
              }}
              transition={{
                duration: 4,
                delay: Math.random() * 3,
                repeat: Infinity,
                repeatDelay: Math.random() * 4
              }}
              className="absolute w-3 h-3 rounded-full"
              style={{ 
                backgroundColor: Math.random() > 0.5 ? '#ff6b35' : '#4a90e2',
                boxShadow: '0 0 10px currentColor'
              }}
            />
          ))}

          {/* Continue Button */}
          <motion.button
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 5.5, duration: 0.8 }}
            onClick={handleSkip}
            className="absolute bottom-12 bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 px-8 py-4 rounded-xl font-bold text-white text-xl flex items-center gap-3 transition-all transform hover:scale-105 shadow-2xl"
          >
            <SkipForward className="w-6 h-6" />
            ENTER AUCTION
          </motion.button>
        </motion.div>

        {/* Skip Button */}
        <AnimatePresence>
          {showSkip && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleSkip}
              className="absolute top-8 right-8 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 transition-all"
            >
              <SkipForward className="w-5 h-5" />
              SKIP
            </motion.button>
          )}
        </AnimatePresence>

        {/* Close Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          onClick={handleSkip}
          className="absolute top-8 left-8 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 p-3 rounded-xl transition-all"
        >
          <X className="w-6 h-6 text-white" />
        </motion.button>
      </motion.div>
    </AnimatePresence>
  )
}