'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TagBadge } from '../tag-badge'
import { Tag, SectionData, MotivationRecord, MotivationLog } from '../../types'
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select"
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { useData } from '../../contexts/DataContext'

interface TagStats {
id: string
name: string
color: string
logCount: number
averageMotivation: number
insightCount: number
}

interface TagLogData {
date: string
title: string
lesson: string
motivation?: number
}

export function SpecificTagWidget() {
const router = useRouter()
const { tags, sectionData } = useData()
const [selectedTagId, setSelectedTagId] = useState<string | null>(null)
const [tagStats, setTagStats] = useState<TagStats | null>(null)
const [tagLogs, setTagLogs] = useState<TagLogData[]>([])

useEffect(() => {
  const savedTagId = localStorage.getItem('selectedTagId');
  if (savedTagId) {
    setSelectedTagId(savedTagId);
  }
}, []);

useEffect(() => {
  const loadTagsAndCalculateStats = () => {
    if (selectedTagId) {
      const selectedTag = tags.find(tag => tag.id === selectedTagId)
      if (selectedTag) {
        let logCount = 0
        let totalMotivation = 0
        let motivationCount = 0
        let insightCount = 0
        const tagLogData: TagLogData[] = []

        Object.values(sectionData).forEach((records: MotivationRecord[]) => {
          records.forEach(record => {
            if (record && record.logs) {
              record.logs.forEach((log: MotivationLog) => {
                if (log && log.tags && log.tags.includes(selectedTagId)) {
                  logCount++
                  if (typeof log.motivation === 'number') {
                    totalMotivation += log.motivation
                    motivationCount++
                  }
                  if (log.tagInsights && log.tagInsights[selectedTagId]) {
                    insightCount++
                    tagLogData.push({
                      date: record.date,
                      title: log.title || '無題',
                      lesson: log.tagInsights[selectedTagId],
                      motivation: log.motivation
                    })
                  }
                }
              })
            }
          })
        })

        const averageMotivation = motivationCount > 0 ? totalMotivation / motivationCount : 0

        setTagStats({
          id: selectedTag.id,
          name: selectedTag.name,
          color: selectedTag.color,
          logCount,
          averageMotivation: Number(averageMotivation.toFixed(2)),
          insightCount
        })

        setTagLogs(tagLogData)
      }
    }
  }

  loadTagsAndCalculateStats()
}, [selectedTagId, tags, sectionData])

const handleTagChange = (tagId: string) => {
  setSelectedTagId(tagId);
  localStorage.setItem('selectedTagId', tagId);
};

const handleLogClick = (date: string) => {
  const clickedDate = new Date(date)
  const params = new URLSearchParams({
    date: format(clickedDate, 'yyyy-MM-dd')
  })
  router.push(`/?${params.toString()}`)
}

return (
  <Card>
    <CardHeader>
      <CardTitle>インサイト一覧</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <Select value={selectedTagId || ''} onValueChange={handleTagChange}>
          <SelectTrigger>
            <SelectValue placeholder="タグを選択" />
          </SelectTrigger>
          <SelectContent>
            {tags.map((tag) => (
              <SelectItem key={tag.id} value={tag.id}>
                {tag.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {tagStats && (
          <div className="space-y-4">
            <div className="flex items-center justify-end">
              <div className="text-right">
                <p className="text-2xl font-bold">ログ数：<span className="text-primary">{tagStats.logCount}</span></p>
                <p className="text-2xl font-bold">平均モチベーション：<span className="text-primary">{tagStats.averageMotivation}</span></p>
                <p className="text-2xl font-bold">インサイトの数：<span className="text-primary">{tagStats.insightCount}</span></p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">最近のインサイト</h3>
              {tagLogs.slice(0, 5).map((log, index) => (
                <div key={index} className="p-2 border rounded cursor-pointer hover:bg-accent" onClick={() => handleLogClick(log.date)}>
                  <p className="font-semibold">{format(new Date(log.date), 'yyyy年M月d日 (E)', { locale: ja })}</p>
                  <p>インサイト: {log.lesson}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
)
}

