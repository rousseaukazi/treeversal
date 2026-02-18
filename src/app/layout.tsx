import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Treecognition',
  description: 'Explore probabilistic futures through decision trees',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        {children}
      </body>
    </html>
  )
} 