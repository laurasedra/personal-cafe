'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'

export default function Header() {
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null)
    })
  }, [])

  return (
    <header style={{
      background: '#2c1a0e',
      color: '#fdf6f0',
      padding: '0.75rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    }}>
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
        <span style={{ display: 'inline-block', width: 28, height: 28, color: '#d4a96a' }} aria-hidden>
          <svg viewBox="0 0 32 32" width="28" height="28" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
            <g>
              <path d="M29.71 15.24h1.53v4.57h-1.53Z" fill="currentColor" />
              <path d="M28.19 19.81h1.52v1.52h-1.52Z" fill="currentColor" />
              <path d="M28.19 13.72h1.52v1.52h-1.52Z" fill="currentColor" />
              <path d="M26.67 25.91h1.52v1.52h-1.52Z" fill="currentColor" />
              <path d="M26.67 16.76h1.52v1.53h-1.52Z" fill="currentColor" />
              <path d="M23.62 12.19h4.57v1.53h-4.57Z" fill="currentColor" />
              <path d="M25.14 27.43h1.53v1.52h-1.53Z" fill="currentColor" />
              <path d="M25.14 24.38h1.53v1.53h-1.53Z" fill="currentColor" />
              <path d="m23.62 21.33 0 1.53 -1.53 0 0 1.52 3.05 0 0 -1.52 3.05 0 0 -1.53 -4.57 0z" fill="currentColor" />
              <path d="m23.62 15.24 0 4.57 3.05 0 0 -1.52 -1.53 0 0 -1.53 1.53 0 0 -1.52 -3.05 0z" fill="currentColor" />
              <path d="M22.09 28.95h3.05v1.53h-3.05Z" fill="currentColor" />
              <path d="M22.09 10.67h1.53v1.52h-1.53Z" fill="currentColor" />
              <path d="M19.05 24.38h3.04v1.53h-3.04Z" fill="currentColor" />
              <path d="M17.52 9.14h4.57v1.53h-4.57Z" fill="currentColor" />
              <path d="M6.86 30.48h15.23V32H6.86Z" fill="currentColor" />
              <path d="m8.38 12.19 0 1.53 -1.52 0 0 1.52 1.52 0 0 1.52 12.19 0 0 -1.52 1.52 0 0 -1.52 -1.52 0 0 -1.53 -12.19 0z" fill="currentColor" />
              <path d="M19.05 1.52h1.52v3.05h-1.52Z" fill="currentColor" />
              <path d="M16 0h3.05v1.52H16Z" fill="currentColor" />
              <path d="M17.52 4.57h1.53V6.1h-1.53Z" fill="currentColor" />
              <path d="M14.47 1.52H16v1.53h-1.53Z" fill="currentColor" />
              <path d="M14.47 7.62H16v3.05h-1.53Z" fill="currentColor" />
              <path d="M11.43 0h3.04v1.52h-3.04Z" fill="currentColor" />
              <path d="M12.95 6.1h1.52v1.52h-1.52Z" fill="currentColor" />
              <path d="M11.43 4.57h1.52V6.1h-1.52Z" fill="currentColor" />
              <path d="M9.9 25.91h9.15v1.52H9.9Z" fill="currentColor" />
              <path d="M9.9 1.52h1.53v3.05H9.9Z" fill="currentColor" />
              <path d="M6.86 9.14h6.09v1.53H6.86Z" fill="currentColor" />
              <path d="M6.86 24.38H9.9v1.53H6.86Z" fill="currentColor" />
              <path d="M3.81 28.95h3.05v1.53H3.81Z" fill="currentColor" />
              <path d="m6.86 21.33 -1.53 0 0 1.53 -1.52 0 0 1.52 3.05 0 0 -3.05z" fill="currentColor" />
              <path d="M5.33 10.67h1.53v1.52H5.33Z" fill="currentColor" />
              <path d="M3.81 12.19h1.52v9.14H3.81Z" fill="currentColor" />
              <path d="M2.28 27.43h1.53v1.52H2.28Z" fill="currentColor" />
              <path d="M2.28 24.38h1.53v1.53H2.28Z" fill="currentColor" />
              <path d="M0.76 25.91h1.52v1.52H0.76Z" fill="currentColor" />
            </g>
          </svg>
        </span>
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fdf6f0', letterSpacing: '0.02em' }}>Personal Cafe</span>
      </a>
      <div>
        {userEmail ? (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <a href="/saved" style={{ fontSize: '0.85rem', color: '#d4a96a', textDecoration: 'none' }}>❤️</a>
            <a href="/profile" style={{ fontSize: '0.85rem', color: '#d4a96a', textDecoration: 'none' }}>⚙️</a>
          </div>
        ) : (
          <a href="/login" style={{ fontSize: '0.85rem', color: '#d4a96a', textDecoration: 'none' }}>Log in</a>
        )}
      </div>
    </header>
  )
}
