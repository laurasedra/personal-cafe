export type PlaceWithHours = {
  currentOpeningHours?: {
    openNow?: boolean
    weekdayDescriptions?: unknown
  }
}

export type PlaceWithMap = {
  displayName?: {
    text?: string
  }
  formattedAddress?: string
  location?: {
    latitude?: number
    longitude?: number
  }
}

export type PersonalCafePlace = PlaceWithHours & PlaceWithMap & {
  id?: string
  priceLevel?: string | null
  rating?: number | null
  distance?: number
}

const weekdayDescriptionIndex = [6, 0, 1, 2, 3, 4, 5]

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {}
}

function asDisplayName(value: unknown) {
  const displayName = asRecord(value)
  return { text: typeof displayName.text === 'string' ? displayName.text : '' }
}

function asLocation(value: unknown) {
  const location = asRecord(value)
  return {
    latitude: typeof location.latitude === 'number' ? location.latitude : undefined,
    longitude: typeof location.longitude === 'number' ? location.longitude : undefined
  }
}

function asOpeningHours(value: unknown) {
  const hours = asRecord(value)
  return {
    openNow: typeof hours.openNow === 'boolean' ? hours.openNow : false,
    weekdayDescriptions: Array.isArray(hours.weekdayDescriptions) ? hours.weekdayDescriptions : []
  }
}

export function normalizePlace(value: unknown): PersonalCafePlace {
  const place = asRecord(value)

  return {
    displayName: asDisplayName(place.displayName),
    formattedAddress: typeof place.formattedAddress === 'string' ? place.formattedAddress : '',
    location: asLocation(place.location),
    currentOpeningHours: asOpeningHours(place.currentOpeningHours),
    priceLevel: typeof place.priceLevel === 'string' ? place.priceLevel : null,
    rating: typeof place.rating === 'number' ? place.rating : null,
    id: typeof place.id === 'string' ? place.id : undefined
  }
}

export function getTodayHours(place: PlaceWithHours) {
  const descriptions = place.currentOpeningHours?.weekdayDescriptions
  if (!Array.isArray(descriptions) || descriptions.length === 0) return null

  const today = descriptions[weekdayDescriptionIndex[new Date().getDay()]]
  if (typeof today !== 'string') return null

  const [, hours] = today.split(/:\s(.+)/)
  return hours || today
}

export function getMapEmbedUrl(place: PlaceWithMap) {
  const latitude = place.location?.latitude
  const longitude = place.location?.longitude
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude)
  const query = hasCoordinates
    ? `${latitude},${longitude}`
    : [place.displayName?.text, place.formattedAddress].filter(Boolean).join(' ')

  if (!query) return null

  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`
}
