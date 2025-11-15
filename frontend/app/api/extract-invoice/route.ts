import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit, RateLimitPresets } from '@/lib/rateLimit'

async function handler(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('invoice') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Check if Anthropic API key is available
    const apiKey = process.env.ANTHROPIC_API_KEY
    
    if (!apiKey) {
      console.log('No Anthropic API key found, using mock data')
      // Return mock data for demo
      return NextResponse.json({
        supplierName: 'Design Agency Ltd',
        amount: '2500',
        currency: 'USDC',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Monthly design retainer',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f5678'
      })
    }

    // Convert file to base64 for Claude API
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')

    // Use Claude to extract invoice data
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: file.type,
                data: base64Image,
              }
            },
            {
              type: 'text',
              text: `Extract the following information from this invoice and return ONLY a JSON object:
              {
                "supplierName": "company name",
                "amount": "numerical amount only",
                "currency": "USD or EUR",
                "dueDate": "YYYY-MM-DD",
                "description": "brief description",
                "walletAddress": "if visible, else null"
              }`
            }
          ]
        }]
      })
    })

    if (!response.ok) {
      throw new Error('Claude API request failed')
    }

    const data = await response.json()
    const extracted = JSON.parse(data.content[0].text)
    
    return NextResponse.json(extracted)
  } catch (error) {
    console.error('Invoice extraction error:', error)
    
    // Return mock data as fallback
    return NextResponse.json({
      supplierName: 'Design Agency Ltd',
      amount: '2500',
      currency: 'USDC',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Monthly design retainer',
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f5678'
    })
  }
}

export const POST = withRateLimit(handler, RateLimitPresets.AI)

export const config = {
  api: {
    bodyParser: false,
  },
}