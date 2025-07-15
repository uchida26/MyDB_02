'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { addDays, format, startOfYear, subYears } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useData } from '../../contexts/DataContext'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ActivityData {
  date: string
  count: number
}

export function ActivityHeatmapWidget() {
  const { sectionData } = useData()

  const activityData = useMemo(() => {
    const data: { [date: string]: number } = {}
    
    // Initialize all dates for the past year with 0
    const endDate = new Date()
    const startDate = subYears(startOfYear(endDate), 1)
    let currentDate = startDate
    
    while (currentDate <= endDate) {
      const dateStr = format(currentDate, 'yyyy-MM-dd')
      data[dateStr] = 0
      currentDate = addDays(currentDate, 1)
    }

    // Count logs for each date
    Object.values(sectionData).forEach(records => {
      records.forEach(record => {
        if (record.date in data) {
          data[record.date] = record.logs.length
        }
      })
    })

    return Object.entries(data).map(([date, count]) => ({
      date,
      count
    }))
  }, [sectionData])

  const getColorForCount = (count: number) => {
    if (count === 0) return 'bg-muted hover:bg-muted/80'
    if (count === 1) return 'bg-primary/20 hover:bg-primary/30'
    if (count === 2) return 'bg-primary/40 hover:bg-primary/50'
    if (count === 3) return 'bg-primary/60 hover:bg-primary/70'
    return 'bg-primary/80 hover:bg-primary/90'
  }

  const weeks = useMemo(() => {
    const result: ActivityData[][] = []
    let currentWeek: ActivityData[] = []

    activityData.forEach((data, index) => {
      const dayOfWeek = new Date(data.date).getDay()
      
      // Fill in empty days at the start of the first week
      if (index === 0) {
        for (let i = 0; i < dayOfWeek; i++) {
          currentWeek.push({ date: '', count: 0 })
        }
      }

      currentWeek.push(data)

      if (dayOfWeek === 6) {
        result.push(currentWeek)
        currentWeek = []
      }
    })

    // Fill in the remaining days of the last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: '', count: 0 })
      }
      result.push(currentWeek)
    }

    return result
  }, [activityData])

  return (
    <Card>
      <CardHeader>
        <CardTitle>ログイン日</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <TooltipProvider key={dayIndex}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`w-3 h-3 rounded-sm transition-colors ${
                            day.date ? getColorForCount(day.count) : 'bg-transparent'
                          }`}
                        />
                      </TooltipTrigger>
                      {day.date && (
                        <TooltipContent>
                          <p>
                            {format(new Date(day.date), 'yyyy年M月d日 (E)', { locale: ja })}
                          </p>
                          <p>{day.count}件のログ</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

