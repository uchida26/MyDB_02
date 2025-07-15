'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TagBadge } from '../tag-badge'
import { useData } from '../../contexts/DataContext'
import { format, subMonths } from 'date-fns'
import { Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function UnusedTagsWidget() {
  const { tags, sectionData, setTags } = useData()
  const [unusedTags, setUnusedTags] = useState<typeof tags>([])

  useEffect(() => {
    const oneMonthAgo = subMonths(new Date(), 1)
    const usedTagIds = new Set<string>()

    // 過去1か月間のログで使用されているタグを収集
    Object.values(sectionData).forEach(records => {
      records.forEach(record => {
        if (new Date(record.date) >= oneMonthAgo) {
          record.logs.forEach(log => {
            log.tags.forEach(tagId => usedTagIds.add(tagId))
          })
        }
      })
    })

    // 未使用のタグを特定
    const unusedTags = tags.filter(tag => !usedTagIds.has(tag.id))
    setUnusedTags(unusedTags)
  }, [tags, sectionData])

  const handleDeleteTag = (tagId: string) => {
    // タグを削除
    const updatedTags = tags.filter(tag => tag.id !== tagId)
    setTags(updatedTags)

    // 未使用タグリストを更新
    setUnusedTags(prevUnusedTags => prevUnusedTags.filter(tag => tag.id !== tagId))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>未使用タグ（過去1か月）</CardTitle>
      </CardHeader>
      <CardContent>
        {unusedTags.length === 0 ? (
          <p>過去1か月間で未使用のタグはありません。</p>
        ) : (
          <div className="space-y-2">
            {unusedTags.map(tag => (
              <div key={tag.id} className="flex items-center justify-between">
                <TagBadge name={tag.name} color={tag.color} />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>タグの削除</AlertDialogTitle>
                      <AlertDialogDescription>
                        「{tag.name}」タグを削除してもよろしいですか？この操作は取り消せません。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>キャンセル</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteTag(tag.id)}>
                        削除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

