// Get server URL for static files
const getServerUrl = (): string => {
  return process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
}

// Utility function to get player image path
export const getPlayerImage = (playerName: string): string => {
  const serverUrl = getServerUrl();
  // Try backend static serving first, then fallback to local
  return `${serverUrl}/static/players/${playerName}.png`;
}

// Get player image with .jpg extension
export const getPlayerImageJpg = (playerName: string): string => {
  const serverUrl = getServerUrl();
  return `${serverUrl}/static/players/${playerName}.jpg`;
}

// Get player image with .avif extension
export const getPlayerImageAvif = (playerName: string): string => {
  const serverUrl = getServerUrl();
  return `${serverUrl}/static/players/${playerName}.avif`;
}

// Fallback to local paths
export const getLocalPlayerImage = (playerName: string): string => {
  return `/Players/${playerName}.png`;
}

// Generate initials for avatar fallback
export const getPlayerInitials = (playerName: string): string => {
  const names = playerName.split(' ')
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
  }
  return playerName.substring(0, 2).toUpperCase()
}

// Handle image error with fallback to .jpg, then .avif, then local, then initials
export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement>,
  playerName: string
) => {
  const target = e.target as HTMLImageElement
  const currentSrc = target.src
  const serverUrl = getServerUrl();
  
  // If we tried server .png, try server .jpg
  if (currentSrc.includes('/static/players/') && currentSrc.endsWith('.png')) {
    target.src = getPlayerImageJpg(playerName)
  } 
  // If we tried server .jpg, try server .avif
  else if (currentSrc.includes('/static/players/') && currentSrc.endsWith('.jpg')) {
    target.src = getPlayerImageAvif(playerName)
  }
  // If we tried server .avif, try local paths
  else if (currentSrc.includes('/static/players/') && currentSrc.endsWith('.avif')) {
    target.src = getLocalPlayerImage(playerName)
  }
  // If we tried local .png, try local .jpg
  else if (currentSrc.includes('/Players/') && currentSrc.endsWith('.png')) {
    target.src = `/Players/${playerName}.jpg`
  }
  // If we tried local .jpg, try local .avif
  else if (currentSrc.includes('/Players/') && currentSrc.endsWith('.jpg')) {
    target.src = `/Players/${playerName}.avif`
  }
  // If all formats failed, show initials
  else {
    target.style.display = 'none'
    const parent = target.parentElement
    if (parent) {
      const size = parent.classList.contains('w-20') ? 'text-2xl' : 
                   parent.classList.contains('w-16') ? 'text-xl' :
                   parent.classList.contains('w-14') ? 'text-lg' :
                   parent.classList.contains('w-12') ? 'text-sm' : 'text-base'
      parent.innerHTML = `<div class="w-full h-full flex items-center justify-center ${size} font-bold">${getPlayerInitials(playerName)}</div>`
    }
  }
}
