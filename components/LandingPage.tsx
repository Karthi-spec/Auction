'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Gavel, Shield, Zap, Share2, Copy, Check, Eye } from 'lucide-react'
import TeamSelectionModal from './TeamSelectionModal'
// Removed connectionStore for frontend-only version

interface LandingPageProps {
  onEnter: (role: 'bidder' | 'admin' | 'spectator', teamName?: string) => void
}

export default function LandingPage({ onEnter }: LandingPageProps) {
  const [showRoleSelection, setShowRoleSelection] = useState(false)
  const [showTeamSelection, setShowTeamSelection] = useState(false)
  const [showShareUrl, setShowShareUrl] = useState(false)
  const [copied, setCopied] = useState(false)
  // Removed connection store for frontend-only version

  const handleCreate = () => {
    setShowRoleSelection(true)
  }

  const handleRoleSelect = (role: 'team' | 'admin' | 'spectate') => {
    setShowRoleSelection(false)
    if (role === 'admin') {
      setShowShareUrl(true)
    } else if (role === 'spectate') {
      // User setting removed for frontend-only version
      onEnter('spectator')
    } else {
      setShowTeamSelection(true)
    }
  }

  const handleTeamSelect = (teamName: string) => {
    setShowTeamSelection(false)
    // User setting removed for frontend-only version
    onEnter('bidder', teamName)
  }

  const handleContinueAsAdmin = () => {
    setShowShareUrl(false)
    // User setting removed for frontend-only version
    onEnter('admin')
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(255, 215, 0, 0.15), transparent)' }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15), transparent)' }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"
          style={{ background: 'radial-gradient(circle, rgba(255, 215, 0, 0.1), transparent)' }}
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-4xl w-full"
      >
        <div className="text-center mb-12">

          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-4"
          >
            {/* CRIC ATTAX Logo - 3D Style */}
            <div className="flex flex-col items-center relative">
              {/* CRIC - 3D Teal/Cyan Style */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <h1 
                  className="text-9xl font-black tracking-wider relative z-10"
                  style={{ 
                    color: '#00D4AA',
                    textShadow: `
                      4px 4px 0px #008B8B,
                      8px 8px 0px #006666,
                      12px 12px 0px #004444,
                      16px 16px 20px rgba(0,0,0,0.8)
                    `,
                    fontFamily: 'Arial Black, Helvetica, sans-serif',
                    lineHeight: '0.8',
                    WebkitTextStroke: '3px #00B8A3',
                    fontWeight: '900',
                    letterSpacing: '0.05em',
                    background: 'linear-gradient(135deg, #00F5D4 0%, #00D4AA 50%, #00B8A3 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  CRIC
                </h1>
              </motion.div>
              
              {/* Metallic Bar with Stars */}
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="relative my-4 px-8 py-2 rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, #E5E5E5 0%, #CCCCCC 25%, #B8B8B8 50%, #A0A0A0 75%, #888888 100%)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.3)',
                  border: '2px solid #666666'
                }}
              >
                {/* 5 Stars */}
                <div className="flex items-center justify-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        delay: 0.7 + i * 0.1,
                        type: 'spring',
                        stiffness: 200
                      }}
                    >
                      <span 
                        className="text-3xl"
                        style={{ 
                          color: '#FFD700',
                          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                          filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))'
                        }}
                      >
                        ⭐
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              {/* ATTAX - 3D Red Style */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="relative"
              >
                <h1 
                  className="text-9xl font-black tracking-wider relative z-10"
                  style={{ 
                    color: '#FF4444',
                    textShadow: `
                      4px 4px 0px #CC0000,
                      8px 8px 0px #990000,
                      12px 12px 0px #660000,
                      16px 16px 20px rgba(0,0,0,0.8)
                    `,
                    fontFamily: 'Arial Black, Helvetica, sans-serif',
                    lineHeight: '0.8',
                    WebkitTextStroke: '3px #DD0000',
                    fontWeight: '900',
                    letterSpacing: '0.05em',
                    background: 'linear-gradient(135deg, #FF6666 0%, #FF4444 50%, #DD0000 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  ATTAX
                </h1>
              </motion.div>

              {/* Subtle glow effects */}
              <div 
                className="absolute inset-0 opacity-30 blur-3xl"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(0, 212, 170, 0.3) 0%, transparent 50%, rgba(255, 68, 68, 0.3) 100%)'
                }}
              />
            </div>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-2xl text-gray-300 font-semibold tracking-wide"
          >
            Professional Real-Time Bidding Platform
          </motion.p>
        </div>

        {!showRoleSelection && !showShareUrl ? (
          <div className="flex justify-center mb-12">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreate}
              className="glass-effect p-12 rounded-3xl hover:bg-white/10 transition-all group max-w-md"
            >
              <Gavel className="w-16 h-16 text-gold-400 mb-6 mx-auto group-hover:animate-pulse" />
              <h3 className="text-3xl font-bold mb-4">CREATE</h3>
              <p className="text-gray-400 text-lg">Start your auction experience</p>
            </motion.button>
          </div>
        ) : showRoleSelection && !showShareUrl ? (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleRoleSelect('team')}
              className="glass-effect p-8 rounded-2xl hover:bg-white/10 transition-all group"
            >
              <Zap className="w-12 h-12 text-gold-400 mb-4 mx-auto group-hover:animate-pulse" />
              <h3 className="text-2xl font-bold mb-2">Join as Team</h3>
              <p className="text-gray-400">Select your team and bid for players</p>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleRoleSelect('spectate')}
              className="glass-effect p-8 rounded-2xl hover:bg-white/10 transition-all group"
            >
              <Eye className="w-12 h-12 text-purple-400 mb-4 mx-auto group-hover:animate-pulse" />
              <h3 className="text-2xl font-bold mb-2">Spectate</h3>
              <p className="text-gray-400">Watch the auction live without bidding</p>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleRoleSelect('admin')}
              className="glass-effect p-8 rounded-2xl hover:bg-white/10 transition-all group"
            >
              <Shield className="w-12 h-12 text-blue-400 mb-4 mx-auto group-hover:animate-pulse" />
              <h3 className="text-2xl font-bold mb-2">Join as Admin</h3>
              <p className="text-gray-400">Control and manage the auction</p>
            </motion.button>
          </div>
        ) : showShareUrl ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-effect p-8 rounded-3xl max-w-2xl mx-auto mb-12"
          >
            <div className="text-center mb-6">
              <Share2 className="w-16 h-16 text-green-400 mb-4 mx-auto" />
              <h3 className="text-3xl font-bold mb-2">Auction Created!</h3>
              <p className="text-gray-400">Share this link with teams to join the auction</p>
            </div>

            <div className="bg-white/5 p-4 rounded-xl mb-6 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex-1 text-sm font-mono text-gray-300 break-all">
                  {typeof window !== 'undefined' ? window.location.href : 'Loading...'}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyUrl}
                  className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 px-4 py-2 rounded-lg transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleContinueAsAdmin}
                className="bg-green-500/20 hover:bg-green-500/30 border-2 border-green-500/50 px-8 py-4 rounded-xl font-bold text-lg"
              >
                Continue to Admin Panel
              </motion.button>
            </div>
          </motion.div>
        ) : null}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="grid grid-cols-3 gap-4 text-center"
        >
          <div className="glass-effect p-4 rounded-xl">
            <div className="text-3xl font-bold text-gold-400">Real-Time</div>
            <div className="text-sm text-gray-400">Live Bidding</div>
          </div>
          <div className="glass-effect p-4 rounded-xl">
            <div className="text-3xl font-bold text-gold-400">Secure</div>
            <div className="text-sm text-gray-400">Protected</div>
          </div>
          <div className="glass-effect p-4 rounded-xl">
            <div className="text-3xl font-bold text-gold-400">Fast</div>
            <div className="text-sm text-gray-400">Instant Updates</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Team Selection Modal */}
      {showTeamSelection && (
        <TeamSelectionModal
          onTeamSelect={handleTeamSelect}
          onClose={() => setShowTeamSelection(false)}
        />
      )}
    </div>
  )
}
