'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TagBadge } from '../tag-badge'
import { Tag, SectionData, MotivationRecord, MotivationLog } from '../../types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, X, Palette, Check, ChevronDown, ChevronUp } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { useData } from '../../contexts/DataContext'
import { Checkbox } from "@/components/ui/checkbox" // Added import for Checkbox

interface TagStats {
  id: string
  name: string
  color: string
  logCount: number
  averageMotivation: number
  insightCount: number // Added insightCount
}

interface TagLogData {
  date: string
  title: string
  lesson: string
  motivation?: number
}

export function TagListWidget() {
  const router = useRouter()
  const { tags, sectionData, setTags } = useData()
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#FF6B6B')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [tagStats, setTagStats] = useState<TagStats[]>([])
  const [isColorPickerOpen, setIsColorPickerOpen] = useState<string | null>(null)
  const [editingTagId, setEditingTagId] = useState<string | null>(null)
  const [editingTagName, setEditingTagName] = useState('')
  const [expandedTags, setExpandedTags] = useState<string[]>([])
  const [tagLogs, setTagLogs] = useState<{ [tagId: string]: TagLogData[] }>({})
  const [hiddenTags, setHiddenTags] = useState<string[]>([])
  const [visibleTags, setVisibleTags] = useState<string[]>([]) // Added visibleTags
  const [isAddTagDialogOpen, setIsAddTagDialogOpen] = useState(false) // Added isAddTagDialogOpen
  const [selectedTagsInDialog, setSelectedTagsInDialog] = useState<string[]>([]) // Added state for selected tags

  const getEmoji = (motivation: number) => {
    const settings = JSON.parse(localStorage.getItem('motivationSettings') || '{}')
    const emojiConfig = settings.motivationEmojis || [
      { level: 5, emoji: '🥳' },
      { level: 4, emoji: '😍' },
      { level: 3, emoji: '🤩' },
      { level: 2, emoji: '😃' },
      { level: 1, emoji: '😄' },
      { level: 0, emoji: '😊' },
      { level: -1, emoji: '😐' },
      { level: -2, emoji: '😕' },
      { level: -3, emoji: '😦' },
      { level: -4, emoji: '😠' },
      { level: -5, emoji: '😡' }
    ]
    
    const config = emojiConfig.find(c => c.level === motivation)
    return config ? config.emoji : '😐'
  }

  useEffect(() => {
    const calculateTagStats = () => {
      const stats: TagStats[] = tags.map(tag => {
        let logCount = 0
        let totalMotivation = 0
        let motivationCount = 0
        let insightCount = 0; // Added insightCount
        const tagLogData: TagLogData[] = []

        Object.values(sectionData).forEach((records: MotivationRecord[]) => {
          records.forEach(record => {
            if (record && record.logs) {  // Add this check
              record.logs.forEach((log: MotivationLog) => {
                if (log && log.tags && log.tags.includes(tag.id)) {  // Add this check
                  logCount++
                  if (typeof log.motivation === 'number') {
                    totalMotivation += log.motivation
                    motivationCount++
                  }
                  if (log.tagInsights && log.tagInsights[tag.id]) { //Updated to tagInsights
                    insightCount++
                    tagLogData.push({
                      date: record.date,
                      title: log.title || '無題',
                      lesson: log.tagInsights[tag.id], //Updated to tagInsights
                      motivation: log.motivation
                    })
                  }
                }
              })
            }
          })
        })

        const averageMotivation = motivationCount > 0 ? totalMotivation / motivationCount : 0

        setTagLogs(prev => ({
          ...prev,
          [tag.id]: tagLogData
        }))

        return {
          id: tag.id,
          name: tag.name,
          color: tag.color,
          logCount,
          averageMotivation: Number(averageMotivation.toFixed(2)),
          insightCount // Added insightCount
        }
      })

      setTagStats(stats)
      // setVisibleTags(tags.map(tag => tag.id))  // Removed this line
    }

    calculateTagStats()
  }, [tags, sectionData])

  const handleAddTag = () => {
    if (newTagName.trim()) {
      const newTag: Tag = {
        id: crypto.randomUUID(),
        name: newTagName.trim(),
        color: newTagColor,
      }
      setTags([...tags, newTag])
      setNewTagName('')
      setNewTagColor('#FF6B6B')
      setIsDialogOpen(false)
    }
  }

  const handleEditTag = (tagId: string, newName: string) => {
    const updatedTags = tags.map(tag =>
      tag.id === tagId ? { ...tag, name: newName.trim() } : tag
    )
    setTags(updatedTags)
    setEditingTagId(null)
    setEditingTagName('')
  }

  const handleHideTag = (tagId: string) => {
    setVisibleTags(prev => prev.filter(id => id !== tagId)) // Updated handleHideTag
  }

  const handleColorChange = (tagId: string, newColor: string) => {
    const updatedTags = tags.map(tag =>
      tag.id === tagId ? { ...tag, color: newColor } : tag
    )
    setTags(updatedTags)
    setIsColorPickerOpen(null)
  }

  const openCreateDialog = () => {
    setNewTagName('')
    setNewTagColor('#FF6B6B')
    setIsDialogOpen(true)
  }

  const startEditingTag = (tagId: string, currentName: string) => {
    setEditingTagId(tagId)
    setEditingTagName(currentName)
  }

  const toggleTagExpansion = (tagId: string) => {
    setExpandedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const handleLogClick = (date: string) => {
    const clickedDate = new Date(date)
    const params = new URLSearchParams({
      date: format(clickedDate, 'yyyy-MM-dd')
    })
    router.push(`/?${params.toString()}`)
  }

  return (
    <Card className="max-w-[100vw]">
      <CardHeader>
        <CardTitle>タグ比較</CardTitle>
      </CardHeader>
      <CardContent className="px-6 sm:px-6">
        <div className="overflow-x-auto -mx-6 sm:mx-0">
          <div className="min-w-[600px] px-6 sm:px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">タグ</TableHead>
                  <TableHead className="w-[100px]">アクション</TableHead>
                  <TableHead className="w-[60px]">ログ数</TableHead>
                  <TableHead className="w-[100px]">平均モチベ</TableHead>
                  <TableHead className="w-[60px]">インサイト数</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tagStats.filter(tagStat => visibleTags.includes(tagStat.id)).map((tagStat) => ( // Updated to use visibleTags
                  <React.Fragment key={tagStat.id}>
                    <TableRow>
                      <TableCell className="font-medium">
                        {editingTagId === tagStat.id ? (
                          <div className="flex items-center">
                            <Input
                              value={editingTagName}
                              onChange={(e) => setEditingTagName(e.target.value)}
                              className="mr-2"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditTag(tagStat.id, editingTagName)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center cursor-pointer hover:opacity-80">
                              <TagBadge name={tagStat.name} color={tagStat.color} />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleTagExpansion(tagStat.id)}
                            >
                              {expandedTags.includes(tagStat.id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => startEditingTag(tagStat.id, tagStat.name)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>タグ名を編集</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => setIsColorPickerOpen(tagStat.id)}>
                                  <Palette className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>色を変更</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleHideTag(tagStat.id)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>タグを非表示</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        {isColorPickerOpen === tagStat.id && (
                          <Input
                            type="color"
                            value={tagStat.color}
                            onChange={(e) => handleColorChange(tagStat.id, e.target.value)}
                            className="w-8 h-8 p-0 border-none mt-2"
                          />
                        )}
                      </TableCell>
                      <TableCell>{tagStat.logCount}</TableCell>
                      <TableCell>{tagStat.averageMotivation}</TableCell>
                      <TableCell>{tagStat.insightCount}</TableCell>
                    </TableRow>
                    {expandedTags.includes(tagStat.id) && (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <div className="pl-8 py-2">
                            {tagLogs[tagStat.id] && tagLogs[tagStat.id].length > 0 ? (
                              <ul className="space-y-4">
                                {tagLogs[tagStat.id].map((log, index) => (
                                  <li key={index} className="border-b pb-4 cursor-pointer hover:bg-accent/50 rounded-lg p-4" onClick={() => handleLogClick(log.date)}>
                                    <div className="flex items-center gap-2 mb-2">
                                      <p className="font-semibold">
                                        {format(new Date(log.date), 'yyyy年M月d日 (E)', { locale: ja })}
                                      </p>
                                      {typeof log.motivation === 'number' && (
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                          <span>{getEmoji(log.motivation)}</span>
                                          <span>レベル {log.motivation}</span>
                                        </div>
                                      )}
                                    </div>
                                    <p className="mb-1">タイトル: {log.title}</p>
                                    <p>学び: {log.lesson}</p>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p>このタグに関連するインサイトはありません。</p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mt-4 flex space-x-2">
          <Dialog open={isAddTagDialogOpen} onOpenChange={setIsAddTagDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                タグを追加
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>タグを追加</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {tags.filter(tag => !visibleTags.includes(tag.id)).map(tag => (
                  <div
                    key={tag.id}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                    onClick={() => {
                      setSelectedTagsInDialog(prev =>
                        prev.includes(tag.id)
                          ? prev.filter(id => id !== tag.id)
                          : [...prev, tag.id]
                      )
                    }}
                  >
                    <Checkbox
                      checked={selectedTagsInDialog.includes(tag.id)}
                      onCheckedChange={(checked) => {
                        setSelectedTagsInDialog(prev =>
                          checked
                            ? [...prev, tag.id]
                            : prev.filter(id => id !== tag.id)
                        )
                      }}
                    />
                    <TagBadge name={tag.name} color={tag.color} />
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setVisibleTags(prev => [...prev, ...selectedTagsInDialog])
                    setSelectedTagsInDialog([])
                    setIsAddTagDialogOpen(false)
                  }}
                >
                  追加
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                新しいタグを作成
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新しいタグを追加</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tagName" className="text-right">
                    タグ名
                  </Label>
                  <Input
                    id="tagName"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tagColor" className="text-right">
                    色
                  </Label>
                  <Input
                    id="tagColor"
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleAddTag}>
                  追加
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}

