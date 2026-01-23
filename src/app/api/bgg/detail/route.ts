import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')
  
  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  const token = process.env.BGG_API_TOKEN
  
  if (!token) {
    return NextResponse.json({ 
      error: 'BGG API token not configured' 
    }, { status: 503 })
  }

  try {
    const url = `https://boardgamegeek.com/xmlapi2/thing?id=${id}&stats=1`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/xml',
      },
    })
    
    console.log('BGG Detail Response status:', response.status)
    
    if (!response.ok) {
      return NextResponse.json({ 
        error: 'BGG API error',
        status: response.status 
      }, { status: response.status })
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