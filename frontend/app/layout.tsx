import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TreasuryFlow - Smart Treasury Management',
  description: 'Multi-currency treasury management powered by Circle and Arc',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              darkMode: 'class',
              theme: {
                extend: {
                  colors: {
                    primary: {
                      50: '#eff6ff',
                      100: '#dbeafe',
                      200: '#bfdbfe',
                      300: '#93c5fd',
                      400: '#60a5fa',
                      500: '#3b82f6',
                      600: '#2563eb',
                      700: '#1d4ed8',
                      800: '#1e40af',
                      900: '#1e3a8a',
                    }
                  }
                }
              }
            }
          `
        }} />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}