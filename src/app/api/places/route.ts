import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!query || !lat || !lng) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  const [itemRes, cafeRes] = await Promise.all([
    fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY!,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.currentOpeningHours,places.priceLevel,places.rating,places.id'
      },
      body: JSON.stringify({
        textQuery: query,
        maxResultCount: 20,
        locationBias: {
          circle: {
            center: { latitude: parseFloat(lat), longitude: parseFloat(lng) },
            radius: 8000.0
          }
        }
      })
    }),
    fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY!,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.currentOpeningHours,places.priceLevel,places.rating,places.id'
      },
      body: JSON.stringify({
        textQuery: `cafe coffee shop near me`,
        maxResultCount: 20,
        locationBias: {
          circle: {
            center: { latitude: parseFloat(lat), longitude: parseFloat(lng) },
            radius: 8000.0
          }
        }
      })
    })
  ])

  const itemData = await itemRes.json()
  const cafeData = await cafeRes.json()

  // Merge and deduplicate by place id
  const allPlaces = [...(itemData.places || []), ...(cafeData.places || [])]
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