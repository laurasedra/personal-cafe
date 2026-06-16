import { NextResponse } from 'next/server'
import { fetchPlaceDetails } from '@/app/lib/googlePlaces'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ placeId: string }> }
) {
  const { placeId } = await params

  if (!placeId) {
    return NextResponse.json({ error: 'Missing place ID' }, { status: 400 })
  }

  try {
    const place = await fetchPlaceDetails(placeId)
    return NextResponse.json({ place })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)

    return NextResponse.json(
      { error: 'Google Place Details request failed', message },
      { status: 502 }
    )
  }
}
