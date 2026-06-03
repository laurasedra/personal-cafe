'use client'

import { useState, useEffect } from 'react'

export default function Home() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [allResults, setAllResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [openNow, setOpenNow] = useState(false)

  useEffect(() => {
    if (openNow) {
      setResults(allResults.filter((p: any) => p.currentOpeningHours?.openNow))
    } else {
      setResults(allResults)
    }
  }, [openNow])

  const search = async () => {
    setLoading(true)
    setError('')

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords

      const res = await fetch(
        `/api/places?query=${encodeURIComponent(query)}&lat=${latitude}&lng=${longitude}`
      )
      const data = await res.json()

      if (data.places) {
        setAllResults(data.places)
        const filtered = openNow
          ? data.places.filter((p: any) => p.currentOpeningHours?.openNow)
          : data.places
        setResults(filtered)
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
      <header style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>personal.cafe</header>
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
        style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
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