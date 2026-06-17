'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import { logEvent } from '@/app/lib/analytics'
import Footer from '@/app/components/Footer'

const weekdayDescriptionIndex = [6, 0, 1, 2, 3, 4, 5]

type PlaceWithHours = {
  currentOpeningHours?: {
    weekdayDescriptions?: unknown
  }
}

type PlaceWithMap = {
  displayName?: {
    text?: string
  }
  formattedAddress?: string
  location?: {
    latitude?: number
    longitude?: number
  }
}

type BrowserLocation = {
  latitude: number
  longitude: number
}

type SearchLocation =
  | { mode: 'manual'; location: string }
  | { mode: 'browser'; coords: BrowserLocation }

function getTodayHours(place: PlaceWithHours) {
  const descriptions = place.currentOpeningHours?.weekdayDescriptions
  if (!Array.isArray(descriptions) || descriptions.length === 0) return null

  const today = descriptions[weekdayDescriptionIndex[new Date().getDay()]]
  if (typeof today !== 'string') return null

  const [, hours] = today.split(/:\s(.+)/)
  return hours || today
}

function getMapEmbedUrl(place: PlaceWithMap) {
  const latitude = place.location?.latitude
  const longitude = place.location?.longitude
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude)
  const query = hasCoordinates
    ? `${latitude},${longitude}`
    : [place.displayName?.text, place.formattedAddress].filter(Boolean).join(' ')

  if (!query) return null

  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`
}

export default function Home() {
  const [query, setQuery] = useState('')
  const [manualLocation, setManualLocation] = useState('')
  const [currentLocation, setCurrentLocation] = useState<BrowserLocation | null>(null)
  const [results, setResults] = useState<any[]>([])
  const [allResults, setAllResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [openNow, setOpenNow] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [travelMode, setTravelMode] = useState('walking')
  const [priceRange, setPriceRange] = useState('any')
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>([])
  const [prefsLoaded, setPrefsLoaded] = useState(false)
  const [readyToSearch, setReadyToSearch] = useState(false)
  const [savedPlaceIds, setSavedPlaceIds] = useState<Set<string>>(new Set())
  const [revealedMapIds, setRevealedMapIds] = useState<Set<string>>(new Set())
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setPrefsLoaded(true)
        return
      }
      setUserEmail(user.email ?? null)
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setTravelMode(data.travel_mode || 'walking')
        setPriceRange(data.price_range || 'any')
        setDietaryPrefs(data.dietary_preferences || [])
      }
      const { data: saved } = await supabase.from('saved_places').select('place_id').eq('user_id', user.id)
      if (saved) setSavedPlaceIds(new Set(saved.map((s: any) => s.place_id)))
      setPrefsLoaded(true)
      const pendingPlace = sessionStorage.getItem('pendingPlace')
      if (pendingPlace) {
        sessionStorage.removeItem('pendingPlace')
        const place = JSON.parse(pendingPlace)
        await supabase.from('saved_places').insert({
          user_id: user.id,
          place_id: place.id,
          place_name: place.displayName?.text,
          place_address: place.formattedAddress
        })
        setSavedPlaceIds(prev => new Set([...prev, place.id]))
        alert(`${place.displayName?.text} saved!`)
      }
      const pendingQuery = sessionStorage.getItem('pendingQuery')
      if (pendingQuery) {
        sessionStorage.removeItem('pendingQuery')
        setQuery(pendingQuery)
        setReadyToSearch(true)
      }
    }
    loadUser()
  }, [])

  useEffect(() => {
    if (readyToSearch && prefsLoaded) {
      search()
      setReadyToSearch(false)
    }
  }, [readyToSearch, prefsLoaded])

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

  const getSearchLocation = (): SearchLocation | null => {
    const trimmedLocation = manualLocation.trim()
    if (trimmedLocation) return { mode: 'manual', location: trimmedLocation }
    if (currentLocation) return { mode: 'browser', coords: currentLocation }
    return null
  }

  const buildPlacesUrl = (searchQuery: string, searchLocation: SearchLocation) => {
    const params = new URLSearchParams({ query: searchQuery })

    if (searchLocation.mode === 'manual') {
      params.set('location', searchLocation.location)
    } else {
      params.set('lat', String(searchLocation.coords.latitude))
      params.set('lng', String(searchLocation.coords.longitude))
      params.set('radius', String(getRadius()))
    }

    return `/api/places?${params.toString()}`
  }

  const toggleMap = (placeId: string) => {
    setRevealedMapIds(prev => {
      const next = new Set(prev)
      if (next.has(placeId)) {
        next.delete(placeId)
      } else {
        next.add(placeId)
      }
      return next
    })
  }

  const toggleFavorite = async (place: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      sessionStorage.setItem('pendingQuery', query)
      sessionStorage.setItem('pendingPlace', JSON.stringify(place))
      router.push('/login')
      return
    }
    if (savedPlaceIds.has(place.id)) {
      await supabase.from('saved_places').delete().eq('user_id', user.id).eq('place_id', place.id)
      setSavedPlaceIds(prev => {
        const next = new Set(prev)
        next.delete(place.id)
        return next
      })
    } else {
      await supabase.from('saved_places').insert({
        user_id: user.id,
        place_id: place.id,
        place_name: place.displayName?.text,
        place_address: place.formattedAddress
      })
      setSavedPlaceIds(prev => new Set([...prev, place.id]))
    }
  }

  const executeSearch = async (searchLocation: SearchLocation) => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch(buildPlacesUrl(buildQuery(), searchLocation))
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'No results found')
        return
      }

      if (data.places) {
        const priceFiltered = filterByPrice(data.places)
        setRevealedMapIds(new Set())
        setAllResults(priceFiltered)
        const filtered = openNow ? priceFiltered.filter((p: any) => p.currentOpeningHours?.openNow) : priceFiltered
        setResults(filtered)
        logEvent('search', {
          query,
          result_count: filtered.length,
          open_now: openNow,
          travel_mode: travelMode,
          price_range: priceRange,
          location_mode: searchLocation.mode
        })
        if (filtered.length === 0) setError('No results matched your preferences. Try adjusting your price range or filters.')
      } else {
        setError('No results found')
      }
    } catch {
      setError('Search failed. Try again in a moment.')
    } finally {
      setLoading(false)
    }
  }

  const pickForMe = async () => {
    const searchLocation = getSearchLocation()
    if (!searchLocation) {
      setError('Enter a city, neighborhood, or ZIP, or choose current location.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(buildPlacesUrl('cafe coffee shop bakery', searchLocation))
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'No places found nearby.')
        return
      }

      if (data.places && data.places.length > 0) {
        const candidates = openNow
          ? data.places.filter((p: any) => p.currentOpeningHours?.openNow)
          : data.places
        if (candidates.length === 0) {
          setError('No open places found nearby.')
          return
        }
        const random = candidates[Math.floor(Math.random() * candidates.length)]
        logEvent('pick_for_me', {
          place_id: random.id,
          place_name: random.displayName?.text,
          open_now: openNow,
          location_mode: searchLocation.mode
        })
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(random.displayName?.text)}&query_place_id=${random.id}`, '_blank')
      } else {
        setError('No places found nearby.')
      }
    } catch {
      setError('Could not pick a place. Try again in a moment.')
    } finally {
      setLoading(false)
    }
  }

  const search = async () => {
    const searchLocation = getSearchLocation()
    if (!searchLocation) {
      setError('Enter a city, neighborhood, or ZIP, or choose current location.')
      return
    }

    await executeSearch(searchLocation)
  }

  const useCurrentLocation = () => {
    setLoading(true)
    setError('')

    navigator.geolocation.getCurrentPosition(async (position) => {
      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }
      const searchLocation: SearchLocation = { mode: 'browser', coords }
      setCurrentLocation(coords)

      if (query.trim()) {
        await executeSearch(searchLocation)
      } else {
        setError('Current location is ready. Enter what you want to find.')
        setLoading(false)
      }
    }, () => {
      setError('Could not get your location. You can still search by city, neighborhood, or ZIP.')
      setLoading(false)
    })
  }

  const canSearch = Boolean(query.trim() && (manualLocation.trim() || currentLocation))

  return (
    <main style={{
      minHeight: '100vh',
      background: '#fdf6f0',
      fontFamily: "'Georgia', serif",
      padding: '0',
    }}>
      {/* Header */}
      <header style={{
        background: '#2c1a0e',
        color: '#fdf6f0',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ display: 'inline-block', width: 28, height: 28, color: '#d4a96a' }} aria-hidden>
            <svg viewBox="0 0 32 32" width="28" height="28" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
              <g>
                <path d="M29.71 15.24h1.53v4.57h-1.53Z" fill="currentColor"></path>
                <path d="M28.19 19.81h1.52v1.52h-1.52Z" fill="currentColor"></path>
                <path d="M28.19 13.72h1.52v1.52h-1.52Z" fill="currentColor"></path>
                <path d="M26.67 25.91h1.52v1.52h-1.52Z" fill="currentColor"></path>
                <path d="M26.67 16.76h1.52v1.53h-1.52Z" fill="currentColor"></path>
                <path d="M23.62 12.19h4.57v1.53h-4.57Z" fill="currentColor"></path>
                <path d="M25.14 27.43h1.53v1.52h-1.53Z" fill="currentColor"></path>
                <path d="M25.14 24.38h1.53v1.53h-1.53Z" fill="currentColor"></path>
                <path d="m23.62 21.33 0 1.53 -1.53 0 0 1.52 3.05 0 0 -1.52 3.05 0 0 -1.53 -4.57 0z" fill="currentColor"></path>
                <path d="m23.62 15.24 0 4.57 3.05 0 0 -1.52 -1.53 0 0 -1.53 1.53 0 0 -1.52 -3.05 0z" fill="currentColor"></path>
                <path d="M22.09 28.95h3.05v1.53h-3.05Z" fill="currentColor"></path>
                <path d="M22.09 10.67h1.53v1.52h-1.53Z" fill="currentColor"></path>
                <path d="M19.05 24.38h3.04v1.53h-3.04Z" fill="currentColor"></path>
                <path d="M17.52 9.14h4.57v1.53h-4.57Z" fill="currentColor"></path>
                <path d="M6.86 30.48h15.23V32H6.86Z" fill="currentColor"></path>
                <path d="m8.38 12.19 0 1.53 -1.52 0 0 1.52 1.52 0 0 1.52 12.19 0 0 -1.52 1.52 0 0 -1.52 -1.52 0 0 -1.53 -12.19 0z" fill="currentColor"></path>
                <path d="M19.05 1.52h1.52v3.05h-1.52Z" fill="currentColor"></path>
                <path d="M16 0h3.05v1.52H16Z" fill="currentColor"></path>
                <path d="M17.52 4.57h1.53V6.1h-1.53Z" fill="currentColor"></path>
                <path d="M14.47 1.52H16v1.53h-1.53Z" fill="currentColor"></path>
                <path d="M14.47 7.62H16v3.05h-1.53Z" fill="currentColor"></path>
                <path d="M11.43 0h3.04v1.52h-3.04Z" fill="currentColor"></path>
                <path d="M12.95 6.1h1.52v1.52h-1.52Z" fill="currentColor"></path>
                <path d="M11.43 4.57h1.52V6.1h-1.52Z" fill="currentColor"></path>
                <path d="M9.9 25.91h9.15v1.52H9.9Z" fill="currentColor"></path>
                <path d="M9.9 1.52h1.53v3.05H9.9Z" fill="currentColor"></path>
                <path d="M6.86 9.14h6.09v1.53H6.86Z" fill="currentColor"></path>
                <path d="M6.86 24.38H9.9v1.53H6.86Z" fill="currentColor"></path>
                <path d="M3.81 28.95h3.05v1.53H3.81Z" fill="currentColor"></path>
                <path d="m6.86 21.33 -1.53 0 0 1.53 -1.52 0 0 1.52 3.05 0 0 -3.05z" fill="currentColor"></path>
                <path d="M5.33 10.67h1.53v1.52H5.33Z" fill="currentColor"></path>
                <path d="M3.81 12.19h1.52v9.14H3.81Z" fill="currentColor"></path>
                <path d="M2.28 27.43h1.53v1.52H2.28Z" fill="currentColor"></path>
                <path d="M2.28 24.38h1.53v1.53H2.28Z" fill="currentColor"></path>
                <path d="M0.76 25.91h1.52v1.52H0.76Z" fill="currentColor"></path>
              </g>
            </svg>
          </span>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fdf6f0', letterSpacing: '0.02em' }}>Personal Cafe</span>
        </div>
        <div>
          {userEmail ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <a href="/saved" style={{ fontSize: '0.85rem', color: '#d4a96a', textDecoration: 'none' }}>❤️</a>
              <a href="/profile" style={{ fontSize: '0.85rem', color: '#d4a96a', textDecoration: 'none' }}>⚙️</a>
            </div>
          ) : (
            <a href="/login" style={{ fontSize: '0.85rem', color: '#d4a96a', textDecoration: 'none' }}>Log in</a>
          )}
        </div>
      </header>

      {/* Hero */}
      <div style={{
        background: '#3d2314',
        padding: '2rem 1rem',
        textAlign: 'center',
        color: '#fdf6f0',
      }}>
        <p style={{ fontSize: '1rem', color: '#c9a97a', marginBottom: '1.25rem', fontStyle: 'italic' }}>
          find something good nearby
        </p>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          maxWidth: '560px',
          margin: '0 auto',
        }}>
	          <input
	            type="text"
	            placeholder="iced latte, matcha, chai..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              fontSize: '1rem',
              borderRadius: '8px',
              border: 'none',
              outline: 'none',
              background: '#fdf6f0',
              color: '#2c1a0e',
              fontFamily: 'Georgia, serif',
	              boxSizing: 'border-box' as const,
	            }}
	          />
	          <input
	            type="text"
	            placeholder="city, neighborhood, or ZIP"
	            value={manualLocation}
	            onChange={e => setManualLocation(e.target.value)}
	            onKeyDown={e => e.key === 'Enter' && search()}
	            aria-label="Search location"
	            style={{
	              width: '100%',
	              padding: '0.85rem 1rem',
	              fontSize: '1rem',
	              borderRadius: '8px',
	              border: '1px solid #d4a96a',
	              outline: 'none',
	              background: '#fdf6f0',
	              color: '#2c1a0e',
	              fontFamily: 'Georgia, serif',
	              boxSizing: 'border-box' as const,
	            }}
	          />
	          <button
	            type="button"
	            onClick={useCurrentLocation}
	            disabled={loading}
	            style={{
	              width: '100%',
	              padding: '0.72rem 1.25rem',
	              fontSize: '0.95rem',
	              borderRadius: '8px',
	              border: '1px solid #d4a96a',
	              background: 'transparent',
	              color: '#d4a96a',
	              fontWeight: 'bold',
	              cursor: loading ? 'not-allowed' : 'pointer',
	              fontFamily: 'Georgia, serif',
	            }}
	          >
	            Use current location
	          </button>
	          <button
	            id="search-btn"
	            onClick={search}
	            disabled={loading || !canSearch}
	            style={{
	              width: '100%',
	              padding: '0.85rem 1.25rem',
              fontSize: '1rem',
              borderRadius: '8px',
              border: 'none',
	              background: '#d4a96a',
	              color: '#2c1a0e',
	              fontWeight: 'bold',
	              cursor: loading || !canSearch ? 'not-allowed' : 'pointer',
	              fontFamily: 'Georgia, serif',
	            }}
	          >
            {loading ? 'Searching...' : 'Find it'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={pickForMe}
            style={{
              padding: '0.6rem 1.25rem',
              fontSize: '0.9rem',
              borderRadius: '8px',
              border: '1px solid #d4a96a',
              background: 'transparent',
              color: '#d4a96a',
              cursor: 'pointer',
              fontFamily: 'Georgia, serif',
            }}
          >
            🎲 Pick for me
          </button>
          <label style={{ fontSize: '0.9rem', color: '#c9a97a', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={openNow}
              onChange={e => setOpenNow(e.target.checked)}
            />
            Open now only
          </label>
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1.25rem 1rem' }}>
        {error && (
          <p style={{ color: '#9b3a2a', background: '#fde8e4', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
            {error}
          </p>
        )}

        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {results.map((place) => {
            const todayHours = getTodayHours(place)
            const mapEmbedUrl = getMapEmbedUrl(place)
            const isMapRevealed = revealedMapIds.has(place.id)

            return (
              <li key={place.id} style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '1rem',
                boxShadow: '0 2px 8px rgba(44,26,14,0.08)',
                border: '1px solid #f0e6d6',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <strong style={{ fontSize: '1rem', color: '#2c1a0e', flex: 1, paddingRight: '0.5rem' }}>{place.displayName?.text}</strong>
                  <button
                    onClick={() => toggleFavorite(place)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      flexShrink: 0,
                    }}
                  >
                    {savedPlaceIds.has(place.id) ? '❤️' : '🤍'}
                  </button>
                </div>
                <p style={{ margin: '0.3rem 0 0', color: '#8a6a50', fontSize: '0.85rem' }}>{place.formattedAddress}</p>
                <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem', color: '#5a3e2b', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span>{place.currentOpeningHours?.openNow ? '🟢 Open' : '🔴 Closed'}</span>
                  {place.rating && <span>⭐ {place.rating}</span>}
                  {place.distance && <span>📍 {place.distance.toFixed(1)} mi</span>}
                  {mapEmbedUrl && (
                    <button
                      type="button"
                      onClick={() => toggleMap(place.id)}
                      aria-expanded={isMapRevealed}
                      style={{
                        border: '1px solid #d4a96a',
                        borderRadius: '8px',
                        background: isMapRevealed ? '#f7ead6' : 'transparent',
                        color: '#5a3e2b',
                        cursor: 'pointer',
                        fontFamily: 'Georgia, serif',
                        fontSize: '0.78rem',
                        padding: '0.12rem 0.45rem',
                      }}
                    >
                      {isMapRevealed ? 'Hide Map' : 'Reveal on Map'}
                    </button>
                  )}
                </p>
                {todayHours && (
                  <p style={{ margin: '0.35rem 0 0', color: '#6f4d35', fontSize: '0.82rem' }}>
                    Today: {todayHours}
                  </p>
                )}
                {mapEmbedUrl && isMapRevealed && (
                  <div style={{
                    marginTop: '0.75rem',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #f0e6d6',
                    background: '#f7ead6',
                  }}>
                    <iframe
                      title={`Map for ${place.displayName?.text || 'selected place'}`}
                      src={mapEmbedUrl}
                      width="100%"
                      height="220"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      style={{
                        border: 0,
                        display: 'block',
                      }}
                    />
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
      <Footer />
    </main>
  )
}
