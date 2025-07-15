'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Section } from '../types'

interface SectionCreatorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateSection: (section: Omit<Section, 'id'>) => void
}

export function SectionCreator({
  open,
  onOpenChange,
  onCreateSection,
}: SectionCreatorProps) {
  const [newSectionName, setNewSectionName] = useState('')

  const handleCreateSection = () => {
    if (newSectionName.trim()) {
      onCreateSection({
        name: newSectionName.trim()
      })
      setNewSectionName('')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新しいセクションを作成</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Input
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              placeholder="セクション名を入力..."
            />
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
            onClick={handleCreateSection}
            disabled={!newSectionName.trim()}
          >
            作成
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

