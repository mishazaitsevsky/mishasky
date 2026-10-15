# mishasky.net — Project Overview

## What this is
A portfolio site for Misha Zaitsevsky (mishasky.net), a design technologist. Built in Next.js 16 (App Router), TypeScript, Tailwind. No component library — everything is hand-coded inline styles or global CSS in SiteShell.tsx.

## Three themes
- **Standard** — rounded, clean, card-based grid
- **Brutalist** — hard borders, flat shadows, `bp-outer` grid layout
- **Gameboy** — physical Game Boy shell rendered in CSS/SVG, cards as cartridges

Theme cycles via `cycleTheme()` in SiteShell.tsx. All state lives in SiteShell.

## Project data
`src/lib/projects.ts` — single source of truth. Key fields:
- `thumb` — used by gameboy + brutal themes
- `thumbGameboy` — gameboy-only override
- `thumbStandard` — standard-only override
- `thumbBlend` — CSS mix-blend-mode for standard card image
- `cardBg`, `cardTextColor` — standard card color overrides
- `thumbBg` — fallback background

## Key files
- `src/components/SiteShell.tsx` — everything: state, all three theme renders, chat system, project overlays
- `src/components/GameboyShell.tsx` — gameboy theme component
- `src/lib/projects.ts` — project content
- `src/app/globals.css` — global styles + responsive grid

## Current projects (in order)
1. Shrapnel — GAMING, design system (yellow card, Shrapnel_thumb)
2. Funko — POP CULTURE, DTC e-commerce
3. Kiro — TECHNOLOGY, Agents Assistants & Chatbots (yellow, Alexa face illustration)
4. Amazon — TECHNOLOGY, Illustration at Scale
5. Sony/VMware — IOT, VMware Interactive Digital Wall (blue, split-gradient card)
6. Microsoft — ENTERPRISE
