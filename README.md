# EuroVisaCalculator

Track your Schengen 90/180-day visa allowance across multiple travelers. Free, no account required.

**Live:** [eurovisacalculator.com](https://eurovisacalculator.com)

---

## What it does

The Schengen Area allows non-EU/EEA nationals a maximum of 90 days in any rolling 180-day window. This tool implements that rule and lets you:

- Track multiple travelers (couples, families, groups) simultaneously
- Add past, current, and planned Schengen trips
- See days used, days remaining, and earliest re-entry dates in real time
- Switch between a **Timeline** view and a **Cards** view
- Share your current state with anyone via a URL — no account, no backend

All trip data lives in your browser (URL + local storage). Nothing is sent to a server.

---

## Tech stack

| Layer | Tech |
|---|---|
| Framework | [Astro](https://astro.build) (static pages) + React 19 (interactive calculator) |
| UI | [Material UI v7](https://mui.com) + Emotion |
| Routing | React Router v7 (within the `/app` island) |
| Date logic | date-fns v4 |
| Language | TypeScript |
| Testing | Vitest |
| Build | Astro (wraps Vite) |

---

## Project structure

```
astro/
  layouts/BaseLayout.astro     # HTML shell, SEO meta tags, fonts
  pages/
    index.astro                # Landing page (/)
    app.astro                  # Calculator shell (/app)
    privacy.astro              # Privacy policy (/privacy)
  components/LandingNav.astro  # Frosted-glass nav for static pages

src/
  app/
    App.tsx                    # React root — ThemeProvider + RouterProvider
    router.tsx                 # React Router config
  pages/
    CalculatorPage/            # Main interactive calculator
    SharedPage.tsx             # Read-only shared view (/shared/:token)
    NotFoundPage.tsx           # 404 fallback
  features/
    calculator/utils/          # Schengen rule logic, date helpers
    sharing/                   # URL encoding/decoding for shareable links
  components/ui/               # Reusable MUI-based UI primitives
  islands/
    CalculatorIsland.tsx       # Astro island wrapper (client:only)
  styles/theme.ts              # MUI theme + design tokens
  types/index.ts               # Shared TypeScript types
```

---

## Routes

| Path | Description |
|---|---|
| `/` | Marketing landing page |
| `/app` | Interactive calculator |
| `/shared/:token` | Read-only shared view (decoded from URL token) |
| `/privacy` | Privacy policy |

---

## Getting started

```bash
npm install
npm run dev       # Start dev server at localhost:4321
npm run build     # Production build
npm run preview   # Preview production build locally
npm run test      # Run Vitest unit tests
npm run lint      # ESLint
```

---

## How the Schengen rule works

The 90/180 rule is a **rolling window**, not a calendar year. On any given day, the tool looks back 180 days and counts how many of those days were spent in the Schengen Area. If the count is at or above 90, entry is not permitted.

The calculation logic lives in `src/features/calculator/utils/schengen.ts` and is verified against the [official EU Visa Calculator](https://ec.europa.eu/assets/home/visa-calculator/calculator.htm).

---

## Sharing

The "Share" button encodes the current traveler and trip state into a compressed URL token. Anyone with the link can view (but not edit) the same data. No data is stored on any server.
