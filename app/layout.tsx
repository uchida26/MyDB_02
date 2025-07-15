import { Inter } from 'next/font/google'
import { AuthProvider } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { ClientLayout } from './components/ClientLayout'
import { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MyDB',
  description: 'モチベーショントラッカーアプリケーション',
  icons: {
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/E-hFlIUEBXRBOJtskQi3H0ckl3u8YlAZ.png',
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={inter.className}>
      <body>
        <AuthProvider>
          <DataProvider>
            <ClientLayout>{children}</ClientLayout>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  )
}



import './globals.css'