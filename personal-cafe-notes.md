# personal.cafe — Project Notes

## Stack
- **Frontend:** Next.js 16 (TypeScript, Tailwind)
- **Auth + Database:** Supabase
- **Places Data:** Google Places API (New)
- **Hosting:** Netlify (auto-deploys on GitHub push)

---

## Project Setup
- Scaffolded with `npx create-next-app@latest personal-cafe --typescript --tailwind --eslint --app --src-dir`
- Renamed `next.config.ts` → `next.config.js` due to Node.js v26 compatibility issue
- Updated Next.js to latest with `npm install next@latest react@latest react-dom@latest`
- Deployed to Netlify for hosting with auto-deploys

---

## Environment Variables (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=
FOURSQUARE_API_KEY= (unused — dropped due to Node v26 HTTP/2 bug)
```

---

## Supabase Setup

### Tables
**profiles** — created automatically on user signup via trigger
- `id` (uuid, references auth.users)
- `email` (text)
- `travel_mode` (text, default: 'walking')
- `price_range` (text, default: 'any')
- `dietary_preferences` (text[])
- `created_at` (timestamp)

**saved_places** — for saving favorite spots (built, not yet wired to UI)
- `id` (uuid)
- `user_id` (references profiles)
- `place_id` (text)
- `place_name` (text)
- `place_address` (text)
- `created_at` (timestamp)

### Trigger
Auto-creates a profile row when a new user signs up:
```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### Row Level Security
- Users can only read/write their own profile and saved places

---

## API Route — `src/app/api/places/route.ts`
- Accepts `query`, `lat`, `lng`, `radius` as query params
- Runs two Google Places text searches in parallel:
  1. The user's actual query (e.g. "matcha")
  2. "cafe coffee shop near me" — to catch chains like Starbucks/Dunkin that may not rank for specific items
- Deduplicates results by `place.id`
- Calculates distance from user using the **Haversine formula**
- Sorts results by distance (closest first)
- Returns `{ places: [...] }`

### Haversine Formula
Calculates straight-line distance in miles between two lat/lng coordinates.

---

## Pages

### `/` — `src/app/page.tsx`
Main search page.
- Loads user preferences from Supabase on mount
- Builds search query by appending dietary preferences (e.g. "matcha vegetarian halal")
- Sets radius based on travel mode:
  - Walking → 3,200m (~2mi)
  - Transit → 8,000m (~5mi)
  - Driving → 16,000m (~10mi)
- Filters results by price range after results return
- `openNow` toggle filters reactively without re-searching (uses `useEffect`)
- Shows 🟢/🔴 open status, ⭐ rating, 📍 distance for each result
- Header shows email + link to `/profile` if logged in, login link if not

### `/login` — `src/app/login/page.tsx`
- Email/password sign up and log in
- Toggles between sign up and log in modes
- Redirects to `/` on success

### `/profile` — `src/app/profile/page.tsx`
- Redirects to `/login` if not authenticated
- Loads current preferences from Supabase
- Editable fields: travel mode, price range, dietary preferences
- Saves back to Supabase on button click
- Back link to `/`

---

## Known Issues / Notes
- **Foursquare** dropped due to `ERR_HTTP2_STREAM_ERROR` on Node.js v26 — Google only for now
- **Price filtering** uses exact match against Google's `priceLevel` field — many places don't have this set, so results may be sparse when a price range is selected
- **Dunkin/Starbucks** visibility improved by running a second parallel search for "cafe coffee shop near me" and merging results
- `FOURSQUARE_API_KEY` can be removed from `.env.local` — it's no longer used

---

## To Do (Remaining)
- [ ] "I'm feeling lucky" button — opens closest result in Google Maps
- [ ] Save to favorites (create `supabase` saved table)
- [ ] Saved places page
- [ ] UI polish with Tailwind
- [ ] Mobile-friendly layout
- [ ] Final deploy + readme
