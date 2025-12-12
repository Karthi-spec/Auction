'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, SkipForward, Volume2, VolumeX } from 'lucide-react'
import { getPlayerVideoUrl, checkVideoExists } from '@/utils/playerVideo'

interface PlayerVideoModalProps {
  show: boolean
  playerName: string
  onComplete: () => void
  context: 'retention' | 'auction'
  teamColor?: string
}

export default function PlayerVideoModal({ 
  show, 
  playerName, 
  onComplete, 
  context,
  teamColor = '#FFD700'
}: PlayerVideoModalProps) {
  const [videoExists, setVideoExists] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showSkip, setShowSkip] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const videoUrl = getPlayerVideoUrl(playerName)

  // Check if video exists when component mounts
  useEffect(() => {
    if (show && playerName) {
      setIsLoading(true)
      checkVideoExists(videoUrl).then(exists => {
        setVideoExists(exists)
        setIsLoading(false)
        
        if (!exists) {
          // If no video exists, auto-complete after 2 seconds
          setTimeout(onComplete, 2000)
        }
      })
    }
  }, [show, playerName, videoUrl, onComplete])

  // Show skip button after 3 seconds
  useEffect(() => {
    if (show && videoExists) {
      const timer = setTimeout(() => {
        setShowSkip(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [show, videoExists])

  const handleVideoEnd = () => {
    onComplete()
  }

  const handleSkip = () => {
    onComplete()
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(videoRef.current.muted)
    }
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
        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 border-4 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white">Loading {playerName}...</h2>
          </motion.div>
        )}

        {/* No Video Available */}
        {!isLoading && !videoExists && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center glass-effect p-8 rounded-2xl max-w-md mx-4"
          >
            <div 
              className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl font-bold"
              style={{ 
                background: `linear-gradient(135deg, ${teamColor}, ${teamColor}80)`,
                boxShadow: `0 0 30px ${teamColor}60`
              }}
            >
              {playerName.split(' ').map(n => n[0]).join('')}
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{playerName}</h2>
            <p className="text-gray-400 mb-4">
              {context === 'retention' ? 'Successfully Retained!' : 'Up for Auction'}
            </p>
            <div className="text-sm text-gray-500">
              Video not available
            </div>
          </motion.div>
        )}

        {/* Video Player */}
        {!isLoading && videoExists && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full h-full"
          >
            <video
              ref={videoRef}
              src={videoUrl}
              autoPlay
              onEnded={handleVideoEnd}
              className="w-full h-full object-cover"
              muted={isMuted}
            />

            {/* Player Name Overlay */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="absolute bottom-8 left-8 right-8"
            >
              <div className="text-center">
                <h1 
                  className="text-4xl md:text-6xl font-black drop-shadow-2xl mb-2"
                  style={{ color: teamColor }}
                >
                  {playerName}
                </h1>
                <div className="text-xl md:text-2xl text-white/80 font-bold">
                  {context === 'retention' ? '🏆 RETAINED' : '⚡ UP FOR AUCTION'}
                </div>
              </div>
            </motion.div>

            {/* Context Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute top-8 left-1/2 transform -translate-x-1/2"
            >
              <div 
                className="px-6 py-3 rounded-full font-bold text-lg border-2"
                style={{ 
                  backgroundColor: `${teamColor}20`,
                  borderColor: teamColor,
                  color: teamColor,
                  boxShadow: `0 0 20px ${teamColor}40`
                }}
              >
                {context === 'retention' ? '🎉 PLAYER RETAINED' : '🔥 AUCTION TIME'}
              </div>
            </motion.div>

            {/* Controls */}
            <div className="absolute top-8 right-8 flex gap-3">
              {/* Mute Toggle */}
              <button
                onClick={toggleMute}
                className="bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 p-3 rounded-xl transition-all"
              >
                {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
              </button>

              {/* Skip Button */}
              <AnimatePresence>
                {showSkip && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={handleSkip}
                    className="bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 transition-all"
                  >
                    <SkipForward className="w-5 h-5" />
                    SKIP
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Close Button */}
            <button
              onClick={handleSkip}
              className="absolute top-8 left-8 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 p-3 rounded-xl transition-all"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}