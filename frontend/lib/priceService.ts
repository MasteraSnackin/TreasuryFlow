// Real-time price fetching service for stablecoins

interface PriceData {
  usd: number
  usd_24h_change: number
  last_updated_at: number
}

interface Prices {
  usdc: PriceData
  eurc: PriceData
}

const COINGECKO_API = 'https://api.coingecko.com/api/v3'
const CACHE_DURATION = 60000 // 1 minute cache

let priceCache: { data: Prices | null; timestamp: number } = {
  data: null,
  timestamp: 0
}

/**
 * Fetch real-time prices for USDC and EURC from CoinGecko
 */
export async function fetchStablecoinPrices(): Promise<Prices> {
  // Check cache first
  const now = Date.now()
  if (priceCache.data && (now - priceCache.timestamp) < CACHE_DURATION) {
    return priceCache.data
  }

  try {
    // Fetch prices from CoinGecko (free tier, no API key needed)
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=usd-coin,euro-coin&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()

    const prices: Prices = {
      usdc: {
        usd: data['usd-coin']?.usd || 1.00,
        usd_24h_change: data['usd-coin']?.usd_24h_change || 0,
        last_updated_at: data['usd-coin']?.last_updated_at || Date.now() / 1000
      },
      eurc: {
        usd: data['euro-coin']?.usd || 1.08,
        usd_24h_change: data['euro-coin']?.usd_24h_change || 0,
        last_updated_at: data['euro-coin']?.last_updated_at || Date.now() / 1000
      }
    }

    // Update cache
    priceCache = {
      data: prices,
      timestamp: now
    }

    return prices
  } catch (error) {
    console.error('Failed to fetch prices from CoinGecko:', error)
    
    // Return fallback prices if API fails
    return {
      usdc: {
        usd: 1.00,
        usd_24h_change: 0,
        last_updated_at: Date.now() / 1000
      },
      eurc: {
        usd: 1.08,
        usd_24h_change: 0,
        last_updated_at: Date.now() / 1000
      }
    }
  }
}

/**
 * Format price change percentage with color
 */
export function formatPriceChange(change: number): {
  text: string
  color: string
  icon: string
} {
  const isPositive = change >= 0
  return {
    text: `${isPositive ? '+' : ''}${change.toFixed(2)}%`,
    color: isPositive ? '#10b981' : '#ef4444',
    icon: isPositive ? '↑' : '↓'
  }
}

/**
 * Calculate USD value of balance
 */
export function calculateUSDValue(balance: string, price: number): string {
  const value = parseFloat(balance) * price
  return value.toFixed(2)
}

/**
 * Get exchange rate between USDC and EURC
 */
export function getExchangeRate(prices: Prices): number {
  return prices.eurc.usd / prices.usdc.usd
}