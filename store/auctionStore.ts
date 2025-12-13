import { create } from 'zustand'
import { Player, Team, Bid } from '@/types'
import { Socket } from 'socket.io-client'
import playersData from '@/players.json'
import { triggerSoldAnimation, triggerRTMAnimation, triggerRetainedAnimation, triggerUnsoldAnimation } from '@/utils/animationManager'

interface PendingAction {
  id: string
  type: 'sold' | 'retain' | 'rtm' | 'unsold'
  playerName: string
  teamName: string
  amount: number
  timestamp: number
  rtmData?: {
    isRTM: boolean
    originalBidder?: string
    hikedAmount?: number
  }
}

interface AuctionState {
  players: Player[]
  teams: Team[]
  currentPlayer: Player | null
  bids: Bid[]
  isAuctionActive: boolean
  timer: number
  timerLimit: number
  isTimerRunning: boolean
  isTimerPaused: boolean
  showRTMModal: boolean
  rtmTeam: Team | null
  showRTMAnimation: boolean
  rtmAnimationData: { team: Team; playerName: string; amount: number } | null
  showSoldAnimation: boolean
  soldAnimationData: { team: Team; playerName: string; amount: number } | null
  showRetainedAnimation: boolean
  retainedAnimationData: { team: Team; playerName: string; amount: number } | null
  showUnsoldAnimation: boolean
  unsoldAnimationData: { playerName: string } | null
  rtmInProgress: boolean
  rtmTeamName: string | null
  rtmMatchedAmount: number
  originalBidderTeam: string | null
  waitingForHike: boolean
  hikeAmount: number | null
  pendingActions: PendingAction[]
  maxRetentions: number
  maxRTM: number
  socket: Socket | null

  // Retention Phase
  retentionPhaseActive: boolean
  retentionPhaseComplete: boolean
  limitsConfigured: boolean
  teamRetentionStatus: { [teamName: string]: 'pending' | 'confirmed' | 'completed' }

  // Actions
  startAuction: () => void
  pauseAuction: () => void
  updateTeamLimits: (maxRetentions: number, maxRTM: number) => void
  startRetentionPhase: () => void
  completeRetentionPhase: () => void
  nextPlayer: () => void
  placeBid: (teamName: string, amount: number) => void
  addPlayer: (player: Omit<Player, 'id'>) => void
  addTeam: (team: Omit<Team, 'id'>) => void
  useRTM: (teamName: string) => void
  retainPlayer: (teamName: string, playerName: string, amount: number) => void
  setShowRTMModal: (show: boolean) => void
  setShowRTMAnimation: (show: boolean) => void
  setShowSoldAnimation: (show: boolean) => void
  setShowRetainedAnimation: (show: boolean) => void
  setShowUnsoldAnimation: (show: boolean) => void
  sellPlayer: (teamName: string, amount: number) => void
  sellPlayerWithRTM: (teamName: string, amount: number) => void
  sellPlayerRetained: (teamName: string, amount: number) => void
  markUnsold: () => void
  initiateRTM: (rtmTeamName: string, matchedAmount: number) => void
  hikePrice: (newAmount: number) => void
  finalizeRTM: (accept: boolean) => void
  cancelRTM: () => void
  approvePendingAction: (actionId: string) => void
  rejectPendingAction: (actionId: string) => void
  requestSold: (teamName: string, amount: number) => void
  requestRetain: (teamName: string, amount: number) => void
  requestRTM: (teamName: string, amount: number, rtmData?: any) => void
  requestRetention: (teamName: string, playerName: string, amount: number) => void
  approveRetention: (actionId: string) => void
  rejectRetention: (actionId: string) => void
  confirmTeamRetentions: (teamName: string) => void
  refreshCurrentPlayer: () => void
  resetAuction: () => void
  undoLastBid: () => void
  undoRetention: (teamName: string, playerName: string) => void
  bringBackUnsoldPlayer: (playerId: string) => void
  pendingRetentions: PendingAction[]

  // Timer Actions
  startTimer: () => void
  pauseTimer: () => void
  resumeTimer: () => void
  resetTimer: () => void
  setTimerLimit: (seconds: number) => void
  extendTimer: (seconds: number) => void
  onTimerTick: () => void
  onTimerExpired: () => void

  // Socket Actions
  setSocket: (socket: Socket) => void
  handleSocketBid: (data: { teamName: string; amount: number; playerId: string }) => void
  handleSocketSold: (teamName: string, amount: number) => void
  handleSocketUnsold: () => void
}

