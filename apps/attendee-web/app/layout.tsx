// Requirements: Root layout for attendee application
// Purpose: Global layout with navigation and styling

'use client';

import './globals.css'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <div className="nav-container">
            <a href="/" className="nav-brand">GateKeeper</a>
            <div className="nav-links">
              <a href="/">Events</a>
              {user && <a href="/tickets">My Tickets</a>}
              {user ? (
                <>
                  <span style={{ color: '#95a5a6' }}>Hello, {user.fullName}</span>
                  <button
                    onClick={handleLogout}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontSize: '1rem'
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <a href="/auth">Login</a>
              )}
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
