'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Game } from '@/lib/types'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

const STATUS_LABEL: Record<string, string> = {
  owned: '所持',
  wishlist: '欲しい',
  lent: '貸出中',
}

const STATUS_COLOR: Record<string, string> = {
  owned: 'bg-green-100 text-green-800',
  wishlist: 'bg-yellow-100 text-yellow-800',
  lent: 'bg-red-100 text-red-800',
}

const PLAY_STATUS_LABEL: Record<string, string> = {
  played: 'プレイ済み',
  interested: '興味あり',
  favorite: 'お気に入り',
}

const PLAY_STATUS_COLOR: Record<string, string> = {
  played: 'bg-purple-100 text-purple-800',
  interested: 'bg-blue-100 text-blue-800',
  favorite: 'bg-pink-100 text-pink-800',
}

export default function GameDetailPage() {
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    const fetchGame = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)

      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error || !data) {
        router.push('/games')
        return
      }

      setGame(data)
      setLoading(false)
    }

    fetchGame()
  }, [params.id])

  const handleDelete = async () => {
    if (!confirm('本当に削除しますか？')) return

    setDeleting(true)

    if (game?.image_url) {
      const path = game.image_url.split('/game-images/')[1]
      if (path) {
        await supabase.storage.from('game-images').remove([path])
      }
    }

    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', params.id)

    if (error) {
      alert('削除に失敗しました')
      setDeleting(false)
    } else {
      router.push('/games')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-800">読み込み中...</p>
      </div>
    )
  }

  if (!game) return null

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/games" className="text-blue-600 hover:underline font-medium">
            ← 一覧に戻る
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* 画像 */}
          <div className="aspect-video bg-gray-200 flex items-center justify-center">
            {game.image_url ? (
              <img
                src={game.image_url}
                alt={game.title}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-gray-500">No Image</span>
            )}
          </div>

          {/* 情報 */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{game.title}</h1>
              <div className="flex gap-2 flex-wrap justify-end">
                <span className={`text-sm px-3 py-1 rounded font-medium ${STATUS_COLOR[game.status]}`}>
                  {STATUS_LABEL[game.status]}
                </span>
                {game.play_status && (
                  <span className={`text-sm px-3 py-1 rounded font-medium ${PLAY_STATUS_COLOR[game.play_status]}`}>
                    {PLAY_STATUS_LABEL[game.play_status]}
                  </span>
                )}
              </div>
            </div>

            <dl className="space-y-3">
              {(game.player_count_min || game.player_count_max) && (
                <div>
                  <dt className="text-sm text-gray-600">プレイ人数</dt>
                  <dd className="font-medium text-gray-900">
                    {game.player_count_min && game.player_count_max
                      ? `${game.player_count_min}〜${game.player_count_max}人`
                      : game.player_count_min
                      ? `${game.player_count_min}人〜`
                      : `〜${game.player_count_max}人`}
                  </dd>
                </div>
              )}
              {game.play_time && (
                <div>
                  <dt className="text-sm text-gray-600">プレイ時間</dt>
                  <dd className="font-medium text-gray-900">{game.play_time}分</dd>
                </div>
              )}
              {game.category && (
                <div>
                  <dt className="text-sm text-gray-600">カテゴリ</dt>
                  <dd className="font-medium text-gray-900">{game.category}</dd>
                </div>
              )}
              {game.memo && (
                <div>
                  <dt className="text-sm text-gray-600">メモ</dt>
                  <dd className="whitespace-pre-wrap text-gray-800">{game.memo}</dd>
                </div>
              )}
            </dl>

            {/* ボタン（ログイン時のみ） */}
            {isLoggedIn && (
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <Link
                  href={`/games/${game.id}/edit`}
                  className="flex-1 text-center py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium shadow"
                >
                  編集
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 font-medium shadow"
                >
                  {deleting ? '削除中...' : '削除'}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
