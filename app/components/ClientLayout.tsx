'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { BarChart2, LineChart, Settings2, ChevronRight, User, Menu } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { Settings } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { useSettings } from '../hooks/useSettings'
import { MotivationalQuote } from './MotivationalQuote'
import { useData } from '../contexts/DataContext'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Toast } from "@/components/ui/toast"
import { InitialSectionSetup } from './InitialSectionSetup'
import { SectionCreator } from '../Components/section-creator' // Updated import statement

const navigation = [
  {
    name: 'モチベーショントラッカー',
    href: '/',
    icon: BarChart2
  },
  {
    name: '分析',
    href: '/analysis',
    icon: LineChart
  },
  {
    name: '設定',
    href: '/settings',
    icon: Settings2
  }
]

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false)
  const { user, isFirstLogin } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const { settings } = useSettings()
  const { sections, currentSection, setCurrentSection: updateCurrentSection, sectionData, setSections, setSectionData } = useData()
  const [isOnline, setIsOnline] = useState(true);
  const [sectionCreatorOpen, setSectionCreatorOpen] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isFirstLogin) {
    return <InitialSectionSetup />
  }

  return (
    <div className="min-h-screen flex bg-background">
      <div
        className={cn(
          "h-screen flex flex-col fixed left-0 top-0 z-40 bg-background border-r transition-all duration-300 overflow-y-auto",
          expanded ? "w-64" : "w-16",
          "fixed",
          "fixed top-0 -left-full lg:left-0",
          expanded && "left-0",
        )}
      >
        <div className="flex items-center justify-between p-4">
          {expanded && <h1 className="text-lg font-semibold">メニュー</h1>}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "transition-transform",
              expanded && "rotate-180"
            )}
            onClick={() => setExpanded(!expanded)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1">
          <ul className="space-y-1 p-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      !expanded && "justify-center"
                    )}
                    onClick={() => router.push(item.href)}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {expanded && <span>{item.name}</span>}
                  </Button>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="mt-auto border-t p-2 space-y-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-full bg-gradient-to-br from-red-500/10 to-green-500/10 hover:from-red-500/20 hover:to-green-500/20"
              >
                <User className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="start">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">アカウント情報</h4>
                  <p className="text-sm text-muted-foreground break-all">
                    {user?.email}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => {/* パスワード変更機能を実装予定 */}}
                  >
                    パスワードを変更
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => signOut(auth)}
                  >
                    ログアウト
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {expanded && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setExpanded(false)}
        />
      )}

      <main className={cn(
        "flex-1 transition-all duration-300",
        expanded ? "lg:ml-64" : "lg:ml-16",
        "ml-0 pt-20 px-4",
        settings.showMotivationalQuote && settings.motivationalQuotes.length > 0 ? "pt-28" : "pt-20"
      )}>
        <div className="flex flex-col min-h-screen">
          {settings.showMotivationalQuote && settings.motivationalQuotes.length > 0 && (
            <MotivationalQuote 
              quotes={settings.motivationalQuotes.map(quote => quote.text)}
              speed={settings.motivationalQuoteSpeed || '1'}
            />
          )}
          <main className={cn(
            "flex-1 transition-all duration-300",
            expanded ? "lg:ml-64" : "lg:ml-16",
            "ml-0",
            settings.showMotivationalQuote && "pt-8"
          )}>
            <Button
              variant="ghost"
              className="lg:hidden fixed top-4 left-4 z-50 p-0"
              style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px' }}
              onClick={() => setExpanded(true)}
            >
              <Menu style={{ width: '25px', height: '25px' }} />
            </Button>

            <div className={cn(
              "fixed top-4 z-50 transition-all duration-300 flex items-center gap-2",
              expanded ? "lg:left-[17.25rem]" : "lg:left-20",
              "left-20"
            )}>
              <Select 
                value={currentSection} 
                onValueChange={(value) => {
                  if (value === 'create_new') {
                    setSectionCreatorOpen(true);
                  } else {
                    updateCurrentSection(value);
                  }
                }}
              >
                <SelectTrigger className="w-[200px] border-0 bg-transparent hover:bg-transparent focus:ring-0 px-0 font-medium">
                  <SelectValue placeholder="セクションを選択" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="create_new">新しいセクションを作成</SelectItem>
                </SelectContent>
              </Select>
              {/* プラスボタンを削除 */}
            </div>
            {children}
          </main>
        </div>
      </main>
      {!isOnline && (
        <Toast>
          <p>インターネット接続がありません。データの保存ができない可能性があります。</p>
        </Toast>
      )}
      <SectionCreator
        open={sectionCreatorOpen}
        onOpenChange={setSectionCreatorOpen}
        onCreateSection={async (newSection) => {
          const section = {
            ...newSection,
            id: crypto.randomUUID()
          }
          const newSections = [...sections, section]
          await setSections(newSections)

          const newSectionData = {
            ...sectionData,
            [section.id]: []
          }
          await setSectionData(newSectionData)
          updateCurrentSection(section.id)
        }}
      />
    </div>
  )
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isFirstLogin } = useAuth()
  const { settings } = useSettings()

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings.darkMode])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  }

  return user ? <AuthenticatedLayout>{children}</AuthenticatedLayout> : children
}

