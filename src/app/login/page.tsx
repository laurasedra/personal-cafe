'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleAuth = async () => {
    setError('')
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

  return (
    <main style={{ padding: '2rem', maxWidth: '420px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h1 style={{ margin: 0, marginBottom: '0.5rem' }}>{isSignUp ? 'Sign Up' : 'Log In'}</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ padding: '0.75rem', fontSize: '1rem', width: '100%', borderRadius: '8px', border: '1px solid #ddd' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ padding: '0.75rem', fontSize: '1rem', width: '100%', borderRadius: '8px', border: '1px solid #ddd' }}
      />
      {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
      <button
        onClick={handleAuth}
        style={{ padding: '0.85rem 1rem', fontSize: '1rem', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer' }}
      >
        {isSignUp ? 'Sign Up' : 'Log In'}
      </button>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
        </span>
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          style={{ padding: '0.85rem 1rem', fontSize: '0.95rem', borderRadius: '8px', border: '1px solid #ccc', background: '#f8fafc', cursor: 'pointer', textAlign: 'center' }}
        >
          <span style={{ color: '#2563eb', fontWeight: 600 }}>
            {isSignUp ? 'Log in' : 'Sign up'}
          </span>
        </button>
      </div>
    </main>
  )
}