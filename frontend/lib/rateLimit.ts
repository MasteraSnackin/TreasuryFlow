import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  interval: number // Time window in milliseconds
  uniqueTokenPerInterval: number // Max requests per interval
}

interface RateLimitStore {
  count: number
  resetTime: number
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitStore>()

// Default configurations for different endpoint types
export const RateLimitPresets = {
  // Very strict - for sensitive operations
  STRICT: {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 5 // 5 requests per minute
  },
  
  // Standard - for normal API calls
  STANDARD: {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 30 // 30 requests per minute
  },
  
  // Relaxed - for read-only operations
  RELAXED: {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 100 // 100 requests per minute
  },
  
  // AI operations - expensive, need strict limits
  AI: {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 10 // 10 requests per minute
  }
}

/**
 * Rate limit middleware for API routes
 * @param request - Next.js request object
 * @param config - Rate limit configuration
 * @returns Response if rate limited, null if allowed
 */
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = RateLimitPresets.STANDARD
): Promise<NextResponse | null> {
  // Get identifier (IP address or user ID)
  const identifier = getIdentifier(request)
  
  // Get current time
  const now = Date.now()
  
  // Get or create rate limit entry
  let limitData = rateLimitStore.get(identifier)
  
  // Reset if interval has passed
  if (!limitData || now > limitData.resetTime) {
    limitData = {
      count: 0,
      resetTime: now + config.interval
    }
    rateLimitStore.set(identifier, limitData)
  }
  
  // Increment count
  limitData.count++
  
  // Check if limit exceeded
  if (limitData.count > config.uniqueTokenPerInterval) {
    const retryAfter = Math.ceil((limitData.resetTime - now) / 1000)
    
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: `Too many requests. Please try again in ${retryAfter} seconds.`,
        retryAfter
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': config.uniqueTokenPerInterval.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': limitData.resetTime.toString()
        }
      }
    )
  }
  
  // Add rate limit headers to response
  const remaining = config.uniqueTokenPerInterval - limitData.count
  
  // Store headers for later use
  ;(request as any).rateLimitHeaders = {
    'X-RateLimit-Limit': config.uniqueTokenPerInterval.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': limitData.resetTime.toString()
  }
  
  return null // Allow request
}

/**
 * Get unique identifier for rate limiting
 * Priority: User wallet address > IP address
 */
function getIdentifier(request: NextRequest): string {
  // Try to get wallet address from header (if authenticated)
  const walletAddress = request.headers.get('x-wallet-address')
  if (walletAddress) {
    return `wallet:${walletAddress.toLowerCase()}`
  }
  
  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown'
  
  return `ip:${ip}`
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  request: NextRequest
): NextResponse {
  const headers = (request as any).rateLimitHeaders
  
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value as string)
    })
  }
  
  return response
}

/**
 * Clean up expired entries (call periodically)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now()
  
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// Clean up every 5 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000)
}

/**
 * Higher-order function to wrap API routes with rate limiting
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: RateLimitConfig = RateLimitPresets.STANDARD
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Check rate limit
    const rateLimitResponse = await rateLimit(request, config)
    
    if (rateLimitResponse) {
      return rateLimitResponse
    }
    
    // Execute handler
    const response = await handler(request)
    
    // Add rate limit headers
    return addRateLimitHeaders(response, request)
  }
}

/**
 * Get rate limit status for a user
 */
export function getRateLimitStatus(identifier: string): {
  remaining: number
  resetTime: number
  isLimited: boolean
} | null {
  const limitData = rateLimitStore.get(identifier)
  
  if (!limitData) {
    return null
  }
  
  const now = Date.now()
  
  if (now > limitData.resetTime) {
    return null
  }
  
  return {
    remaining: Math.max(0, 100 - limitData.count), // Assuming standard limit
    resetTime: limitData.resetTime,
    isLimited: limitData.count >= 100
  }
}

/**
 * Manually reset rate limit for a user (admin function)
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier)
}

/**
 * Get all rate limit entries (for monitoring)
 */
export function getAllRateLimits(): Array<{
  identifier: string
  count: number
  resetTime: number
}> {
  return Array.from(rateLimitStore.entries()).map(([identifier, data]) => ({
    identifier,
    count: data.count,
    resetTime: data.resetTime
  }))
}