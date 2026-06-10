'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'

export default function Saved() {
  const [saved, setSaved] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadSaved = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      const { data } = await supabase
        .from('saved_places')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (data) setSaved(data)
      setLoading(false)
    }
    loadSaved()
  }, [])

  const unsave = async (placeId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('saved_places').delete().eq('user_id', user.id).eq('place_id', placeId)
    setSaved(prev => prev.filter(p => p.place_id !== placeId))
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: '#fdf6f0', fontFamily: "'Georgia', serif" }}>
        <Header />
        <p style={{ padding: '2rem', color: '#8a6a50', fontStyle: 'italic' }}>Loading...</p>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: '#fdf6f0', fontFamily: "'Georgia', serif" }}>
      <Header />

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <a href="/" style={{ fontSize: '0.85rem', color: '#d4a96a', textDecoration: 'none' }}>← Back to search</a>
          <h1 style={{ margin: '0.5rem 0 0', fontSize: '1.4rem', color: '#2c1a0e' }}>Saved Places</h1>
        </div>

        {saved.length === 0 ? (
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(44,26,14,0.08)',
            border: '1px solid #f0e6d6',
          }}>
            <p style={{ color: '#8a6a50', fontStyle: 'italic', margin: 0 }}>
              No saved places yet. Search for something and tap the heart!
            </p>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {saved.map((place) => (
              <li key={place.id} style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '1rem',
                boxShadow: '0 2px 8px rgba(44,26,14,0.08)',
                border: '1px solid #f0e6d6',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <strong style={{ fontSize: '1rem', color: '#2c1a0e', flex: 1, paddingRight: '0.5rem' }}>
                    {place.place_name}
                  </strong>
                  <button
                    onClick={() => unsave(place.place_id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      flexShrink: 0,
                    }}
                    title="Remove from saved"
                  >
                    ❤️
                  </button>
                </div>
                <p style={{ margin: '0.3rem 0 0', color: '#8a6a50', fontSize: '0.85rem' }}>
                  {place.place_address}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
