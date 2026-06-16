'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'

export default function FeedbackPage() {
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!message.trim()) return
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()

    const { error: dbError } = await supabase.from('feedback').insert({
      message: message.trim(),
      user_id: user?.id ?? null,
    })

    if (dbError) {
      setError('Something went wrong. Please try again.')
    } else {
      setSubmitted(true)
    }
    setLoading(false)
  }

  return (
    <main style={{ minHeight: '100vh', background: '#fdf6f0', fontFamily: 'Georgia, serif', padding: '0' }}>
      <Header />

      <section style={{ background: '#3d2314', padding: '2rem 1rem', color: '#fdf6f0' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Share Feedback</h1>
          <p style={{ margin: '0.5rem 0 0', color: '#c9a97a', fontStyle: 'italic' }}>
            suggest a feature, report a bug, or just say hi
          </p>
        </div>
      </section>

      <section style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem 1rem 2rem' }}>
        {submitted ? (
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(44,26,14,0.08)',
            border: '1px solid #f0e6d6',
            textAlign: 'center',
            color: '#2c1a0e',
          }}>
            <p style={{ fontSize: '1.1rem', margin: 0 }}>Thanks for the feedback! ☕</p>
          </div>
        ) : (
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '1.25rem',
            boxShadow: '0 2px 8px rgba(44,26,14,0.08)',
            border: '1px solid #f0e6d6',
          }}>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="What's on your mind?"
              rows={5}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                fontSize: '1rem',
                borderRadius: '8px',
                border: '1px solid #f0e6d6',
                outline: 'none',
                background: '#fdf6f0',
                color: '#2c1a0e',
                fontFamily: 'Georgia, serif',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
            {error && (
              <p style={{ color: '#9b3a2a', fontSize: '0.9rem', margin: '0.5rem 0 0' }}>{error}</p>
            )}
            <button
              onClick={handleSubmit}
              disabled={loading || !message.trim()}
              style={{
                marginTop: '0.75rem',
                width: '100%',
                padding: '0.85rem',
                fontSize: '1rem',
                borderRadius: '8px',
                border: 'none',
                background: '#d4a96a',
                color: '#2c1a0e',
                fontWeight: 'bold',
                cursor: loading || !message.trim() ? 'not-allowed' : 'pointer',
                fontFamily: 'Georgia, serif',
              }}
            >
              {loading ? 'Sending...' : 'Send Feedback'}
            </button>
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}