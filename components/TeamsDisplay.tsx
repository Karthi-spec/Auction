'use client'

import { motion } from 'framer-motion'
import { useAuctionStore } from '@/store/auctionStore'
import { getTeamLogoUrl, handleLogoError } from '@/utils/teamLogos'
// Removed useConnectedClients for frontend-only version

export default function TeamsDisplay() {
  const { teams } = useAuctionStore()
  // Removed connection checking for frontend-only version

  // Helper function to determine if color is too dark
  const isColorDark = (color: string) => {
    // Convert hex to RGB
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance < 0.5
  }

  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-10 gap-4 max-w-7xl">
        {teams.map((team, idx) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="relative"
          >
            {/* Decorative Circle Background */}
            <div 
              className="relative w-20 h-20 rounded-full p-1"
              style={{ 
                background: `conic-gradient(from 0deg, ${team.color}, ${team.color}80, ${team.color}, ${team.color}80, ${team.color})`,
              }}
            >
              {/* Inner Circle */}
              <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center p-2">
                {/* Team Logo */}
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-1.5">
                  <img 
                    src={getTeamLogoUrl(team.name)} 
                    alt={team.name} 
                    className="w-full h-full object-contain"
                    onError={(e) => handleLogoError(e, team.name)}
                  />
                </div>
              </div>
              
              {/* Online Status Indicator - Always show in frontend-only version */}
              {true && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 bg-white rounded-full"
                  />
                </motion.div>
              )}
            </div>

            {/* Funds Remaining */}
            <div className="mt-2 text-center">
              <div className="text-[10px] text-gray-400 mb-0.5">Funds</div>
              <div 
                className="text-sm font-bold"
                style={{ 
                  color: team.color,
                  textShadow: `0 0 10px ${team.color}80, 0 1px 2px rgba(0,0,0,0.8)`
                }}
              >
                ₹{team.budget}Cr
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
