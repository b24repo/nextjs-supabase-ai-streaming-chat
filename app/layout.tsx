import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Chat MVP - Intelligent Conversations at Your Fingertips',
  description: 'Experience the power of streaming AI conversations with real-time responses, credit-based billing, and intelligent message streaming.',
  keywords: ['AI', 'Chat', 'Streaming', 'OpenAI', 'Next.js'],
  authors: [{ name: 'AI Chat Team' }],
  openGraph: {
    title: 'AI Chat MVP',
    description: 'Experience the power of streaming AI conversations',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='75' font-size='75' fill='%230284c7'>💬</text></svg>" />
      </head>
      <body className="h-screen overflow-hidden">
        <div className="h-full w-full">
          {children}
        </div>
      </body>
    </html>
  )
}
