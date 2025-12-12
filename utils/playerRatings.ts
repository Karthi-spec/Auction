// Player ratings utility
let playerRatingsCache: { [key: string]: number } | null = null

export const loadPlayerRatings = async (): Promise<{ [key: string]: number }> => {
  if (playerRatingsCache) {
    return playerRatingsCache
  }

  try {
    const response = await fetch('/playerRatings.json')
    const data = await response.json()
    const ratings = data.playerRatings || {}
    playerRatingsCache = ratings
    return ratings
  } catch (error) {
    console.error('Error loading player ratings:', error)
    const emptyRatings = {}
    playerRatingsCache = emptyRatings
    return emptyRatings
  }
}

export const getPlayerRating = (playerName: string, fallbackBasePrice: number = 2.0): number => {
  if (playerRatingsCache && playerRatingsCache[playerName]) {
    return playerRatingsCache[playerName]
  }
  
  // Fallback calculation based on base price
  return Math.min(10, Math.max(1, fallbackBasePrice * 2.5))
}

// Initialize ratings on module load
if (typeof window !== 'undefined') {
  loadPlayerRatings()
}