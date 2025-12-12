'use client'

import { useState, useEffect } from 'react'
import AuctionRoom from '@/components/AuctionRoom'
import AdminPanel from '@/components/AdminPanel'
import LandingPage from '@/components/LandingPage'
import RetentionPhase from '@/components/RetentionPhase'
import TeamWelcomeIntro from '@/components/TeamWelcomeIntro'
import FirstTimeIntro from '@/components/FirstTimeIntro'
import GlobalUIComponents from '@/components/GlobalUIComponents'
import { useAuctionStore } from '@/store/auctionStore'

export default function Home() {
  const [view, setView] = useState<'landing' | 'auction' | 'admin' | 'spectator' | 'retention' | 'video'>('landing')
  const [userRole, setUserRole] = useState<'bidder' | 'admin' | 'spectator' | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [showVideoIntro, setShowVideoIntro] = useState(false)
  const [showFirstTimeIntro, setShowFirstTimeIntro] = useState(false)
  const { retentionPhaseActive, limitsConfigured } = useAuctionStore()

  // Check if this is the first time visiting
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('ipl-auction-intro-seen')
    if (!hasSeenIntro) {
      setShowFirstTimeIntro(true)
    }
  }, [])

  const handleEnter = (role: 'bidder' | 'admin' | 'spectator', teamName?: string) => {
    setUserRole(role)
    if (teamName) {
      setSelectedTeam(teamName)
    }
    
    if (role === 'admin') {
      setView('admin')
    } else if (role === 'spectator') {
      setView('spectator')
    } else if (role === 'bidder' && teamName) {
      // Show video intro for team members
      setShowVideoIntro(true)
      setView('video')
    }
  }

  const handleVideoComplete = () => {
    setShowVideoIntro(false)
    // After video, check if retention phase is active
    if (retentionPhaseActive) {
      setView('retention')
    } else {
      setView('auction')
    }
  }

  const handleFirstTimeIntroComplete = () => {
    setShowFirstTimeIntro(false)
  }

  if (view === 'landing') {
    return (
      <>
        <LandingPage onEnter={handleEnter} />
        <FirstTimeIntro 
          show={showFirstTimeIntro} 
          onComplete={handleFirstTimeIntroComplete} 
        />
        <GlobalUIComponents />
      </>
    )
  }

  if (view === 'admin') {
    return (
      <>
        <AdminPanel onBack={() => setView('landing')} />
        <GlobalUIComponents />
      </>
    )
  }

  if (view === 'retention') {
    return (
      <>
        <RetentionPhase 
          onBack={() => setView('landing')} 
          userRole={userRole === 'admin' ? 'admin' : 'team'}
          userTeam={selectedTeam || undefined}
        />
        <GlobalUIComponents />
      </>
    )
  }

  if (view === 'spectator') {
    return (
      <>
        <AuctionRoom onBack={() => setView('landing')} selectedTeam={null} isSpectator={true} />
        <GlobalUIComponents />
      </>
    )
  }

  return (
    <>
      <AuctionRoom onBack={() => setView('landing')} selectedTeam={selectedTeam} isSpectator={false} />
      
      {/* Team Welcome Intro */}
      <TeamWelcomeIntro
        teamName={selectedTeam || ''}
        onComplete={handleVideoComplete}
        show={showVideoIntro}
      />
      
      {/* Global UI Components */}
      <GlobalUIComponents />
    </>
  )
}
