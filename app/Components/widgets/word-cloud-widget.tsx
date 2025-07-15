'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useData } from '../../contexts/DataContext'
import { MotivationRecord } from '../../types'
import { Button } from '@/components/ui/button'
import { SortAsc } from 'lucide-react'

interface Word {
  text: string
  value: number
}

interface WordCloudWidgetProps {
  className?: string
}

export function WordCloudWidget({ className }: WordCloudWidgetProps) {
  const { tags, sectionData } = useData()
  const [selectedTagId, setSelectedTagId] = useState<string>('')
  const [sortType, setSortType] = useState<'frequency' | 'score'>('frequency')
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const words: Word[] = useMemo(() => {
    setIsLoading(true);
    setError(null);
    if (!selectedTagId || !sectionData || Object.keys(sectionData).length === 0) {
      setIsLoading(false);
      return [];
    }

    const wordMap = new Map<string, number>();
    
    try {
      Object.values(sectionData).forEach((records: MotivationRecord[]) => {
        records.forEach(record => {
          if (record?.logs) {
            record.logs.forEach(log => {
              if (log?.tags?.includes(selectedTagId) && log.tagInsights?.[selectedTagId]) {
                const text = log.tagInsights[selectedTagId];
                const words = text.split(/[\s,。、！？!?]+/).filter(word => word.trim() !== '');
                
                words.forEach(word => {
                  wordMap.set(word, (wordMap.get(word) || 0) + 1);
                });
              }
            });
          }
        });
      });

      const wordArray = Array.from(wordMap.entries());
      if (wordArray.length === 0) {
        setIsLoading(false);
        return [];
      }

      const maxFrequency = Math.max(...wordArray.map(([_, value]) => value), 1);

      const result = wordArray
        .map(([text, value]) => ({
          text,
          value: sortType === 'frequency' ? value : Math.round((value / maxFrequency) * 100)
        }))
        .filter(word => word.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 100);

      console.log('Processed words:', result);
      setIsLoading(false);
      return result;
    } catch (err) {
      console.error('Error processing word cloud data:', err);
      setError('データの処理中にエラーが発生しました');
      setIsLoading(false);
      return [];
    }
  }, [selectedTagId, sectionData, sortType])

  const renderWordCloud = () => {
    if (isLoading) {
      return (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          ワードクラウドを生成中...
        </div>
      );
    }

    if (error) {
      return (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          {error}
        </div>
      );
    }

    if (!words || words.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          このタグに関連する十分なデータがありません
        </div>
      );
    }

    const maxValue = Math.max(...words.map(w => w.value));
    const minValue = Math.min(...words.map(w => w.value));
    const fontSizeScale = (value: number) => {
      return 12 + ((value - minValue) / (maxValue - minValue)) * 36; // 12px to 48px
    };

    return (
      <div className="h-[400px] w-full overflow-hidden relative">
        {words.map((word, index) => {
          const fontSize = fontSizeScale(word.value);
          const left = Math.random() * 90 + '%';
          const top = Math.random() * 90 + '%';
          return (
            <div
              key={index}
              className="absolute inline-block transform -translate-x-1/2 -translate-y-1/2"
              style={{
                fontSize: `${fontSize}px`,
                left,
                top,
                color: `hsl(${Math.random() * 360}, 70%, 50%)`,
              }}
            >
              {word.text}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>ワードクラウド</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortType(prev => prev === 'frequency' ? 'score' : 'frequency')}
          >
            <SortAsc className="h-4 w-4 mr-2" />
            {sortType === 'frequency' ? '出現頻度順' : 'スコア順'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select value={selectedTagId} onValueChange={setSelectedTagId}>
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

          {renderWordCloud()}
        </div>
      </CardContent>
    </Card>
  )
}

