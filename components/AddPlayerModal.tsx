'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Plus, User } from 'lucide-react'
import { useAuctionStore } from '@/store/auctionStore'

interface AddPlayerModalProps {
  show: boolean
  onClose: () => void
}

export default function AddPlayerModal({ show, onClose }: AddPlayerModalProps) {
  const { addPlayer } = useAuctionStore()
  const [formData, setFormData] = useState({
    name: '',
    role: 'Batsman',
    country: 'India',
    basePrice: 0.3,
    set: 'Uncapped'
  })

  const roles = ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper']
  const countries = [
    'India', 'Australia', 'England', 'South Africa', 'New Zealand', 
    'West Indies', 'Pakistan', 'Sri Lanka', 'Bangladesh', 'Afghanistan',
    'Zimbabwe', 'Ireland', 'Netherlands', 'USA', 'Canada'
  ]
  const sets = [
    'M1', 'M2', // Marquee sets
    'BA1', 'BA2', 'BA3', // Batter sets
    'AL1', 'AL2', 'AL3', // All-rounder sets
    'WK1', 'WK2', 'WK3', // Wicket-keeper sets
    'FA1', 'FA2', 'FA3', // Fast bowler sets
    'SP1', 'SP2', 'SP3', // Spinner sets
    'UBA1', 'UBA2', 'UBA3', // Uncapped batter sets
    'UAL1', 'UAL2', 'UAL3', // Uncapped all-rounder sets
    'UWK1', 'UWK2', 'UWK3', // Uncapped wicket-keeper sets
    'UFA1', 'UFA2', 'UFA3', // Uncapped fast bowler sets
    'USP1', 'USP2', 'USP3'  // Uncapped spinner sets
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('Player name is required')
      return
    }

    const newPlayer = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      role: formData.role,
      country: formData.country,
      basePrice: formData.basePrice,
      currentBid: formData.basePrice,
      status: 'available' as const,
      set: formData.set,
      stats: {
        matches: 0,
        runs: 0,
        wickets: 0,
        average: 0,
        strikeRate: 0,
        economy: 0
      }
    }

    addPlayer(newPlayer)
    
    // Reset form
    setFormData({
      name: '',
      role: 'Batsman',
      country: 'India',
      basePrice: 0.3,
      set: 'Uncapped'
    })
    
    onClose()
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="glass-effect p-8 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <User className="w-8 h-8 text-blue-400" />
            Add New Player
          </h2>
          <button
            onClick={onClose}
            className="glass-effect p-2 rounded-xl hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Player Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Player Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400 transition-colors"
              placeholder="Enter player name..."
              required
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400 transition-colors"
            >
              {roles.map(role => (
                <option key={role} value={role} className="bg-gray-800">
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Country
            </label>
            <select
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400 transition-colors"
            >
              {countries.map(country => (
                <option key={country} value={country} className="bg-gray-800">
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* Base Price */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Base Price (Cr)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.2"
              max="2.0"
              value={formData.basePrice}
              onChange={(e) => handleInputChange('basePrice', parseFloat(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400 transition-colors"
            />
            <div className="text-xs text-gray-400 mt-1">
              Range: ₹0.2Cr - ₹2.0Cr
            </div>
          </div>

          {/* Set */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Player Set
            </label>
            <select
              value={formData.set}
              onChange={(e) => handleInputChange('set', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400 transition-colors"
            >
              {sets.map(set => (
                <option key={set} value={set} className="bg-gray-800">
                  {set}
                </option>
              ))}
            </select>
          </div>

          {/* Preview */}
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <h3 className="text-lg font-bold mb-3">Preview</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
                {formData.name.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
              </div>
              <div>
                <div className="text-xl font-bold">{formData.name || 'Player Name'}</div>
                <div className="text-sm text-gray-400">
                  {formData.role} • {formData.country}
                </div>
                <div className="text-sm text-gray-500">
                  {formData.set} • Base Price: ₹{formData.basePrice.toFixed(2)}Cr
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 glass-effect p-4 rounded-xl hover:bg-white/10 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 border-2 border-blue-500/50 p-4 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Player
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}