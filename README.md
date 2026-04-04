# KINO — Premium Movie Discovery

A cinematic movie exploration platform powered by TMDB and Google Gemini AI. Built with Next.js, Tailwind CSS, and Framer Motion.

## Features

- **Cinematic Home** — Auto-rotating hero with trending movies, carousels for Now Playing, Top Rated, and Upcoming
- **Movie Details** — Full cinematic presentation with cast, trailers, metadata, and AI insights
- **AI Oracle** — Describe a mood or vibe and get AI-curated movie recommendations powered by Gemini
- **Explore** — Browse by genre worlds and decades
- **Search** — Real-time search with ⌘K command palette
- **Watchlist & Favorites** — Save movies locally with persistent storage
- **Person Pages** — Actor/director profiles with filmography
- **Surprise Me** — Random highly-rated movie discovery

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Icons | Lucide React |
| Movie Data | TMDB API v3 |
| AI Engine | Google Gemini 2.0 Flash |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Setup

1. Clone the repo:
```bash
git clone https://github.com/your-username/kino.git
cd kino
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` from the template:
```bash
cp .env.example .env.local
```

4. Add your API keys to `.env.local`:
```
TMDB_API_KEY=your_tmdb_api_key
GEMINI_API_KEY=your_gemini_api_key
```

- Get a TMDB API key: [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
- Get a Gemini API key: [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

5. Run the dev server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `TMDB_API_KEY`
   - `GEMINI_API_KEY`
4. Deploy — Vercel auto-deploys on every push to `main`

## Routes

| Route | Page |
|---|---|
| `/` | Home — Discovery feed |
| `/movie/[id]` | Movie detail |
| `/search` | Search |
| `/explore` | Genre worlds & decades |
| `/explore/genre/[id]` | Genre-specific feed |
| `/ai` | AI Movie Oracle |
| `/person/[id]` | Actor/Director profile |
| `/watchlist` | Saved watchlist |
| `/favorites` | Favorited movies |

## Attribution

Movie data provided by [TMDB](https://www.themoviedb.org/). This product uses the TMDB API but is not endorsed or certified by TMDB.

---

Built with obsessive attention to cinema.