// MARQUEE SET Players
const marqueeSetPlayers: Player[] = [
  { id: '327', name: 'Rishabh Pant', role: 'Wicket-Keeper', country: 'India', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Marquee', stats: { matches: 111, runs: 3284, average: 35.3, strikeRate: 147.9 } },
  { id: '328', name: 'Shreyas Iyer', role: 'Batsman', country: 'India', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Marquee', stats: { matches: 115, runs: 3127, average: 32.1, strikeRate: 126.8 } },
  { id: '329', name: 'KL Rahul', role: 'Wicket-Keeper', country: 'India', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Marquee', stats: { matches: 132, runs: 4163, average: 45.5, strikeRate: 134.6 } },
  { id: '400', name: 'Arshdeep Singh', role: 'Bowler', country: 'India', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Marquee', stats: { matches: 65, wickets: 76, average: 28.5, economy: 9.1 } },
  { id: '401', name: 'Yuzvendra Chahal', role: 'Bowler', country: 'India', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Marquee', stats: { matches: 159, wickets: 205, average: 25.4, economy: 7.8 } },
  { id: '402', name: 'Mohammed Shami', role: 'Bowler', country: 'India', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Marquee', stats: { matches: 112, wickets: 127, average: 28.6, economy: 9.2 } },
  { id: '403', name: 'Mitchell Starc', role: 'Bowler', country: 'Australia', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Marquee', stats: { matches: 41, wickets: 51, average: 25.3, economy: 8.3 } },
  { id: '404', name: 'Jos Buttler', role: 'Wicket-Keeper', country: 'England', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Marquee', stats: { matches: 107, runs: 3582, average: 35.3, strikeRate: 148.9 } },
  { id: '405', name: 'Liam Livingstone', role: 'All-Rounder', country: 'England', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Marquee', stats: { matches: 38, runs: 748, average: 28.8, strikeRate: 153.9 } },
  { id: '406', name: 'David Miller', role: 'Batsman', country: 'South Africa', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Marquee', stats: { matches: 142, runs: 2933, average: 36.2, strikeRate: 139.4 } },
  { id: '407', name: 'Kagiso Rabada', role: 'Bowler', country: 'South Africa', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Marquee', stats: { matches: 76, wickets: 103, average: 22.8, economy: 8.2 } }
]

// CAPPED SET Players
const cappedSetPlayers: Player[] = [
  { id: '408', name: 'Khaleel Ahmed', role: 'Bowler', country: 'India', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Capped', stats: { matches: 29, wickets: 26, average: 35.5, economy: 9.3 } },
  { id: '409', name: 'Ishan Kishan', role: 'Wicket-Keeper', country: 'India', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Capped', stats: { matches: 48, runs: 1133, average: 27.0, strikeRate: 135.0 } },
  { id: '410', name: 'Devdutt Padikkal', role: 'Batsman', country: 'India', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Capped', stats: { matches: 29, runs: 556, average: 21.4, strikeRate: 124.4 } },
  { id: '411', name: 'Rahul Chahar', role: 'Bowler', country: 'India', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Capped', stats: { matches: 44, wickets: 44, average: 29.8, economy: 7.8 } },
  { id: '412', name: 'Shardul Thakur', role: 'All-Rounder', country: 'India', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Capped', stats: { matches: 61, wickets: 63, average: 32.5, economy: 9.5 } },
  { id: '413', name: 'Krunal Pandya', role: 'All-Rounder', country: 'India', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Capped', stats: { matches: 109, runs: 1143, average: 22.0, strikeRate: 143.8 } },
  { id: '414', name: 'Deepak Chahar', role: 'Bowler', country: 'India', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Capped', stats: { matches: 72, wickets: 72, average: 28.3, economy: 8.2 } },
  { id: '415', name: 'Jonny Bairstow', role: 'Wicket-Keeper', country: 'England', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Capped', stats: { matches: 44, runs: 1038, average: 28.8, strikeRate: 136.1 } },
  { id: '416', name: 'Sam Curran', role: 'All-Rounder', country: 'England', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Capped', stats: { matches: 62, wickets: 62, average: 32.5, economy: 9.2 } },
  { id: '417', name: 'Glenn Maxwell', role: 'All-Rounder', country: 'Australia', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Capped', stats: { matches: 132, runs: 2771, average: 22.5, strikeRate: 154.4 } },
  { id: '418', name: 'Marcus Stoinis', role: 'All-Rounder', country: 'Australia', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Capped', stats: { matches: 74, runs: 1388, average: 28.3, strikeRate: 135.0 } },
  { id: '419', name: 'Faf du Plessis', role: 'Batsman', country: 'South Africa', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Capped', stats: { matches: 100, runs: 2935, average: 33.7, strikeRate: 130.0 } },
  { id: '420', name: 'Quinton de Kock', role: 'Wicket-Keeper', country: 'South Africa', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Capped', stats: { matches: 94, runs: 2962, average: 33.5, strikeRate: 135.9 } }
]

// UNCAPPED SET Players  
const uncappedSetPlayers: Player[] = [
  { id: '421', name: 'Avesh Khan', role: 'Bowler', country: 'India', basePrice: 0.5, currentBid: 0.5, status: 'available', set: 'Uncapped', stats: { matches: 39, wickets: 42, average: 30.5, economy: 9.1 } },
  { id: '422', name: 'Kuldeep Yadav', role: 'Bowler', country: 'India', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Uncapped', stats: { matches: 76, wickets: 88, average: 25.6, economy: 7.6 } },
  { id: '423', name: 'Axar Patel', role: 'All-Rounder', country: 'India', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Uncapped', stats: { matches: 123, wickets: 127, average: 23.4, economy: 7.5 } },
  { id: '424', name: 'Washington Sundar', role: 'All-Rounder', country: 'India', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Uncapped', stats: { matches: 62, wickets: 45, average: 32.8, economy: 7.1 } },
  { id: '425', name: 'Ravichandran Ashwin', role: 'Bowler', country: 'India', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Uncapped', stats: { matches: 195, wickets: 180, average: 28.3, economy: 7.2 } },
  { id: '426', name: 'Shivam Dube', role: 'All-Rounder', country: 'India', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Uncapped', stats: { matches: 68, runs: 1162, average: 26.4, strikeRate: 133.9 } },
  { id: '427', name: 'Rinku Singh', role: 'Batsman', country: 'India', basePrice: 0.5, currentBid: 0.5, status: 'available', set: 'Uncapped', stats: { matches: 30, runs: 629, average: 41.9, strikeRate: 143.3 } },
  { id: '428', name: 'Tilak Varma', role: 'Batsman', country: 'India', basePrice: 0.5, currentBid: 0.5, status: 'available', set: 'Uncapped', stats: { matches: 33, runs: 794, average: 35.2, strikeRate: 140.5 } },
  { id: '429', name: 'Shubman Gill', role: 'Batsman', country: 'India', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Uncapped', stats: { matches: 87, runs: 2763, average: 34.5, strikeRate: 132.6 } },
  { id: '430', name: 'Yashasvi Jaiswal', role: 'Batsman', country: 'India', basePrice: 0.5, currentBid: 0.5, status: 'available', set: 'Uncapped', stats: { matches: 29, runs: 1141, average: 42.3, strikeRate: 148.5 } },
  { id: '431', name: 'Abhishek Sharma', role: 'All-Rounder', country: 'India', basePrice: 0.5, currentBid: 0.5, status: 'available', set: 'Uncapped', stats: { matches: 42, runs: 684, average: 21.4, strikeRate: 163.8 } },
  { id: '432', name: 'Riyan Parag', role: 'All-Rounder', country: 'India', basePrice: 0.5, currentBid: 0.5, status: 'available', set: 'Uncapped', stats: { matches: 76, runs: 1127, average: 23.5, strikeRate: 143.2 } },
  { id: '433', name: 'Harshit Rana', role: 'Bowler', country: 'India', basePrice: 0.5, currentBid: 0.5, status: 'available', set: 'Uncapped', stats: { matches: 7, wickets: 11, average: 24.5, economy: 9.3 } },
  { id: '434', name: 'Mayank Yadav', role: 'Bowler', country: 'India', basePrice: 0.5, currentBid: 0.5, status: 'available', set: 'Uncapped', stats: { matches: 4, wickets: 7, average: 12.4, economy: 6.2 } },
  { id: '435', name: 'Nitish Kumar Reddy', role: 'All-Rounder', country: 'India', basePrice: 0.5, currentBid: 0.5, status: 'available', set: 'Uncapped', stats: { matches: 4, runs: 83, average: 27.7, strikeRate: 136.1 } },
  { id: '436', name: 'Ramandeep Singh', role: 'All-Rounder', country: 'India', basePrice: 0.5, currentBid: 0.5, status: 'available', set: 'Uncapped', stats: { matches: 3, runs: 35, average: 17.5, strikeRate: 145.8 } },
  { id: '437', name: 'Vaibhav Arora', role: 'Bowler', country: 'India', basePrice: 0.5, currentBid: 0.5, status: 'available', set: 'Uncapped', stats: { matches: 19, wickets: 16, average: 35.1, economy: 9.8 } },
  { id: '438', name: 'Mohsin Khan', role: 'Bowler', country: 'India', basePrice: 0.5, currentBid: 0.5, status: 'available', set: 'Uncapped', stats: { matches: 24, wickets: 23, average: 28.3, economy: 8.5 } },
  { id: '439', name: 'Umran Malik', role: 'Bowler', country: 'India', basePrice: 0.5, currentBid: 0.5, status: 'available', set: 'Uncapped', stats: { matches: 28, wickets: 29, average: 36.2, economy: 10.2 } },
  { id: '440', name: 'Akash Madhwal', role: 'Bowler', country: 'India', basePrice: 0.5, currentBid: 0.5, status: 'available', set: 'Uncapped', stats: { matches: 13, wickets: 15, average: 27.3, economy: 8.9 } },
  { id: '441', name: 'Prabhsimran Singh', role: 'Wicket-Keeper', country: 'India', basePrice: 0.5, currentBid: 0.5, status: 'available', set: 'Uncapped', stats: { matches: 25, runs: 411, average: 18.7, strikeRate: 158.5 } },
  { id: '442', name: 'Jitesh Sharma', role: 'Wicket-Keeper', country: 'India', basePrice: 0.5, currentBid: 0.5, status: 'available', set: 'Uncapped', stats: { matches: 32, runs: 730, average: 36.5, strikeRate: 147.5 } },
  { id: '443', name: 'Dhruv Jurel', role: 'Wicket-Keeper', country: 'India', basePrice: 0.5, currentBid: 0.5, status: 'available', set: 'Uncapped', stats: { matches: 8, runs: 141, average: 28.2, strikeRate: 122.6 } },
  { id: '444', name: 'Sanju Samson', role: 'Wicket-Keeper', country: 'India', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Uncapped', stats: { matches: 153, runs: 3907, average: 29.9, strikeRate: 137.4 } },
  { id: '445', name: 'Anuj Rawat', role: 'Wicket-Keeper', country: 'India', basePrice: 0.5, currentBid: 0.5, status: 'available', set: 'Uncapped', stats: { matches: 29, runs: 449, average: 17.3, strikeRate: 130.1 } },
  { id: '446', name: 'Rahul Tripathi', role: 'Batsman', country: 'India', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Uncapped', stats: { matches: 93, runs: 2320, average: 28.4, strikeRate: 146.3 } },
  { id: '447', name: 'Manish Pandey', role: 'Batsman', country: 'India', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Uncapped', stats: { matches: 147, runs: 3647, average: 29.7, strikeRate: 121.5 } },
  { id: '448', name: 'Ajinkya Rahane', role: 'Batsman', country: 'India', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Uncapped', stats: { matches: 159, runs: 4187, average: 31.8, strikeRate: 121.8 } },
  { id: '449', name: 'Mayank Agarwal', role: 'Batsman', country: 'India', basePrice: 2.0, currentBid: 2.0, status: 'available', set: 'Uncapped', stats: { matches: 118, runs: 3252, average: 30.0, strikeRate: 133.4 } },
  { id: '450', name: 'Prithvi Shaw', role: 'Batsman', country: 'India', basePrice: 0.5, currentBid: 0.5, status: 'available', set: 'Uncapped', stats: { matches: 79, runs: 1892, average: 24.8, strikeRate: 147.4 } }
]

// Team name mapping from abbreviations to full names
const teamNameMapping: { [key: string]: string } = {
  'MI': 'Mumbai Indians',
  'CSK': 'Chennai Super Kings',
  'RCB': 'Royal Challengers Bangalore',
  'KKR': 'Kolkata Knight Riders',
  'DC': 'Delhi Capitals',
  'PBKS': 'Punjab Kings',
  'RR': 'Rajasthan Royals',
  'SRH': 'Sunrisers Hyderabad',
  'GT': 'Gujarat Titans',
  'LSG': 'Lucknow Super Giants'
}

// Convert players from JSON to Player type
const convertJsonToPlayer = (jsonPlayer: any): Player => {
  return {
    id: jsonPlayer.id.toString(),
    name: jsonPlayer.name || jsonPlayer.fullName,
    role: jsonPlayer.specialism || 'All-Rounder',
    country: jsonPlayer.country || 'India',
    basePrice: jsonPlayer.basePrice || 0.3,
    currentBid: jsonPlayer.basePrice || 0.3,
    status: 'available',
    set: jsonPlayer.category || 'Uncapped',
    categoryOrder: jsonPlayer.categoryOrder || 5,
    stats: {
      matches: jsonPlayer.iplCaps || 0,
      runs: 0,
      average: 0,
      strikeRate: 0,
      wickets: 0,
      economy: 0
    },
    previousTeam: teamNameMapping[jsonPlayer.previousTeam || jsonPlayer.retainedBy] || jsonPlayer.previousTeam || jsonPlayer.retainedBy,
    retainedAmount: undefined,
    soldPrice: jsonPlayer.soldPrice
  }
}

// Load all players from JSON and sort by category order
const samplePlayers: Player[] = playersData.players
  .map(convertJsonToPlayer)
  .sort((a, b) => {
    // Sort by categoryOrder first, then by id
    const orderA = a.categoryOrder || 99
    const orderB = b.categoryOrder || 99
    if (orderA !== orderB) {
      return orderA - orderB
    }
    return parseInt(a.id) - parseInt(b.id)
  })

// Helper to get logo URL
import { getTeamLogoUrl } from '@/utils/teamLogos'

const sampleTeams: Team[] = [
  {
    id: '1',
    name: 'Mumbai Indians',
    budget: 125,
    players: [],
    color: '#004BA0',
    logo: getTeamLogoUrl('Mumbai Indians'),
    rtmAvailable: 1,
    retentionsUsed: 0
  },
  {
    id: '2',
    name: 'Chennai Super Kings',
    budget: 125,
    players: [],
    color: '#FDB913',
    logo: getTeamLogoUrl('Chennai Super Kings'),
    rtmAvailable: 1,
    retentionsUsed: 0
  },
  {
    id: '3',
    name: 'Royal Challengers Bangalore',
    budget: 125,
    players: [],
    color: '#EC1C24',
    logo: getTeamLogoUrl('Royal Challengers Bangalore'),
    rtmAvailable: 1,
    retentionsUsed: 0
  },
  {
    id: '4',
    name: 'Kolkata Knight Riders',
    budget: 125,
    players: [],
    color: '#6A4A9E',
    logo: getTeamLogoUrl('Kolkata Knight Riders'),
    rtmAvailable: 1,
    retentionsUsed: 0
  },
  {
    id: '5',
    name: 'Delhi Capitals',
    budget: 125,
    players: [],
    color: '#004C93',
    logo: getTeamLogoUrl('Delhi Capitals'),
    rtmAvailable: 1,
    retentionsUsed: 0
  },
  {
    id: '6',
    name: 'Punjab Kings',
    budget: 125,
    players: [],
    color: '#DD1F2D',
    logo: getTeamLogoUrl('Punjab Kings'),
    rtmAvailable: 1,
    retentionsUsed: 0
  },
  {
    id: '7',
    name: 'Rajasthan Royals',
    budget: 125,
    players: [],
    color: '#254AA5',
    logo: getTeamLogoUrl('Rajasthan Royals'),
    rtmAvailable: 1,
    retentionsUsed: 0
  },
  {
    id: '8',
    name: 'Sunrisers Hyderabad',
    budget: 125,
    players: [],
    color: '#FF822A',
    logo: getTeamLogoUrl('Sunrisers Hyderabad'),
    rtmAvailable: 1,
    retentionsUsed: 0
  },
  {
    id: '9',
    name: 'Gujarat Titans',
    budget: 125,
    players: [],
    color: '#4A90E2',
    logo: getTeamLogoUrl('Gujarat Titans'),
    rtmAvailable: 1,
    retentionsUsed: 0
  },
  {
    id: '10',
    name: 'Lucknow Super Giants',
    budget: 125,
    players: [],
    color: '#0E7BC6',
    logo: getTeamLogoUrl('Lucknow Super Giants'),
    rtmAvailable: 1,
    retentionsUsed: 0
  }
]

// Populate teams with retained players and adjust budgets
const populateTeamsWithRetainedPlayers = (teams: Team[], players: Player[]): Team[] => {
  const teamMap = new Map(teams.map(team => [team.name, { ...team }]))

  // Add retained players to their teams
  players.forEach(player => {
    if (player.status === 'retained' && player.previousTeam && player.retainedAmount) {
      // Convert abbreviation to full team name
      const fullTeamName = teamNameMapping[player.previousTeam] || player.previousTeam
      const team = teamMap.get(fullTeamName)
      if (team) {
        team.players.push(player)
        team.budget -= player.retainedAmount
        team.retentionsUsed += 1
      }
    }
  })

  return Array.from(teamMap.values())
}

// Start with clean teams (no pre-retained players)
const initializedTeams = sampleTeams

// Helper function to check squad limits
const canAddPlayerToTeam = (team: Team, player: Player): { canAdd: boolean; reason?: string } => {
  const MAX_SQUAD_SIZE = 25
  const MAX_OVERSEAS = 8

  // Check squad size
  if (team.players.length >= MAX_SQUAD_SIZE) {
    return { canAdd: false, reason: `Squad full (${MAX_SQUAD_SIZE} players maximum)` }
  }

  // Check overseas limit
  if (player.country !== 'India') {
    const overseasCount = team.players.filter(p => p.country !== 'India').length
    if (overseasCount >= MAX_OVERSEAS) {
      return { canAdd: false, reason: `Overseas quota full (${MAX_OVERSEAS} maximum)` }
    }
  }

  return { canAdd: true }
}

export const useAuctionStore = create<AuctionState>((set, get) => ({
  players: samplePlayers,
  teams: initializedTeams,
  currentPlayer: samplePlayers.find(p => p.status === 'available') || samplePlayers[0],
  bids: [],
  isAuctionActive: false,
  timer: 30,
  timerLimit: 30,
  isTimerRunning: false,
  isTimerPaused: false,
  showRTMModal: false,
  rtmTeam: null,
  showRTMAnimation: false,
  rtmAnimationData: null,
  showSoldAnimation: false,
  soldAnimationData: null,
  showRetainedAnimation: false,
  retainedAnimationData: null,
  showUnsoldAnimation: false,
  unsoldAnimationData: null,
  rtmInProgress: false,
  rtmTeamName: null,
  rtmMatchedAmount: 0,
  originalBidderTeam: null,
  waitingForHike: false,
  hikeAmount: null,
  pendingActions: [],
  pendingRetentions: [],
  maxRetentions: 6,
  maxRTM: 1,
  retentionPhaseActive: false,
  retentionPhaseComplete: false,
  limitsConfigured: false,
  teamRetentionStatus: {},
  socket: null,

  startAuction: () => {
    const { players } = get()

    // Get first available player (exclude retained, sold, unsold)
    const availablePlayers = players.filter(p => p.status === 'available')
    const firstPlayer = availablePlayers.length > 0 ? availablePlayers[0] : null

    const { timerLimit } = get()
    set({
      isAuctionActive: true,
      currentPlayer: firstPlayer,
      timer: timerLimit,
      bids: [], // Clear any previous bidding history
      isTimerRunning: false, // Don't start timer until first bid
      isTimerPaused: false
    })
  },

  pauseAuction: () => set({
    isAuctionActive: false,
    isTimerPaused: true // Pause timer when auction is paused
  }),

  updateTeamLimits: (maxRetentions: number, maxRTM: number) => {
    set((state) => ({
      maxRetentions,
      maxRTM,
      limitsConfigured: true,
      teams: state.teams.map(team => ({
        ...team,
        rtmAvailable: maxRTM,
      }))
    }))
  },

  startRetentionPhase: () => {
    const { players, teams } = get()

    // Reset all previously retained players to available status
    const resetPlayers = players.map(player => ({
      ...player,
      status: player.status === 'retained' ? 'available' as const : player.status,
      retainedAmount: undefined,
      soldPrice: undefined
    }))

    // Reset team retention counts and budgets
    const resetTeams = teams.map(team => ({
      ...team,
      retentionsUsed: 0,
      budget: 125, // Reset to full budget
      players: [] // Clear all players from teams
    }))

    // Initialize team retention status
    const teamRetentionStatus: { [teamName: string]: 'pending' | 'confirmed' | 'completed' } = {}
    teams.forEach(team => {
      teamRetentionStatus[team.name] = 'pending'
    })

    set({
      retentionPhaseActive: true,
      retentionPhaseComplete: false,
      players: resetPlayers,
      teams: resetTeams,
      teamRetentionStatus,
      pendingRetentions: []
    })
  },

  completeRetentionPhase: () => {
    const { teams, maxRetentions, players } = get()

    // Calculate RTM slots for each team based on unused retentions
    const updatedTeams = teams.map(team => ({
      ...team,
      rtmAvailable: maxRetentions - team.retentionsUsed
    }))

    // Set first available player (exclude all retained players)
    const availablePlayers = players.filter(p => p.status === 'available')
    const firstAvailablePlayer = availablePlayers.length > 0 ? availablePlayers[0] : null

    set({
      retentionPhaseActive: false,
      retentionPhaseComplete: true,
      teams: updatedTeams,
      currentPlayer: firstAvailablePlayer,
      timer: 30
    })
  },

  nextPlayer: () => {
    const { players, currentPlayer } = get()

    // Get only available players (exclude retained, sold, unsold)
    const availablePlayers = players.filter(p => p.status === 'available')

    if (availablePlayers.length === 0) {
      // No more players available
      set({ currentPlayer: null, timer: 30, bids: [] })
      return
    }

    const currentIndex = availablePlayers.findIndex(p => p.id === currentPlayer?.id)
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % availablePlayers.length
    const { timerLimit } = get()
    set({
      currentPlayer: availablePlayers[nextIndex],
      timer: timerLimit,
      bids: [], // Clear bidding history for new player
      isTimerRunning: false, // Don't start timer until first bid
      isTimerPaused: false
    })
  },

  placeBid: (teamName: string, amount: number) => {
    const { currentPlayer, teams, bids } = get()
    console.log('placeBid called:', { teamName, amount, currentPlayer: currentPlayer?.name })

    const { socket } = get()
    if (socket?.connected && currentPlayer) {
      // If connected to socket, emit event and let backend handle it
      socket.emit('place-bid', { playerId: currentPlayer.id, amount })
      return
    }

    if (!currentPlayer) {
      console.log('No current player available')
      return
    }

    const team = teams.find(t => t.name === teamName)
    if (!team) {
      console.log('Team not found:', teamName)
      return
    }

    if (team.budget < amount) {
      console.log('Insufficient budget:', { budget: team.budget, amount })
      return
    }

    // Check squad limits
    const squadCheck = canAddPlayerToTeam(team, currentPlayer)
    if (!squadCheck.canAdd) {
      console.log('Squad limit check failed:', squadCheck)
      return
    }

    // Prevent duplicate bids - check if any team has already bid this exact amount
    const existingBidAtAmount = bids.find(bid =>
      bid.playerId === currentPlayer.id && bid.amount === amount
    )
    if (existingBidAtAmount) {
      console.log('Duplicate bid amount detected:', amount)
      return // Cannot bid the same amount that's already been bid
    }

    // Check minimum increment (0.25Cr = 25 lakhs) - but allow base price bid
    const minIncrement = 0.25

    // If no one has bid yet, allow base price bid
    if (!currentPlayer.currentBidder && amount >= currentPlayer.basePrice) {
      console.log('First bid allowed:', { amount, basePrice: currentPlayer.basePrice })
      // First bid - allow base price or higher
    } else {
      // Subsequent bids - must be higher than current bid with minimum increment
      if (amount <= currentPlayer.currentBid) {
        console.log('Bid not higher than current:', { amount, currentBid: currentPlayer.currentBid })
        return // Bid must be higher than current bid
      }

      if (amount < currentPlayer.currentBid + minIncrement) {
        console.log('Minimum increment not met:', { amount, required: currentPlayer.currentBid + minIncrement })
        return // Bid must be at least 25 lakhs higher
      }
    }

    console.log('Bid validation passed, creating bid...')

    const newBid: Bid = {
      id: Date.now().toString(),
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      teamId: team.id,
      teamName: team.name,
      amount,
      timestamp: Date.now()
    }

    // RTM is now manual - teams can use RTM button when they want

    // Start timer on first bid, extend on subsequent bids
    const { timerLimit, isTimerRunning } = get()
    const isFirstBid = bids.length === 0 || !currentPlayer.currentBidder

    let newTimer
    if (isFirstBid) {
      // First bid - start timer with full duration
      newTimer = timerLimit
    } else {
      // Subsequent bid - extend timer by 10 seconds (or timer limit if smaller)
      newTimer = Math.min(10, timerLimit)
    }

    set({
      currentPlayer: { ...currentPlayer, currentBid: amount, currentBidder: teamName },
      bids: [newBid, ...bids],
      timer: newTimer,
      isTimerRunning: true, // Start timer on first bid
      isTimerPaused: false
    })
  },

  useRTM: (teamName: string) => {
    const { currentPlayer, teams } = get()
    if (!currentPlayer) return

    const team = teams.find(t => t.name === teamName)
    if (!team || team.rtmAvailable <= 0) return

    const updatedTeams = teams.map(t =>
      t.name === teamName
        ? { ...t, rtmAvailable: t.rtmAvailable - 1 }
        : t
    )

    set({
      currentPlayer: { ...currentPlayer, currentBidder: teamName },
      teams: updatedTeams,
      showRTMModal: false,
      showRTMAnimation: true,
      rtmAnimationData: {
        team,
        playerName: currentPlayer.name,
        amount: currentPlayer.currentBid
      }
    })
  },

  retainPlayer: (teamName: string, playerName: string, amount: number) => {
    const { players, teams } = get()

    const team = teams.find(t => t.name === teamName)
    if (!team || team.budget < amount) return

    // Find the player and update it with retention info
    const playerToRetain = players.find(p => p.name === playerName)
    if (!playerToRetain) return

    const updatedPlayer = {
      ...playerToRetain,
      status: 'retained' as const,
      retainedAmount: amount,
      previousTeam: teamName
    }

    const updatedPlayers = players.map(p =>
      p.name === playerName ? updatedPlayer : p
    )

    const updatedTeams = teams.map(t =>
      t.name === teamName
        ? {
          ...t,
          budget: t.budget - amount,
          retentionsUsed: t.retentionsUsed + 1,
          players: [...t.players, updatedPlayer]
        }
        : t
    )

    set({ players: updatedPlayers, teams: updatedTeams })

    // Refresh current player if the retained player was the current player
    get().refreshCurrentPlayer()
  },

  setShowRTMModal: (show: boolean) => set({ showRTMModal: show }),

  setShowRTMAnimation: (show: boolean) => set({ showRTMAnimation: show }),

  setShowSoldAnimation: (show: boolean) => set({ showSoldAnimation: show }),

  setShowRetainedAnimation: (show: boolean) => set({ showRetainedAnimation: show }),

  setShowUnsoldAnimation: (show: boolean) => set({ showUnsoldAnimation: show }),

  sellPlayer: (teamName: string, amount: number) => {
    const { currentPlayer, teams, players, socket } = get()
    if (!currentPlayer) return

    const team = teams.find(t => t.name === teamName)
    if (!team) return

    // If socket connected, emit logic
    if (socket?.connected) {
      socket.emit('admin-action', {
        action: 'sell-player',
        payload: { playerId: currentPlayer.id, teamName, amount }
      })
      return
    }

    // Check squad limits before selling
    const squadCheck = canAddPlayerToTeam(team, currentPlayer)
    if (!squadCheck.canAdd) {
      return
    }

    const updatedPlayer = {
      ...currentPlayer,
      status: 'sold' as const,
      soldPrice: amount,
      currentBidder: teamName
    }

    const updatedPlayers = players.map(p =>
      p.id === currentPlayer.id ? updatedPlayer : p
    )

    const updatedTeams = teams.map(t =>
      t.name === teamName
        ? {
          ...t,
          budget: t.budget - amount,
          players: [...t.players, updatedPlayer]
        }
        : t
    )

    // Update state first
    set({
      players: updatedPlayers,
      teams: updatedTeams
    })

    // Trigger sold animation with auto next player
    triggerSoldAnimation(team, currentPlayer.name, amount, () => {
      get().nextPlayer()
    })
  },

  sellPlayerWithRTM: (teamName: string, amount: number) => {
    const { currentPlayer, teams, players } = get()
    if (!currentPlayer) return

    const team = teams.find(t => t.name === teamName)
    if (!team) return

    // Check squad limits before RTM
    const squadCheck = canAddPlayerToTeam(team, currentPlayer)
    if (!squadCheck.canAdd) {
      return
    }

    const updatedPlayer = {
      ...currentPlayer,
      status: 'sold' as const,
      soldPrice: amount,
      currentBidder: teamName,
      previousTeam: teamName
    }

    const updatedPlayers = players.map(p =>
      p.id === currentPlayer.id ? updatedPlayer : p
    )

    const updatedTeams = teams.map(t =>
      t.name === teamName
        ? {
          ...t,
          budget: t.budget - amount,
          rtmAvailable: t.rtmAvailable - 1,
          players: [...t.players, updatedPlayer]
        }
        : t
    )

    // Update state first
    set({
      players: updatedPlayers,
      teams: updatedTeams
    })

    // Trigger RTM animation with auto next player
    triggerRTMAnimation(team, currentPlayer.name, amount, () => {
      get().nextPlayer()
    })
  },

  sellPlayerRetained: (teamName: string, amount: number) => {
    const { currentPlayer, teams, players } = get()
    if (!currentPlayer) return

    const team = teams.find(t => t.name === teamName)
    if (!team) return

    // Check squad limits before retention
    const squadCheck = canAddPlayerToTeam(team, currentPlayer)
    if (!squadCheck.canAdd) {
      return
    }

    const updatedPlayer = {
      ...currentPlayer,
      status: 'retained' as const,
      retainedAmount: amount,
      previousTeam: teamName,
      soldPrice: amount
    }

    const updatedPlayers = players.map(p =>
      p.id === currentPlayer.id ? updatedPlayer : p
    )

    const updatedTeams = teams.map(t =>
      t.name === teamName
        ? {
          ...t,
          budget: t.budget - amount,
          retentionsUsed: t.retentionsUsed + 1,
          players: [...t.players, updatedPlayer]
        }
        : t
    )

    // Update state first
    set({
      players: updatedPlayers,
      teams: updatedTeams
    })

    // Trigger retained animation with auto next player
    triggerRetainedAnimation(team, currentPlayer.name, amount, () => {
      get().nextPlayer()
    })
  },

  markUnsold: () => {
    const { currentPlayer, players, socket } = get()
    if (!currentPlayer) return

    if (socket?.connected) {
      socket.emit('admin-action', {
        action: 'mark-unsold',
        payload: { playerId: currentPlayer.id }
      })
      return
    }

    const updatedPlayers = players.map(p =>
      p.id === currentPlayer.id ? { ...p, status: 'unsold' as const } : p
    )

    // Update state first
    set({
      players: updatedPlayers
    })

    // Trigger unsold animation with auto next player
    triggerUnsoldAnimation(currentPlayer.name, () => {
      get().nextPlayer()
    })
  },

  // RTM Hike Mechanism
  initiateRTM: (rtmTeamName: string, matchedAmount: number) => {
    const { currentPlayer } = get()
    if (!currentPlayer || !currentPlayer.currentBidder) return

    // Start RTM process - wait for original bidder to hike
    set({
      rtmInProgress: true,
      rtmTeamName,
      rtmMatchedAmount: matchedAmount,
      originalBidderTeam: currentPlayer.currentBidder,
      waitingForHike: true,
      hikeAmount: null,
      isTimerPaused: true // Pause timer during RTM
    })
  },

  hikePrice: (newAmount: number) => {
    const { rtmMatchedAmount } = get()

    // Validate hike amount (must be higher than RTM matched amount)
    if (newAmount <= rtmMatchedAmount) {
      return
    }

    // Set hike amount and wait for RTM team to respond
    set({
      hikeAmount: newAmount,
      waitingForHike: false
    })
  },

  finalizeRTM: (accept: boolean) => {
    const { currentPlayer, teams, rtmTeamName, hikeAmount, rtmMatchedAmount, originalBidderTeam, pendingActions } = get()
    if (!currentPlayer || !rtmTeamName) return

    const finalAmount = hikeAmount || rtmMatchedAmount
    const winningTeam = accept ? rtmTeamName : originalBidderTeam

    if (!winningTeam) return

    const team = teams.find(t => t.name === winningTeam)
    if (!team) return

    // Check squad limits
    const squadCheck = canAddPlayerToTeam(team, currentPlayer)
    if (!squadCheck.canAdd) {
      set({
        rtmInProgress: false,
        rtmTeamName: null,
        rtmMatchedAmount: 0,
        originalBidderTeam: null,
        waitingForHike: false,
        hikeAmount: null
      })
      return
    }

    // Automatically finalize the sale and trigger animations
    if (winningTeam === rtmTeamName) {
      // RTM team won - use RTM (animation handled automatically)
      get().sellPlayerWithRTM(winningTeam, finalAmount)
    } else {
      // Original bidder won - regular sale (animation handled automatically)
      get().sellPlayer(winningTeam, finalAmount)
    }

    // Clear RTM state and resume timer
    set({
      rtmInProgress: false,
      rtmTeamName: null,
      rtmMatchedAmount: 0,
      originalBidderTeam: null,
      waitingForHike: false,
      hikeAmount: null,
      isTimerPaused: false // Resume timer after RTM
    })

  },

  cancelRTM: () => {
    set({
      rtmInProgress: false,
      rtmTeamName: null,
      rtmMatchedAmount: 0,
      originalBidderTeam: null,
      waitingForHike: false,
      hikeAmount: null,
      isTimerPaused: false // Resume timer when RTM is cancelled
    })
  },

  addPlayer: (player) => {
    const newPlayer: Player = { ...player, id: Date.now().toString() }
    set(state => ({ players: [...state.players, newPlayer] }))
  },

  addTeam: (team) => {
    const newTeam: Team = { ...team, id: Date.now().toString() }
    set(state => ({ teams: [...state.teams, newTeam] }))
  },

  // Admin Approval System
  requestSold: (teamName: string, amount: number) => {
    const { currentPlayer, pendingActions } = get()
    if (!currentPlayer) return

    const newAction: PendingAction = {
      id: Date.now().toString(),
      type: 'sold',
      playerName: currentPlayer.name,
      teamName,
      amount,
      timestamp: Date.now()
    }

    set({ pendingActions: [...pendingActions, newAction] })
  },

  requestRetain: (teamName: string, amount: number) => {
    const { currentPlayer, pendingActions } = get()
    if (!currentPlayer) return

    const newAction: PendingAction = {
      id: Date.now().toString(),
      type: 'retain',
      playerName: currentPlayer.name,
      teamName,
      amount,
      timestamp: Date.now()
    }

    set({ pendingActions: [...pendingActions, newAction] })
  },

  requestRTM: (teamName: string, amount: number, rtmData?: any) => {
    const { currentPlayer, pendingActions } = get()
    if (!currentPlayer) return

    const newAction: PendingAction = {
      id: Date.now().toString(),
      type: 'rtm',
      playerName: currentPlayer.name,
      teamName,
      amount,
      timestamp: Date.now(),
      rtmData
    }

    set({ pendingActions: [...pendingActions, newAction] })
  },

  approvePendingAction: (actionId: string) => {
    const { pendingActions, teams, maxRetentions, maxRTM } = get()
    const action = pendingActions.find(a => a.id === actionId)
    if (!action) return

    // Validate retention limits before approval
    if (action.type === 'retain') {
      const team = teams.find(t => t.name === action.teamName)
      if (team && team.retentionsUsed >= maxRetentions) {
        // Reject if team has exceeded retention limit
        set({ pendingActions: pendingActions.filter(a => a.id !== actionId) })
        return
      }
    }

    // Validate RTM limits before approval
    if (action.type === 'rtm') {
      const team = teams.find(t => t.name === action.teamName)
      if (team && team.rtmAvailable <= 0) {
        // Reject if team has no RTM available
        set({ pendingActions: pendingActions.filter(a => a.id !== actionId) })
        return
      }
    }

    // Remove from pending
    set({ pendingActions: pendingActions.filter(a => a.id !== actionId) })

    // Execute the action based on type (animations handled automatically)
    if (action.type === 'sold') {
      get().sellPlayer(action.teamName, action.amount)
    } else if (action.type === 'retain') {
      get().sellPlayerRetained(action.teamName, action.amount)
    } else if (action.type === 'rtm') {
      if (action.rtmData?.isRTM) {
        get().sellPlayerWithRTM(action.teamName, action.amount)
      }
    }
  },

  rejectPendingAction: (actionId: string) => {
    const { pendingActions } = get()
    set({ pendingActions: pendingActions.filter(a => a.id !== actionId) })
  },

  // Retention Phase Functions
  requestRetention: (teamName: string, playerName: string, amount: number) => {
    const { pendingRetentions } = get()

    const newRetention: PendingAction = {
      id: Date.now().toString(),
      type: 'retain',
      playerName,
      teamName,
      amount,
      timestamp: Date.now()
    }

    set({ pendingRetentions: [...pendingRetentions, newRetention] })
  },

  approveRetention: (actionId: string) => {
    const { pendingRetentions } = get()
    const retention = pendingRetentions.find(r => r.id === actionId)
    if (!retention) return

    // Remove from pending
    set({ pendingRetentions: pendingRetentions.filter(r => r.id !== actionId) })

    // Execute the retention
    get().retainPlayer(retention.teamName, retention.playerName, retention.amount)
  },

  rejectRetention: (actionId: string) => {
    const { pendingRetentions } = get()
    set({ pendingRetentions: pendingRetentions.filter(r => r.id !== actionId) })
  },

  confirmTeamRetentions: (teamName: string) => {
    const { teamRetentionStatus } = get()
    set({
      teamRetentionStatus: {
        ...teamRetentionStatus,
        [teamName]: 'confirmed'
      }
    })
  },

  // Helper function to ensure current player is always available
  refreshCurrentPlayer: () => {
    const { players, currentPlayer } = get()

    // If current player is not available (retained/sold/unsold), find next available
    if (!currentPlayer || currentPlayer.status !== 'available') {
      const availablePlayers = players.filter(p => p.status === 'available')
      const firstAvailable = availablePlayers.length > 0 ? availablePlayers[0] : null

      set({
        currentPlayer: firstAvailable,
        timer: 30,
        bids: [] // Clear bidding history when refreshing to new player
      })
    }
  },

  // Reset entire auction to initial state
  resetAuction: () => {
    // Reset all players to available status with original base prices
    const resetPlayers = samplePlayers.map(player => ({
      ...player,
      status: 'available' as const,
      currentBid: player.basePrice,
      currentBidder: undefined,
      retainedAmount: undefined,
      soldPrice: undefined
    }))

    // Reset all teams to initial state
    const resetTeams = initializedTeams.map(team => ({
      ...team,
      budget: 125,
      players: [],
      retentionsUsed: 0,
      rtmAvailable: 1 // Default RTM slots
    }))

    // Reset team retention status
    const resetTeamRetentionStatus: { [teamName: string]: 'pending' | 'confirmed' | 'completed' } = {}
    initializedTeams.forEach(team => {
      resetTeamRetentionStatus[team.name] = 'pending'
    })

    // Reset to initial state
    set({
      players: resetPlayers,
      teams: resetTeams,
      currentPlayer: resetPlayers[0],
      bids: [],
      isAuctionActive: false,
      timer: 30,
      timerLimit: 30,
      isTimerRunning: false,
      isTimerPaused: false,
      showRTMModal: false,
      rtmTeam: null,
      showRTMAnimation: false,
      rtmAnimationData: null,
      showSoldAnimation: false,
      soldAnimationData: null,
      showRetainedAnimation: false,
      retainedAnimationData: null,
      showUnsoldAnimation: false,
      unsoldAnimationData: null,
      rtmInProgress: false,
      rtmTeamName: null,
      rtmMatchedAmount: 0,
      originalBidderTeam: null,
      waitingForHike: false,
      hikeAmount: null,
      pendingActions: [],
      pendingRetentions: [],
      maxRetentions: 6,
      maxRTM: 1,
      retentionPhaseActive: false,
      retentionPhaseComplete: false,
      limitsConfigured: false,
      teamRetentionStatus: resetTeamRetentionStatus
    })
  },

  // Undo last bid - removes the most recent bid and reverts to previous state
  undoLastBid: () => {
    const { bids, currentPlayer, teams } = get()

    if (bids.length === 0 || !currentPlayer) return

    // Get the most recent bid
    const lastBid = bids[0]

    // Remove the last bid from bids array
    const updatedBids = bids.slice(1)

    // Find the previous bid for this player (if any)
    const previousBid = updatedBids.find(bid => bid.playerId === currentPlayer.id)

    // Update current player state
    const updatedCurrentPlayer = {
      ...currentPlayer,
      currentBid: previousBid ? previousBid.amount : currentPlayer.basePrice,
      currentBidder: previousBid ? previousBid.teamName : undefined
    }

    set({
      bids: updatedBids,
      currentPlayer: updatedCurrentPlayer
    })
  },

  // Undo retention - removes a retained player and returns them to available status
  undoRetention: (teamName: string, playerName: string) => {
    const { teams, players } = get()

    // Find the team and player
    const team = teams.find(t => t.name === teamName)
    const player = players.find(p => p.name === playerName)

    if (!team || !player) return

    // Remove player from team and restore budget
    const updatedTeams = teams.map(t => {
      if (t.name === teamName) {
        const retainedPlayer = t.players.find(p => p.name === playerName && p.status === 'retained')
        if (!retainedPlayer) return t

        return {
          ...t,
          players: t.players.filter(p => !(p.name === playerName && p.status === 'retained')),
          budget: t.budget + (retainedPlayer.retainedAmount || 0),
          retentionsUsed: Math.max(0, t.retentionsUsed - 1)
        }
      }
      return t
    })

    // Update player status back to available
    const updatedPlayers = players.map(p => {
      if (p.name === playerName) {
        return {
          ...p,
          status: 'available' as const,
          retainedAmount: undefined
        }
      }
      return p
    })

    set({
      teams: updatedTeams,
      players: updatedPlayers
    })
  },

  // Bring back unsold player to auction
  bringBackUnsoldPlayer: (playerId: string) => {
    const { players, timerLimit } = get()

    // Find the player being brought back
    const playerToBringBack = players.find(p => p.id === playerId && p.status === 'unsold')
    if (!playerToBringBack) return

    const updatedPlayers = players.map(p => {
      if (p.id === playerId && p.status === 'unsold') {
        return {
          ...p,
          status: 'available' as const,
          currentBid: p.basePrice,
          currentBidder: undefined
        }
      }
      return p
    })

    // Set the brought-back player as current player and reset timer
    const broughtBackPlayer = updatedPlayers.find(p => p.id === playerId)

    set({
      players: updatedPlayers,
      currentPlayer: broughtBackPlayer || null,
      timer: timerLimit,
      bids: [], // Clear any previous bidding history
      isTimerRunning: false, // Don't start timer until first bid
      isTimerPaused: false
    })
  },

  // Timer Actions
  startTimer: () => {
    set({ isTimerRunning: true, isTimerPaused: false })
  },

  pauseTimer: () => {
    set({ isTimerPaused: true })
  },

  resumeTimer: () => {
    set({ isTimerPaused: false })
  },

  resetTimer: () => {
    const { timerLimit } = get()
    set({ timer: timerLimit, isTimerRunning: false, isTimerPaused: false })
  },

  setTimerLimit: (seconds: number) => {
    set({ timerLimit: seconds, timer: seconds })
  },

  extendTimer: (seconds: number) => {
    const { timer } = get()
    set({ timer: timer + seconds })
  },

  onTimerTick: () => {
    const { timer, isTimerRunning, isTimerPaused } = get()

    if (!isTimerRunning || isTimerPaused) return

    if (timer > 0) {
      set({ timer: timer - 1 })
    } else {
      // Timer expired
      get().onTimerExpired()
    }
  },

  onTimerExpired: () => {
    const { currentPlayer } = get()

    if (currentPlayer) {
      if (currentPlayer.currentBidder) {
        // Someone has bid - sell to highest bidder
        get().sellPlayer(currentPlayer.currentBidder, currentPlayer.currentBid)
      } else {
        // No bids - mark as unsold
        get().markUnsold()
      }
    }

    set({ isTimerRunning: false, isTimerPaused: false })
  },

  setSocket: (socket: Socket) => set({ socket }),

  handleSocketBid: ({ teamName, amount, playerId }) => {
    const { currentPlayer, teams, bids, timerLimit } = get()
    if (!currentPlayer || currentPlayer.id !== playerId) return

    const team = teams.find(t => t.name === teamName)
    if (!team) return

    const newBid: Bid = {
      id: Date.now().toString(),
      playerId,
      playerName: currentPlayer.name,
      teamId: team.id,
      teamName,
      amount,
      timestamp: Date.now()
    }

    // Logic similar to placeBid but without validation (trusting backend)
    // Also update timer logic

    const isFirstBid = bids.length === 0 || !currentPlayer.currentBidder
    let newTimer
    if (isFirstBid) {
      newTimer = timerLimit
    } else {
      newTimer = Math.min(10, timerLimit)
    }

    set({
      currentPlayer: { ...currentPlayer, currentBid: amount, currentBidder: teamName },
      bids: [newBid, ...bids],
      timer: newTimer,
      isTimerRunning: true,
      isTimerPaused: false
    })
  },

  handleSocketSold: (teamName, amount) => {
    const { currentPlayer, teams, players } = get()
    if (!currentPlayer) return

    const team = teams.find(t => t.name === teamName)
    if (!team) return

    const updatedPlayer = {
      ...currentPlayer,
      status: 'sold' as const,
      soldPrice: amount,
      currentBidder: teamName
    }

    const updatedPlayers = players.map(p =>
      p.id === currentPlayer.id ? updatedPlayer : p
    )

    const updatedTeams = teams.map(t =>
      t.name === teamName
        ? {
          ...t,
          budget: t.budget - amount,
          players: [...t.players, updatedPlayer]
        }
        : t
    )

    set({
      players: updatedPlayers,
      teams: updatedTeams,
      currentPlayer: null // Backend handles clearing, but we sync state
    })

    // Trigger sold animation with auto next player
    triggerSoldAnimation(team, currentPlayer.name, amount, () => {
      get().nextPlayer()
    })
  },

  handleSocketUnsold: () => {
    const { currentPlayer, players } = get()
    if (!currentPlayer) return

    const updatedPlayers = players.map(p =>
      p.id === currentPlayer.id ? { ...p, status: 'unsold' as const } : p
    )

    set({
      players: updatedPlayers,
      currentPlayer: null
    })

    triggerUnsoldAnimation(currentPlayer.name, () => {
      get().nextPlayer()
    })
  }
}))
