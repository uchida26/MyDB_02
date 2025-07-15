'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('パスワードが一致しません。')
      return
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上である必要があります。')
      return
    }

    setIsLoading(true)
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      router.push('/')
    } catch (error: any) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('このメールアドレスは既に使用されています。')
          break
        case 'auth/invalid-email':
          setError('メールアドレスの形式が正しくありません。')
          break
        default:
          setError('アカウントの作成に失敗しました。')
          break
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    if (isLoading) return
    setIsLoading(true)
    setError(null)
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        console.log('Googleアカウントでサインアップ成功:', result.user);
        router.push('/');
      } else {
        setError('Googleでのサインアップに失敗しました。もう一度お試しください。');
      }
    } catch (error: any) {
      console.error('Googleサインアップエラー:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setError('ポップアップが閉じられました。もう一度お試しください。');
      } else if (error.code === 'auth/cancelled-popup-request') {
        setError('認証プロセスが中断されました。もう一度お試しください。');
      } else if (error.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;
        if (currentDomain.includes('vusercontent.net')) {
          console.error('開発者向け: 現在の環境は一時的なドメインを使用しています。本番環境では、適切なドメインをFirebase Consoleの承認済みドメインリストに追加してください。');
          setError('開発環境では、Googleサインアップ機能は利用できません。メールアドレスとパスワードでアカウントを作成してください。');
        } else {
          console.error(`開発者向け: このドメイン (${currentDomain}) は Firebase Console で承認されていません。承認済みドメインリストにこのドメインを追加してください。`);
          setError('申し訳ありませんが、現在この機能は利用できません。管理者にお問い合わせください。');
        }
      } else {
        setError(`Googleでのサインアップに失敗しました: ${error.message}`);
      }
    } finally {
      setIsLoading(false)
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('ユーザーが認証されました:', user);
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-[400px]">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/E-Apafv5uWvxY1p6y4b3eV9wedsfTncr.png"
              alt="MyDB Logo"
              width={100}
              height={100}
              priority
            />
          </div>
          <CardTitle className="text-2xl text-center">アカウント作成</CardTitle>
          <CardDescription className="text-center">
            必要な情報を入力してアカウントを作成してください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@example.com"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6文字以上"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">パスワード（確認）</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="パスワードを再入力"
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full bg-black hover:bg-black/90" disabled={isLoading}>
              {isLoading ? '処理中...' : 'アカウントを作成'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full mt-4"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
            >
              {isLoading ? '処理中...' : 'Googleでサインアップ'}
            </Button>
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                onClick={() => router.push('/login')}
                disabled={isLoading}
              >
                既にアカウントをお持ちの方はこちら
              </button>
            </div>
            <div className="text-center mt-4">
              <Link href="/" className="text-sm text-primary hover:underline">
                トップ画面へ戻る
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

