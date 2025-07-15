'use client'

import { useState, useEffect } from 'react'
import LandingPage from './landing-page'
import { MotivationTracker } from './Components/motivation-tracker'
import { useAuth } from './contexts/AuthContext'

export default function HomePage() {
  const [isClient, setIsClient] = useState(false)
  const { user, loading } = useAuth()

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return user ? <MotivationTracker /> : <LandingPage />
}

