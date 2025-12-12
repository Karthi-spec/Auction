// Helper for GitHub Pages path
const getBasePath = (): string => {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/Auction')) {
    return '/Auction';
  }
  return '';
}

// Utility function to get player image path
export const getPlayerImage = (playerName: string): string => {
  const basePath = getBasePath();
  // Prioritize local public assets
  // Default to .png, fallback logic will handle others
  return `${basePath}/Players/${playerName}.png`;
}

// Fallback to local paths
export const getLocalPlayerImage = (playerName: string): string => {
  const basePath = getBasePath();
  return `${basePath}/Players/${playerName}.png`;
}

// Generate initials for avatar fallback
export const getPlayerInitials = (playerName: string): string => {
  const names = playerName.split(' ')
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
  }
  return playerName.substring(0, 2).toUpperCase()
}

// Handle image error with fallback to .jpg, then .avif, then initials
export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement>,
  playerName: string
) => {
  const target = e.target as HTMLImageElement
  const currentSrc = target.src
  const basePath = getBasePath();

  // Clean the current source to check path logic
  const isPng = currentSrc.includes('.png');
  const isJpg = currentSrc.endsWith('.jpg');
  const isAvif = currentSrc.endsWith('.avif');

  // Chain: png -> jpg -> avif -> initials
  if (isPng) {
    target.src = `${basePath}/Players/${playerName}.jpg`
  }
  else if (isJpg) {
    target.src = `${basePath}/Players/${playerName}.avif`
  }
  else if (isAvif) {
    // If all formats failed, show initials
    target.style.display = 'none'
    const parent = target.parentElement
    if (parent) {
      const size = parent.classList.contains('w-20') ? 'text-2xl' :
        parent.classList.contains('w-16') ? 'text-xl' :
          parent.classList.contains('w-14') ? 'text-lg' :
            parent.classList.contains('w-12') ? 'text-sm' : 'text-base'
      parent.innerHTML = `<div class="w-full h-full flex items-center justify-center ${size} font-bold bg-gray-200 text-gray-800">${getPlayerInitials(playerName)}</div>`
    }
  }
}
