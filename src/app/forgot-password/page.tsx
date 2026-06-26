'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { supabase } from '@/app/lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleResetRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSent(false)

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError('Enter your email address.')
      return
    }

    setLoading(true)
    const redirectTo = `${window.location.origin}/reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, { redirectTo })
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setSent(true)
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
            Reset your password
          </h1>
          <p style={{ margin: '0 0 1.5rem', fontSize: '0.9rem', color: '#8a6a50', fontStyle: 'italic' }}>
            Enter your email and we&apos;ll send you a reset link
          </p>

          <form onSubmit={handleResetRequest} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              autoComplete="email"
              style={inputStyle}
            />

            {error && (
              <p style={{ color: '#9b3a2a', background: '#fde8e4', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', margin: 0 }}>
                {error}
              </p>
            )}

            {sent && (
              <p style={{ color: '#365b2c', background: '#e8f5e4', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', margin: 0 }}>
                If an account exists for that email, a reset link has been sent.
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                fontSize: '1rem',
                borderRadius: '8px',
                border: 'none',
                background: '#d4a96a',
                color: '#2c1a0e',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Georgia, serif',
              }}
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>

          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <Link href="/login" style={{ fontSize: '0.9rem', color: '#d4a96a', fontWeight: 'bold', textDecoration: 'none' }}>
              Back to log in
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
