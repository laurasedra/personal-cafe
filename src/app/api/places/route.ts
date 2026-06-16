import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!query || !lat || !lng) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  const classifyRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 10,
      messages: [{
        role: 'user',
        content: `Is this a food or drink related search query? Reply only "yes" or "no". Query: "${query}"`
      }]
    })
  })

const classifyData = await classifyRes.json()
const answer = classifyData.content?.[0]?.text?.trim().toLowerCase()

if (answer !== 'yes') {
  return NextResponse.json(
    { error: 'Try searching for a food or drink — like "matcha" or "bagel".' },
    { status: 400 }
  )
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
    const locationBias = {
      circle: {
        center: { latitude: parseFloat(lat), longitude: parseFloat(lng) },
        radius
      }
    }

    const requestBody = (text: string) => ({
      textQuery: text,
      maxResultCount: 20,
      locationBias
    })

    const commonHeaders = {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.currentOpeningHours,places.priceLevel,places.rating,places.id'
    }

    const [itemRes, cafeRes] = await Promise.all([
      fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: commonHeaders,
        body: JSON.stringify(requestBody(query))
      }),
      fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: commonHeaders,
        body: JSON.stringify(requestBody('cafe coffee shop near me'))
      })
    ])

    const itemData = await itemRes.json().catch(() => null)
    const cafeData = await cafeRes.json().catch(() => null)

    const isPlacesStatusInvalid = (data: any) =>
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

    const normalize = (place: any) => ({
      displayName: place.displayName ?? { text: '' },
      formattedAddress: place.formattedAddress ?? '',
      location: {
        latitude: place.location?.latitude,
        longitude: place.location?.longitude
      },
      currentOpeningHours: {
        openNow: place.currentOpeningHours?.openNow ?? false,
        periods: place.currentOpeningHours?.periods ?? [],
        weekdayDescriptions: place.currentOpeningHours?.weekdayDescriptions ?? []
      },
      priceLevel: place.priceLevel ?? null,
      rating: place.rating ?? null,
      id: place.id
    })

    const allPlaces = [...itemResults, ...cafeResults].map(normalize)
    const seen = new Set()
    const places = allPlaces.filter((place: any) => {
      if (seen.has(place.id)) return false
      seen.add(place.id)
      return true
    })

    const placesWithDistance = places.map((place: any) => {
      const placeLat = place.location?.latitude
      const placeLng = place.location?.longitude
      const distance = haversine(parseFloat(lat), parseFloat(lng), placeLat, placeLng)
      return { ...place, distance }
    })

    placesWithDistance.sort((a: any, b: any) => a.distance - b.distance)

    return NextResponse.json({ places: placesWithDistance })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', message: error?.message || String(error) },
      { status: 500 }
    )
  }
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
