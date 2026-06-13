import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'

const sectionStyle = {
  marginBottom: '1.5rem',
}

const headingStyle = {
  margin: '0 0 0.5rem',
  fontSize: '1.1rem',
  color: '#2c1a0e',
}

const paragraphStyle = {
  margin: '0 0 0.75rem',
  color: '#5a3e2b',
  lineHeight: 1.6,
}

export const metadata = {
  title: 'Privacy Policy | Personal Cafe',
  description: 'Privacy policy for Personal Cafe.',
}

export default function PrivacyPolicy() {
  return (
    <main style={{ minHeight: '100vh', background: '#fdf6f0', fontFamily: "'Georgia', serif" }}>
      <Header />

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem 1rem' }}>
        <Link href="/" style={{ fontSize: '0.85rem', color: '#d4a96a', textDecoration: 'none' }}>
          Back to search
        </Link>

        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 2px 16px rgba(44,26,14,0.1)',
          border: '1px solid #f0e6d6',
          marginTop: '1rem',
        }}>
          <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.8rem', color: '#2c1a0e' }}>
            Privacy Policy
          </h1>
          <p style={{ margin: '0 0 2rem', fontSize: '0.9rem', color: '#8a6a50', fontStyle: 'italic' }}>
            Last updated June 13, 2026
          </p>

          <section style={sectionStyle}>
            <p style={paragraphStyle}>
              Personal Cafe is operated by Laura Sedra. This policy explains what information
              the app uses, why it is used, and what happens when you leave Personal Cafe for
              a third-party service.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={headingStyle}>Information we collect</h2>
            <p style={paragraphStyle}>
              If you create an account, Personal Cafe uses your email address for sign in.
              If you save preferences, the app stores your travel mode, price range, and
              dietary preferences. If you save places, the app stores the place name, address,
              and place identifier.
            </p>
            <p style={paragraphStyle}>
              When you search, your browser may ask for your location. Personal Cafe uses that
              location to find nearby cafes and coffee shops. The app does not ask for location
              access until you search or use Pick for me.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={headingStyle}>How we use information</h2>
            <p style={paragraphStyle}>
              Personal Cafe uses your information to show nearby results, apply your saved
              preferences, save places to your account, complete login, and understand basic
              app activity such as searches, saved preferences, and Pick for me actions.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={headingStyle}>Service providers</h2>
            <p style={paragraphStyle}>
              Personal Cafe uses Supabase for account login, profiles, saved places, and app
              event records. It uses Google Places API to search for nearby cafes and coffee
              shops. Hosting providers may process technical data needed to serve the site.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={headingStyle}>Affiliate and ordering links</h2>
            <p style={paragraphStyle}>
              Personal Cafe may include affiliate links, ordering links, or links to third-party
              services. If you click one of those links, the third party may collect information
              under its own privacy policy. Personal Cafe is not responsible for privacy practices
              on other sites.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={headingStyle}>Cookies and browser storage</h2>
            <p style={paragraphStyle}>
              Personal Cafe and its service providers may use cookies or browser storage to keep
              you signed in and support app features. The app also uses session storage to remember
              a pending search or saved place when you are sent to login.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={headingStyle}>Children</h2>
            <p style={paragraphStyle}>
              Personal Cafe is not intended for children under 13. The app should not be used by
              children under 13.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={headingStyle}>Contact</h2>
            <p style={paragraphStyle}>
              For privacy questions, contact Laura Sedra at laurasedra9@gmail.com.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  )
}
