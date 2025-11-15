/**
 * TreasuryFlow - AI Fraud Detection System
 * Phase 5.3: Blacklist Checking Service
 * 
 * API endpoint for checking addresses against multiple blacklist sources
 */

import { NextRequest, NextResponse } from 'next/server'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface BlacklistCheckResult {
  address: string
  isBlacklisted: boolean
  sources: BlacklistSource[]
  riskLevel: 'safe' | 'warning' | 'danger'
  details: string
  checkedAt: string
}

export interface BlacklistSource {
  name: string
  listed: boolean
  reason?: string
  addedDate?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
}

// ============================================================================
// BLACKLIST DATABASES
// ============================================================================

/**
 * Internal blacklist (maintained by TreasuryFlow)
 */
const INTERNAL_BLACKLIST = new Set<string>([
  // Example addresses (in production, load from database)
  '0x0000000000000000000000000000000000000000',
  '0x000000000000000000000000000000000000dead'
])

/**
 * Known scam addresses (curated list)
 */
const SCAM_ADDRESSES = new Map<string, { reason: string; severity: 'low' | 'medium' | 'high' | 'critical' }>([
  // Example entries
  ['0x1234567890123456789012345678901234567890', { 
    reason: 'Known phishing scam', 
    severity: 'critical' 
  }]
])

/**
 * Sanctioned addresses (OFAC, EU, etc.)
 */
const SANCTIONED_ADDRESSES = new Map<string, { reason: string; addedDate: string }>([
  // In production, integrate with official sanction lists
])

/**
 * High-risk jurisdictions
 */
const HIGH_RISK_PATTERNS = [
  { pattern: /^0x0+/, reason: 'Null address pattern' },
  { pattern: /^0xdead/, reason: 'Burn address pattern' },
  { pattern: /^0xffff/, reason: 'Suspicious pattern' }
]

// ============================================================================
// API HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, includeExternal = true } = body

    // Validate input
    if (!address || typeof address !== 'string') {
      return NextResponse.json(
        { error: 'Invalid address provided' },
        { status: 400 }
      )
    }

    // Normalize address
    const normalizedAddress = address.toLowerCase().trim()

    // Validate Ethereum address format
    if (!isValidEthereumAddress(normalizedAddress)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address format' },
        { status: 400 }
      )
    }

    // Perform blacklist checks
    const result = await checkBlacklists(normalizedAddress, includeExternal)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Blacklist check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json(
      { error: 'Address parameter required' },
      { status: 400 }
    )
  }

  const normalizedAddress = address.toLowerCase().trim()

  if (!isValidEthereumAddress(normalizedAddress)) {
    return NextResponse.json(
      { error: 'Invalid Ethereum address format' },
      { status: 400 }
    )
  }

  const result = await checkBlacklists(normalizedAddress, true)
  return NextResponse.json(result)
}

// ============================================================================
// BLACKLIST CHECKING LOGIC
// ============================================================================

async function checkBlacklists(
  address: string,
  includeExternal: boolean
): Promise<BlacklistCheckResult> {
  const sources: BlacklistSource[] = []

  // 1. Check internal blacklist
  const internalCheck = checkInternalBlacklist(address)
  if (internalCheck) sources.push(internalCheck)

  // 2. Check scam database
  const scamCheck = checkScamDatabase(address)
  if (scamCheck) sources.push(scamCheck)

  // 3. Check sanctions list
  const sanctionCheck = checkSanctionsList(address)
  if (sanctionCheck) sources.push(sanctionCheck)

  // 4. Check pattern matching
  const patternCheck = checkSuspiciousPatterns(address)
  if (patternCheck) sources.push(patternCheck)

  // 5. Check external sources (if enabled)
  if (includeExternal) {
    const externalChecks = await checkExternalSources(address)
    sources.push(...externalChecks)
  }

  // Determine overall status
  const isBlacklisted = sources.some(s => s.listed)
  const riskLevel = determineRiskLevel(sources)
  const details = generateDetails(sources)

  return {
    address,
    isBlacklisted,
    sources,
    riskLevel,
    details,
    checkedAt: new Date().toISOString()
  }
}

/**
 * Check internal blacklist
 */
function checkInternalBlacklist(address: string): BlacklistSource | null {
  if (INTERNAL_BLACKLIST.has(address)) {
    return {
      name: 'TreasuryFlow Internal',
      listed: true,
      reason: 'Flagged by internal security team',
      severity: 'high'
    }
  }
  return {
    name: 'TreasuryFlow Internal',
    listed: false
  }
}

/**
 * Check scam database
 */
function checkScamDatabase(address: string): BlacklistSource | null {
  const scamInfo = SCAM_ADDRESSES.get(address)
  
  if (scamInfo) {
    return {
      name: 'Scam Database',
      listed: true,
      reason: scamInfo.reason,
      severity: scamInfo.severity
    }
  }

  return {
    name: 'Scam Database',
    listed: false
  }
}

/**
 * Check sanctions lists
 */
