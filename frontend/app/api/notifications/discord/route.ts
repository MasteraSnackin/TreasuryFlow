import { NextRequest, NextResponse } from 'next/server'

interface DiscordNotificationRequest {
  webhook: string
  title: string
  message: string
  priority: string
  data?: Record<string, any>
}

export async function POST(request: NextRequest) {
  try {
    const { webhook, title, message, priority, data }: DiscordNotificationRequest = await request.json()

    // Validate input
    if (!webhook || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Priority colors for Discord embeds
    const priorityColors: Record<string, number> = {
      URGENT: 15158332,    // Red
      HIGH: 16744192,      // Orange
      MEDIUM: 16776960,    // Yellow
      LOW: 3447003         // Blue
    }

    const color = priorityColors[priority] || 3447003

    // Build Discord embed
    const embed: any = {
      title: `${getPriorityEmoji(priority)} ${title}`,
      description: message,
      color,
      timestamp: new Date().toISOString(),
      footer: {
        text: 'TreasuryFlow Notification',
        icon_url: 'https://treasuryflow.com/icon-192.png'
      },
      fields: []
    }

    // Add priority field
    embed.fields.push({
      name: 'Priority',
      value: priority,
      inline: true
    })

    // Add transaction hash if available
    if (data?.txHash) {
      embed.fields.push({
        name: 'Transaction',
        value: `\`${data.txHash}\``,
        inline: false
      })
    }

    // Add action button if URL available
    const components = []
    if (data?.actionUrl) {
      components.push({
        type: 1, // Action Row
        components: [{
          type: 2, // Button
          style: 5, // Link
          label: 'View Details',
          url: data.actionUrl
        }]
      })
    }

    // Send to Discord
    const discordPayload: any = {
      username: 'TreasuryFlow',
      avatar_url: 'https://treasuryflow.com/icon-192.png',
      embeds: [embed]
    }

    if (components.length > 0) {
      discordPayload.components = components
    }

    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload)
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Discord webhook error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to send Discord message' },
        { status: 500 }
      )
    }

    console.log('[DISCORD NOTIFICATION] Sent successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to send Discord notification:', error)
    return NextResponse.json(
      { error: 'Failed to send Discord notification' },
      { status: 500 }
    )
  }
}

function getPriorityEmoji(priority: string): string {
  const emojis: Record<string, string> = {
    URGENT: '🚨',
    HIGH: '⚠️',
    MEDIUM: 'ℹ️',
    LOW: '📝'
  }
  return emojis[priority] || 'ℹ️'
}

// Test webhook endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const webhook = searchParams.get('webhook')

    if (!webhook) {
      return NextResponse.json({
        instructions: [
          '1. Go to your Discord server settings',
          '2. Navigate to Integrations → Webhooks',
          '3. Click "New Webhook"',
          '4. Name it "TreasuryFlow" and choose a channel',
          '5. Copy the webhook URL',
          '6. Add it to your notification preferences',
          '7. Test it by sending a test notification'
        ]
      })
    }

    // Send test message
    const testEmbed = {
      title: '✅ Webhook Test Successful',
      description: 'Your Discord webhook is configured correctly!',
      color: 3066993, // Green
      timestamp: new Date().toISOString(),
      footer: {
        text: 'TreasuryFlow',
        icon_url: 'https://treasuryflow.com/icon-192.png'
      }
    }

    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'TreasuryFlow',
        avatar_url: 'https://treasuryflow.com/icon-192.png',
        embeds: [testEmbed]
      })
    })

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Invalid webhook URL' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, message: 'Test message sent!' })
  } catch (error) {
    console.error('Discord test error:', error)
    return NextResponse.json(
      { error: 'Test failed' },
      { status: 500 }
    )
  }
}