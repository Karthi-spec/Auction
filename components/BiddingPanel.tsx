import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuctionStore } from '@/store/auctionStore'
import { Zap, AlertCircle, ArrowUp, Gavel, Check } from 'lucide-react'
import { audioManager } from '@/utils/audioManager'
import { getAssetUrl } from '@/utils/appPaths'
import { getTeamLogoUrl } from '@/utils/teamLogos'




interface BiddingPanelProps {
  selectedTeam: string
  onTeamSelect: (team: string) => void
  isTeamLocked?: boolean
}

export default function BiddingPanel({ selectedTeam, onTeamSelect, isTeamLocked = false }: BiddingPanelProps) {
  const {
    currentPlayer,
    teams,
    bids,
    placeBid,
    rtmInProgress,
    rtmTeamName,
    rtmMatchedAmount,
    originalBidderTeam,
    waitingForHike,
    hikeAmount,
    initiateRTM,
    hikePrice,
    finalizeRTM,
    cancelRTM,
    undoLastBid
  } = useAuctionStore()
  const [customAmount, setCustomAmount] = useState('')
  const [bidError, setBidError] = useState('')

  // Clear error message after 3 seconds
  useEffect(() => {
    if (bidError) {
      const timer = setTimeout(() => {
        setBidError('')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [bidError])
  const [showRTMModal, setShowRTMModal] = useState(false)
  const [showHikeModal, setShowHikeModal] = useState(false)
  const [hikeAmountInput, setHikeAmountInput] = useState('')

  const BID_INCREMENT = 0.25 // ₹0.25Cr increment

  // Check if team has RTM available
  const canUseRTM = selectedTeam !== '' &&
    (teams.find(t => t.name === selectedTeam)?.rtmAvailable ?? 0) > 0

  // Check if this team is the original bidder waiting to hike
  const canHike = rtmInProgress && waitingForHike && selectedTeam === originalBidderTeam

  // Check if this team is the RTM team waiting for hike response
  const isRTMTeamWaiting = rtmInProgress && !waitingForHike && selectedTeam === rtmTeamName && hikeAmount !== null

  // Check if this team is the RTM team and original bidder declined to hike
  const canFinalizeRTM = rtmInProgress && !waitingForHike && selectedTeam === rtmTeamName && hikeAmount === null

  const handleBid = () => {
    if (!currentPlayer || !selectedTeam) {
      setBidError('Please select a team and ensure a player is available!')
      return
    }

    setBidError('')

    // Check if this team is the current highest bidder
    if (currentPlayer.currentBidder === selectedTeam) {
      setBidError('You are already the highest bidder!')
      return
    }

    // Calculate next bid (increment by 0.25Cr)
    const nextBid = currentPlayer.currentBid + BID_INCREMENT

    // Check team budget
    const team = teams.find(t => t.name === selectedTeam)
    if (!team || team.budget < nextBid) {
      setBidError('Insufficient budget for this bid!')
      return
    }

    console.log('Placing bid:', { selectedTeam, nextBid, currentBid: currentPlayer.currentBid })
    audioManager.playBidSound()
    placeBid(selectedTeam, nextBid)
  }

  const handleCustomBid = () => {
    if (!currentPlayer || !selectedTeam || !customAmount) return

    setBidError('')

    // Check if this team is the current highest bidder
    if (currentPlayer.currentBidder === selectedTeam) {
      setBidError('You are already the highest bidder!')
      return
    }

    const amount = parseFloat(customAmount)

    // Validate minimum increment
    if (amount < currentPlayer.currentBid + BID_INCREMENT) {
      setBidError(`Minimum bid is ₹${(currentPlayer.currentBid + BID_INCREMENT).toFixed(2)}Cr`)
      return
    }

    // Check team budget
    const team = teams.find(t => t.name === selectedTeam)
    if (!team || team.budget < amount) {
      setBidError('Insufficient budget for this bid!')
      return
    }

    audioManager.playBidSound()
    placeBid(selectedTeam, amount)
    setCustomAmount('')
  }

  const handleBasePriceBid = () => {
    if (!currentPlayer || !selectedTeam) {
      setBidError('Please select a team and ensure a player is available!')
      return
    }

    setBidError('')

    // Only allow base price bid if no one has bid yet
    if (currentPlayer.currentBid > currentPlayer.basePrice) {
      setBidError('Bidding has already started for this player!')
      return
    }

    console.log('Placing base price bid:', { selectedTeam, basePrice: currentPlayer.basePrice })
    audioManager.playBidSound()
    placeBid(selectedTeam, currentPlayer.basePrice)
  }

  const handleNotInterested = () => {
    // Skip this player - could be implemented with store action
    console.log('Not interested in', currentPlayer?.name)
  }



  const handleRTMClick = () => {
    if (!currentPlayer || !selectedTeam || !canUseRTM) return
    setShowRTMModal(true)
  }

  const handleRTMConfirm = () => {
    if (!currentPlayer || !selectedTeam) return

    // Automatically use current bid amount
    const amount = currentPlayer.currentBid
    // Play RTM sound effect
    audioManager.playRTMSound()
    // Initiate RTM process - wait for original bidder to hike
    initiateRTM(selectedTeam, amount)



    setShowRTMModal(false)
  }

  const handleHikeClick = () => {
    if (!rtmMatchedAmount) return
    // Pre-fill with RTM amount + increment
    setHikeAmountInput((rtmMatchedAmount + BID_INCREMENT).toFixed(2))
    setShowHikeModal(true)
  }

  const handleHikeConfirm = () => {
    if (!hikeAmountInput) return

    const amount = parseFloat(hikeAmountInput)
    if (amount > rtmMatchedAmount) {
      hikePrice(amount)
      setShowHikeModal(false)
      setHikeAmountInput('')
    }
  }

  const handleDeclineHike = () => {
    // Original bidder declines to hike - RTM team gets player at matched amount
    finalizeRTM(true)
  }

  const handleAcceptHike = () => {
    // RTM team accepts the hiked price
    finalizeRTM(true)
  }

  const handleDeclineHikedPrice = () => {
    // RTM team declines the hiked price - original bidder gets player
    finalizeRTM(false)
  }

  return (
    <>
      {/* Hike Modal */}
      {showHikeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-effect p-8 rounded-3xl max-w-md w-full mx-4"
          >
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">⚡</div>
              <h2 className="text-3xl font-bold">Hike the Price</h2>
            </div>
            <div className="mb-6">
              <div className="text-center mb-4">
                <div className="text-sm text-gray-400">Player</div>
                <div className="text-2xl font-bold">{currentPlayer?.name}</div>
                <div className="text-sm text-gray-400 mt-2">RTM Team: {rtmTeamName}</div>
                <div className="text-sm text-yellow-400 mt-1">RTM Matched: ₹{rtmMatchedAmount.toFixed(2)}Cr</div>
              </div>
              <label className="block text-sm text-gray-400 mb-2">New Hike Amount (Cr)</label>
              <input
                type="number"
                step="0.25"
                value={hikeAmountInput}
                onChange={(e) => setHikeAmountInput(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-2xl text-center focus:outline-none focus:border-yellow-400 transition-colors"
                placeholder="Enter hike amount..."
                autoFocus
              />
              <div className="text-xs text-gray-500 mt-2 text-center">
                Must be higher than ₹{rtmMatchedAmount.toFixed(2)}Cr
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleDeclineHike}
                className="glass-effect p-3 rounded-xl hover:bg-white/10"
              >
                Decline (Let RTM Win)
              </button>
              <button
                onClick={handleHikeConfirm}
                disabled={!hikeAmountInput || parseFloat(hikeAmountInput) <= rtmMatchedAmount}
                className="bg-yellow-500/20 hover:bg-yellow-500/30 p-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hike Price
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* RTM Modal */}
      {showRTMModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-effect p-8 rounded-3xl max-w-md w-full mx-4"
          >
            <div className="text-center mb-6">
              <img
                src={getAssetUrl('/rtm-card.svg')}
                alt="RTM"
                className="w-32 h-32 mx-auto mb-4 object-contain"
              />
              <h2 className="text-3xl font-bold">Right to Match</h2>
            </div>
            <div className="mb-6">
              <div className="text-center mb-4">
                <div className="text-sm text-gray-400">Player</div>
                <div className="text-2xl font-bold">{currentPlayer?.name}</div>
                <div className="text-sm text-gray-400 mt-2">Your Team: {selectedTeam}</div>
              </div>
              <div className="bg-blue-500/10 border-2 border-blue-500/30 p-6 rounded-xl mb-4">
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-2">You will match the current bid</div>
                  <div className="text-4xl font-bold text-blue-400">₹{currentPlayer?.currentBid.toFixed(2)}Cr</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 text-center">
                Note: After RTM, the bidding team can "hike" the price once more
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowRTMModal(false)}
                className="glass-effect p-3 rounded-xl hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleRTMConfirm}
                className="bg-blue-500/20 hover:bg-blue-500/30 p-3 rounded-xl font-bold"
              >
                Use RTM
              </button>
            </div>
          </motion.div>
        </div>
      )}


      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect p-6 rounded-2xl"
      >
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6 text-gold-400" />
          Place Your Bid
        </h3>

        {/* Team Selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm text-gray-400">
              {isTeamLocked ? 'Your Team' : 'Select Your Team'}
            </label>
            {isTeamLocked && (
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                Locked
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {teams.map((team) => (
              <motion.button
                key={team.id}
                whileHover={isTeamLocked ? {} : { scale: 1.02 }}
                whileTap={isTeamLocked ? {} : { scale: 0.98 }}
                onClick={() => !isTeamLocked && onTeamSelect(team.name)}
                disabled={isTeamLocked && selectedTeam !== team.name}
                className={`p-4 rounded-xl border-2 transition-all ${selectedTeam === team.name
                  ? 'border-gold-400 bg-gold-400/20'
                  : isTeamLocked
                    ? 'border-white/5 bg-white/5 opacity-30 cursor-not-allowed'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img src={getTeamLogoUrl(team.name)} alt={team.name} className="w-10 h-10 object-contain" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">{team.name}</div>
                    <div className="text-xs text-gold-400">₹{team.budget.toFixed(2)}Cr</div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Current Bid Display */}
        {currentPlayer && (
          <div className="bg-white/5 p-4 rounded-xl mb-6">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">Current Bid</div>
              <div className="text-3xl font-bold text-gold-400 mb-3">
                ₹{currentPlayer.currentBid.toFixed(2)}Cr
              </div>
              {currentPlayer.currentBidder && (() => {
                const bidderTeam = teams.find(t => t.name === currentPlayer.currentBidder)
                return (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm text-gray-400">Highest Bidder:</span>
                    {bidderTeam && (
                      <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg">
                        <img
                          src={getTeamLogoUrl(bidderTeam.name)}
                          alt={bidderTeam.name}
                          className="w-6 h-6 object-contain"
                        />
                        <span className="font-bold text-sm">{currentPlayer.currentBidder}</span>
                      </div>
                    )}
                  </div>
                )
              })()}
              {!currentPlayer.currentBidder && (
                <div className="text-sm text-gray-400">No bids yet</div>
              )}
            </div>
          </div>
        )}

        {/* RTM Process Status */}
        {rtmInProgress && (
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-blue-500/50 p-4 rounded-xl mb-6">
            <div className="text-center">
              <div className="text-lg font-bold mb-2">🎯 RTM IN PROGRESS</div>

              {waitingForHike && selectedTeam === originalBidderTeam && (
                <div>
                  <div className="text-sm text-gray-300 mb-3">
                    {rtmTeamName} used RTM to match ₹{rtmMatchedAmount.toFixed(2)}Cr
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleHikeClick}
                    className="bg-yellow-500/30 hover:bg-yellow-500/40 border-2 border-yellow-500 px-6 py-3 rounded-xl font-bold"
                  >
                    ⚡ HIKE THE PRICE
                  </motion.button>
                </div>
              )}

              {waitingForHike && selectedTeam === rtmTeamName && (
                <div className="text-sm text-gray-300">
                  ⏳ Waiting for {originalBidderTeam} to hike the price...
                </div>
              )}

              {!waitingForHike && hikeAmount !== null && (
                <div>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg mb-3">
                    <div className="text-center">
                      <div className="text-xs text-gray-400 mb-1">Hiked Price</div>
                      <div className="text-2xl font-bold text-yellow-400">₹{hikeAmount.toFixed(2)}Cr</div>
                      <div className="text-xs text-gray-400 mt-1">by {originalBidderTeam}</div>
                    </div>
                  </div>

                  {selectedTeam === rtmTeamName && (
                    <div className="grid grid-cols-2 gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAcceptHike}
                        className="bg-green-500/30 hover:bg-green-500/40 border-2 border-green-500 px-4 py-3 rounded-xl font-bold"
                      >
                        ✓ Match ₹{hikeAmount.toFixed(2)}Cr
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDeclineHikedPrice}
                        className="bg-red-500/30 hover:bg-red-500/40 border-2 border-red-500 px-4 py-3 rounded-xl font-bold"
                      >
                        ✗ Decline
                      </motion.button>
                    </div>
                  )}

                  {selectedTeam === originalBidderTeam && (
                    <div className="text-sm text-gray-300 text-center">
                      ⏳ Waiting for {rtmTeamName} to respond to your hike...
                    </div>
                  )}

                  {selectedTeam !== originalBidderTeam && selectedTeam !== rtmTeamName && (
                    <div className="text-sm text-gray-300 text-center">
                      ⏳ Waiting for {rtmTeamName} to respond...
                    </div>
                  )}
                </div>
              )}

              {waitingForHike && selectedTeam !== originalBidderTeam && selectedTeam !== rtmTeamName && (
                <div className="text-sm text-gray-300">
                  ⏳ RTM process ongoing - Waiting for {originalBidderTeam} to decide...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Bid Buttons */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {/* Bid Button - Start at base or increment by 0.25 */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={currentPlayer?.currentBid === currentPlayer?.basePrice && !currentPlayer?.currentBidder ? handleBasePriceBid : handleBid}
            disabled={!selectedTeam || !currentPlayer || currentPlayer.currentBidder === selectedTeam || rtmInProgress}
            className="bg-green-500/20 hover:bg-green-500/30 border-2 border-green-500/50 p-6 rounded-xl font-bold text-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentPlayer?.currentBid === currentPlayer?.basePrice && !currentPlayer?.currentBidder
              ? `Bid ₹${currentPlayer?.basePrice.toFixed(2)}Cr`
              : `Bid ₹${currentPlayer ? (currentPlayer.currentBid + BID_INCREMENT).toFixed(2) : '0.00'}Cr`
            }
          </motion.button>

          {/* RTM Button - Show only if eligible and no RTM in progress */}
          {canUseRTM && !rtmInProgress ? (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRTMClick}
              className="bg-blue-500/20 hover:bg-blue-500/30 border-2 border-blue-500/50 p-6 rounded-xl font-bold text-xl transition-all flex flex-col items-center justify-center gap-1"
            >
              <img
                src={getAssetUrl('/rtm-card.svg')}
                alt="RTM"
                className="w-12 h-12 object-contain"
              />
              <span className="text-sm">RTM</span>
            </motion.button>
          ) : (
            <motion.button
              disabled
              className="bg-gray-500/10 border-2 border-gray-500/20 p-6 rounded-xl font-bold text-xl opacity-30 cursor-not-allowed flex flex-col items-center justify-center gap-1"
            >
              <img
                src={getAssetUrl('/rtm-card.svg')}
                alt="RTM"
                className="w-12 h-12 object-contain grayscale"
              />
              <span className="text-sm">RTM</span>
            </motion.button>
          )}

          {/* Undo Last Bid Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={undoLastBid}
            disabled={!currentPlayer || bids.length === 0 || rtmInProgress}
            className="bg-orange-500/20 hover:bg-orange-500/30 border-2 border-orange-500/50 p-6 rounded-xl font-bold text-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-1"
          >
            <motion.div
              animate={{ rotate: [0, -15, 15, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              ↶
            </motion.div>
            <span className="text-sm">UNDO</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNotInterested}
            disabled={!selectedTeam || !currentPlayer || rtmInProgress}
            className="bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500/50 p-6 rounded-xl font-bold text-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Not Interested
          </motion.button>
        </div>

        {/* Custom Bid */}
        <div className="flex gap-3">
          <input
            type="number"
            step="0.25"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Custom amount..."
            disabled={rtmInProgress}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCustomBid}
            disabled={!selectedTeam || !currentPlayer || !customAmount || rtmInProgress}
            className="gold-gradient px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            BID
          </motion.button>
        </div>

        {/* Error Message Display */}
        {bidError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm text-center"
          >
            {bidError}
          </motion.div>
        )}
      </motion.div>
    </>
  )
}
