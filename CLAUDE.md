# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install dependencies
npm run dev          # development server on http://localhost:3000
npm run build        # production build
npm run start        # run production build on port 3000
npm run lint         # ESLint check
npm run lint:fix     # auto-fix lint issues
```

yt-dlp must be installed separately on the host machine:
```bash
pip install yt-dlp   # or: winget install yt-dlp.yt-dlp
```

## Architecture

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · yt-dlp (system binary)

```
src/
├── app/
│   ├── page.tsx                  # Home (server component) — hero, how-it-works, wires together sections
│   ├── layout.tsx                # Root layout + metadata
│   ├── globals.css               # Tailwind base + custom background/scrollbar
│   ├── sitemap.ts / robots.ts    # SEO
│   ├── api/
│   │   ├── fetch/route.ts        # POST /api/fetch — main endpoint: validates URL, rate-limits, calls yt-dlp
│   │   └── health/route.ts       # GET /api/health — reports yt-dlp availability
│   ├── terms/page.tsx
│   └── privacy/page.tsx
├── components/
│   ├── DownloadSection.tsx       # Client wrapper that owns form + result state
│   ├── DownloadForm.tsx          # URL input, paste button, loading/error states
│   ├── VideoResult.tsx           # Thumbnail + HD/SD download buttons
│   ├── Features.tsx              # Feature grid (server)
│   ├── FAQ.tsx                   # Accordion FAQ (client)
│   ├── Header.tsx / Footer.tsx
└── lib/
    ├── ytdlp.ts       # Spawns yt-dlp, parses JSON, picks best HD/SD formats
    ├── rateLimit.ts   # In-memory sliding window (10 req/min per IP by default)
    ├── validators.ts  # Zod schema — validates FB URL patterns
    └── utils.ts       # formatDuration, formatFilesize, toFilename (safe to import client-side)
```

## Key Design Decisions

- **Server vs client components:** `page.tsx` is a server component for SEO. Only `DownloadSection`, `DownloadForm`, `VideoResult`, and `FAQ` are client components (`'use client'`). `utils.ts` is kept separate from `ytdlp.ts` so client components can import formatting helpers without pulling in `child_process`.

- **Video extraction flow:** `POST /api/fetch` → `extractVideoInfo()` spawns `yt-dlp --dump-json --no-playlist` → parses JSON → `pickFormats()` selects best merged MP4 formats (video + audio in one file) sorted by height (HD first). Download links are direct Facebook CDN URLs — we never proxy video bytes.

- **Rate limiting:** In-memory `Map` with auto-cleanup every 5 min. To switch to Redis, replace `src/lib/rateLimit.ts` with an Upstash/ioredis implementation.

- **Private video support:** Enabled by setting `YTDLP_COOKIES_PATH` in `.env` to a Netscape-format cookies file exported from a logged-in browser session.

## Environment Variables

Copy `.env.example` to `.env.local` and set:
- `NEXT_PUBLIC_APP_URL` — your production domain (used in metadata + sitemap)
- `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS` — tune rate limits
- `YTDLP_PATH` — override yt-dlp binary location
- `YTDLP_COOKIES_PATH` — enable private video support
