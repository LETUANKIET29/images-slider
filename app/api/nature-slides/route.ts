import { NextResponse } from 'next/server'
import { getAllNatureSlides } from '@/lib/db'

export async function GET() {
  try {
    const result = await getAllNatureSlides()
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Error fetching nature slides:', error)
    return NextResponse.json(
      { error: 'Failed to fetch nature slides' },
      { status: 500 }
    )
  }
} 