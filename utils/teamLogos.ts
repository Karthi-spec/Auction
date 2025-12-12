// Team Logo Utility
// Handles team logo paths and availability

// Get server URL for static files
const getServerUrl = (): string => {
  return process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
}

// Helper for GitHub Pages path
const getBasePath = (): string => {
  // Check if running on GitHub Pages (often defined in env or inferred)
  // For this specific user deployment:
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/Auction')) {
    return '/Auction';
  }
  return '';
}

export function getTeamLogoUrl(teamName: string): string {
  const basePath = getBasePath();

  // Map team names to actual logo filenames found in public/logos
  const teamLogoMap: { [key: string]: string } = {
    'Mumbai Indians': 'Original Mumbai Indians PNG-SVG File Download Free Download.png',
    'Chennai Super Kings': 'Original Chennai Super Fun Logo PNG - SVG File Download Free Download.png',
    'Royal Challengers Bangalore': 'Original Royal Challengers Bangalore PNG-SVG File Download Free Download.png',
    'Kolkata Knight Riders': 'Original Kolkata Knight Riders PNG-SVG File Download Free Download.png',
    'Delhi Capitals': 'Original Delhi Capitals Logo PNG-SVG File Download Free Download.jpg', // Updated to match public/logo file
    'Punjab Kings': 'Original Punjab Kings PNG-SVG File Download Free Download.png',
    'Rajasthan Royals': 'Original Rajasthan Royals Logo PNG-SVG File Download Free Download.png',
    'Sunrisers Hyderabad': 'Original Sunrisers Hyderabad PNG-SVG File Download Free Download.png',
    'Gujarat Titans': 'Original Gujarat Titans Logo PNG-SVG File Download Free Download.png',
    'Lucknow Super Giants': 'Original Lucknow Super Giants PNG-SVG File Download Free Download.png'
  };

  const logoFile = teamLogoMap[teamName];

  if (logoFile) {
    return `${basePath}/logos/${logoFile}`;
  }

  // Fallback for others
  return `${basePath}/logos/${teamName.replace(/\s+/g, '_')}.png`;
}

export function getTeamLogoByShortName(shortName: string): string {
  const basePath = getBasePath();
  return `${basePath}/logos/${shortName}.png`;
}

// Handle logo error with fallback
export const handleLogoError = (
  e: React.SyntheticEvent<HTMLImageElement>,
  teamName: string
) => {
  const target = e.target as HTMLImageElement;
  target.style.display = 'none';
  const parent = target.parentElement;
  if (parent) {
    const initials = teamName.split(' ').map(word => word[0]).join('').toUpperCase();
    parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-sm font-bold bg-gray-200 text-gray-800 rounded">${initials}</div>`;
  }
};

// Team video paths for intro videos
export function getTeamVideoUrl(teamName: string): string {
  const basePath = getBasePath();

  // Map team names to actual video filenames
  const teamVideoMap: { [key: string]: string } = {
    'Mumbai Indians': 'mumbai indians.mp4',
    'Chennai Super Kings': 'csk.mp4',
    'Royal Challengers Bangalore': 'rcb.mp4',
    'Kolkata Knight Riders': 'KKR.mp4',
    'Delhi Capitals': 'DC.mp4',
    'Punjab Kings': 'pbks.mp4',
    'Rajasthan Royals': 'RR.mp4',
    'Sunrisers Hyderabad': 'Srh.mp4',
    'Gujarat Titans': 'Gt.mp4',
    'Lucknow Super Giants': 'lsg.mp4'
  };

  const videoFile = teamVideoMap[teamName] || `${teamName.replace(/\s+/g, '_')}.mp4`;
  return `${basePath}/team-videos/${videoFile}`;
}

export async function checkTeamVideoExists(teamName: string): Promise<boolean> {
  try {
    const videoUrl = getTeamVideoUrl(teamName);
    const response = await fetch(videoUrl, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}