'use client'

import * as React from 'react'
import { Check, Plus, Tag, X, Edit } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { TagBadge } from './tag-badge'
import { Tag as TagType, TagGroup } from '../types'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useData } from '../contexts/DataContext'

interface TagSelectorProps {
  availableTags: TagType[]
  selectedTags: string[]
  tagInsights: { [tagId: string]: string }
  onTagsChange: (tags: string[]) => void
  onTagInsightChange: (tagId: string, lesson: string) => void
  onCreateNewClick: (tagName: string) => TagType
  onTagClick?: (tagId: string) => void
  currentDate: string
  currentTitle: string
}

export function TagSelector({
  availableTags = [],
  selectedTags = [],
  tagInsights = {},
  onTagsChange,
  onTagInsightChange,
  onCreateNewClick,
  onTagClick,
  currentDate,
  currentTitle,
}: TagSelectorProps) {
  const { tagGroups, setTagGroups, setTags } = useData()
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState('')
  const [selectedTagDialog, setSelectedTagDialog] = useState<string | null>(null)
  const [newGroupName, setNewGroupName] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string>('no-group')
  const [isEditingGroup, setIsEditingGroup] = useState(false)
  const [editingTagDescription, setEditingTagDescription] = useState('')

  // Ensure selectedTags is always an array and contains valid tag IDs
  const safeSelectedTags = React.useMemo(() => {
    return Array.isArray(selectedTags) 
      ? selectedTags.filter(id => availableTags.some(tag => tag.id === id))
      : []
  }, [selectedTags, availableTags])

  // フィルタリングされたタグ（選択されているタグのみ）
  const selectedTagItems = React.useMemo(() => {
    return availableTags.filter(tag => safeSelectedTags.includes(tag.id))
  }, [availableTags, safeSelectedTags])

  const filteredTags = React.useMemo(() => {
    if (!Array.isArray(availableTags)) return []
    return availableTags.filter(tag => 
      tag && 
      tag.name && 
      tag.name.toLowerCase().includes((inputValue || '').toLowerCase())
    )
  }, [availableTags, inputValue])

  const toggleTag = React.useCallback(
    (tagId: string) => {
      if (!tagId) return
      onTagsChange(
        safeSelectedTags.includes(tagId)
          ? safeSelectedTags.filter(id => id !== tagId)
          : [...safeSelectedTags, tagId]
      )
    },
    [onTagsChange, safeSelectedTags]
  )

  const handleCreateNew = React.useCallback(() => {
    if (!inputValue?.trim()) return
    const newTag = onCreateNewClick(inputValue.trim())
    if (newTag?.id) {
      onTagsChange([...safeSelectedTags, newTag.id])
      setInputValue('')
      setOpen(false)
    }
  }, [inputValue, onCreateNewClick, onTagsChange, safeSelectedTags])

  const handleSelect = React.useCallback(
    (currentValue: string) => {
      if (!currentValue) return
      const matchingTag = availableTags.find(
        tag => tag?.name?.toLowerCase() === currentValue.toLowerCase()
      )
      if (matchingTag?.id) {
        toggleTag(matchingTag.id)
      } else {
        handleCreateNew()
      }
    },
    [availableTags, toggleTag, handleCreateNew]
  )

  const handleGroupChange = (tagId: string, groupId: string) => {
    const updatedTags = availableTags.map(tag =>
      tag.id === tagId ? { ...tag, groupId: groupId === 'no-group' ? undefined : groupId } : tag
    )
    setTags(updatedTags)
  }

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      const newGroup: TagGroup = {
        id: crypto.randomUUID(),
        name: newGroupName.trim()
      }
      setTagGroups([...tagGroups, newGroup])
      setNewGroupName('')
      setIsEditingGroup(false)
    }
  }

  const handleTagClick = (tagId: string) => {
    const selectedTag = availableTags.find(tag => tag.id === tagId)
    if (selectedTag) {
      setSelectedTagDialog(tagId)
      setEditingTagDescription(selectedTag.description || '')
    }
  }

  const handleUpdateTagDescription = () => {
    if (selectedTagDialog) {
      const updatedTags = availableTags.map(tag =>
        tag.id === selectedTagDialog ? { ...tag, description: editingTagDescription } : tag
      )
      setTags(updatedTags)
      setSelectedTagDialog(null)
    }
  }

  const selectedTag = selectedTagDialog ? availableTags.find(tag => tag.id === selectedTagDialog) : null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        {selectedTagItems.map(tag => (
          <div
            key={tag.id}
            className="flex flex-col sm:flex-row items-start sm:items-center w-full p-3 rounded-lg border bg-background gap-3"
          >
            <div className="flex items-center gap-2 min-w-fit">
              <div className="grid size-6 place-items-center">
                <Tag className="size-4" />
              </div>
              <TagBadge
                name={tag.name}
                color={tag.color}
                onClick={() => handleTagClick(tag.id)}
              />
            </div>
            <div className="flex-1 flex items-center w-full sm:w-auto">
              <Input
                id={`lesson-${tag.id}`}
                value={tagInsights[tag.id] || ''}
                onChange={(e) => onTagInsightChange(tag.id, e.target.value)}
                placeholder="このタグに関連するインサイト"
                className="w-full"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 ml-2"
              onClick={() => toggleTag(tag.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between w-full text-left"
          >
            タグを選択...
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput 
              placeholder="タグを検索または作成..." 
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              {filteredTags.length === 0 && inputValue.trim() !== '' ? (
                <CommandItem onSelect={handleCreateNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  作成: {inputValue}
                </CommandItem>
              ) : (
                <CommandGroup>
                  {filteredTags.map(tag => (
                    <CommandItem
                      key={tag.id}
                      value={tag.name}
                      onSelect={() => handleSelect(tag.name)}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span>{tag.name}</span>
                      </div>
                      <Check
                        className={cn(
                          'ml-auto h-4 w-4',
                          safeSelectedTags.includes(tag.id) ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedTagDialog && (
        <Dialog open={!!selectedTagDialog} onOpenChange={() => setSelectedTagDialog(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedTag?.name}</span>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedTag?.groupId || 'no-group'}
                    onValueChange={(value) => handleGroupChange(selectedTag!.id, value)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="グループを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-group">グループなし</SelectItem>
                      {tagGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsEditingGroup(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tagDescription">タグの詳細</Label>
                <Textarea
                  id="tagDescription"
                  value={editingTagDescription}
                  onChange={(e) => setEditingTagDescription(e.target.value)}
                  placeholder="タグの詳細を入力してください"
                  rows={4}
                />
              </div>
              {tagInsights[selectedTagDialog] ? (
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-semibold mb-1">
                    {currentDate ? format(new Date(currentDate), 'yyyy年M月d日 (E)', { locale: ja }) : ''}
                  </p>
                  <p className="text-base font-medium mb-2">{currentTitle}</p>
                  <p className="text-sm text-muted-foreground">インサイト:</p>
                  <p>{tagInsights[selectedTagDialog]}</p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  このタグに関するインサイトは登録されていません。
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateTagDescription}>保存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

