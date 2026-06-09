'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'

export default function Home() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [allResults, setAllResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [openNow, setOpenNow] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [travelMode, setTravelMode] = useState('walking')
  const [priceRange, setPriceRange] = useState('any')
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>([])

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserEmail(user.email ?? null)

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        console.log('Loaded preferences:', data)
        setTravelMode(data.travel_mode || 'walking')
        setPriceRange(data.price_range || 'any')
        setDietaryPrefs(data.dietary_preferences || [])
      }
    }

    loadUser()
  }, [])

  useEffect(() => {
    if (openNow) {
      setResults(allResults.filter((p: any) => p.currentOpeningHours?.openNow))
    } else {
      setResults(allResults)
    }
  }, [openNow])

  const getRadius = () => {
    if (travelMode === 'walking') return 3200
    if (travelMode === 'transit') return 8000
    return 16000
  }

  const filterByPrice = (places: any[]) => {
    if (priceRange === 'any') return places
    const map: Record<string, string> = {
      '$': 'PRICE_LEVEL_INEXPENSIVE',
      '$$': 'PRICE_LEVEL_MODERATE',
      '$$$': 'PRICE_LEVEL_EXPENSIVE'
    }
    return places.filter((p: any) => p.priceLevel === map[priceRange])
  }

  const buildQuery = () => {
    if (dietaryPrefs.length === 0) return query
    return `${query} ${dietaryPrefs.join(' ')}`
  }

  const search = async () => {
    setLoading(true)
    setError('')

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords

      console.log('Searching with:', {
        query: buildQuery(),
        radius: getRadius(),
        priceRange,
        dietaryPrefs
      })

      const res = await fetch(
        `/api/places?query=${encodeURIComponent(buildQuery())}&lat=${latitude}&lng=${longitude}&radius=${getRadius()}`
      )
      const data = await res.json()

      if (data.places) {
        const priceFiltered = filterByPrice(data.places)
        setAllResults(priceFiltered)
        const filtered = openNow
          ? priceFiltered.filter((p: any) => p.currentOpeningHours?.openNow)
          : priceFiltered
        setResults(filtered)
        if (filtered.length === 0) {
          setError('No results matched your preferences. Try adjusting your price range or filters.')
        }
      } else {
        setError('No results found')
      }

      setLoading(false)
    }, () => {
      setError('Could not get your location. Please allow location access.')
      setLoading(false)
    })
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        <span style={{ display: 'inline-block', width: 28, height: 28, color: '#fff' }} aria-hidden>
          <svg viewBox="0 0 32 32" width="28" height="28" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
            <g>
              <path d="M29.71 15.24h1.53v4.57h-1.53Z" fill="currentColor" strokeWidth="1"></path>
              <path d="M28.19 19.81h1.52v1.52h-1.52Z" fill="currentColor" strokeWidth="1"></path>
              <path d="M28.19 13.72h1.52v1.52h-1.52Z" fill="currentColor" strokeWidth="1"></path>
              <path d="M26.67 25.91h1.52v1.52h-1.52Z" fill="currentColor" strokeWidth="1"></path>
              <path d="M26.67 16.76h1.52v1.53h-1.52Z" fill="currentColor" strokeWidth="1"></path>
              <path d="M23.62 12.19h4.57v1.53h-4.57Z" fill="currentColor" strokeWidth="1"></path>
              <path d="M25.14 27.43h1.53v1.52h-1.53Z" fill="currentColor" strokeWidth="1"></path>
              <path d="M25.14 24.38h1.53v1.53h-1.53Z" fill="currentColor" strokeWidth="1"></path>
              <path d="m23.62 21.33 0 1.53 -1.53 0 0 1.52 3.05 0 0 -1.52 3.05 0 0 -1.53 -4.57 0z" fill="currentColor" strokeWidth="1"></path>
              <path d="m23.62 15.24 0 4.57 3.05 0 0 -1.52 -1.53 0 0 -1.53 1.53 0 0 -1.52 -3.05 0z" fill="currentColor" strokeWidth="1"></path>
              <path d="M22.09 28.95h3.05v1.53h-3.05Z" fill="currentColor" strokeWidth="1"></path>
              <path d="M22.09 10.67h1.53v1.52h-1.53Z" fill="currentColor" strokeWidth="1"></path>
              <path d="M19.05 24.38h3.04v1.53h-3.04Z" fill="currentColor" strokeWidth="1"></path>
              <path d="M17.52 9.14h4.57v1.53h-4.57Z" fill="currentColor" strokeWidth="1"></path>
              <path d="M6.86 30.48h15.23V32H6.86Z" fill="currentColor" strokeWidth="1"></path>
              <path d="m8.38 12.19 0 1.53 -1.52 0 0 1.52 1.52 0 0 1.52 12.19 0 0 -1.52 1.52 0 0 -1.52 -1.52 0 0 -1.53 -12.19 0z" fill="currentColor" strokeWidth="1"></path>
              <path d="M19.05 1.52h1.52v3.05h-1.52Z" fill="currentColor" strokeWidth="1"></path>
              <path d="M16 0h3.05v1.52H16Z" fill="currentColor" strokeWidth="1"></path>
              <path d="M17.52 4.57h1.53V6.1h-1.53Z" fill="currentColor" strokeWidth="1"></path>
              <path d="M14.47 1.52H16v1.53h-1.53Z" fill="currentColor" strokeWidth="1"></path>
              <path d="M14.47 7.62H16v3.05h-1.53Z" fill="currentColor" strokeWidth="1"></path>
              <path d="M11.43 0h3.04v1.52h-3.04Z" fill="currentColor" strokeWidth="1"></path>
              <path d="M12.95 6.1h1.52v1.52h-1.52Z" fill="currentColor" strokeWidth="1"></path>
              <path d="M11.43 4.57h1.52V6.1h-1.52Z" fill="currentColor" strokeWidth="1"></path>
              <path d="M9.9 25.91h9.15v1.52H9.9Z" fill="currentColor" strokeWidth="1"></path>
              <path d="M9.9 1.52h1.53v3.05H9.9Z" fill="currentColor" strokeWidth="1"></path>
              <path d="M6.86 9.14h6.09v1.53H6.86Z" fill="currentColor" strokeWidth="1"></path>
              <path d="M6.86 24.38H9.9v1.53H6.86Z" fill="currentColor" strokeWidth="1"></path>
              <path d="M3.81 28.95h3.05v1.53H3.81Z" fill="currentColor" strokeWidth="1"></path>
              <path d="m6.86 21.33 -1.53 0 0 1.53 -1.52 0 0 1.52 3.05 0 0 -3.05z" fill="currentColor" strokeWidth="1"></path>
              <path d="M5.33 10.67h1.53v1.52H5.33Z" fill="currentColor" strokeWidth="1"></path>
              <path d="M3.81 12.19h1.52v9.14H3.81Z" fill="currentColor" strokeWidth="1"></path>
              <path d="M2.28 27.43h1.53v1.52H2.28Z" fill="currentColor" strokeWidth="1"></path>
              <path d="M2.28 24.38h1.53v1.53H2.28Z" fill="currentColor" strokeWidth="1"></path>
              <path d="M0.76 25.91h1.52v1.52H0.76Z" fill="currentColor" strokeWidth="1"></path>
            </g>
          </svg>
        </span>
        <span>Personal Cafe</span>
        <div style={{ marginLeft: 'auto' }}>
          {userEmail ? (
            <a href="/profile" style={{ fontSize: '1rem', color: '#2563eb', textDecoration: 'none' }}>
              ⚙️ {userEmail}
            </a>
          ) : (
            <a href="/login" style={{ fontSize: '1rem', color: '#2563eb', textDecoration: 'none' }}>
              Log in / Sign up
            </a>
          )}
        </div>
      </header>

      <p>What do you want to eat or drink?</p>

      <input
        type="text"
        placeholder="e.g. iced latte, matcha, chai..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && search()}
        style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', marginBottom: '1rem' }}
      />

      <button
        onClick={search}
        disabled={loading || !query}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          borderRadius: '8px',
          border: 'none',
          background: '#2563eb',
          color: '#fff',
          cursor: loading || !query ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Searching...' : 'Find it'}
      </button>

      <label style={{ marginLeft: '1rem', fontSize: '1rem' }}>
        <input
          type="checkbox"
          checked={openNow}
          onChange={e => setOpenNow(e.target.checked)}
          style={{ marginRight: '0.5rem' }}
        />
        Open now only
      </label>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul style={{ listStyle: 'none', padding: 0, marginTop: '2rem' }}>
        {results.map((place) => (
          <li key={place.id} style={{ borderBottom: '1px solid #eee', padding: '1rem 0' }}>
            <strong>{place.displayName?.text}</strong>
            <p style={{ margin: '0.25rem 0', color: '#666' }}>{place.formattedAddress}</p>
            <p style={{ margin: '0.25rem 0' }}>
              {place.currentOpeningHours?.openNow ? '🟢 Open now' : '🔴 Closed'}
              {place.rating && ` · ⭐ ${place.rating}`}
              {place.distance && ` · 📍 ${place.distance.toFixed(1)} mi`}
            </p>
          </li>
        ))}
      </ul>
    </main>
  )
}