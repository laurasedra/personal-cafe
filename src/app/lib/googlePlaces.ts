import { normalizePlace } from '@/app/lib/places'

const PLACE_DETAILS_FIELD_MASK = [
  'id',
  'displayName',
  'formattedAddress',
  'location',
  'currentOpeningHours',
  'priceLevel',
  'rating'
].join(',')

export async function fetchPlaceDetails(placeId: string) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

  if (!apiKey) {
    throw new Error('Missing Google Places API key on the server')
  }

  const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': PLACE_DETAILS_FIELD_MASK
    },
    cache: 'no-store'
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = data?.error?.message || data?.error_message || 'Google Place Details request failed'
    throw new Error(message)
  }

  return normalizePlace(data)
}
