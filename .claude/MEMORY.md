# CAPTHCA land — Project Memory

## Project Purpose
Dual-narrative landing page for the CAPTHCA identity protocol at capthca.ai. Visitors choose between Light (Symbiotic) and Dark (Post-Biological) tracks via an interactive slider, then sign up with email.

## Project Tools — ALWAYS USE THESE
**STOP and check here before running ANY infrastructure/dev command.**

| Action | Use THIS | NEVER use |
|---|---|---|
| Start/stop dev env | `bin/local-stack.sh start\|stop` | `npm run dev`, `lsof -ti:PORT`, manual kill |
| Deploy staging | `bin/deploy-staging.sh [service]` | raw `gcloud run deploy` |
| Deploy production | `bin/deploy-production.sh [service]` | raw `gcloud builds submit` |
| Tests | `npm test` / `npm run ci` | `vitest`, `jest` |

## Testing
- Test runner: **Node.js built-in** (`node --test`), NOT vitest/jest
- Command: `node --test --import tsx test/*.test.ts test/**/*.test.ts`
- npm script: `npm test`

## Key Project Patterns
- **Theme switching:** CSS variables + body class (`theme-light` / `theme-dark`)
- **Shared components:** Same logic, different skins per track (see `docs/COMPONENT_STRATEGY.md`)
- **Domain:** capthca.ai (DNS manually managed, oclens.capthca.ai is a separate project)
- **Email storage:** Firestore — email + track preference (light/dark)
- **North star metric:** Visitor → email signup conversion rate, segmented by track

## Key Decisions
- Next.js on Cloud Run (not static export) — need SSR for SEO + API routes
- Firestore for email (not Sheets/Supabase) — simplest GCP-native option
- Ship MVP ASAP — prototype already works, real data > more planning
- Biome excludes `app/styles/**/*.css` (Tailwind @apply syntax)
- init-project.sh: file type check uses `grep -qiE "text|json|csv|yaml|xml"` (macOS fix)

## Environments
| Environment | URL | Service Name |
|---|---|---|
| Production | capthca.ai | capthca-land-prod |
| Staging | TBD | capthca-land-staging |

## Sprint Status
- Sprint 0 (Inception): COMPLETE — charter, backlog, context populated
- Sprint 1: NOT STARTED

## Lessons Learned
- macOS `file` command classifies .json as "JSON data" not "text" — broke init script placeholder replacement
