'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, SortAsc, SortDesc } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { TagBadge } from './tag-badge'
import { useData } from '../contexts/DataContext'
import { MotivationRecord, MotivationLog } from '../types'

interface DatabaseViewProps {
  onDateClick: (date: string) => void;
}

type SortConfig = {
  key: 'date' | 'motivation' | 'title'
  direction: 'asc' | 'desc'
}

export function DatabaseView({ onDateClick }: DatabaseViewProps) {
  const { sectionData, sections, tags, currentSection } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' })

  // フラットなログリストを作成
  const flatLogs = Object.entries(sectionData)
    .filter(([sectionId]) => currentSection === 'all' || sectionId === currentSection)
    .flatMap(([sectionId, records]) =>
      records.flatMap((record: MotivationRecord) =>
        record.logs.map((log: MotivationLog) => ({
          date: record.date,
          sectionId,
          ...log,
        }))
      )
    )

  // ソート関数
  const sortLogs = (logs: any[]) => {
    return [...logs].sort((a, b) => {
      if (sortConfig.key === 'date') {
        const comparison = a.date.localeCompare(b.date)
        return sortConfig.direction === 'asc' ? comparison : -comparison
      }
      if (sortConfig.key === 'motivation') {
        const aValue = a.motivation ?? 0
        const bValue = b.motivation ?? 0
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
      }
      if (sortConfig.key === 'title') {
        const aValue = a.title || ''
        const bValue = b.title || ''
        const comparison = aValue.localeCompare(bValue)
        return sortConfig.direction === 'asc' ? comparison : -comparison
      }
      return 0
    })
  }

  // フィルタリング関数
  const filterLogs = (logs: any[]) => {
    return logs.filter(log => {
      const matchesSection = currentSection === 'all' || log.sectionId === currentSection
      const matchesSearch = searchQuery === '' || 
        log.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        Object.values(log.tagInsights || {}).some(
          insight => (insight as string).toLowerCase().includes(searchQuery.toLowerCase())
        )
      return matchesSection && matchesSearch
    })
  }

  const handleSort = (key: SortConfig['key']) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const getSortIcon = (key: SortConfig['key']) => {
    if (sortConfig.key !== key) return null
    return sortConfig.direction === 'asc' ? 
      <SortAsc className="h-4 w-4" /> : 
      <SortDesc className="h-4 w-4" />
  }

  const processedLogs = sortLogs(filterLogs(flatLogs))

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          {/*Removed Section Selector*/}
        </div>
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('date')}
                  className="flex items-center gap-2"
                >
                  日付 {getSortIcon('date')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('title')}
                  className="flex items-center gap-2"
                >
                  タイトル {getSortIcon('title')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('motivation')}
                  className="flex items-center gap-2"
                >
                  モチベ {getSortIcon('motivation')}
                </Button>
              </TableHead>
              <TableHead>タグ</TableHead>
              <TableHead>インサイト</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedLogs.map((log, index) => (
              <TableRow key={`${log.date}-${index}`}>
                <TableCell
                  className="cursor-pointer hover:underline"
                  onClick={() => onDateClick(log.date)}
                >
                  {format(new Date(log.date), 'yyyy年M月d日 (E)', { locale: ja })}
                </TableCell>
                <TableCell>{log.title || '無題'}</TableCell>
                <TableCell>{log.motivation !== undefined ? log.motivation : '-'}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {log.tags?.map(tagId => {
                      const tag = tags.find(t => t.id === tagId)
                      return tag ? (
                        <TagBadge
                          key={tag.id}
                          name={tag.name}
                          color={tag.color}
                        />
                      ) : null
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[300px] space-y-2">
                    {log.tags?.map(tagId => {
                      const tag = tags.find(t => t.id === tagId)
                      const insight = log.tagInsights?.[tagId]
                      return tag && insight ? (
                        <div key={tag.id} className="text-sm">
                          <span className="font-medium">{tag.name}:</span> {insight}
                        </div>
                      ) : null
                    })}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

