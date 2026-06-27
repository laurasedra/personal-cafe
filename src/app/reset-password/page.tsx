'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { supabase } from '@/app/lib/supabase'

const RECOVERY_STORAGE_KEY = 'personal-cafe-password-recovery'

type RecoveryMarker = {
  userId: string
  expiresAt: number
}

function saveRecoveryMarker(userId: string, expiresAt?: number) {
  const marker: RecoveryMarker = {
    userId,
    expiresAt: expiresAt ?? Math.floor(Date.now() / 1000) + 60 * 60,
  }

  window.sessionStorage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(marker))
}

function hasValidRecoveryMarker(userId: string) {
  const storedMarker = window.sessionStorage.getItem(RECOVERY_STORAGE_KEY)
  if (!storedMarker) return false

  try {
    const marker = JSON.parse(storedMarker) as RecoveryMarker
    return marker.userId === userId && marker.expiresAt > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}

function clearRecoveryMarker() {
  window.sessionStorage.removeItem(RECOVERY_STORAGE_KEY)
}

export default function ResetPassword() {
  const [checking, setChecking] = useState(true)
  const [hasRecoverySession, setHasRecoverySession] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let isMounted = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        saveRecoveryMarker(session.user.id, session.expires_at)
        setHasRecoverySession(true)
        setChecking(false)
        setError('')
      } else if (event === 'SIGNED_OUT') {
        clearRecoveryMarker()
        setHasRecoverySession(false)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return

      if (session && hasValidRecoveryMarker(session.user.id)) {
        setHasRecoverySession(true)
        setError('')
      } else {
        clearRecoveryMarker()
        setError('This password reset link is invalid or expired. Request a new link.')
      }

      setChecking(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handlePasswordUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (loading || !hasRecoverySession) return

    setError('')
    setSuccess('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setLoading(false)
      setError('We could not update your password. Request a new reset link and try again.')
      return
    }

    clearRecoveryMarker()
    setHasRecoverySession(false)
    setPassword('')
    setConfirmPassword('')
    await supabase.auth.signOut({ scope: 'local' })
    setLoading(false)
    setSuccess('Your password has been updated. Redirecting to log in...')
    window.setTimeout(() => router.replace('/login'), 1500)
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
            Choose a new password
          </h1>
          <p style={{ margin: '0 0 1.5rem', fontSize: '0.9rem', color: '#8a6a50', fontStyle: 'italic' }}>
            Use the reset link from your email to update your password
          </p>

          {checking && (
            <p style={{ color: '#8a6a50', fontStyle: 'italic', fontSize: '0.9rem', margin: 0 }}>
              Checking reset link...
            </p>
          )}

          {!checking && success && (
            <p style={{ color: '#365b2c', background: '#e8f5e4', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', margin: 0 }}>
              {success}
            </p>
          )}

          {!checking && !success && hasRecoverySession && (
            <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
                style={inputStyle}
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={event => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
                style={inputStyle}
              />

              {error && (
                <p style={{ color: '#9b3a2a', background: '#fde8e4', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', margin: 0 }}>
                  {error}
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
                {loading ? 'Updating...' : 'Update password'}
              </button>
            </form>
          )}

          {!checking && !success && !hasRecoverySession && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {error && (
                <p style={{ color: '#9b3a2a', background: '#fde8e4', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', margin: 0 }}>
                  {error}
                </p>
              )}
              <Link href="/forgot-password" style={{ fontSize: '0.9rem', color: '#d4a96a', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center' }}>
                Request a new reset link
              </Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}
