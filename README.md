# Pocket Dates 💌

*Little plans. Big memories.*

A cozy, mobile-first web app for couples: find something to do together based on how
much time you have, go do it, then turn it into a little scrapbook memory you can look
back on — and share.

## Stack

- **Next.js 16** (App Router, TypeScript, React 19)
- **Tailwind CSS v4** + **shadcn/ui** (Base UI primitives) + **Lucide** icons + **Framer Motion**
- **Supabase** — Postgres, Auth, Storage, Row Level Security
- **Google Places API (New)** for real nearby date spots (optional — the app works without it)
- **next/og** (`ImageResponse`) for the shareable memory cards
- Deploys to **Vercel**

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project details (see below)
npm run dev
```

Open http://localhost:3000 — it redirects to `/discover`, which works immediately in
**demo mode** (no account, no Supabase config required) so you can click around.

### 1. Create a Supabase project

1. Create a free project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. **Project Settings → API** — copy the Project URL into `NEXT_PUBLIC_SUPABASE_URL`,
   and the `anon public` key (labeled **"publishable key"** on newer dashboards —
   same thing) into `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`. Copy the
   `service_role` key (labeled **"secret key"** on newer dashboards) into
   `SUPABASE_SERVICE_ROLE_KEY` — server-only, used solely for the "delete account"
   flow, never sent to the browser.
3. **SQL Editor** — paste and run, in order:
   - [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) — tables + RLS policies
   - [`supabase/migrations/0002_storage.sql`](supabase/migrations/0002_storage.sql) — storage buckets + policies
   - [`supabase/seed.sql`](supabase/seed.sql) — 40 curated date-idea activities
4. **Authentication → URL Configuration** — add `http://localhost:3000/auth/callback`
   (and your production URL's equivalent) to the redirect allow-list.
5. (Optional) **Authentication → Sign In / Providers → Google** if you want the
   "Continue with Google" button to work — follow Supabase's Google OAuth guide.

Restart `npm run dev` after editing `.env.local`.

### 2. Google Places API (optional)

Powers the real, named nearby places on Discover (coffee shops, restaurants, parks,
etc). Without it, Discover still works fully using the at-home and generic
"find a ___ nearby" seed activities.

1. [console.cloud.google.com](https://console.cloud.google.com/) → create/select a project.
2. **APIs & Services → Library** → enable **Places API (New)**.
3. **APIs & Services → Credentials** → create an API key.
4. Restrict it: Application restrictions → IP addresses (it's only ever called
   server-side, in [`app/api/places/nearby/route.ts`](app/api/places/nearby/route.ts) and
   [`app/api/places/photo/route.ts`](app/api/places/photo/route.ts) — the key never
   reaches the browser); API restrictions → Places API (New) only.
5. Put it in `GOOGLE_PLACES_API_KEY` (no `NEXT_PUBLIC_` prefix).

### 3. Deploy

Push to a Git repo, import into [Vercel](https://vercel.com/new), add the same
environment variables in the Vercel project settings, and deploy. Add your production
domain's `/auth/callback` URL to Supabase's redirect allow-list too.

## Project structure

```
app/
  (app)/            Discover, Memories, Calendar, Profile, Favorites — bottom-nav shell
  (auth)/           Login, signup, password reset — centered card shell
  api/               Route handlers: Places proxy, share-card image generation, data export
  onboarding/        Post-signup preference wizard
components/          UI grouped by feature (discover/, memories/, calendar/, auth/, ...)
lib/                 Client/server Supabase setup, recommendation engine, server actions
services/            Server-only data-fetching (activities, memories)
supabase/            SQL migrations + seed data
types/                Database schema + shared domain types
```

## How discovery/recommendations work

All ranking in `lib/recommendations.ts` is deterministic — no AI, no weather. It scores
each activity by overlap with the couple's interests/date styles, nudges based on their
at-home-vs-out preference, and deprioritizes activity *types* completed in the last two
weeks (so if you just did coffee, cinema, and a restaurant, walks/museums/crafts surface
instead) while hard-excluding the exact same activity if done in the last two months.
"Surprise Us" picks genuinely at random from the top-scoring slice of that ranking.

## Known limitations / what's next

- **Couple sharing**: the schema has a `couples` table and nullable `couple_id` columns
  on `profiles`/`memories` ready for it, but the invite-your-partner UI isn't built —
  each account currently has its own private memory collection.
- **Demo mode** uses static sample data (`lib/demo-data.ts`) and doesn't touch Supabase.
- The Google Places integration only fetches Nearby Search + Photos — no Place Details
  (opening hours, ratings, etc).
- No automated test suite yet — this was built and verified via manual QA, `tsc`,
  `eslint`, and Playwright screenshot checks at mobile width in demo mode (real
  authenticated flows need a live Supabase project to test end-to-end).
