// Helper for GitHub Pages path
const getBasePath = (): string => {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/Auction')) {
    return '/Auction';
  }
  return '';
}

export function getPlayerVideoPath(playerName: string): string {
  // Clean player name for file matching
  const cleanName = playerName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

  const basePath = getBasePath();
  return `${basePath}/player-videos/${cleanName}.mp4`
}

export function getPlayerVideoUrl(playerName: string): string {
  const basePath = getBasePath();
  const cleanName = playerName.replace(/\s+/g, '_');
  const dashName = playerName.toLowerCase().replace(/\s+/g, '-');

  // Try local paths
  const possiblePaths = [
    `${basePath}/player-videos/${cleanName}.mp4`,
    `${basePath}/player-videos/${dashName}.mp4`,
    `${basePath}/Players/${dashName}.mp4` // Some might be in Players dir
  ];

  return possiblePaths[0];
}

export async function checkVideoExists(videoUrl: string): Promise<boolean> {
  try {
    const response = await fetch(videoUrl, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

// Common player names that might have videos
export const PLAYERS_WITH_VIDEOS = [
  'Virat Kohli',
  'MS Dhoni',
  'Rohit Sharma',
  'KL Rahul',
  'Rishabh Pant',
  'Hardik Pandya',
  'Jasprit Bumrah',
  'Yuzvendra Chahal',
  'Shubman Gill',
  'Yashasvi Jaiswal',
  'Ruturaj Gaikwad',
  'Shreyas Iyer',
  'Jos Buttler',
  'David Miller',
  'Kagiso Rabada',
  'Mitchell Starc',
  'Pat Cummins',
  'Rashid Khan',
  'Sunil Narine',
  'Andre Russell'
]

export function hasPlayerVideo(playerName: string): boolean {
  return PLAYERS_WITH_VIDEOS.includes(playerName)
}