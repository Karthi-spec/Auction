'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Copy, Check } from 'lucide-react'
import { useAuctionStore } from '@/store/auctionStore'
// Removed useConnectedClients for frontend-only version

interface TeamSelectionModalProps {
  onTeamSelect: (teamName: string) => void
  onClose: () => void
}

export default function TeamSelectionModal({ onTeamSelect, onClose }: TeamSelectionModalProps) {
  const { teams } = useAuctionStore()
  // Removed connection stats for frontend-only version
  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [copied, setCopied] = useState(false)

  // Generate shareable URL
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTeamSelect = (teamName: string) => {
    setSelectedTeam(teamName)
  }

  const handleJoinAuction = () => {
    if (selectedTeam) {
      onTeamSelect(selectedTeam)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-effect p-8 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 mb-4">
            <Users className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent mb-2">
            Join IPL Auction
          </h1>
          <p className="text-gray-400">Select your team to start bidding</p>
        </div>

        {/* Waiting Status */}
        <div className="bg-white/5 p-4 rounded-xl mb-6 text-center">
          <div className="text-sm text-gray-400 mb-2">Auction Status</div>
          <div className="text-xl font-bold">Waiting for auction to start</div>
        </div>

        {/* Share URL */}
        <div className="bg-white/5 p-4 rounded-xl mb-6">
          <div className="text-sm text-gray-400 mb-2">Share this URL with your friends to invite them</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyUrl}
              className="bg-purple-500 hover:bg-purple-600 px-6 py-2 rounded-lg font-bold flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy URL'}
            </motion.button>
          </div>
        </div>

        {/* Selected Team Display */}
        {selectedTeam && (
          <div className="bg-green-500/20 border border-green-500/50 p-4 rounded-xl mb-6 text-center">
            <div className="text-green-400 font-bold text-lg">
              You have joined as {selectedTeam}
            </div>
          </div>
        )}

        {/* Teams Joined Count */}
        <div className="text-center mb-6">
          <div className="text-gray-400 text-sm">
            {teams.length} teams available
          </div>
        </div>

        {/* Team Selection Grid */}
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-4">Select Your Team</h3>
          <div className="grid grid-cols-2 gap-4">
            {teams.map((team) => {
              const isSelected = selectedTeam === team.name
              const isJoined = false // Always available in frontend-only version
              
              return (
                <motion.button
                  key={team.id}
                  whileHover={isJoined ? {} : { scale: 1.05 }}
                  whileTap={isJoined ? {} : { scale: 0.95 }}
                  onClick={() => !isJoined && handleTeamSelect(team.name)}
                  disabled={isJoined}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-gold-400 bg-gold-500/20'
                      : isJoined
                      ? 'border-gray-600 bg-gray-500/20 opacity-50 cursor-not-allowed'
                      : 'border-white/10 hover:border-white/30 bg-white/5'
                  }`}
                  style={{
                    borderColor: isSelected ? '#FFD700' : isJoined ? '#666' : team.color,
                    background: isSelected
                      ? 'rgba(255, 215, 0, 0.2)'
                      : isJoined
                      ? 'rgba(100, 100, 100, 0.2)'
                      : `${team.color}20`,
                  }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <img src={team.logo} alt={team.name} className="w-16 h-16 object-contain" />
                    <div className="font-bold text-lg">{team.name}</div>
                    {isJoined && (
                      <div className="text-xs text-gray-400">Already Joined</div>
                    )}
                    {isSelected && !isJoined && (
                      <div className="text-xs text-gold-400 font-bold">SELECTED</div>
                    )}
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="flex-1 glass-effect p-4 rounded-xl hover:bg-white/10 font-bold"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleJoinAuction}
            disabled={!selectedTeam}
            className="flex-1 gold-gradient p-4 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join Auction
          </motion.button>
        </div>

        {/* Joined Teams List */}
        {teams.length > 0 && (
          <div className="mt-6 bg-white/5 p-4 rounded-xl">
            <div className="text-sm text-gray-400 mb-2">Teams in Auction:</div>
            <div className="space-y-1">
              {teams.map((team) => (
                <div key={team.id} className="text-sm flex items-center gap-2">
                  <img src={team.logo} alt={team.name} className="w-4 h-4 object-contain" />
                  • {team.name} joined
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
