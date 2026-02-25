# REBUILD PLAN — Base Signal Frontend

## What's Wrong Right Now

### Critical Issues
1. **Mobile is broken** — Header hides nav items, no hamburger menu, cards probably overflow. No mobile testing done.
2. **Using emoji unicode in UI** (🔥 👀) — looks amateur, inconsistent across platforms. Use proper icons or styled text.
3. **Lost pages from previous version** — curation, docs, leaderboard, submit pages weren't redesigned, just left as old code
4. **No real navigation** — Header tabs (Trending/New/Upcoming) don't link anywhere, they're local state buttons
5. **No page structure** — Homepage has no hero/intro, just dumps straight into a grid. No context for new visitors.
6. **Cards are same-height gradient boxes** — They all look identical. No visual variety. No personality.
7. **No sidebar/secondary content** — Just a flat grid. No ecosystem stats, no trending section, no "coming soon" preview.

### Design Issues
1. **Not Bubbble-level** — Bubbble has varied card content (different images, different layouts), gamification built into cards, a premium upgrade card that breaks the grid, diverse visual content
2. **Category pills look basic** — Gradient pills on filter bar, but the actual cards have tiny muted category labels
3. **No real visual hierarchy** — Everything is the same size, same weight, same importance
4. **The gradient banners are boring** — Just a flat gradient with a giant letter. No texture, no depth, no character.
5. **No featured/hero section** — Bubbble has that golden premium card that breaks the pattern. We need something similar for featured projects.

### Missing Features
1. **Mobile hamburger menu** with search
2. **Proper link routing** — tabs should route to actual pages
3. **Footer** — Every real product has a footer
4. **Loading states** — No skeletons, no shimmer
5. **Project cards should link to /project/[id]** — currently no Link wrapper

## The Rebuild — Component by Component

### 1. Layout Shell (layout.tsx + Header + Footer)
- **Header**: Logo | Search (expandable on mobile) | Nav links (not buttons) | My Signal | Connect
- **Mobile header**: Logo | hamburger menu → slide-out with all nav + search
- **Footer**: Logo, links (About, Submit, API, Docs), social links, "Built on Base" badge
- All nav links use Next.js Link, route to real pages

### 2. Homepage (page.tsx)
Structure (top to bottom):
a) **Hero section** — Minimal. One line: "Discover what's building on Base" + search bar. Dark, clean, not a generic SaaS hero.
b) **Featured project** — ONE highlighted card, wider than the grid (full-width or 2-col span), with richer content (banner image, longer description, key metric). Changes daily/weekly.
c) **Filter bar** — Category pills + sort options (Trending/New/Top)
d) **Project grid** — 3 columns desktop, 2 tablet, 1 mobile. Cards with proper visual hierarchy.
e) **Sidebar** (desktop only, right side) — "Launching Soon" preview (2-3 upcoming), ecosystem stats, "Submit a project" CTA

### 3. Card Design (the most important part)
Each card must feel unique even with placeholder data:
- **Banner area**: Category-specific gradient BUT with subtle noise texture, organic shapes (not flat). Different pattern per project (use project ID as seed for slight variation)
- **Project initial**: Large, but translucent watermark — not the center of attention
- **Card content**: 
  - Project name (bold, 15px)
  - One-line desc (muted, 13px)
  - Category tag (colored pill)
  - Stats row: watchers count (icon, not emoji) + upvote button (icon, not emoji)
  - The card IS a link to /project/[id]
- **Hover**: Lift + glow + subtle scale
- **No emojis anywhere** — use Lucide icons (Eye for watchers, ChevronUp for upvotes, Flame for trending)
- **HOT badge**: Styled with icon, not 🔥 emoji

### 4. Mobile Responsive (non-negotiable)
- Cards: single column, full width, proper touch targets (min 44px buttons)
- Header: collapses to logo + hamburger
- Sidebar: moves above or below main content, or becomes horizontal scroll
- Filter pills: horizontal scroll with fade edges
- Touch-friendly: all interactive elements min 44px hit area

### 5. Project Detail Page (/project/[id])
- Back button
- Large banner with gradient
- Project name, description, key links (website, twitter, docs)
- Stats row (upvotes, watchers, category, chain)
- "Watch this project" CTA with milestone preferences modal
- Milestones timeline
- Comments section
- Related projects at bottom

### 6. My Signal Dashboard (/my-signal)
- Requires auth state check
- Alert feed (recent triggered milestones)
- Watched projects grid (smaller cards)
- Notification settings

### 7. Upcoming Page (/upcoming)
- Card grid matching homepage style
- Each card has countdown timer
- "Notify me" button
- Sorted by launch date

### 8. Submit Page (/submit)
- Form: project name, description, category, website, twitter, logo upload
- Token cost indicator (when applicable)
- Preview card showing how it'll look

## Tech Constraints
- Next.js App Router, Tailwind v4, Framer Motion
- Lucide React for ALL icons (no emojis, no heroicons)
- All interactive elements are proper <Link> or <button>
- Every page must work on 375px width (iPhone SE) through 1440px+
- Build must pass (npm run build)
- Commit after each major component

## Order of Operations
1. Layout shell (header with mobile menu + footer)
2. Homepage with hero + featured + grid + sidebar
3. Card component (the core visual)
4. Mobile responsive pass on everything
5. Project detail page
6. Upcoming page
7. My Signal dashboard
8. Final build + deploy
