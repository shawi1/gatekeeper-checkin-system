// Requirements: Root layout for attendee application
// Purpose: Global layout with navigation and styling

import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GateKeeper - Event Tickets',
  description: 'Discover and register for events',
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
            <a href="/" className="nav-brand">🎫 GateKeeper</a>
            <div className="nav-links">
              <a href="/">Events</a>
              <a href="/tickets">My Tickets</a>
              <a href="/auth/login">Login</a>
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
