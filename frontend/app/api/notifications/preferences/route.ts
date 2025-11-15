import { NextRequest, NextResponse } from 'next/server'
import { NotificationPreferences } from '@/lib/notifications'

// In production, this would save to database
export async function POST(request: NextRequest) {
  try {
    const preferences: NotificationPreferences = await request.json()

    // Validate preferences
    if (!preferences.userAddress) {
      return NextResponse.json(
        { error: 'User address required' },
        { status: 400 }
      )
    }

    // In production, save to database
    // await db.notificationPreferences.upsert({
    //   where: { userAddress: preferences.userAddress },
    //   update: preferences,
    //   create: preferences
    // })

    console.log('[NOTIFICATION PREFERENCES] Saved for:', preferences.userAddress)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save notification preferences:', error)
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    )
  }
}

// Get user preferences
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('userAddress')

    if (!userAddress) {
      return NextResponse.json(
        { error: 'User address required' },
        { status: 400 }
      )
    }

    // In production, fetch from database
    // const preferences = await db.notificationPreferences.findUnique({
    //   where: { userAddress }
    // })

    // For now, return null (will use defaults)
    return NextResponse.json(null)
  } catch (error) {
    console.error('Failed to fetch notification preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}