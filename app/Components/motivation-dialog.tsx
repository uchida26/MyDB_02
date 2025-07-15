'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import ReactMarkdown from 'react-markdown'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { TagSelector } from './tag-selector'
import { MotivationLog, Tag } from '../types'
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from 'next/navigation'

interface MotivationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  logIndex: number;
  initialData?: MotivationLog | null;
  onDelete: (date: string, logIndex: number) => void;
  onClose: (log: MotivationLog) => void;
  availableTags: Tag[];
  onCreateTag: (tag: Omit<Tag, 'id'>) => Tag;
}

export function MotivationDialog({
  open,
  onOpenChange,
  date,
  logIndex,
  initialData,
  onDelete,
  onClose,
  availableTags,
  onCreateTag,
}: MotivationDialogProps) {
  const router = useRouter()
  const [log, setLog] = useState<MotivationLog>({ 
    motivation: 0, 
    title: '', 
    note: '', 
    tags: [],
    tagInsights: {},
    isMemo: false
  })
  const [selectedDate, setSelectedDate] = useState(date)
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write")

  useEffect(() => {
    if (initialData) {
      setLog({
        ...initialData,
        tagInsights: initialData.tagInsights || {}
      })
    } else {
      setLog({ 
        motivation: 0, 
        title: '', 
        note: '', 
        tags: [], 
        tagInsights: {},
        isMemo: false 
      })
    }
  }, [initialData])

  useEffect(() => {
    setSelectedDate(date)
  }, [date])

  useEffect(() => {
    if (open && !initialData) {
      setLog({
        motivation: 0,
        title: '',
        note: '',
        tags: [],
        tagInsights: {},
        isMemo: false
      });
    }
  }, [open, initialData]);

  const getEmoji = (level: number) => {
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
    
    const config = emojiConfig.find(c => c.level === level)
    return config ? config.emoji : '😐'
  }

  const handleLogChange = (field: keyof MotivationLog, value: any) => {
    setLog(prevLog => ({ ...prevLog, [field]: value }))
  }

  const handleCreateTag = (tagName: string) => {
    const newTag = onCreateTag({
      name: tagName,
      color: '#FF6B6B',
    })
    return newTag
  }

  //const handleTagInsightChange = (tagId: string, lesson: string) => {
  //  setLog(prevLog => ({
  //    ...prevLog,
  //    tagInsights: {
  //      ...prevLog.tagInsights,
  //      [tagId]: lesson
  //    }
  //  }))
  //}

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      onClose(log);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex flex-col h-full">
          <DialogHeader>
            <DialogTitle>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="p-0 font-semibold text-base sm:text-lg hover:bg-transparent">
                    {format(new Date(selectedDate), 'yyyy年M月d日 (E)', { locale: ja })}の気分 (ログ {logIndex + 1})
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={new Date(selectedDate)}
                    onSelect={(newDate) => {
                      if (newDate) {
                        setSelectedDate(format(newDate, 'yyyy-MM-dd'))
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </DialogTitle>
            <DialogDescription>
              この日の気分やモチベーションを記録します。
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto py-4">
            <div className="grid gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="memo-mode"
                  checked={log.isMemo}
                  onCheckedChange={(checked) => handleLogChange('isMemo', checked)}
                />
                <Label htmlFor="memo-mode">メモとして記録</Label>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="title">タイトル</Label>
                <Input
                  id="title"
                  value={log.title}
                  onChange={(e) => handleLogChange('title', e.target.value)}
                  placeholder="今日のタイトル..."
                />
              </div>
              <div className="grid gap-2">
                <Label>タグとインサイト</Label>
                <div className="border rounded-lg p-2 max-h-60 overflow-y-auto">
                  <TagSelector
                    availableTags={availableTags}
                    selectedTags={log.tags}
                    tagInsights={log.tagInsights}
                    onTagsChange={(tags) => handleLogChange('tags', tags)}
                    onTagInsightChange={(tagId, lesson) => {
                      const updatedTagInsights = { ...log.tagInsights, [tagId]: lesson };
                      handleLogChange('tagInsights', updatedTagInsights);
                    }}
                    onCreateNewClick={handleCreateTag}
                    onTagClick={(tagId) => {
                      const selectedTag = availableTags.find(tag => tag.id === tagId);
                      if (selectedTag) {
                        console.log('Selected tag:', selectedTag);
                        // 例: タグ編集ダイアログを開く関数を呼び出す
                        // openTagEditDialog(selectedTag);
                      }
                    }}
                    currentDate={selectedDate}
                    currentTitle={log.title || '無題'}
                  />
                </div>
              </div>
              {!log.isMemo && (
                <div className="grid gap-2">
                  <Label htmlFor="motivation-level">モチベーションレベル</Label>
                  <Select
                    value={log.motivation?.toString()}
                    onValueChange={(value) => handleLogChange('motivation', parseInt(value))}
                  >
                    <SelectTrigger id="motivation-level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 11 }, (_, i) => 5 - i).map((level) => (
                        <SelectItem key={level} value={level.toString()}>
                          {getEmoji(level)} レベル {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="note">メモ</Label>
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "write" | "preview")}>
                  <TabsList className="mb-2">
                    <TabsTrigger value="write">編集</TabsTrigger>
                    <TabsTrigger value="preview">プレビュー</TabsTrigger>
                  </TabsList>
                  <TabsContent value="write" className="mt-0">
                    <Textarea
                      id="note"
                      value={log.note}
                      onChange={(e) => handleLogChange('note', e.target.value)}
                      placeholder="今日の気分メモ... (マークダウン形式で入力できます)"
                      className="min-h-[200px] font-mono"
                    />
                  </TabsContent>
                  <TabsContent value="preview" className="mt-0">
                    <div className="min-h-[200px] p-4 border rounded-md bg-background">
                      <ReactMarkdown className="prose dark:prose-invert max-w-none">
                        {log.note || '*メモが入力されていません*'}
                      </ReactMarkdown>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            <div className="mt-6 sm:mt-0 pt-4 border-t">
              <div className="flex justify-end">
                {initialData && (
                  <Button
                    variant="destructive"
                    onClick={() => onDelete(date, logIndex)}
                  >
                    削除
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

