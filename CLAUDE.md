# {{PROJECT_NAME}} — Project Rules

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

## Code Style

- Biome v2 for linting/formatting (tabs, double quotes, trailing commas)
- Use `--write` not `--apply` (removed in Biome v2)
- Test runner: Node.js built-in (`node --test`), not vitest/jest
- Dashboard: Next.js 14 App Router at `dashboard/`
- Middleware runs in Edge Runtime (Web Crypto API only, no Node.js `crypto`)
- Standalone output enabled for Docker builds
- Exclude from Biome: `dashboard/app/globals.css`, `dashboard/components/ui`
