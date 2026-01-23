export type GameStatus = 'owned' | 'wishlist' | 'lent'

export type Game = {
  id: string
  user_id: string
  title: string
  image_url: string | null
  player_count_min: number | null
  player_count_max: number | null
  play_time: number | null
  category: string | null
  status: GameStatus
  memo: string | null
  created_at: string
  updated_at: string
}

export type GameInsert = Omit<Game, 'id' | 'created_at' | 'updated_at'>
export type GameUpdate = Partial<GameInsert>