'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tag, TagGroup } from '../../types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, X, Palette, Download } from 'lucide-react'
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
import { useData } from '../../contexts/DataContext'
import { TagBadge } from '../tag-badge'

// デフォルトのタググループを定義
const DEFAULT_TAG_GROUPS = [
  {
    name: "社会人基礎力（経済産業省）",
    tags: [
      { name: "主体性", description: "物事に進んで取り組む力" },
      { name: "働きかけ力", description: "他人に働きかけ巻き込む力" },
      { name: "実行力", description: "目的を設定し確実に行動する力" },
      { name: "発信力", description: "自分の意見をわかりやすく伝える力" },
      { name: "傾聴力", description: "相手の意見を丁寧に聴く力" },
      { name: "柔軟性", description: "意見の違いや立場の違いを理解する力" },
      { name: "情況把握力", description: "自分と周囲の人々や物事との関係性を理解する力" },
      { name: "規律性", description: "社会のルールや人との約束を守る力" },
      { name: "ストレスコントロール力", description: "ストレスの発生源に対応する力" },
      { name: "課題発見力", description: "現状を分析し目的や課題を明らかにする力" },
      { name: "計画力", description: "課題の解決に向けたプロセスを明らかにし準備する力" },
      { name: "創造力", description: "新しい価値を生み出す力" },
    ]
  }
]

