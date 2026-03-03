---
name: deploy
description: Deploy to local, staging, or production environments. Manages the full lifecycle including pre-flight checks, build, deploy, smoke tests, and demo data generation.
---

# Deploy Skill

You are managing deployment for CAPTHCA land. The user invoked `/deploy $ARGUMENTS`.

## Determine Target

Parse the first argument to determine the deployment target:

| Argument | Target | Script |
|----------|--------|--------|
| `local` or `dev` | Local development stack | `bin/local-stack.sh start` |
| `local-prod` or `prod-mode` | Local production mode (for perf testing) | `bin/local-stack.sh start-prod` |
| `stop` | Stop local stack | `bin/local-stack.sh stop` |
| `status` | Show running services | `bin/local-stack.sh status` |
| `staging` or `stg` | Cloud staging environment | `bin/deploy-staging.sh` |
| `production` or `prod` | Cloud production environment | `bin/deploy-production.sh` |
| `demo` | Generate/refresh demo data | `bin/gen-demo.sh` |
| (empty) | Show this help and ask which target | — |

## Pre-Flight Checks (all targets except local/stop/status)

Before deploying, verify:

1. **Git state**: Run `git status` and `git branch --show-current`
   - Warn if uncommitted changes exist
   - Warn if not on expected branch (main for production, sprint branch for staging)
   - Show last commit message for confirmation

2. **CI gate**: Run `npm run ci`
   - If lint fails: attempt `npx biome check --write .` to auto-fix, then re-run
   - If typecheck fails: show the errors and suggest fixes
   - If tests fail: show failing test names and ask whether to proceed or fix first
   - For `--skip-checks` argument, skip this step but warn

3. **Environment check**:
   - Verify required env vars are set for the target environment
   - For staging/production: check that deploy scripts exist and are executable

## Deployment Execution

### Local (`/deploy local`)
```
bin/local-stack.sh start
```
- After starting, verify the service is accessible at the expected port
- Show the URL to open
- If port is already in use, offer to stop existing and restart

### Local Production Mode (`/deploy local-prod`)
```
bin/local-stack.sh start-prod
```
- Remind the user this is for performance testing only
- After build completes, show the URL
- Note: dev mode adds 10-20s per page due to compilation + React Strict Mode double-mounting

### Staging (`/deploy staging`)
```
bin/deploy-staging.sh [service]
```
- Run pre-flight checks first
- Execute the deploy script
- After deploy, if a staging URL is configured, run a basic health check: `curl -s STAGING_URL/api/health`
- Report: deploy status, URL, revision info

### Production (`/deploy production`)
```
bin/deploy-production.sh [service]
```
- **Extra safety**: Confirm with the user before proceeding
- Verify staging was deployed recently (check git log for deploy commits)
- Run pre-flight checks
- Execute the deploy script (it has its own confirmation prompt)
- After deploy, verify health check
- Watch for error spikes in the first 2 minutes

### Demo Data (`/deploy demo`)
```
bin/gen-demo.sh $1
```
- Pass through any arguments (--count, --dry-run, --prefix)
- After generation, report: how many records created, any errors
- Remind about write verification (count check + spot check)

## Post-Deploy Verification

After staging or production deploy:

1. **Health check**: `curl -s $URL/api/health` — expect 200
2. **Smoke test**: If `bin/api-smoke-test.sh` or `test/live/` exists, offer to run it
3. **Error check**: Suggest checking logs for errors in the first few minutes
4. **Report**: Summarize what was deployed, to where, at what time

## Error Recovery

If deployment fails:
- Show the full error output
- Diagnose common issues:
  - Docker build failure → check Dockerfile, missing deps, symlinks
  - Permission denied → check IAM, service account roles
  - Secret not found → check Secret Manager IAM bindings
  - Port in use (local) → offer to kill existing process
- Suggest specific fixes based on error message
- Reference `docs/GOTCHAS.md` for known deployment issues
- For production failures, suggest rollback: `/rollback`

## Important Rules

- NEVER use raw `gcloud run deploy` or `gcloud builds submit` — always use deploy scripts
- NEVER deploy to production without staging first
- NEVER skip CI checks without explicit user confirmation
- ALWAYS report the deployment result clearly
