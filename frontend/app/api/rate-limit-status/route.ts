import { NextRequest, NextResponse } from 'next/server'
import { getAllRateLimits } from '@/lib/rateLimit'

export async function GET(request: NextRequest) {
  try {
    // Get all current rate limits
    const limits = getAllRateLimits()
    
    // Format for frontend
    const formatted = limits.map(limit => ({
      identifier: limit.identifier,
      count: limit.count,
      resetTime: limit.resetTime,
      limit: 100 // Default limit, adjust based on actual config
    }))
    
    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Rate limit status error:', error)
    return NextResponse.json(
      { error: 'Failed to get rate limit status' },
      { status: 500 }
    )
  }
}