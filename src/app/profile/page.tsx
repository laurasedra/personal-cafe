'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { logEvent } from '@/app/lib/analytics'

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
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
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
    await supabase.from('profiles').update({
      travel_mode: travelMode,
      price_range: priceRange,
      dietary_preferences: dietaryPrefs,
    }).eq('id', user.id)
    logEvent('save_preferences', { travel_mode: travelMode, price_range: priceRange, dietary_prefs: dietaryPrefs })
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

  const sectionStyle = {
    background: '#fff',
    borderRadius: '12px',
    padding: '1.25rem',
    boxShadow: '0 2px 8px rgba(44,26,14,0.08)',
    border: '1px solid #f0e6d6',
    marginBottom: '1rem',
  }

  const sectionHeadingStyle = {
    margin: '0 0 1rem',
    fontSize: '0.8rem',
    fontWeight: 'bold' as const,
    color: '#8a6a50',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
  }

  const pillBase = {
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    fontFamily: 'Georgia, serif',
    border: '1px solid #e8d8c4',
    transition: 'all 0.15s',
  }

  const pillActive = { ...pillBase, background: '#d4a96a', color: '#2c1a0e', border: '1px solid #d4a96a', fontWeight: 'bold' as const }
  const pillInactive = { ...pillBase, background: '#fdf6f0', color: '#5a3e2b' }

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

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <a href="/" style={{ fontSize: '0.85rem', color: '#d4a96a', textDecoration: 'none' }}>← Back to search</a>
          <h1 style={{ margin: '0.5rem 0 0', fontSize: '1.4rem', color: '#2c1a0e' }}>My Preferences</h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#8a6a50', fontStyle: 'italic' }}>
            These are applied automatically to every search
          </p>
        </div>

        <div style={sectionStyle}>
          <p style={sectionHeadingStyle}>Travel Mode</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const }}>
            {[
              { value: 'walking', label: '🚶 Walking' },
              { value: 'transit', label: '🚌 Transit' },
              { value: 'driving', label: '🚗 Driving' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setTravelMode(value)}
                style={travelMode === value ? pillActive : pillInactive}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={sectionStyle}>
          <p style={sectionHeadingStyle}>Price Range</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const }}>
            {[
              { value: 'any', label: 'Any' },
              { value: '$', label: '$' },
              { value: '$$', label: '$$' },
              { value: '$$$', label: '$$$' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setPriceRange(value)}
                style={priceRange === value ? pillActive : pillInactive}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={sectionStyle}>
          <p style={sectionHeadingStyle}>Dietary Preferences</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const }}>
            {['vegan', 'vegetarian', 'gluten-free', 'halal', 'kosher'].map(pref => (
              <button
                key={pref}
                onClick={() => toggleDietary(pref)}
                style={dietaryPrefs.includes(pref) ? pillActive : pillInactive}
              >
                {pref.charAt(0).toUpperCase() + pref.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const, marginTop: '0.5rem' }}>
          <button
            onClick={save}
            disabled={saving}
            style={{
              padding: '0.85rem 1.5rem',
              fontSize: '1rem',
              borderRadius: '8px',
              border: 'none',
              background: '#d4a96a',
              color: '#2c1a0e',
              fontWeight: 'bold',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: 'Georgia, serif',
            }}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
          <button
            onClick={logout}
            style={{
              padding: '0.85rem 1.5rem',
              fontSize: '1rem',
              borderRadius: '8px',
              border: '1px solid #d4a96a',
              background: 'transparent',
              color: '#d4a96a',
              cursor: 'pointer',
              fontFamily: 'Georgia, serif',
            }}
          >
            Log out
          </button>
        </div>
      </div>
      <Footer />
    </main>
  )
}