export function TagGroupWidget() {
  const { tags, setTags, tagGroups, setTagGroups } = useData()
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#FF6B6B')
  const [newTagGroup, setNewTagGroup] = useState('no-group')
  const [newGroupName, setNewGroupName] = useState('')
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false)
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [editingGroup, setEditingGroup] = useState<TagGroup | null>(null)
  const [isColorPickerOpen, setIsColorPickerOpen] = useState<string | null>(null)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)

  const handleAddTag = () => {
    if (newTagName.trim()) {
      const newTag: Tag = {
        id: crypto.randomUUID(),
        name: newTagName.trim(),
        color: newTagColor,
        groupId: newTagGroup === 'no-group' ? undefined : newTagGroup
      }
      setTags([...tags, newTag])
      setNewTagName('')
      setNewTagColor('#FF6B6B')
      setNewTagGroup('no-group')
      setIsTagDialogOpen(false)
    }
  }

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag)
    setNewTagName(tag.name)
    setNewTagColor(tag.color)
    setNewTagGroup(tag.groupId || 'no-group')
    setIsTagDialogOpen(true)
  }

  const handleUpdateTag = () => {
    if (editingTag && newTagName.trim()) {
      const updatedTags = tags.map(tag =>
        tag.id === editingTag.id ? { ...tag, name: newTagName.trim(), color: newTagColor, groupId: newTagGroup === 'no-group' ? undefined : newTagGroup } : tag
      )
      setTags(updatedTags)
      setEditingTag(null)
      setIsTagDialogOpen(false)
    }
  }

  const handleDeleteTag = (tagId: string) => {
    const updatedTags = tags.filter(tag => tag.id !== tagId)
    setTags(updatedTags)
  }

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      const newGroup: TagGroup = {
        id: crypto.randomUUID(),
        name: newGroupName.trim()
      }
      setTagGroups([...tagGroups, newGroup])
      setNewGroupName('')
      setIsGroupDialogOpen(false)
    }
  }

  const handleEditGroup = (group: TagGroup) => {
    setEditingGroup(group)
    setNewGroupName(group.name)
    setIsGroupDialogOpen(true)
  }

  const handleUpdateGroup = () => {
    if (editingGroup && newGroupName.trim()) {
      const updatedGroups = tagGroups.map(group =>
        group.id === editingGroup.id ? { ...group, name: newGroupName.trim() } : group
      )
      setTagGroups(updatedGroups)
      // タグのgroupIdも更新
      const updatedTags = tags.map(tag =>
        tag.groupId === editingGroup.id ? { ...tag, groupId: newGroupName.trim() } : tag
      )
      setTags(updatedTags)
      setEditingGroup(null)
      setIsGroupDialogOpen(false)
    }
  }

  const handleDeleteGroup = (groupId: string) => {
    const updatedGroups = tagGroups.filter(group => group.id !== groupId)
    setTagGroups(updatedGroups)
    // グループに属していたタグのgroupIdを削除
    const updatedTags = tags.map(tag =>
      tag.groupId === groupId ? { ...tag, groupId: undefined } : tag
    )
    setTags(updatedTags)
  }

  const handleColorChange = (tagId: string, newColor: string) => {
    const updatedTags = tags.map(tag =>
      tag.id === tagId ? { ...tag, color: newColor } : tag
    )
    setTags(updatedTags)
    setIsColorPickerOpen(null)
  }

  const handleGroupChange = (value: string) => {
    if (value === 'create_new') {
      setEditingGroup(null);
      setNewGroupName('');
      setIsGroupDialogOpen(true);
    } else {
      const updatedTags = tags.map(t =>
        t.id === editingTag?.id ? { ...t, groupId: value === 'no-group' ? undefined : value } : t
      );
      setTags(updatedTags);
    }
  };

  const handleImportGroup = (groupName: string) => {
    const groupToImport = DEFAULT_TAG_GROUPS.find(group => group.name === groupName)
    if (groupToImport) {
      const newGroup: TagGroup = {
        id: crypto.randomUUID(),
        name: groupToImport.name
      }
      setTagGroups([...tagGroups, newGroup])

      const newTags = groupToImport.tags.map(tag => ({
        id: crypto.randomUUID(),
        name: tag.name,
        color: '#' + Math.floor(Math.random()*16777215).toString(16), // ランダムな色を生成
        description: tag.description,
        groupId: newGroup.id
      }))

      // 既存のタグと重複しないようにチェック
      const uniqueNewTags = newTags.filter(newTag => 
        !tags.some(existingTag => existingTag.name === newTag.name)
      )

      setTags([...tags, ...uniqueNewTags])
      setIsImportDialogOpen(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>タググループ</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>タグ名</TableHead>
                <TableHead>グループ</TableHead>
                <TableHead>アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell>
                    <TagBadge name={tag.name} color={tag.color} />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={tag.groupId || 'no-group'}
                      onValueChange={handleGroupChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="グループを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-group">グループなし</SelectItem>
                        <SelectItem value="create_new">新しいグループを作成</SelectItem>
                        {tagGroups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditTag(tag)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsColorPickerOpen(tag.id)}
                      >
                        <Palette className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTag(tag.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {isColorPickerOpen === tag.id && (
                      <Input
                        type="color"
                        value={tag.color}
                        onChange={(e) => handleColorChange(tag.id, e.target.value)}
                        className="w-8 h-8 p-0 border-none mt-2"
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex space-x-2">
            <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingTag(null); setNewTagName(''); setNewTagColor('#FF6B6B'); setNewTagGroup('no-group'); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  新しいタグを作成
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingTag ? 'タグを編集' : '新しいタグを追加'}</DialogTitle>
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
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tagGroup" className="text-right">
                      グループ
                    </Label>
                    <Select value={newTagGroup} onValueChange={handleGroupChange}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="グループを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-group">グループなし</SelectItem>
                        <SelectItem value="create_new">新しいグループを作成</SelectItem>
                        {tagGroups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={editingTag ? handleUpdateTag : handleAddTag}>
                    {editingTag ? '更新' : '追加'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingGroup ? 'グループを編集' : '新しいグループを追加'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="groupName" className="text-right">
                      グループ名
                    </Label>
                    <Input
                      id="groupName"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={editingGroup ? handleUpdateGroup : handleAddGroup}>
                    {editingGroup ? '更新' : '追加'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  グループをインポート
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>グループをインポート</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {DEFAULT_TAG_GROUPS.map((group) => (
                    <Button
                      key={group.name}
                      onClick={() => handleImportGroup(group.name)}
                      variant="outline"
                    >
                      {group.name}
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">グループ一覧</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>グループ名</TableHead>
                  <TableHead>アクション</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tagGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell>{group.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditGroup(group)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteGroup(group.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

