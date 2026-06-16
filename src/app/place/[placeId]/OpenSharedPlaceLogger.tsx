'use client'

import { useEffect } from 'react'
import { logEvent } from '@/app/lib/analytics'

export default function OpenSharedPlaceLogger({
  placeId,
  placeName,
}: {
  placeId: string
  placeName?: string
}) {
  useEffect(() => {
    logEvent('open_shared_place', { place_id: placeId, place_name: placeName })
  }, [placeId, placeName])

  return null
}
