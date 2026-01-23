import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query')
  
  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 })
  }

  try {
    const url = `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(query)}&type=boardgame`
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'text/xml,application/xml',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
      },
    })
    
    clearTimeout(timeoutId)
    
    console.log('BGG Response status:', response.status)
    
    if (!response.ok) {
      // BGGがブロックしている場合のフォールバック
      return NextResponse.json({ 
        error: 'BGG API unavailable',
        status: response.status 
      }, { status: 503 })
    }
    
    const text = await response.text()
    
    return new NextResponse(text, {
      headers: { 
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('BGG API error:', error)
    return NextResponse.json({ error: 'Failed to fetch from BGG' }, { status: 500 })
  }
}