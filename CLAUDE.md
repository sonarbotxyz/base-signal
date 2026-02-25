# CLAUDE.md — Base Signal Redesign

## Project
Base Signal — a personalized intelligence feed for the Base ecosystem. Users discover projects, watch the ones they care about, and get notified via Telegram when milestones happen.

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Framer Motion for animations
- Privy for auth (wallet optional, email/social login)
- Supabase (Postgres) for data
- Viem for on-chain interactions
- shadcn/ui components (restyle heavily, never use defaults)

## Design Direction
Read DESIGN.md for the full brief. Key points:

### Layout
- **Main feed = ranked list** (NOT grid). Horizontal rows with: logo thumbnail + project name + one-line description + upvote count + watcher count + category tags + [Watch] button
- **My Signal dashboard = card grid** of watched projects + alert feed
- **Upcoming section = visual cards** with banners and countdown timers
- Dark mode ONLY. Background #0C0C0E, surface #16161A, primary accent Base blue #0052FF

### Typography
- Space Grotesk for brand/logo
- Inter for all UI text
- JetBrains Mono for numbers/metrics
- Import from Google Fonts

### Color Palette
- Background: #0C0C0E
- Surface: #16161A
- Surface hover: #1E1E24
- Border: #2A2A32
- Primary (Base Blue): #0052FF
- Success: #00D897
- Danger: #FF4466
- Gold (tokens): #FFB800
- Text primary: #F5F5F5
- Text secondary: #8B8B9A
- Text tertiary: #56566B

### Key UX
- 👀 Watcher count on every project (social proof)
- [Watch] is the primary CTA, upvote (▲) is secondary
- Free to browse, watch, upvote. No token costs for basic actions
- Token balance shown in nav only when wallet connected
- "🔥 Hot" badge for trending velocity
- Category pills with muted backgrounds
- Subtle hover animations (2px lift + shadow)

### What NOT to do
- No gradient blobs, no "trusted by" bars, no SaaS feature grids
- No light mode
- No mandatory wallet connection
- No empty states — always show something
- No generic AI/crypto marketing speak in the UI

## Pages to Build (Priority Order)

### P0 — This Build
1. **Homepage Feed** — Ranked list of projects with trending/new/categories tabs
2. **Project Detail Page** — Banner, description, milestones, stats, watch button, discussion
3. **My Signal Dashboard** — Watched projects grid + alert feed + notification preferences
4. **Upcoming Section** — Pre-launch projects with countdowns + notify button

### Existing Code
There's an existing codebase with API routes and pages. Preserve all API functionality but completely redesign the frontend. The API routes under /api/ should be kept and extended as needed. Existing database schema in Supabase should be preserved.

## Build Commands
- `npm run dev` — Development server
- `npm run build` — Production build (run before reporting done)
- `npm run lint` — Linting

## Commits
- Commit frequently with clear messages
- Use conventional commits: feat:, fix:, style:, refactor:
