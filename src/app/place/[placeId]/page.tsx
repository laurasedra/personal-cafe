import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { fetchPlaceDetails } from '@/app/lib/googlePlaces'
import { getMapEmbedUrl, getTodayHours } from '@/app/lib/places'
import OpenSharedPlaceLogger from './OpenSharedPlaceLogger'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ placeId: string }>
}) {
  const { placeId } = await params
  const place = await fetchPlaceDetails(placeId)
  const placeName = place.displayName?.text || 'A great spot'
  return {
    title: `${placeName} – Personal Cafe`,
  }
}

export default async function SharedPlacePage({
  params,
}: {
  params: Promise<{ placeId: string }>
}) {
  const { placeId } = await params
  const place = await fetchPlaceDetails(placeId)
  const mapEmbedUrl = getMapEmbedUrl(place)
  const todayHours = getTodayHours(place)
  const placeName = place.displayName?.text || 'This place'

  return (
    <main style={{
      minHeight: '100vh',
      background: '#fdf6f0',
      fontFamily: "'Georgia', serif",
      padding: '0',
    }}>
      <Header />
      <OpenSharedPlaceLogger placeId={placeId} placeName={place.displayName?.text} />

      <section style={{
        background: '#3d2314',
        padding: '2rem 1rem',
        color: '#fdf6f0',
      }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <Link href="/" style={{ color: '#d4a96a', fontSize: '0.9rem', textDecoration: 'none' }}>
            Back to search
          </Link>
          <h1 style={{ margin: '0.75rem 0 0', fontSize: '2rem', lineHeight: 1.1 }}>
            {placeName}
          </h1>
          {place.formattedAddress && (
            <p style={{ margin: '0.75rem 0 0', color: '#c9a97a', fontSize: '1rem' }}>
              {place.formattedAddress}
            </p>
          )}
          <p style={{ margin: '0.5rem 0 0', color: '#a07850', fontSize: '0.85rem', fontStyle: 'italic' }}>
            Shared via Personal Cafe — find great spots near you
          </p>
        </div>
      </section>

      <section style={{ maxWidth: '680px', margin: '0 auto', padding: '1.25rem 1rem 2rem' }}>
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '1rem',
          boxShadow: '0 2px 8px rgba(44,26,14,0.08)',
          border: '1px solid #f0e6d6',
        }}>
          <p style={{ margin: 0, color: '#5a3e2b', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span>{place.currentOpeningHours?.openNow ? 'Open now' : 'Closed now'}</span>
            {place.rating && <span>{place.rating} stars</span>}
            {place.priceLevel && <span>{place.priceLevel.replace('PRICE_LEVEL_', '').toLowerCase()}</span>}
          </p>

          {todayHours && (
            <p style={{ margin: '0.75rem 0 0', color: '#6f4d35', fontSize: '0.95rem' }}>
              Today: {todayHours}
            </p>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <Link
              href="/"
              style={{
                border: 'none',
                borderRadius: '8px',
                background: '#d4a96a',
                color: '#2c1a0e',
                fontWeight: 'bold',
                padding: '0.7rem 1rem',
                textDecoration: 'none',
              }}
            >
              Find more nearby
            </Link>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName)}&query_place_id=${encodeURIComponent(placeId)}`}
              target="_blank"
              rel="noreferrer"
              style={{
                border: '1px solid #d4a96a',
                borderRadius: '8px',
                background: 'transparent',
                color: '#5a3e2b',
                padding: '0.7rem 1rem',
                textDecoration: 'none',
              }}
            >
              Open in Maps
            </a>
          </div>

          {mapEmbedUrl && (
            <div style={{
              marginTop: '1rem',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #f0e6d6',
              background: '#f7ead6',
            }}>
              <iframe
                title={`Map for ${placeName}`}
                src={mapEmbedUrl}
                width="100%"
                height="280"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ border: 0, display: 'block' }}
              />
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
