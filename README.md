# personal cafe

Find cafes and coffee shops near you, personalized to what you're craving.

## What it does

Search for anything — "iced latte", "matcha", "avocado toast" — and get nearby cafes sorted by distance. Filter by open now, price range, and travel mode. Save places to your profile. Or let the app just pick one for you.

## Features

- **Search by craving** — powered by Google Places API, cross-referenced with nearby cafes so results are always cafe-relevant
- **Location-aware** — uses your browser's geolocation; search radius adjusts automatically based on travel mode (walking / transit / driving)
- **Pick for me** — random cafe picker that opens directly in Google Maps
- **Open now filter** — toggle to show only currently open places
- **Save places** — heart any result to save it; requires an account
- **User preferences** — set your travel mode, price range, and dietary preferences from your profile; they're applied automatically to every search
- **Pending intent** — if you favorite a place while logged out, you're redirected to login and the save completes automatically after auth

## Tech stack

- [Next.js](https://nextjs.org) (App Router)
- [Supabase](https://supabase.com) — auth and database (saved places, user profiles)
- [Google Places API v1](https://developers.google.com/maps/documentation/places/web-service) — text search
- TypeScript, Tailwind CSS
- Deployed on [Netlify](https://netlify.com)

## Getting started

### 1. Clone and install

```bash
git clone <repo-url>
cd personal-cafe
npm install
```

### 2. Set environment variables

Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Set up Supabase

Under **Authentication → URL Configuration**:

- Set **Site URL** to `https://personalcafe.netlify.app`.
- Add `https://personalcafe.netlify.app/reset-password` to **Redirect URLs**.
- Add `http://localhost:3000/reset-password` only when local reset testing is needed.

Set `NEXT_PUBLIC_SITE_URL=https://personalcafe.netlify.app` in the Netlify production
environment. Supabase rejects recovery redirects that are not on its allowlist and
otherwise falls back to the Site URL.

You need two tables:

**`profiles`**
| column | type |
|---|---|
| id | uuid (references auth.users) |
| travel_mode | text |
| price_range | text |
| dietary_preferences | text[] |

**`saved_places`**
| column | type |
|---|---|
| user_id | uuid (references auth.users) |
| place_id | text |
| place_name | text |
| place_address | text |

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/app/
  page.tsx          # main search page
  layout.tsx        # root layout
  login/            # auth page
  profile/          # user preferences
  saved/            # saved places list
  api/places/       # Google Places API proxy
  lib/              # Supabase client
```
