export interface Tag {
  id: string
  name: string
  color: string
  groupId?: string
  description?: string
}

export interface TagGroup {
  id: string
  name: string
}

export interface MotivationLog {
  motivation?: number
  title?: string
  note?: string
  tags: string[]
  tagInsights: { [tagId: string]: string }
  isMemo?: boolean
}

export interface MotivationRecord {
  date: string
  logs: MotivationLog[]
}

export interface SectionData {
  [sectionName: string]: MotivationRecord[]
}

export interface Section {
  id: string
  name: string
}

export interface EmojiConfig {
  level: number
  emoji: string
}

export interface MotivationalQuote {
  id: string
  text: string
}

export interface Settings {
  defaultSection: string
  darkMode: boolean
  motivationEmojis: EmojiConfig[]
  graphColor: string
  showMotivationalQuote: boolean
  motivationalQuotes: MotivationalQuote[]
  motivationalQuoteSpeed: string
}

export interface DashboardWidget {
  id: string
  type: 'tag-list' | 'specific-tag' | 'word-cloud' | 'tag-group' | 'unused-tags' | 'activity-heatmap'
  title: string
}

export interface Dashboard {
  widgets: DashboardWidget[]
}

