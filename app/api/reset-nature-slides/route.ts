import { NextResponse } from 'next/server'
import { resetNatureSlides } from '@/lib/db'

export async function POST() {
  try {
    const result = await resetNatureSlides()
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: result.message })
  } catch (error) {
    console.error('Error resetting nature slides:', error)
    return NextResponse.json(
      { error: 'Failed to reset nature slides' },
      { status: 500 }
    )
  }
} 