import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')
  
  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  try {
    // xmlapi（v1）を使用
    const url = `https://www.boardgamegeek.com/xmlapi/boardgame/${id}`
    console.log('Fetching:', url)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })
    
    console.log('Response status:', response.status)
    
    const text = await response.text()
    
    return new NextResponse(text, {
      headers: { 'Content-Type': 'application/xml' },
    })
  } catch (error) {
    console.error('BGG API error:', error)
    return NextResponse.json({ error: 'Failed to fetch from BGG' }, { status: 500 })
  }
}