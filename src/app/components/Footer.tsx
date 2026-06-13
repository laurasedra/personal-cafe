import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{
      padding: '1.5rem 1rem 2rem',
      textAlign: 'center',
      color: '#8a6a50',
      fontSize: '0.85rem',
      fontFamily: 'Georgia, serif',
    }}>
      <Link href="/privacy" style={{ color: '#8a6a50', textDecoration: 'underline' }}>
        Privacy Policy
      </Link>
    </footer>
  )
}
