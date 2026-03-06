# CAPTHCA land — Project Rules

## Required Project Scripts — USE THESE, NOT RAW COMMANDS

Before running any infrastructure, dev, or management command, check this list first.

### Local Development
- **Start/stop dev environment**: `bin/local-stack.sh start|stop|status`
  - NEVER use `npm run dev`, `lsof -ti:PORT`, or manual `kill` to manage the dev stack
- **Test API endpoints locally**: `bin/api-test.sh /api/path` (auto-generates auth header)
  - Example: `bin/api-test.sh /api/resource?limit=5`
  - Example: `bin/api-test.sh -X POST /api/resource -d '{"name":"Test"}'`

### Deployment
- **Deploy to staging**: `bin/deploy-staging.sh [service] [--skip-checks]`
  - NEVER use raw `gcloud run deploy` or `gcloud builds submit`
- **Deploy to production**: `bin/deploy-production.sh [service]`

### Testing & Quality
- **Run tests**: `npm test` (uses `node --test --import tsx`, NOT vitest/jest)
- **Full CI check**: `npm run ci` (lint + typecheck + test)
- **Lint only**: `npm run lint` (Biome v2)
- **Typecheck only**: `npm run typecheck`

### Data & Utilities
- **Generate demo data**: `bin/gen-demo.sh`

## Bug Tracking

- **Report a bug**: `/report-bug [description]` — creates a GitHub issue or appends to KANBAN.md
- **Fix a bug**: `/fix-bug <issue-number|search-text>` — fetches issue, investigates, proposes fix, implements after approval
- **Tracker config**: `.claude/project.json` — set `tracker.type` to `"github"` or `"none"`
- When `tracker.type` is `"github"`, bugs are tracked as GitHub issues with severity labels
- When `tracker.type` is `"none"` or the file is missing, bugs fall back to KANBAN.md entries
- Sprint start includes bug triage; sprint end includes issue reconciliation

## Content System — IMPORTANT

All landing page copy and design direction lives in `content/`. This is the **single source of truth** for what appears on the site.

- **Read `content/CONTENT_SYSTEM.md`** before touching any page copy
- **`content/light/`** and **`content/dark/`** contain section-by-section markdown files with YAML frontmatter
- **`content/home/duality-slider.md`** defines the slider/home page content
- **`content/shared/meta.md`** defines SEO metadata and page titles
- **`content/research/`** contains research briefs that support the copy — reference these for fact-checking

### Content → Dashboard Workflow

When updating dashboard pages (`dashboard/app/light/page.tsx`, `dashboard/app/dark/page.tsx`, etc.):
1. Read the corresponding `content/` files FIRST
2. Use the **body text** as the exact copy (do not paraphrase or rewrite)
3. Follow **`design_notes`** in frontmatter for layout, typography, and animation direction
4. Follow **`layout_hint`** for component choices (`standard`, `hero`, `split`, `centered`)
5. Use **`sources`** in frontmatter to add attribution where appropriate
6. Respect content markers: `{highlight}`, `{table}`, `{alert}`, `{quote}` → map to appropriate React components
7. Images are referenced by filename — serve from `/tracks/{track}/assets/` in `public/`

### Rules
- **NEVER rewrite content** — the copy in `content/` has been researched and refined; implement it verbatim
- **Design notes are instructions**, not suggestions — follow them
- **When content files change**, regenerate the affected dashboard pages to match
- If something in the content seems wrong, flag it — don't silently fix it

## Code Style

- Biome v2 for linting/formatting (tabs, double quotes, trailing commas)
- Use `--write` not `--apply` (removed in Biome v2)
- Test runner: Node.js built-in (`node --test`), not vitest/jest
- Dashboard: Next.js 14 App Router at `dashboard/`
- Middleware runs in Edge Runtime (Web Crypto API only, no Node.js `crypto`)
- Standalone output enabled for Docker builds
- Exclude from Biome: `dashboard/app/globals.css`, `dashboard/components/ui`
