'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Section, Settings, SectionData, EmojiConfig, MotivationalQuote } from '../types'
import { ChevronDown, Plus, Trash2 } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const DEFAULT_EMOJIS: EmojiConfig[] = [
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
]

const DEFAULT_QUOTE: MotivationalQuote = {
  id: 'default',
  text: `盛田昭夫（ソニー創始者）
人は誰でも種々様々な能力を持っているものなのに、自分がどんなに優れた能力があるかを知らずにいる場合が多いと思う。
どの世界でも、偉人というものはたいてい、自分で自分の能力を発見し、育てていった人であろう。`
}

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const { sections, settings, setSettings, loading: dataLoading, sectionData, tags } = useData()
  const [localSettings, setLocalSettings] = useState<Settings>({
    defaultSection: 'default',
    darkMode: false,
    motivationEmojis: DEFAULT_EMOJIS,
    graphColor: 'hsl(var(--primary))',
    showMotivationalQuote: false,
    motivationalQuotes: [DEFAULT_QUOTE],
    motivationalQuoteSpeed: '1'
  })
  const [isGeneralOpen, setIsGeneralOpen] = useState(false)
  const [isGraphOpen, setIsGraphOpen] = useState(false)
  const [isHeaderOpen, setIsHeaderOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!dataLoading && settings) {
      setLocalSettings(prevSettings => ({
        ...prevSettings,
        ...settings,
        motivationEmojis: settings.motivationEmojis || prevSettings.motivationEmojis,
        showMotivationalQuote: settings.showMotivationalQuote ?? false,
        motivationalQuotes: settings.motivationalQuotes || [DEFAULT_QUOTE],
        motivationalQuoteSpeed: settings.motivationalQuoteSpeed || '1'
      }))
    }
  }, [dataLoading, settings])

  useEffect(() => {
    if (localSettings.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [localSettings.darkMode])

  const handleSettingsChange = async (key: keyof Settings, value: any) => {
    const newSettings = { ...localSettings, [key]: value }
    setLocalSettings(newSettings)
    await setSettings(newSettings)
  }

  const handleEmojiChange = (level: number, newEmoji: string) => {
    const newEmojis = localSettings.motivationEmojis.map(config =>
      config.level === level ? { ...config, emoji: newEmoji } : config
    )
    handleSettingsChange('motivationEmojis', newEmojis)
  }

  const handleResetEmojis = () => {
    handleSettingsChange('motivationEmojis', DEFAULT_EMOJIS)
  }

  const convertToCSV = (data: any) => {
    let csv = 'Date,Section,Motivation,Title,Note\n'
    Object.entries(data.sectionData).forEach(([sectionId, records]: [string, any]) => {
      records.forEach((record: any) => {
        record.logs.forEach((log: any) => {
          csv += `${record.date},${sectionId},${log.motivation},${log.title},${log.note}\n`
        })
      })
    })
    return csv
  }

  const convertToNotionCSV = (data: any) => {
    let csv = 'Name,Date,Section,Motivation,Tags,Note\n'
    Object.entries(data.sectionData).forEach(([sectionId, records]: [string, any]) => {
      records.forEach((record: any) => {
        record.logs.forEach((log: any) => {
          const tags = log.tags.map((tagId: string) => {
            const tag = data.tags.find((t: any) => t.id === tagId)
            return tag ? tag.name : ''
          }).join(';')
          csv += `${log.title},${record.date},${sectionId},${log.motivation},${tags},${log.note}\n`
        })
      })
    })
    return csv
  }

  const handleExport = (format: 'json' | 'csv' | 'notion-csv') => {
    const data = {
      sections: sections,
      settings: localSettings,
      sectionData: sectionData,
      tags: tags
    }

    let content: string
    let fileName: string
    let mimeType: string

    switch (format) {
      case 'json':
        content = JSON.stringify(data, null, 2)
        fileName = 'motivation_tracker_data.json'
        mimeType = 'application/json'
        break
      case 'csv':
        content = convertToCSV(data)
        fileName = 'motivation_tracker_data.csv'
        mimeType = 'text/csv'
        break
      case 'notion-csv':
        content = convertToNotionCSV(data)
        fileName = 'motivation_tracker_data_notion.csv'
        mimeType = 'text/csv'
        break
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
    setIsExportDialogOpen(false)
  }

  const handleAddQuote = () => {
    const newQuote: MotivationalQuote = {
      id: crypto.randomUUID(),
      text: ''
    }
    const newQuotes = [...localSettings.motivationalQuotes, newQuote]
    handleSettingsChange('motivationalQuotes', newQuotes)
  }

  const handleQuoteChange = (id: string, newText: string) => {
    const newQuotes = localSettings.motivationalQuotes.map(quote =>
      quote.id === id ? { ...quote, text: newText } : quote
    )
    handleSettingsChange('motivationalQuotes', newQuotes)
  }

  const handleDeleteQuote = (id: string) => {
    const newQuotes = localSettings.motivationalQuotes.filter(quote => quote.id !== id)
    handleSettingsChange('motivationalQuotes', newQuotes)
  }

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">設定</h1>
      <div className="space-y-4">
        {/* 全般設定 */}
        <Card className="p-0">
          <Collapsible
            open={isGeneralOpen}
            onOpenChange={setIsGeneralOpen}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 font-medium hover:bg-accent hover:text-accent-foreground">
              <span className="font-bold">全般</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isGeneralOpen ? 'transform rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 pt-0 space-y-4 border-t">
              <div className="flex items-center space-x-2">
                <Switch
                  id="darkMode"
                  checked={localSettings.darkMode}
                  onCheckedChange={(checked) => handleSettingsChange('darkMode', checked)}
                />
                <Label htmlFor="darkMode" className="font-bold">ダークモード</Label>
              </div>

              <div className="space-y-2">
                <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>データをエクスポート</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>エクスポート形式を選択</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col space-y-4 mt-4">
                      <Button onClick={() => handleExport('json')}>JSON形式</Button>
                      <Button onClick={() => handleExport('csv')}>CSV形式</Button>
                      <Button onClick={() => handleExport('notion-csv')}>Notion用CSV形式</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* グラフ設定 */}
        <Card className="p-0">
          <Collapsible
            open={isGraphOpen}
            onOpenChange={setIsGraphOpen}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 font-medium hover:bg-accent hover:text-accent-foreground">
              <span className="font-bold">グラフ</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isGraphOpen ? 'transform rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 pt-0 space-y-4 border-t">
              <div>
                <Label htmlFor="defaultSection" className="font-bold">デフォルトのセクション</Label>
                <Select
                  value={localSettings.defaultSection || ''}
                  onValueChange={(value) => handleSettingsChange('defaultSection', value)}
                >
                  <SelectTrigger id="defaultSection">
                    <SelectValue placeholder="デフォルトのセクションを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label htmlFor="graphColor" className="font-bold">グラフの色</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="color"
                    id="graphColor"
                    value={localSettings.graphColor || 'hsl(var(--primary))'}
                    onChange={(e) => handleSettingsChange('graphColor', e.target.value)}
                    className="w-20 h-10"
                  />
                  <span>{localSettings.graphColor}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="font-bold">モチベーションレベルのアイコン</Label>
                  <Button variant="outline" size="sm" onClick={handleResetEmojis}>
                    デフォルトに戻す
                  </Button>
                </div>
                <div className="grid gap-4">
                  {localSettings.motivationEmojis.map((config) => (
                    <div key={config.level} className="flex items-center gap-4">
                      <Label className="w-24">レベル {config.level}</Label>
                      <Input
                        type="text"
                        value={config.emoji}
                        onChange={(e) => handleEmojiChange(config.level, e.target.value)}
                        className="w-20 text-center text-2xl"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* ヘッダー設定 */}
        <Card className="p-0">
          <Collapsible
            open={isHeaderOpen}
            onOpenChange={setIsHeaderOpen}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 font-medium hover:bg-accent hover:text-accent-foreground">
              <span className="font-bold">ヘッダー</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isHeaderOpen ? 'transform rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 pt-0 space-y-4 border-t">
              <div className="flex items-center space-x-2">
                <Switch
                  id="showMotivationalQuote"
                  checked={localSettings.showMotivationalQuote}
                  onCheckedChange={(checked) => handleSettingsChange('showMotivationalQuote', checked)}
                />
                <Label htmlFor="showMotivationalQuote" className="font-bold">Motivational Quote</Label>
              </div>

              {localSettings.showMotivationalQuote && (
                <div className="space-y-2">
                  <Label htmlFor="quoteSpeed" className="font-bold">
                    流れる速度（×{localSettings.motivationalQuoteSpeed}）
                  </Label>
                  <Slider
                    id="quoteSpeed"
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={[parseFloat(localSettings.motivationalQuoteSpeed)]}
                    onValueChange={([value]) => handleSettingsChange('motivationalQuoteSpeed', value.toFixed(1))}
                    className="w-full"
                  />
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="font-bold">Motivational Quotes</Label>
                  <Button variant="outline" size="sm" onClick={handleAddQuote}>
                    <Plus className="h-4 w-4 mr-2" />
                    新しいQuoteを追加
                  </Button>
                </div>
                {localSettings.motivationalQuotes.map((quote, index) => (
                  <div key={quote.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`quote-${quote.id}`} className="font-bold">Quote {index + 1}</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteQuote(quote.id)}
                        disabled={localSettings.motivationalQuotes.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      id={`quote-${quote.id}`}
                      value={quote.text}
                      onChange={(e) => handleQuoteChange(quote.id, e.target.value)}
                      rows={4}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </div>
  )
}

