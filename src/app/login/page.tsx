'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { logEvent } from '@/app/lib/analytics'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleAuth = async () => {
    setError('')
    logEvent('auth_submit', { type: isSignUp ? 'signup' : 'login' })
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else router.push('/')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/')
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '0.85rem 1rem',
    fontSize: '1rem',
    borderRadius: '8px',
    border: '1px solid #e8d8c4',
    outline: 'none',
    background: '#fdf6f0',
    color: '#2c1a0e',
    fontFamily: 'Georgia, serif',
    boxSizing: 'border-box' as const,
  }

  return (
    <main style={{ minHeight: '100vh', background: '#fdf6f0', fontFamily: "'Georgia', serif" }}>
      <Header />
      <div style={{ maxWidth: '420px', margin: '3rem auto', padding: '0 1rem' }}>
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 2px 16px rgba(44,26,14,0.1)',
          border: '1px solid #f0e6d6',
        }}>
          <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.4rem', color: '#2c1a0e' }}>
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h1>
          <p style={{ margin: '0 0 1.5rem', fontSize: '0.9rem', color: '#8a6a50', fontStyle: 'italic' }}>
            {isSignUp ? 'Save your favorite spots' : 'Sign in to see your saved places'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAuth()}
              style={inputStyle}
            />
            {!isSignUp && (
              <Link
                href="/forgot-password"
                style={{
                  alignSelf: 'flex-end',
                  fontSize: '0.85rem',
                  color: '#d4a96a',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                }}
              >
                Forgot password?
              </Link>
            )}

            {error && (
              <p style={{ color: '#9b3a2a', background: '#fde8e4', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', margin: 0 }}>
                {error}
              </p>
            )}

            <button
              onClick={handleAuth}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                fontSize: '1rem',
                borderRadius: '8px',
                border: 'none',
                background: '#d4a96a',
                color: '#2c1a0e',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'Georgia, serif',
              }}
            >
              {isSignUp ? 'Sign up' : 'Log in'}
            </button>
          </div>

          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: '#8a6a50' }}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            </span>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.9rem',
                color: '#d4a96a',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'Georgia, serif',
                padding: 0,
              }}
            >
              {isSignUp ? 'Log in' : 'Sign up'}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
