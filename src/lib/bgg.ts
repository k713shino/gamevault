export type BGGSearchResult = {
  id: string
  name: string
  yearPublished: string | null
}

export type BGGGameDetail = {
  id: string
  name: string
  image: string | null
  minPlayers: number | null
  maxPlayers: number | null
  playingTime: number | null
  categories: string[]
}

// BGG検索API（API Route経由）
export async function searchBGG(query: string): Promise<BGGSearchResult[]> {
  const response = await fetch(`/api/bgg/search?query=${encodeURIComponent(query)}`)
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('BGG search failed:', response.status, errorData)
    return []
  }
  
  const text = await response.text()
  
  // JSONエラーレスポンスの場合
  if (text.startsWith('{')) {
    console.error('BGG API error:', text)
    return []
  }
  
  const parser = new DOMParser()
  const xml = parser.parseFromString(text, 'text/xml')
  
  const items = xml.querySelectorAll('item')
  const results: BGGSearchResult[] = []
  
  items.forEach((item) => {
    const id = item.getAttribute('id')
    const nameEl = item.querySelector('name')
    const yearEl = item.querySelector('yearpublished')
    
    if (id && nameEl) {
      results.push({
        id,
        name: nameEl.getAttribute('value') || '',
        yearPublished: yearEl?.getAttribute('value') || null,
      })
    }
  })
  
  return results.slice(0, 10)
}

// BGG詳細API（API Route経由）
export async function getBGGGameDetail(id: string): Promise<BGGGameDetail | null> {
  const response = await fetch(`/api/bgg/detail?id=${id}`)
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('BGG detail failed:', response.status, errorData)
    return null
  }
  
  const text = await response.text()
  
  // JSONエラーレスポンスの場合
  if (text.startsWith('{')) {
    console.error('BGG API error:', text)
    return null
  }
  
  const parser = new DOMParser()
  const xml = parser.parseFromString(text, 'text/xml')
  
  const item = xml.querySelector('item')
  if (!item) return null
  
  const primaryName = item.querySelector('name[type="primary"]')
  const image = item.querySelector('image')
  const minPlayers = item.querySelector('minplayers')
  const maxPlayers = item.querySelector('maxplayers')
  const playingTime = item.querySelector('playingtime')
  const categories = item.querySelectorAll('link[type="boardgamecategory"]')
  
  const categoryList: string[] = []
  categories.forEach((cat) => {
    const value = cat.getAttribute('value')
    if (value) categoryList.push(value)
  })
  
  return {
    id,
    name: primaryName?.getAttribute('value') || '',
    image: image?.textContent || null,
    minPlayers: minPlayers ? parseInt(minPlayers.getAttribute('value') || '0') : null,
    maxPlayers: maxPlayers ? parseInt(maxPlayers.getAttribute('value') || '0') : null,
    playingTime: playingTime ? parseInt(playingTime.getAttribute('value') || '0') : null,
    categories: categoryList,
  }
}