// Player Video Utility
// Handles player video paths and availability

// Get server URL for static files
const getServerUrl = (): string => {
  return process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
}

export function getPlayerVideoPath(playerName: string): string {
  // Clean player name for file matching
  const cleanName = playerName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
  
  const serverUrl = getServerUrl();
  // Try backend static serving first
  return `${serverUrl}/static/videos/${cleanName}.mp4`
}

export function getPlayerVideoUrl(playerName: string): string {
  // Try different naming conventions
  const serverUrl = getServerUrl();
  const cleanName = playerName.replace(/\s+/g, '_');
  
  // Try backend static serving with different formats
  const possiblePaths = [
    `${serverUrl}/static/videos/${cleanName}.mp4`,
    `${serverUrl}/static/videos/${playerName.replace(/\s+/g, '-').toLowerCase()}.mp4`,
    `${serverUrl}/static/videos/${playerName.replace(/\s+/g, '_')}.mp4`,
    // Fallback to local paths
    `/Player Video/${cleanName}.mp4`,
    `/player-videos/${playerName.toLowerCase().replace(/\s+/g, '-')}.mp4`
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