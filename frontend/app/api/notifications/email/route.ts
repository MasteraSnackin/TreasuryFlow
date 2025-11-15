import { NextRequest, NextResponse } from 'next/server'

interface EmailNotificationRequest {
  to: string
  subject: string
  body: string
  priority: string
  data?: Record<string, any>
}

export async function POST(request: NextRequest) {
  try {
    const { to, subject, body, priority, data }: EmailNotificationRequest = await request.json()

    // Validate input
    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // In production, use email service (SendGrid, AWS SES, etc.)
    // Example with SendGrid:
    /*
    const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    
    const msg = {
      to,
      from: process.env.SMTP_FROM || 'noreply@treasuryflow.com',
      subject,
      text: body,
      html: generateEmailHTML(subject, body, priority, data),
    }
    
    await sgMail.send(msg)
    */

    // For now, just log
    console.log('[EMAIL NOTIFICATION]', {
      to,
      subject,
      priority,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to send email notification:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}

// Helper function to generate HTML email
function generateEmailHTML(
  subject: string,
  body: string,
  priority: string,
  data?: Record<string, any>
): string {
  const priorityColors: Record<string, string> = {
    URGENT: '#ef4444',
    HIGH: '#f97316',
    MEDIUM: '#eab308',
    LOW: '#3b82f6'
  }

  const color = priorityColors[priority] || '#3b82f6'

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">TreasuryFlow</h1>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
        <div style="background: ${color}; color: white; padding: 10px 15px; border-radius: 5px; margin-bottom: 20px; font-weight: bold; text-transform: uppercase; font-size: 12px;">
          ${priority} Priority
        </div>
        
        <h2 style="color: #1f2937; margin-top: 0;">${subject}</h2>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.8;">
          ${body}
        </p>
        
        ${data?.txHash ? `
          <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">Transaction Hash:</p>
            <p style="margin: 5px 0 0 0; font-family: monospace; font-size: 12px; color: #1f2937; word-break: break-all;">
              ${data.txHash}
            </p>
          </div>
        ` : ''}
        
        ${data?.actionUrl ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.actionUrl}" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              View Details
            </a>
          </div>
        ` : ''}
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          This is an automated notification from TreasuryFlow.<br>
          To manage your notification preferences, visit your <a href="https://treasuryflow.com/settings" style="color: #3b82f6;">settings page</a>.
        </p>
      </div>
    </body>
    </html>
  `
}