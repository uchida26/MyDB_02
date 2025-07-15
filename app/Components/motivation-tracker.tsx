'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { format, subDays, addDays } from 'date-fns'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { MotivationDialog } from './motivation-dialog'
import { ja } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Plus, CalendarDays, Target } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { MotivationRecord, Tag, MotivationLog } from '../types'
import { TagSelector } from './tag-selector'
import { useData } from '../contexts/DataContext'
import { DatabaseView } from './database-view'
import { useRouter } from 'next/navigation'

type ViewMode = 'graph' | 'database'

export function MotivationTracker() {
  const {
    sections,
    sectionData,
    tags,
    settings,
    setSections,
    setSectionData,
    setTags,
    currentSection,
    setCurrentSection,
    loading
  } = useData()

  const router = useRouter()

  useEffect(() => {
    const hasSetInitialSection = localStorage.getItem('hasSetInitialSection')
    if (!hasSetInitialSection) {
      router.push('/initial-setup')
    }
  }, [router])

  useEffect(() => {
    if (sections.length > 0 && !currentSection) {
      setCurrentSection(sections[0].id)
    }
  }, [sections, currentSection, setCurrentSection])

  const [currentOffset, setCurrentOffset] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedLogIndex, setSelectedLogIndex] = useState(0)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [showTitles, setShowTitles] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagLogs, setTagLogs] = useState<{ [tagId: string]: { date: string; title: string; lesson: string }[] }>({})
  const [viewMode, setViewMode] = useState<ViewMode>('graph')

  const handleWheel = useCallback((event: WheelEvent) => {
    if (event.deltaY < 0) {
      setCurrentOffset(prev => prev + 1)
    } else if (event.deltaY > 0) {
      setCurrentOffset(prev => prev - 1)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('wheel', handleWheel)
    return () => {
      window.removeEventListener('wheel', handleWheel)
    }
  }, [handleWheel])

  useEffect(() => {
    // URLパラメータの処理
    const params = new URLSearchParams(window.location.search)
    const dateParam = params.get('date')
    const startDateParam = params.get('startDate')

    if (dateParam && startDateParam) {
      const clickedDate = new Date(dateParam)
      const today = new Date()
      const diffDays = Math.floor((today.getTime() - clickedDate.getTime()) / (1000 * 60 * 60 * 24))
      setCurrentOffset(-diffDays)
      openDialog(clickedDate, 0)
    }

    // tagLogsの準備
    const newTagLogs: { [tagId: string]: { date: string; title: string; lesson: string }[] } = {}
    Object.entries(sectionData).forEach(([_, records]) => {
      records.forEach(record => {
        if (record && record.logs) {
          record.logs.forEach(log => {
            if (log && log.tags) {
              log.tags.forEach(tagId => {
                if (!newTagLogs[tagId]) {
                  newTagLogs[tagId] = []
                }
                if (log.tagInsights && log.tagInsights[tagId]) {
                  newTagLogs[tagId].push({
                    date: record.date,
                    title: log.title || '無題',
                    lesson: log.tagInsights[tagId]
                  })
                }
              })
            }
          })
        }
      })
    })
    setTagLogs(newTagLogs)
  }, [sectionData])

  const get7DaysRange = (offset = 0) => {
    const endDate = addDays(new Date(), offset)
    const dates = []
    for (let i = 6; i >= 0; i--) {
      const date = subDays(endDate, i)
      dates.push(format(date, 'yyyy-MM-dd'))
    }
    return dates
  }

  const getChartData = useCallback(() => {
    const dates = get7DaysRange(currentOffset)
    return dates.map((date) => {
      const record = sectionData[currentSection]?.find(r => r.date === date)
      if (!record || !record.logs) {
        return {
          date: date,
          displayDate: format(new Date(date), 'M/d', { locale: ja }),
          value1: 0,
          value2: 0,
          emoji1: null,
          emoji2: null,
          title1: null,
          title2: null,
          note1: null,
          note2: null,
        }
      }

      const filteredLogs = record.logs
        .filter(log => log && !log.isMemo)
        .filter(log =>
          selectedTags.length === 0 || (log.tags && log.tags.some(tag => selectedTags.includes(tag)))
        )

      if (filteredLogs.length === 2) {
        const [higherLog, lowerLog] = filteredLogs.sort((a, b) => b.motivation - a.motivation)
        return {
          date: date,
          displayDate: format(new Date(date), 'M/d', { locale: ja }),
          value1: higherLog.motivation,
          value2: lowerLog.motivation,
          emoji1: getEmoji(higherLog.motivation),
          emoji2: getEmoji(lowerLog.motivation),
          title1: higherLog.title || null,
          title2: lowerLog.title || null,
          note1: higherLog.note || null,
          note2: lowerLog.note || null,
        }
      } else if (filteredLogs.length === 1) {
        return {
          date: date,
          displayDate: format(new Date(date), 'M/d', { locale: ja }),
          value1: filteredLogs[0].motivation,
          value2: filteredLogs[0].motivation,
          emoji1: getEmoji(filteredLogs[0].motivation),
          emoji2: null,
          title1: filteredLogs[0].title || null,
          title2: null,
          note1: filteredLogs[0].note || null,
          note2: null,
        }
      } else {
        return {
          date: date,
          displayDate: format(new Date(date), 'M/d', { locale: ja }),
          value1: 0,
          value2: 0,
          emoji1: null,
          emoji2: null,
          title1: null,
          title2: null,
          note1: null,
          note2: null,
        }
      }
    })
  }, [currentOffset, currentSection, sectionData, selectedTags])

  const getEmoji = (motivation: number) => {
    const emojiConfig = settings.motivationEmojis || [
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

    const config = emojiConfig.find(c => c.level === motivation)
    return config ? config.emoji : '😐'
  }

  const handleClose = async (date: string, logIndex: number, log: MotivationLog) => {
    const currentRecords = [...(sectionData[currentSection] || [])];
    const existingIndex = currentRecords.findIndex(r => r && r.date === date);

    if (existingIndex !== -1 && currentRecords[existingIndex] && currentRecords[existingIndex].logs) {
      currentRecords[existingIndex].logs[logIndex] = log;
    } else {
      currentRecords.push({ date, logs: [log] });
    }

    const newSectionData = {
      ...sectionData,
      [currentSection]: currentRecords
    };
    await setSectionData(newSectionData);
  };

  const handleDelete = async (date: string, logIndex: number) => {
    const currentRecords = sectionData[currentSection]?.map(record => {
      if (record && record.date === date && record.logs) {
        const newLogs = [...record.logs]
        newLogs.splice(logIndex, 1)
        return { ...record, logs: newLogs }
      }
      return record
    }).filter(record => record && record.logs && record.logs.length > 0) || []

    const newSectionData = {
      ...sectionData,
      [currentSection]: currentRecords
    }
    await setSectionData(newSectionData)
    setDialogOpen(false)
  }

  const handleCreateTag = async (newTag: Omit<Tag, 'id'>) => {
    const tag: Tag = {
      ...newTag,
      id: crypto.randomUUID()
    }
    const newTags = [...tags, tag]
    await setTags(newTags)
    return tag
  }

  const handleCreateSection = async (newSection: Omit<Section, 'id'>) => {
    const section = {
      ...newSection,
      id: crypto.randomUUID()
    }
    const newSections = [...sections, section]
    await setSections(newSections)

    const newSectionData = {
      ...sectionData,
      [section.id]: []
    }
    await setSectionData(newSectionData)
    setCurrentSection(section.id)
  }

  const openDialog = (date: Date, logIndex: number) => {
    const record = sectionData[currentSection]?.find(r => r.date === format(date, 'yyyy-MM-dd'));
    if (record) {
      setSelectedDate(date);
      setSelectedLogIndex(logIndex);
      setDialogOpen(true);
    } else {
      // 新しいログを作成するためのダイアログを開く
      setSelectedDate(date);
      setSelectedLogIndex(0);
      setDialogOpen(true);
    }
  };

  const chartData = useMemo(() => getChartData(), [getChartData])

  if (loading || !currentSection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container max-w-full sm:max-w-4xl mx-auto px-1 sm:px-4 py-4 sm:py-4 bg-background">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">モチベーショントラッカー</h1>
        <div className="flex items-center gap-2 bg-muted p-0.5 rounded-full">
          <Button
            variant={viewMode === 'graph' ? 'default' : 'ghost'}
            size="sm"
            className="rounded-full"
            onClick={() => setViewMode('graph')}
          >
            <CalendarDays className="h-4 w-4 mr-2" />
            グラフ
          </Button>
          <Button
            variant={viewMode === 'database' ? 'default' : 'ghost'}
            size="sm"
            className="rounded-full"
            onClick={() => setViewMode('database')}
          >
            <Target className="h-4 w-4 mr-2" />
            データベース
          </Button>
        </div>
      </div>

      {viewMode === 'graph' ? (
        <>
          <Card className="p-2 sm:p-6 bg-card">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">週間モチベーション</h2>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-titles"
                    checked={showTitles}
                    onCheckedChange={setShowTitles}
                  />
                  <Label htmlFor="show-titles">タイトルを表示</Label>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentOffset(prev => prev - 7)}
                  >
                    前週へ
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentOffset(prev => prev + 7)}
                  >
                    翌週へ
                  </Button>
                </div>
              </div>

              <div className="mb-4">
                <Label htmlFor="tag-filter" className="mb-2 block">タグフィルター</Label>
                <TagSelector
                  availableTags={tags}
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                  onCreateNewClick={handleCreateTag}
                />
              </div>

              <div className="h-[300px] sm:h-[400px] w-full -mx-4 sm:mx-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <Line
                      key="memo-indicator"
                      type="monotone"
                      dataKey="value1"
                      stroke="transparent"
                      dot={(props) => {
                        const { cx, payload } = props
                        if (!payload) return null
                        const record = sectionData[currentSection]?.find(r => r.date === payload.date)
                        const hasMemo = record?.logs.some(log => log.isMemo)

                        if (!hasMemo) return null

                        return (
                          <g key={`memo-${payload.date}`} transform={`translate(${cx}, 10)`}>
                            <text
                              textAnchor="middle"
                              fill="currentColor"
                              fontSize={20}
                              className="cursor-pointer"
                              onClick={() => {
                                const date = new Date(payload.date)
                                const memoIndex = record.logs.findIndex(log => log.isMemo)
                                openDialog(date, memoIndex)
                              }}
                            >
                              📌
                            </text>
                          </g>
                        )
                      }}
                    />
                    <Line
                      key="primary-motivation"
                      type="monotone"
                      dataKey="value1"
                      stroke={settings.graphColor || 'hsl(var(--primary))'}
                      dot={(props) => {
                        const { cx, cy, payload } = props
                        if (!payload || !payload.emoji1) return null
                        return (
                          <g key={`g1-outer-${payload.date}`} transform={`translate(${cx},${cy})`}>
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <g key={`g1-inner-${payload.date}`}>
                                  <text
                                    key={`emoji1-${payload.date}`}
                                    x={0}
                                    y={0}
                                    dy={-10}
                                    textAnchor="middle"
                                    fill={settings.graphColor || 'hsl(var(--primary))'}
                                    fontSize={20}
                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => {
                                      openDialog(new Date(payload.date), 0)
                                    }}
                                  >
                                    {payload.emoji1}
                                  </text>
                                  {showTitles && payload.title1 && (
                                    <text
                                      key={`title1-${payload.date}`}
                                      x={0}
                                      y={20}
                                      textAnchor="middle"
                                      fill={settings.graphColor || 'hsl(var(--primary))'}
                                      fontSize={12}
                                      pointerEvents="none"
                                    >
                                      {payload.title1}
                                    </text>
                                  )}
                                </g>
                              </HoverCardTrigger>
                              {payload.note1 && (
                                <HoverCardContent className="w-80">
                                  <div className="prose dark:prose-invert">
                                    <ReactMarkdown>
                                      {payload.note1}
                                    </ReactMarkdown>
                                  </div>
                                </HoverCardContent>
                              )}
                            </HoverCard>
                          </g>
                        )
                      }}
                    />
                    <Line
                      key="secondary-motivation"
                      type="monotone"
                      dataKey="value2"
                      stroke={settings.graphColor || 'hsl(var(--primary))'}
                      dot={(props) => {
                        const { cx, cy, payload } = props
                        const record = sectionData[currentSection]?.find(r => r.date === payload.date)
                        if (!payload || !payload.emoji2 || !record || record.logs.length < 2) return null
                        return (
                          <g key={`g2-outer-${payload.date}`} transform={`translate(${cx},${cy})`}>
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <g key={`g2-inner-${payload.date}`}>
                                  <text
                                    key={`emoji2-${payload.date}`}
                                    x={0}
                                    y={0}
                                    dy={-10}
                                    textAnchor="middle"
                                    fill={settings.graphColor || 'hsl(var(--primary))'}
                                    fontSize={20}
                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => {
                                      openDialog(new Date(payload.date), 1)
                                    }}
                                  >
                                    {payload.emoji2}
                                  </text>
                                  {showTitles && payload.title2 && (
                                    <text
                                      key={`title2-${payload.date}`}
                                      x={0}
                                      y={20}
                                      textAnchor="middle"
                                      fill={settings.graphColor || 'hsl(var(--primary))'}
                                      fontSize={12}
                                      pointerEvents="none"
                                    >
                                      {payload.title2}
                                    </text>
                                  )}
                                </g>
                              </HoverCardTrigger>
                              {payload.note2 && (
                                <HoverCardContent className="w-80">
                                  <div className="prose dark:prose-invert">
                                    <ReactMarkdown>
                                      {payload.note2}
                                    </ReactMarkdown>
                                  </div>
                                </HoverCardContent>
                              )}
                            </HoverCard>
                          </g>
                        )
                      }}
                    />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => format(new Date(value), 'M/d')}
                      tick={(props) => {
                        const { x, y, payload } = props;
                        return (
                          <g transform={`translate(${x},${y})`}>
                            <text
                              x={0}
                              y={0}
                              dy={16}
                              textAnchor="middle"
                              fill="currentColor"
                              className="cursor-pointer hover:underline"
                              onClick={() => openDialog(new Date(payload.value), 0)}
                            >
                              {format(new Date(payload.value), 'M/d')}
                            </text>
                          </g>
                        );
                      }}
                    />
                    <YAxis
                      domain={[-5, 5]}
                      ticks={[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]}
                      tickFormatter={(value) => value.toString()}
                      interval={0}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">日付を選択</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) {
                          openDialog(date, 0)
                          setCalendarOpen(false)
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Button onClick={() => openDialog(new Date(), 0)} className="w-full sm:w-auto">
                  今日の気分を記録
                </Button>
              </div>
            </div>
          </Card>
        </>
      ) : (
        <DatabaseView onDateClick={(date) => openDialog(new Date(date), 0)} />
      )}

      {selectedDate && (
        <MotivationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          date={format(selectedDate, 'yyyy-MM-dd')}
          logIndex={selectedLogIndex}
          initialData={sectionData[currentSection]?.find(r => r.date === format(selectedDate, 'yyyy-MM-dd'))?.logs[selectedLogIndex]}
          onDelete={handleDelete}
          onClose={(log) => handleClose(format(selectedDate, 'yyyy-MM-dd'), selectedLogIndex, log)}
          availableTags={tags}
          onCreateTag={handleCreateTag}
        />
      )}
    </div>
  )
}

