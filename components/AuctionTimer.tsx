'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Clock, Play, Pause, RotateCcw } from 'lucide-react'
import { useAuctionStore } from '@/store/auctionStore'
import { audioManager } from '@/utils/audioManager'

interface AuctionTimerProps {
  isAdmin?: boolean
}

export default function AuctionTimer({ isAdmin = false }: AuctionTimerProps) {
  const { 
    timer, 
    timerLimit,
    isTimerRunning, 
    isTimerPaused,
    rtmInProgress,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    setTimerLimit,
    onTimerTick
  } = useAuctionStore()

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastTickSoundRef = useRef<number>(0)

  // Timer countdown effect
  useEffect(() => {
    if (isTimerRunning && !isTimerPaused) {
      intervalRef.current = setInterval(() => {
        onTimerTick()
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isTimerRunning, isTimerPaused, onTimerTick])

  // Audio ticking effect
  useEffect(() => {
    // Play tick sound in last 10 seconds
    if (isTimerRunning && !isTimerPaused && timer <= 10 && timer > 0) {
      // Prevent multiple sounds for the same second
      if (lastTickSoundRef.current !== timer) {
        audioManager.playCountdownSound()
        lastTickSoundRef.current = timer
      }
    }
  }, [timer, isTimerRunning, isTimerPaused])

  // Calculate timer display properties
  const percentage = (timer / timerLimit) * 100
  const isUrgent = timer <= 10 && isTimerRunning
  const isCritical = timer <= 5 && isTimerRunning

  const getTimerColor = () => {
    if (!isTimerRunning && !isTimerPaused) return '#3b82f6' // blue-500 (waiting for bid)
    if (isCritical) return '#ef4444' // red-500
    if (isUrgent) return '#f59e0b' // amber-500
    return '#10b981' // emerald-500
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="glass-effect p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Clock className="w-6 h-6" />
          Auction Timer
        </h3>
        
        {isAdmin && (
          <div className="flex items-center gap-2">
            {/* Timer Limit Selector */}
            <select
              value={timerLimit}
              onChange={(e) => setTimerLimit(parseInt(e.target.value))}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm"
              disabled={isTimerRunning}
            >
              <option value={15}>15s</option>
              <option value={30}>30s</option>
              <option value={45}>45s</option>
              <option value={60}>60s</option>
              <option value={90}>90s</option>
              <option value={120}>2min</option>
            </select>

            {/* Timer Controls */}
            <div className="flex gap-1">
              {!isTimerRunning ? (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={startTimer}
                  className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-500/50"
                >
                  <Play className="w-4 h-4 text-green-400" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={isTimerPaused ? resumeTimer : pauseTimer}
                  className={`p-2 rounded-lg border ${
                    isTimerPaused 
                      ? 'bg-green-500/20 hover:bg-green-500/30 border-green-500/50' 
                      : 'bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/50'
                  }`}
                >
                  {isTimerPaused ? (
                    <Play className="w-4 h-4 text-green-400" />
                  ) : (
                    <Pause className="w-4 h-4 text-yellow-400" />
                  )}
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={resetTimer}
                className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50"
              >
                <RotateCcw className="w-4 h-4 text-blue-400" />
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* Timer Display */}
      <div className="relative">
        {/* Background Circle */}
        <div className="relative w-32 h-32 mx-auto">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="8"
              fill="none"
            />
            
            {/* Progress circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              stroke={getTimerColor()}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - percentage / 100)}`}
              animate={{
                strokeDashoffset: `${2 * Math.PI * 45 * (1 - percentage / 100)}`,
                stroke: getTimerColor()
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{
                filter: isCritical ? 'drop-shadow(0 0 10px currentColor)' : 'none'
              }}
            />
          </svg>

          {/* Timer Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{
                scale: isCritical ? [1, 1.1, 1] : 1,
                color: getTimerColor()
              }}
              transition={{
                scale: { duration: 0.5, repeat: isCritical ? Infinity : 0 },
                color: { duration: 0.3 }
              }}
              className="text-center"
            >
              <div className="text-3xl font-bold">
                {formatTime(timer)}
              </div>
              <div className="text-xs opacity-70">
                {isTimerPaused && rtmInProgress ? 'RTM' : 
                 isTimerPaused ? 'PAUSED' : 
                 isTimerRunning ? 'RUNNING' : 'WAITING FOR BID'}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex justify-center gap-4 mt-4">
          {isTimerRunning && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="flex items-center gap-1 text-sm"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-green-400">LIVE</span>
            </motion.div>
          )}

          {isTimerPaused && rtmInProgress && (
            <div className="flex items-center gap-1 text-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              <span className="text-blue-400">RTM IN PROGRESS</span>
            </div>
          )}

          {!isTimerRunning && !isTimerPaused && (
            <motion.div
              animate={{ 
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-1 text-sm"
            >
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              <span className="text-blue-400">WAITING FOR FIRST BID</span>
            </motion.div>
          )}

          {isUrgent && isTimerRunning && !isTimerPaused && (
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="flex items-center gap-1 text-sm"
            >
              <div className={`w-2 h-2 rounded-full ${isCritical ? 'bg-red-400' : 'bg-amber-400'}`} />
              <span className={isCritical ? 'text-red-400' : 'text-amber-400'}>
                {isCritical ? 'CRITICAL!' : 'URGENT!'}
              </span>
            </motion.div>
          )}
        </div>

        {/* Timer Extension Info */}
        {!isAdmin && (
          <div className="mt-4 text-center text-sm text-gray-400">
            <p>🚀 Timer starts on first bid</p>
            <p>⏰ Timer extends +10s on new bids</p>
            <p>⏸️ Timer pauses during RTM</p>
          </div>
        )}
      </div>
    </div>
  )
}