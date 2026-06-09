'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Profile() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [travelMode, setTravelMode] = useState('walking')
  const [priceRange, setPriceRange] = useState('any')
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setTravelMode(data.travel_mode || 'walking')
        setPriceRange(data.price_range || 'any')
        setDietaryPrefs(data.dietary_preferences || [])
      }

      setLoading(false)
    }

    loadProfile()
  }, [])

  const save = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('profiles')
      .update({
        travel_mode: travelMode,
        price_range: priceRange,
        dietary_preferences: dietaryPrefs
      })
      .eq('id', user.id)

    setSaving(false)
    alert('Preferences saved!')
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const toggleDietary = (pref: string) => {
    setDietaryPrefs(prev =>
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    )
  }

  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>

  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>My Preferences</h1>
      <a href="/" style={{ fontSize: '0.9rem', color: '#2563eb', textDecoration: 'none' }}>← Back to search</a>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Travel Mode</h2>
        {['walking', 'driving', 'transit'].map(mode => (
          <label key={mode} style={{ display: 'block', marginBottom: '0.5rem' }}>
            <input
              type="radio"
              name="travelMode"
              value={mode}
              checked={travelMode === mode}
              onChange={() => setTravelMode(mode)}
              style={{ marginRight: '0.5rem' }}
            />
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </label>
        ))}
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Price Range</h2>
        {['any', '$', '$$', '$$$'].map(price => (
          <label key={price} style={{ display: 'block', marginBottom: '0.5rem' }}>
            <input
              type="radio"
              name="priceRange"
              value={price}
              checked={priceRange === price}
              onChange={() => setPriceRange(price)}
              style={{ marginRight: '0.5rem' }}
            />
            {price === 'any' ? 'Any price' : price}
          </label>
        ))}
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Dietary Preferences</h2>
        {['vegan', 'vegetarian', 'gluten-free', 'halal', 'kosher'].map(pref => (
          <label key={pref} style={{ display: 'block', marginBottom: '0.5rem' }}>
            <input
              type="checkbox"
              checked={dietaryPrefs.includes(pref)}
              onChange={() => toggleDietary(pref)}
              style={{ marginRight: '0.5rem' }}
            />
            {pref.charAt(0).toUpperCase() + pref.slice(1)}
          </label>
        ))}
      </section>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={save}
          disabled={saving}
          style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
        <button
          onClick={logout}
          style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', background: '#fff', color: '#000', border: '1px solid #ddd', cursor: 'pointer' }}
        >
          Log out
        </button>
      </div>
    </main>
  )
}