function checkSanctionsList(address: string): BlacklistSource | null {
  const sanctionInfo = SANCTIONED_ADDRESSES.get(address)
  
  if (sanctionInfo) {
    return {
      name: 'Sanctions List (OFAC/EU)',
      listed: true,
      reason: sanctionInfo.reason,
      addedDate: sanctionInfo.addedDate,
      severity: 'critical'
    }
  }

  return {
    name: 'Sanctions List',
    listed: false
  }
}

/**
 * Check for suspicious patterns
 */
function checkSuspiciousPatterns(address: string): BlacklistSource | null {
  for (const { pattern, reason } of HIGH_RISK_PATTERNS) {
    if (pattern.test(address)) {
      return {
        name: 'Pattern Analysis',
        listed: true,
        reason,
        severity: 'medium'
      }
    }
  }

  return {
    name: 'Pattern Analysis',
    listed: false
  }
}

/**
 * Check external blacklist sources
 */
async function checkExternalSources(address: string): Promise<BlacklistSource[]> {
  const sources: BlacklistSource[] = []

  // In production, integrate with:
  // - Chainalysis
  // - TRM Labs
  // - Elliptic
  // - CipherTrace
  // - Public blockchain explorers

  // For now, return mock data
  sources.push({
    name: 'Chainalysis',
    listed: false
  })

  sources.push({
    name: 'TRM Labs',
    listed: false
  })

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100))

  return sources
}

/**
 * Determine overall risk level
 */
function determineRiskLevel(sources: BlacklistSource[]): 'safe' | 'warning' | 'danger' {
  const listedSources = sources.filter(s => s.listed)

  if (listedSources.length === 0) return 'safe'

  // Check for critical severity
  const hasCritical = listedSources.some(s => s.severity === 'critical')
  if (hasCritical) return 'danger'

  // Check for high severity
  const hasHigh = listedSources.some(s => s.severity === 'high')
  if (hasHigh) return 'danger'

  // Check for medium severity or multiple listings
  const hasMedium = listedSources.some(s => s.severity === 'medium')
  if (hasMedium || listedSources.length >= 2) return 'warning'

  return 'warning'
}

/**
 * Generate human-readable details
 */
function generateDetails(sources: BlacklistSource[]): string {
  const listedSources = sources.filter(s => s.listed)

  if (listedSources.length === 0) {
    return 'Address is not listed on any blacklists. Safe to proceed.'
  }

  if (listedSources.length === 1) {
    const source = listedSources[0]
    return `⚠️ Address is listed on ${source.name}. Reason: ${source.reason || 'Not specified'}.`
  }

  return `⛔ Address is listed on ${listedSources.length} blacklists: ${listedSources.map(s => s.name).join(', ')}. High risk - do not proceed.`
}

/**
 * Validate Ethereum address format
 */
function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

// ============================================================================
// BATCH CHECKING ENDPOINT
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { addresses } = body

    if (!Array.isArray(addresses) || addresses.length === 0) {
      return NextResponse.json(
        { error: 'Invalid addresses array' },
        { status: 400 }
      )
    }

    // Limit batch size
    if (addresses.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 addresses per batch' },
        { status: 400 }
      )
    }

    // Check all addresses
    const results = await Promise.all(
      addresses.map(addr => checkBlacklists(addr.toLowerCase().trim(), false))
    )

    return NextResponse.json({
      total: results.length,
      blacklisted: results.filter(r => r.isBlacklisted).length,
      results
    })

  } catch (error) {
    console.error('Batch blacklist check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// ADMIN ENDPOINTS (Protected)
// ============================================================================

/**
 * Add address to internal blacklist
 * In production, protect with authentication
 */
export async function PATCH(request: NextRequest) {
  try {
    // TODO: Add authentication check
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { address, reason } = body

    if (!address || !isValidEthereumAddress(address.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid address' },
        { status: 400 }
      )
    }

    const normalizedAddress = address.toLowerCase().trim()

    // Add to internal blacklist
    INTERNAL_BLACKLIST.add(normalizedAddress)

    // In production, save to database
    // await db.blacklist.create({ address: normalizedAddress, reason, addedBy: userId })

    return NextResponse.json({
      success: true,
      message: `Address ${normalizedAddress} added to blacklist`,
      reason
    })

  } catch (error) {
    console.error('Add to blacklist error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Remove address from internal blacklist
 * In production, protect with authentication
 */
export async function DELETE(request: NextRequest) {
  try {
    // TODO: Add authentication check
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { address } = body

    if (!address || !isValidEthereumAddress(address.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid address' },
        { status: 400 }
      )
    }

    const normalizedAddress = address.toLowerCase().trim()

    // Remove from internal blacklist
    INTERNAL_BLACKLIST.delete(normalizedAddress)

    // In production, remove from database
    // await db.blacklist.delete({ address: normalizedAddress })

    return NextResponse.json({
      success: true,
      message: `Address ${normalizedAddress} removed from blacklist`
    })

  } catch (error) {
    console.error('Remove from blacklist error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}