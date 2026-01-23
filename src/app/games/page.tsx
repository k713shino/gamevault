'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Game } from '@/lib/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUserAndFetchGames = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      fetchGames()
    }
    checkUserAndFetchGames()
  }, [])

  const fetchGames = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching games:', error)
    } else {
      setGames(data || [])
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || game.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || game.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const categories = [...new Set(games.map((g) => g.category).filter(Boolean))]

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
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">GameVault</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-700 hover:text-gray-900 font-medium"
          >
            ログアウト
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* フィルター・検索エリア */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <input
              type="text"
              placeholder="タイトルで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md flex-1 min-w-[200px] text-gray-900 bg-white"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
            >
              <option value="all">すべてのステータス</option>
              <option value="owned">所持</option>
              <option value="wishlist">欲しい</option>
              <option value="lent">貸出中</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
            >
              <option value="all">すべてのカテゴリ</option>
              {categories.map((cat) => (
                <option key={cat} value={cat!}>{cat}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-md font-medium ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                グリッド
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-md font-medium ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                リスト
              </button>
            </div>
          </div>
        </div>

        {/* 新規登録ボタン */}
        <div className="mb-6">
          <Link
            href="/games/new"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium shadow"
          >
            + ゲームを追加
          </Link>
        </div>

        {/* ゲーム一覧 */}
        {filteredGames.length === 0 ? (
          <p className="text-gray-700 text-center py-8">
            ゲームが登録されていません。「ゲームを追加」から登録してください。
          </p>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredGames.map((game) => (
              <Link
                key={game.id}
                href={`/games/${game.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="aspect-square bg-gray-200 flex items-center justify-center">
                  {game.image_url ? (
                    <img
                      src={game.image_url}
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500">No Image</span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 truncate">{game.title}</h3>
                  <p className="text-sm text-gray-600">
                    {game.player_count_min && game.player_count_max
                      ? `${game.player_count_min}-${game.player_count_max}人`
                      : '人数未設定'}
                  </p>
                  <span className={`inline-block mt-2 text-xs px-2 py-1 rounded font-medium ${
                    game.status === 'owned' ? 'bg-green-100 text-green-800' :
                    game.status === 'wishlist' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {game.status === 'owned' ? '所持' : game.status === 'wishlist' ? '欲しい' : '貸出中'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {filteredGames.map((game) => (
              <Link
                key={game.id}
                href={`/games/${game.id}`}
                className="flex items-center p-4 border-b border-gray-200 hover:bg-gray-50"
              >
                <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                  {game.image_url ? (
                    <img
                      src={game.image_url}
                      alt={game.title}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <span className="text-gray-500 text-xs">No Image</span>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold text-gray-900">{game.title}</h3>
                  <p className="text-sm text-gray-600">
                    {game.player_count_min && game.player_count_max
                      ? `${game.player_count_min}-${game.player_count_max}人`
                      : '人数未設定'}
                    {game.category && ` / ${game.category}`}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded font-medium ${
                  game.status === 'owned' ? 'bg-green-100 text-green-800' :
                  game.status === 'wishlist' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {game.status === 'owned' ? '所持' : game.status === 'wishlist' ? '欲しい' : '貸出中'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}