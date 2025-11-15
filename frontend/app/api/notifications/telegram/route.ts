import { NextRequest, NextResponse } from 'next/server'

interface TelegramNotificationRequest {
  chatId: string
  title: string
  message: string
  priority: string
  data?: Record<string, any>
}

export async function POST(request: NextRequest) {
  try {
    const { chatId, title, message, priority, data }: TelegramNotificationRequest = await request.json()

    // Validate input
    if (!chatId || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN
    if (!botToken) {
      console.warn('TELEGRAM_BOT_TOKEN not configured')
      return NextResponse.json({ success: false, error: 'Bot token not configured' })
    }

    // Format message with priority emoji
    const priorityEmojis: Record<string, string> = {
      URGENT: '🚨',
      HIGH: '⚠️',
      MEDIUM: 'ℹ️',
      LOW: '📝'
    }

    const emoji = priorityEmojis[priority] || 'ℹ️'
    
    let formattedMessage = `${emoji} *${title}*\n\n${message}`
    
    // Add transaction hash if available
    if (data?.txHash) {
      formattedMessage += `\n\n🔗 TX: \`${data.txHash}\``
    }

    // Add action URL if available
    if (data?.actionUrl) {
      formattedMessage += `\n\n👉 [View Details](${data.actionUrl})`
    }

    // Send to Telegram
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`
    
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: formattedMessage,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Telegram API error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to send Telegram message' },
        { status: 500 }
      )
    }

    console.log('[TELEGRAM NOTIFICATION] Sent to:', chatId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to send Telegram notification:', error)
    return NextResponse.json(
      { error: 'Failed to send Telegram notification' },
      { status: 500 }
    )
  }
}

// Webhook endpoint for Telegram bot commands
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'setup') {
      // Return setup instructions
      return NextResponse.json({
        instructions: [
          '1. Open Telegram and search for @BotFather',
          '2. Send /newbot and follow instructions',
          '3. Copy the bot token to your .env file as TELEGRAM_BOT_TOKEN',
          '4. Search for your bot and send /start',
          '5. Get your chat ID from @userinfobot',
          '6. Add your chat ID to notification preferences'
        ],
        botUsername: process.env.TELEGRAM_BOT_USERNAME || 'Not configured'
      })
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 500 }
    )
  }
}