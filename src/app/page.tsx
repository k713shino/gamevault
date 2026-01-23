'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function HomePage() {
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/games')
      } else {
        setChecking(false)
      }
    }
    checkUser()
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-800">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            GameVault
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            あなたのボードゲームコレクションを管理しよう
          </p>

          <div className="flex justify-center gap-4 mb-12">
            <Link
              href="/login"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow"
            >
              ログイン
            </Link>
            <Link
              href="/signup"
              className="px-6 py-3 bg-white text-blue-700 border-2 border-blue-600 rounded-lg hover:bg-blue-50 font-medium shadow"
            >
              新規登録
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-3">📦</div>
              <h3 className="font-bold text-gray-900 mb-2">コレクション管理</h3>
              <p className="text-gray-700 text-sm">
                所持しているゲーム、欲しいゲームを一覧で管理できます。
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="font-bold text-gray-900 mb-2">検索・フィルタ</h3>
              <p className="text-gray-700 text-sm">
                タイトル、カテゴリ、プレイ人数で素早く検索できます。
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-bold text-gray-900 mb-2">どこでもアクセス</h3>
              <p className="text-gray-700 text-sm">
                スマホでもPCでも、いつでもコレクションを確認できます。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}