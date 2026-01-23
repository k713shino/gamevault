'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { searchBGG, getBGGGameDetail, BGGSearchResult } from '@/lib/bgg'

const CATEGORIES = [
  '戦略',
  'パーティー',
  '協力',
  'デッキ構築',
  '正体隠匿',
  'その他',
]

export default function NewGamePage() {
  const [title, setTitle] = useState('')
  const [playerCountMin, setPlayerCountMin] = useState('')
  const [playerCountMax, setPlayerCountMax] = useState('')
  const [playTime, setPlayTime] = useState('')
  const [category, setCategory] = useState('')
  const [customCategory, setCustomCategory] = useState('')
  const [status, setStatus] = useState<'owned' | 'wishlist' | 'lent'>('owned')
  const [memo, setMemo] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // BGG検索用
  const [bggQuery, setBggQuery] = useState('')
  const [bggResults, setBggResults] = useState<BGGSearchResult[]>([])
  const [bggSearching, setBggSearching] = useState(false)
  const [bggLoading, setBggLoading] = useState(false)
  const [bggError, setBggError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  // BGG検索
  const handleBGGSearch = async () => {
    if (!bggQuery.trim()) return
    setBggSearching(true)
    setBggResults([])
    setBggError(null)
    try {
      const results = await searchBGG(bggQuery)
      if (results.length === 0) {
        setBggError('検索結果がありません。BGG APIが利用できない可能性があります。')
      }
      setBggResults(results)
    } catch (err) {
      console.error('BGG search error:', err)
      setBggError('BGG検索に失敗しました')
    } finally {
      setBggSearching(false)
    }
  }

  // BGGからゲーム情報を取得して入力
  const handleBGGSelect = async (id: string) => {
    setBggLoading(true)
    setBggError(null)
    try {
      const detail = await getBGGGameDetail(id)
      if (detail) {
        setTitle(detail.name)
        setPlayerCountMin(detail.minPlayers?.toString() || '')
        setPlayerCountMax(detail.maxPlayers?.toString() || '')
        setPlayTime(detail.playingTime?.toString() || '')
        if (detail.image) {
          setImageUrl(detail.image)
        }
        // カテゴリのマッピング（英語→日本語）
        const categoryMap: { [key: string]: string } = {
          'Abstract Strategy': '戦略',
          'Strategy': '戦略',
          'Party Game': 'パーティー',
          'Cooperative': '協力',
          'Cooperative Game': '協力',
          'Deck Building': 'デッキ構築',
          'Deck, Bag, and Pool Building': 'デッキ構築',
          'Card Game': 'デッキ構築',
          'Deduction': '正体隠匿',
          'Bluffing': '正体隠匿',
          'Hidden Roles': '正体隠匿',
        }
        const matchedCategory = detail.categories.find(cat => categoryMap[cat])
        if (matchedCategory && categoryMap[matchedCategory]) {
          setCategory(categoryMap[matchedCategory])
        }
      } else {
        setBggError('ゲーム情報の取得に失敗しました')
      }
      setBggResults([])
      setBggQuery('')
    } catch (err) {
      console.error('BGG detail error:', err)
      setBggError('ゲーム情報の取得に失敗しました')
    } finally {
      setBggLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      let finalImageUrl: string | null = imageUrl

      // ファイルがアップロードされた場合はそちらを優先
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('game-images')
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('game-images')
          .getPublicUrl(fileName)

        finalImageUrl = urlData.publicUrl
      }

      const finalCategory = category === 'custom' ? customCategory : category

      const { error: insertError } = await supabase.from('games').insert({
        user_id: user.id,
        title,
        image_url: finalImageUrl,
        player_count_min: playerCountMin ? parseInt(playerCountMin) : null,
        player_count_max: playerCountMax ? parseInt(playerCountMax) : null,
        play_time: playTime ? parseInt(playTime) : null,
        category: finalCategory || null,
        status,
        memo: memo || null,
      })

      if (insertError) throw insertError

      router.push('/games')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/games" className="text-blue-600 hover:underline font-medium">
            ← 一覧に戻る
          </Link>
          <h1 className="text-xl font-bold text-gray-900 mt-2">ゲームを追加</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* BGG検索セクション */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-md p-4 mb-6">
          <h2 className="font-bold text-gray-900 mb-2">📚 BGGから検索</h2>
          <p className="text-sm text-gray-700 mb-3">
            BoardGameGeekからゲーム情報を自動入力できます
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="ゲーム名（英語推奨）"
              value={bggQuery}
              onChange={(e) => setBggQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleBGGSearch())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
            />
            <button
              type="button"
              onClick={handleBGGSearch}
              disabled={bggSearching}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {bggSearching ? '検索中...' : '検索'}
            </button>
          </div>

          {/* エラー表示 */}
          {bggError && (
            <p className="mt-3 text-sm text-amber-700 bg-amber-50 p-2 rounded">
              ⚠️ {bggError}
            </p>
          )}

          {/* 検索結果 */}
          {bggResults.length > 0 && (
            <div className="mt-3 bg-white border border-gray-200 rounded-md max-h-60 overflow-y-auto">
              {bggResults.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => handleBGGSelect(result.id)}
                  disabled={bggLoading}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 disabled:opacity-50"
                >
                  <span className="font-medium text-gray-900">{result.name}</span>
                  {result.yearPublished && (
                    <span className="text-gray-600 text-sm ml-2">({result.yearPublished})</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {bggLoading && (
            <p className="mt-3 text-sm text-gray-700">ゲーム情報を取得中...</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
          {/* BGGから取得した画像プレビュー */}
          {imageUrl && !imageFile && (
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">BGGから取得した画像</label>
              <img
                src={imageUrl}
                alt="BGG image"
                className="w-32 h-32 object-cover rounded"
              />
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                className="text-sm text-red-600 hover:underline mt-1"
              >
                画像を削除
              </button>
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
            <label className="block text-sm font-medium text-gray-800 mb-1">
              画像{imageUrl && '（アップロードするとBGG画像を上書きします）'}
            </label>
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
              onChange={(e) => setStatus(e.target.value as 'owned' | 'wishlist' | 'lent')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
            >
              <option value="owned">所持</option>
              <option value="wishlist">欲しい</option>
              <option value="lent">貸出中</option>
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
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium shadow"
          >
            {loading ? '登録中...' : '登録する'}
          </button>
        </form>
      </main>
    </div>
  )
}