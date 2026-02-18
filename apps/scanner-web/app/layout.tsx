// Requirements: Root layout for scanner application
// Purpose: Global layout for organizer scanner app

import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GateKeeper Scanner',
  description: 'Event check-in scanner',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <div className="nav-container">
            <a href="/" className="nav-brand">GateKeeper Scanner</a>
            <div className="nav-links">
              <a href="/">Scan</a>
              <a href="/events">Events</a>
            </div>
          </div>
        </nav>
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  )
}
