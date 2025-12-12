'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, SkipForward, Play } from 'lucide-react'
import { getAssetUrl } from '@/utils/appPaths'
// Removed TeamIntroTracker for frontend-only version

// Simple intro tracker replacement for frontend-only version
const TeamIntroTracker = {
  hasShownIntro: (teamName: string) => false,
  markIntroShown: (teamName: string) => { }
}

interface TeamWelcomeIntroProps {
  teamName: string
  onComplete: () => void
  show: boolean
}

export default function TeamWelcomeIntro({ teamName, onComplete, show }: TeamWelcomeIntroProps) {
  const [currentPhase, setCurrentPhase] = useState<'welcome' | 'video' | 'complete'>('welcome')
  const [showSkip, setShowSkip] = useState(false)
  const [hasShownIntro, setHasShownIntro] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Team data with colors and short names
  const teamData: { [key: string]: { color: string; shortName: string; logo: string } } = {
    'Mumbai Indians': { color: '#004BA0', shortName: 'MI', logo: getAssetUrl('/logos/Original Mumbai Indians PNG-SVG File Download Free Download.png') },
    'Chennai Super Kings': { color: '#F7C52D', shortName: 'CSK', logo: getAssetUrl('/logos/Original Chennai Super Fun Logo PNG - SVG File Download Free Download.png') },
    'Royal Challengers Bangalore': { color: '#D50000', shortName: 'RCB', logo: getAssetUrl('/logos/rcb-logo-png_seeklogo-531612.png') },
    'Kolkata Knight Riders': { color: '#3A225D', shortName: 'KKR', logo: getAssetUrl('/logos/Original Kolkata Knight Riders PNG-SVG File Download Free Download.png') },
    'Delhi Capitals': { color: '#282968', shortName: 'DC', logo: getAssetUrl('/logos/delhi-capitals.png') },
    'Punjab Kings': { color: '#ED1B24', shortName: 'PBKS', logo: getAssetUrl('/logos/Original Punjab Kings PNG-SVG File Download Free Download.png') },
    'Rajasthan Royals': { color: '#E91E63', shortName: 'RR', logo: getAssetUrl('/logos/Original Rajasthan Royals Logo PNG-SVG File Download Free Download.png') },
    'Sunrisers Hyderabad': { color: '#FF822A', shortName: 'SRH', logo: getAssetUrl('/logos/Original Sunrisers Hyderabad PNG-SVG File Download Free Download.png') },
    'Gujarat Titans': { color: '#1C2841', shortName: 'GT', logo: getAssetUrl('/logos/Original Gujarat Titans Logo PNG-SVG File Download Free Download.png') },
    'Lucknow Super Giants': { color: '#00A8CC', shortName: 'LSG', logo: getAssetUrl('/logos/Original Lucknow Super Giants PNG-SVG File Download Free Download.png') }
  }

  // Team video mapping
  const teamVideos: { [key: string]: string } = {
    'Mumbai Indians': getAssetUrl('/team-videos/mumbai-indians.mp4'),
    'Chennai Super Kings': getAssetUrl('/team-videos/chennai-super-kings.mp4'),
    'Royal Challengers Bangalore': getAssetUrl('/team-videos/royal-challengers-bangalore.mp4'),
    'Kolkata Knight Riders': getAssetUrl('/team-videos/kolkata-knight-riders.mp4'),
    'Delhi Capitals': getAssetUrl('/team-videos/delhi-capitals.mp4'),
    'Punjab Kings': getAssetUrl('/team-videos/punjab-kings.mp4'),
    'Rajasthan Royals': getAssetUrl('/team-videos/rajasthan-royals.mp4'),
    'Sunrisers Hyderabad': getAssetUrl('/team-videos/sunrisers-hyderabad.mp4'),
    'Gujarat Titans': getAssetUrl('/team-videos/gujarat-titans.mp4'),
    'Lucknow Super Giants': getAssetUrl('/team-videos/lucknow-super-giants.mp4')
  }

  const team = teamData[teamName]
  const videoSrc = teamVideos[teamName]

  // Always show welcome intro before video for all teams
  useEffect(() => {
    if (show && teamName) {
      const hasShown = false // Always show intro in frontend-only version
      setHasShownIntro(hasShown)

      // Always show welcome animation first, regardless of previous visits
      setCurrentPhase('welcome')

      // Auto-progress to video after welcome animation
      const welcomeTimer = setTimeout(() => {
        setCurrentPhase('video')
      }, 4000) // 4 seconds for welcome animation

      return () => clearTimeout(welcomeTimer)
    }
  }, [show, teamName])

  // Show skip button after 3 seconds in video phase
  useEffect(() => {
    if (currentPhase === 'video') {
      const timer = setTimeout(() => {
        setShowSkip(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [currentPhase])

  const handleVideoEnd = () => {
    // Mark intro as shown for this team
    if (!hasShownIntro && teamName) {
      TeamIntroTracker.markIntroShown(teamName)
    }
    onComplete()
  }

  const handleSkip = () => {
    // Mark intro as shown for this team
    if (!hasShownIntro && teamName) {
      TeamIntroTracker.markIntroShown(teamName)
    }
    onComplete()
  }

  const handleWelcomeComplete = () => {
    setCurrentPhase('video')
  }

  if (!show || !team) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden"
      >
        {/* Welcome Animation Phase */}
        {currentPhase === 'welcome' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${team.color}20, ${team.color}40, #000000)`
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
                duration: 4,
                ease: "easeInOut"
              }}
              className="absolute inset-0 opacity-20"
              style={{
                background: `radial-gradient(circle, ${team.color}40, transparent 70%)`
              }}
            />

            {/* Team Logo Animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                duration: 1.5,
                ease: "easeOut",
                type: "spring",
                stiffness: 100
              }}
              className="relative z-10 mb-8"
            >
              <div
                className="w-32 h-32 md:w-48 md:h-48 rounded-full flex items-center justify-center shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${team.color}, ${team.color}80)`,
                  boxShadow: `0 0 60px ${team.color}60`
                }}
              >
                <img
                  src={team.logo}
                  alt={teamName}
                  className="w-20 h-20 md:w-32 md:h-32 object-contain"
                />
              </div>
            </motion.div>

            {/* Welcome Text Animation */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-center relative z-10"
            >
              <motion.h1
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="text-4xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl"
              >
                WELCOME
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.8, duration: 0.8 }}
                className="text-6xl md:text-9xl font-black drop-shadow-2xl"
                style={{ color: team.color }}
              >
                {team.shortName}
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.4, duration: 0.6 }}
                className="text-xl md:text-3xl text-white/80 mt-4 font-bold"
              >
                {teamName}
              </motion.p>
            </motion.div>

            {/* Particle Effects */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 0,
                  scale: 0,
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  y: [Math.random() * window.innerHeight, -100]
                }}
                transition={{
                  duration: 3,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 3
                }}
                className="absolute w-2 h-2 rounded-full"
                style={{ backgroundColor: team.color }}
              />
            ))}

            {/* Skip Welcome Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              onClick={handleWelcomeComplete}
              className="absolute bottom-8 right-8 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 transition-all"
            >
              <Play className="w-5 h-5" />
              CONTINUE
            </motion.button>
          </motion.div>
        )}

        {/* Video Phase */}
        {currentPhase === 'video' && videoSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0"
          >
            <video
              ref={videoRef}
              src={videoSrc}
              autoPlay
              onEnded={handleVideoEnd}
              className="w-full h-full object-cover"
            />

            {/* Video Controls */}
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

            {/* Team Name Overlay on Video */}
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
        )}

        {/* Close Button (always visible) */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleSkip}
          className="absolute top-8 left-8 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 p-3 rounded-xl transition-all z-20"
        >
          <X className="w-6 h-6 text-white" />
        </motion.button>

        {/* Team Welcome Indicator */}
        {currentPhase === 'welcome' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3 }}
            className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-full text-sm font-bold z-20"
          >
            🎉 Welcome to your team!
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}