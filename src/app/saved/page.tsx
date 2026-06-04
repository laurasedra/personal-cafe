'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'

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

    await supabase
      .from('saved_places')
      .delete()
      .eq('user_id', user.id)
      .eq('place_id', placeId)

    setSaved(prev => prev.filter(p => p.place_id !== placeId))
  }

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>

  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <a href="/" style={{ fontSize: '0.9rem', color: '#666', textDecoration: 'none' }}>← Back to search</a>
      <h1 style={{ marginTop: '1rem' }}>Saved Places</h1>

      {saved.length === 0 ? (
        <p style={{ color: '#666' }}>No saved places yet. Search for something and hit Save!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
          {saved.map((place) => (
            <li key={place.id} style={{ borderBottom: '1px solid #eee', padding: '1rem 0' }}>
              <strong>{place.place_name}</strong>
              <p style={{ margin: '0.25rem 0', color: '#666' }}>{place.place_address}</p>
              <button
                onClick={() => unsave(place.place_id)}
                style={{ marginTop: '0.5rem', padding: '0.25rem 0.75rem', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                ❤️ Unsave
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}