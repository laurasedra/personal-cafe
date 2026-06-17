import { NextRequest, NextResponse } from 'next/server'

type PlacesApiData = {
  places?: unknown[]
  status?: string
  error_message?: string
}

type NormalizedPlace = {
  displayName: {
    text: string
  }
  formattedAddress: string
  location: {
    latitude?: number
    longitude?: number
  }
  currentOpeningHours: {
    openNow: boolean
    periods: unknown[]
    weekdayDescriptions: unknown[]
  }
  priceLevel: unknown
  rating: unknown
  id?: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')?.trim()
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const location = searchParams.get('location')?.trim().slice(0, 120)
  const latitude = lat ? parseFloat(lat) : null
  const longitude = lng ? parseFloat(lng) : null
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude)
  const hasManualLocation = Boolean(location)

  if (!query || (!hasCoordinates && !hasManualLocation)) {
    return NextResponse.json({ error: 'Enter a search and a city, neighborhood, or ZIP, or choose current location.' }, { status: 400 })
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing Google Places API key on the server' },
        { status: 500 }
      )
    }

    const radius = parseFloat(searchParams.get('radius') || '8000')
    const locationBias = hasCoordinates
      ? {
          circle: {
            center: { latitude: latitude as number, longitude: longitude as number },
            radius
          }
        }
      : undefined

    const requestBody = (text: string) => ({
      textQuery: text,
      maxResultCount: 20,
      ...(locationBias ? { locationBias } : {})
    })

    const commonHeaders = {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.currentOpeningHours,places.priceLevel,places.rating,places.id'
    }

    const itemTextQuery = hasManualLocation ? `${query} near ${location}` : query
    const cafeTextQuery = hasManualLocation ? `cafe coffee shop near ${location}` : 'cafe coffee shop near me'

    const [itemRes, cafeRes] = await Promise.all([
      fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: commonHeaders,
        body: JSON.stringify(requestBody(itemTextQuery))
      }),
      fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: commonHeaders,
        body: JSON.stringify(requestBody(cafeTextQuery))
      })
    ])

    const itemData = await itemRes.json().catch(() => null) as PlacesApiData | null
    const cafeData = await cafeRes.json().catch(() => null) as PlacesApiData | null

    const isPlacesStatusInvalid = (data: PlacesApiData | null) =>
      data && data.status && !['OK', 'ZERO_RESULTS'].includes(data.status)

    if (!itemRes.ok || !cafeRes.ok || isPlacesStatusInvalid(itemData) || isPlacesStatusInvalid(cafeData)) {
      return NextResponse.json(
        {
          error: 'Google Places API request failed',
          itemStatus: itemRes.status,
          itemPlacesStatus: itemData?.status,
          itemErrorMessage: itemData?.error_message,
          itemData,
          cafeStatus: cafeRes.status,
          cafePlacesStatus: cafeData?.status,
          cafeErrorMessage: cafeData?.error_message,
          cafeData
        },
        { status: 502 }
      )
    }

    const itemResults = Array.isArray(itemData?.places) ? itemData.places : []
    const cafeResults = Array.isArray(cafeData?.places) ? cafeData.places : []

    const allPlaces = [...itemResults, ...cafeResults].map(normalize)
    const seen = new Set<string | undefined>()
    const places = allPlaces.filter((place) => {
      if (seen.has(place.id)) return false
      seen.add(place.id)
      return true
    })

    if (!hasCoordinates) {
      return NextResponse.json({ places })
    }

    const placesWithDistance = places.map((place) => {
      const placeLat = place.location?.latitude
      const placeLng = place.location?.longitude
      const distance = Number.isFinite(placeLat) && Number.isFinite(placeLng)
        ? haversine(latitude as number, longitude as number, placeLat as number, placeLng as number)
        : Number.POSITIVE_INFINITY
      return { ...place, distance }
    })

    placesWithDistance.sort((a, b) => a.distance - b.distance)

    return NextResponse.json({ places: placesWithDistance })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

function normalize(value: unknown): NormalizedPlace {
  const place = asRecord(value)
  const displayName = asRecord(place.displayName)
  const location = asRecord(place.location)
  const currentOpeningHours = asRecord(place.currentOpeningHours)

  return {
    displayName: { text: typeof displayName.text === 'string' ? displayName.text : '' },
    formattedAddress: typeof place.formattedAddress === 'string' ? place.formattedAddress : '',
    location: {
      latitude: typeof location.latitude === 'number' ? location.latitude : undefined,
      longitude: typeof location.longitude === 'number' ? location.longitude : undefined
    },
    currentOpeningHours: {
      openNow: typeof currentOpeningHours.openNow === 'boolean' ? currentOpeningHours.openNow : false,
      periods: Array.isArray(currentOpeningHours.periods) ? currentOpeningHours.periods : [],
      weekdayDescriptions: Array.isArray(currentOpeningHours.weekdayDescriptions) ? currentOpeningHours.weekdayDescriptions : []
    },
    priceLevel: place.priceLevel ?? null,
    rating: place.rating ?? null,
    id: typeof place.id === 'string' ? place.id : undefined
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {}
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
