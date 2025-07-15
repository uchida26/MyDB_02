'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TagListWidget } from './widgets/tag-list-widget'
import { SpecificTagWidget } from './widgets/specific-tag-widget'
import { WordCloudWidget } from './widgets/word-cloud-widget'
import { TagGroupWidget } from './widgets/tag-group-widget'
import { UnusedTagsWidget } from './widgets/unused-tags-widget'
import { ActivityHeatmapWidget } from './widgets/activity-heatmap-widget'
import { DashboardWidget } from '../types'
import { useData } from '../contexts/DataContext'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

const WIDGET_TYPES = [
  { id: 'tag-list', name: 'タグ比較' },
  { id: 'specific-tag', name: 'インサイト一覧' },
  { id: 'word-cloud', name: 'ワードクラウド' },
  { id: 'tag-group', name: 'タググループ' },
  { id: 'unused-tags', name: '未使用タグ' },
  { id: 'activity-heatmap', name: 'ログイン日' },
]

export function Dashboard() {
  const { dashboardWidgets, setDashboardWidgets } = useData()
  const [widgets, setWidgets] = useState<DashboardWidget[]>(dashboardWidgets)
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false)

  useEffect(() => {
    setWidgets(dashboardWidgets)
  }, [dashboardWidgets])

  const handleAddWidget = (type: string) => {
    const widgetType = WIDGET_TYPES.find(w => w.id === type)
    if (!widgetType) return

    const newWidget: DashboardWidget = {
      id: crypto.randomUUID(),
      type: widgetType.id as DashboardWidget['type'],
      title: widgetType.name,
    }

    const updatedWidgets = [...widgets, newWidget]
    setWidgets(updatedWidgets)
    setDashboardWidgets(updatedWidgets)
    setIsAddWidgetOpen(false)
  }

  const handleDeleteWidget = (widgetId: string) => {
    const updatedWidgets = widgets.filter(w => w.id !== widgetId)
    setWidgets(updatedWidgets)
    setDashboardWidgets(updatedWidgets)
  }

  const renderWidget = (widget: DashboardWidget) => {
    const content = (() => {
      switch (widget.type) {
        case 'tag-list':
          return <TagListWidget key={widget.id} />
        case 'specific-tag':
          return <SpecificTagWidget key={widget.id} />
        case 'word-cloud':
          return <WordCloudWidget key={widget.id} />
        case 'tag-group':
          return <TagGroupWidget key={widget.id} />
        case 'unused-tags':
          return <UnusedTagsWidget key={widget.id} />
        case 'activity-heatmap':
          return <ActivityHeatmapWidget key={widget.id} />
        default:
          return null
      }
    })()

    if (!content) return null

    return (
      <div className="relative group">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => handleDeleteWidget(widget.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        {content}
      </div>
    )
  }

  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return
    }

    const items = Array.from(widgets)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setWidgets(items)
    setDashboardWidgets(items)
  }

  const EmptyDashboard = () => (
    <div className="text-center py-12 border-2 border-dashed rounded-lg">
      <h2 className="text-xl font-semibold mb-2">空白のダッシュボード</h2>
      <p className="text-muted-foreground mb-4">
        右上の「ウィジェットを追加」ボタンからウィジェットを追加できます
      </p>
      <Button onClick={() => setIsAddWidgetOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        ウィジェットを追加
      </Button>
    </div>
  )

  const AddWidgetButton = () => (
    <div className="text-center py-12 border-2 border-dashed rounded-lg">
      <p className="text-muted-foreground mb-4">
        右上の「ウィジェットを追加」ボタンからウィジェットを追加できます
      </p>
      <Button variant="outline" onClick={() => setIsAddWidgetOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        ウィジェットを追加
      </Button>
    </div>
  )

  return (
    <div className="w-full overflow-x-hidden">
      <div className="container mx-auto px-2 sm:px-4 py-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">分析</h1>
          <Dialog open={isAddWidgetOpen} onOpenChange={setIsAddWidgetOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                ウィジェットを追加
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>ウィジェットを追加</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {WIDGET_TYPES.map((type) => (
                  <Button
                    key={type.id}
                    variant="outline"
                    className="justify-start"
                    onClick={() => handleAddWidget(type.id)}
                  >
                    {type.name}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="widgets">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
                {widgets.length > 0 ? (
                  <>
                    {widgets.map((widget, index) => (
                      <Draggable key={widget.id} draggableId={widget.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-card rounded-lg shadow-sm transition-shadow hover:shadow-md"
                          >
                            {renderWidget(widget)}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    <AddWidgetButton />
                  </>
                ) : (
                  <EmptyDashboard />
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  )
}

