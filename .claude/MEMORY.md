# {{PROJECT_NAME}} — Project Memory

## Project Purpose
<!-- One sentence: what does this project do and why? -->
{{PROJECT_DESCRIPTION}}

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
<!-- Add patterns as they emerge: auth approach, data model, env vars, etc. -->

## Environments
<!-- Fill in when staging/production are set up -->
| Environment | Dashboard URL | Service Name | Prefix |
|---|---|---|---|
| Staging | TBD | TBD | `stg_` |
| Production | TBD | TBD | `prd_` |

## Sprint Status
- Sprint 1: PLANNING

## Lessons Learned
<!-- Add after each sprint — synthesize from sprint handover docs -->
