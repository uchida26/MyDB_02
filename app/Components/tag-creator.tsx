'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tag } from '../types'

interface TagCreatorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateTag: (tag: Omit<Tag, 'id'>) => void
  initialTagName?: string
}

const PRESET_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
  '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', '#2ECC71'
]

export function TagCreator({
  open,
  onOpenChange,
  onCreateTag,
  initialTagName = ''
}: TagCreatorProps) {
  const [newTagName, setNewTagName] = useState(initialTagName)
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0])

  useEffect(() => {
    setNewTagName(initialTagName)
  }, [initialTagName])

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      onCreateTag({
        name: newTagName.trim(),
        color: selectedColor
      })
      setNewTagName('')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新しいタグを作成</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="タグ名を入力..."
            />
          </div>
          <div className="grid gap-2">
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded-full transition-all ${
                    color === selectedColor ? 'ring-2 ring-primary ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleCreateTag}
            disabled={!newTagName.trim()}
          >
            作成
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

