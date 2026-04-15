'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Game } from '@/lib/types'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

const CATEGORIES = [
  '戦略',
  'パーティー',
  '協力',
  'デッキ構築',
  '正体隠匿',
  'その他',
]

export default function EditGamePage() {
  const [game, setGame] = useState<Game | null>(null)
  const [title, setTitle] = useState('')
  const [playerCountMin, setPlayerCountMin] = useState('')
  const [playerCountMax, setPlayerCountMax] = useState('')
  const [playTime, setPlayTime] = useState('')
  const [category, setCategory] = useState('')
  const [customCategory, setCustomCategory] = useState('')
  const [status, setStatus] = useState<'owned' | 'wishlist' | 'lent' | 'played'>('owned')
  const [memo, setMemo] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    const fetchGame = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

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
      setTitle(data.title)
      setPlayerCountMin(data.player_count_min?.toString() || '')
      setPlayerCountMax(data.player_count_max?.toString() || '')
      setPlayTime(data.play_time?.toString() || '')
      setStatus(data.status)
      setMemo(data.memo || '')

      // カテゴリの設定
      if (data.category && CATEGORIES.includes(data.category)) {
        setCategory(data.category)
      } else if (data.category) {
        setCategory('custom')
        setCustomCategory(data.category)
      }

      setLoading(false)
    }

    fetchGame()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      let imageUrl = game?.image_url || null

      // 新しい画像がアップロードされた場合
      if (imageFile) {
        // 古い画像を削除
        if (game?.image_url) {
          const oldPath = game.image_url.split('/game-images/')[1]
          if (oldPath) {
            await supabase.storage.from('game-images').remove([oldPath])
          }
        }

        // 新しい画像をアップロード
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('game-images')
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('game-images')
          .getPublicUrl(fileName)

        imageUrl = urlData.publicUrl
      }

      const finalCategory = category === 'custom' ? customCategory : category

      const { error: updateError } = await supabase
        .from('games')
        .update({
          title,
          image_url: imageUrl,
          player_count_min: playerCountMin ? parseInt(playerCountMin) : null,
          player_count_max: playerCountMax ? parseInt(playerCountMax) : null,
          play_time: playTime ? parseInt(playTime) : null,
          category: finalCategory || null,
          status,
          memo: memo || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id)

      if (updateError) throw updateError

      router.push(`/games/${params.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-800">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href={`/games/${params.id}`} className="text-blue-600 hover:underline font-medium">
            ← 詳細に戻る
          </Link>
          <h1 className="text-xl font-bold text-gray-900 mt-2">ゲームを編集</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
          {/* 現在の画像 */}
          {game?.image_url && (
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">現在の画像</label>
              <img
                src={game.image_url}
                alt={game.title}
                className="w-32 h-32 object-cover rounded"
              />
            </div>
          )}

          {/* タイトル */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
            />
          </div>

          {/* 画像 */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">新しい画像</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full text-gray-700"
            />
          </div>

          {/* プレイ人数 */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-800 mb-1">最少人数</label>
              <input
                type="number"
                min="1"
                value={playerCountMin}
                onChange={(e) => setPlayerCountMin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-800 mb-1">最大人数</label>
              <input
                type="number"
                min="1"
                value={playerCountMax}
                onChange={(e) => setPlayerCountMax(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
              />
            </div>
          </div>

          {/* プレイ時間 */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">プレイ時間（分）</label>
            <input
              type="number"
              min="1"
              value={playTime}
              onChange={(e) => setPlayTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
            />
          </div>

          {/* カテゴリ */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">カテゴリ</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
            >
              <option value="">選択してください</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="custom">その他（自由入力）</option>
            </select>
            {category === 'custom' && (
              <input
                type="text"
                placeholder="カテゴリを入力"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2 text-gray-900 bg-white"
              />
            )}
          </div>

          {/* ステータス */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              ステータス <span className="text-red-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'owned' | 'wishlist' | 'lent' | 'played')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
            >
              <option value="owned">所持</option>
              <option value="wishlist">欲しい</option>
              <option value="lent">貸出中</option>
              <option value="played">プレイ済み</option>
            </select>
          </div>

          {/* メモ */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">メモ</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
            />
          </div>

          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium shadow"
          >
            {saving ? '保存中...' : '保存する'}
          </button>
        </form>
      </main>
    </div>
  )
}