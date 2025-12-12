'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, SkipForward } from 'lucide-react'

interface VideoIntroProps {
  teamName: string
  onComplete: () => void
  show: boolean
}

export default function VideoIntro({ teamName, onComplete, show }: VideoIntroProps) {
  const [showSkip, setShowSkip] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Team video mapping
  const teamVideos: { [key: string]: string } = {
    'Mumbai Indians': '/team-videos/mumbai-indians.mp4',
    'Chennai Super Kings': '/team-videos/chennai-super-kings.mp4',
    'Royal Challengers Bangalore': '/team-videos/royal-challengers-bangalore.mp4',
    'Kolkata Knight Riders': '/team-videos/kolkata-knight-riders.mp4',
    'Delhi Capitals': '/team-videos/delhi-capitals.mp4',
    'Punjab Kings': '/team-videos/punjab-kings.mp4',
    'Rajasthan Royals': '/team-videos/rajasthan-royals.mp4',
    'Sunrisers Hyderabad': '/team-videos/sunrisers-hyderabad.mp4',
    'Gujarat Titans': '/team-videos/gujarat-titans.mp4',
    'Lucknow Super Giants': '/team-videos/lucknow-super-giants.mp4'
  }

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
    onComplete()
  }

  const handleSkip = () => {
    onComplete()
  }

  const videoSrc = teamVideos[teamName]

  if (!show || !videoSrc) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      >
        {/* Video */}
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          onEnded={handleVideoEnd}
          className="w-full h-full object-cover"
        />

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

        {/* Close Button (always visible) */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleSkip}
          className="absolute top-8 left-8 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 p-3 rounded-xl transition-all"
        >
          <X className="w-6 h-6 text-white" />
        </motion.button>

        {/* Team Name Overlay */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-8 right-8 text-center"
        >
          <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-2xl">
            {teamName}
          </h1>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}