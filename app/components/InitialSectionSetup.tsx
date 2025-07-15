'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import Image from 'next/image'

export function InitialSectionSetup() {
  const [sectionName, setSectionName] = useState('')
  const router = useRouter()
  const { setSections, setSectionData, setCurrentSection, setSettings } = useData()
  const { user, setIsFirstLogin } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sectionName.trim() && user) {
      const newSection = {
        id: crypto.randomUUID(),
        name: sectionName.trim()
      }
      await setSections([newSection])
      await setSectionData({ [newSection.id]: [] })
      await setSettings({
        defaultSection: newSection.id,
        darkMode: false,
        motivationEmojis: [
          { level: 5, emoji: '🥳' },
          { level: 4, emoji: '🤩' },
          { level: 3, emoji: '😁' },
          { level: 2, emoji: '😊' },
          { level: 1, emoji: '🙂' },
          { level: 0, emoji: '😶' },
          { level: -1, emoji: '😐' },
          { level: -2, emoji: '😕' },
          { level: -3, emoji: '😦' },
          { level: -4, emoji: '😠' },
          { level: -5, emoji: '😡' }
        ],
        graphColor: 'hsl(var(--primary))',
        showMotivationalQuote: false,
        motivationalQuotes: [],
        motivationalQuoteSpeed: '1'
      })
      setCurrentSection(newSection.id)
      setIsFirstLogin(false)
      localStorage.setItem('hasSetInitialSection', 'true')
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Card className="w-[350px]">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/E-Apafv5uWvxY1p6y4b3eV9wedsfTncr.png"
              alt="MyDB Logo"
              width={80}
              height={80}
              priority
            />
          </div>
          <CardTitle>最初のセクションを作成</CardTitle>
          <CardDescription>
            モチベーショントラッカーで使用する最初のセクション名を入力してください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="セクション名"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">
              セクションを作成
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

