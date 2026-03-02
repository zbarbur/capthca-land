# Deployment — Build, Staging, Production

## Pipeline Overview

Every change follows this pipeline — no shortcuts.

```
lint → typecheck → test → build → deploy staging → verify → deploy production
```

Automate each stage. Never run raw cloud commands directly — always use deploy scripts that encapsulate the pipeline steps and safety checks.

## Docker: Multi-Stage Build

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production=false

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build-time env vars (NEXT_PUBLIC_*) must be ARGs
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### Docker Rules

- **No symlinks in build context** — Docker COPY follows symlinks differently across builders. Copy real files.
- **No secrets in images** — Never `COPY .env` or bake secrets as ENV. Pass secrets at runtime via environment variables or secret mounts.
- **Standalone output** — Enable `output: "standalone"` in `next.config.js` to produce a self-contained `server.js` with only needed dependencies.
- **Multi-stage** — Keep final image minimal. Only copy build artifacts into the runner stage.
- **`.dockerignore`** — Exclude `node_modules/`, `.git/`, `test/`, `.env*`, `docs/`.

## Build-Time vs Runtime Environment Variables

| Type | When resolved | How to set | Example |
|---|---|---|---|
| `NEXT_PUBLIC_*` | Build time | Docker ARG → ENV | `NEXT_PUBLIC_FIREBASE_CONFIG` |
| Server-only vars | Runtime | Cloud Run env vars / Secret Manager | `DATABASE_URL`, `API_SECRET` |

`NEXT_PUBLIC_*` variables are inlined into the client bundle at build time. If you set them at runtime, the client bundle will have the build-time values (or empty strings). This is the most common deployment bug in Next.js projects.

```yaml
# cloudbuild.yaml — pass build-time vars as substitutions
steps:
  - name: gcr.io/cloud-builders/docker
    args:
      - build
      - --build-arg=NEXT_PUBLIC_API_URL=${_API_URL}
      - -t=gcr.io/$PROJECT_ID/myapp:$COMMIT_SHA
      - .
```

## Cloud Run Deployment

### Requirements

- Bind to `0.0.0.0` (not `localhost`) — Cloud Run routes traffic to the container's `PORT`
- Read port from `PORT` env var (Cloud Run sets this automatically)
- Stateless — no local filesystem persistence between requests
- Ephemeral filesystem — writes to disk are lost on container recycling

### Blue/Green Deployment

```bash
# Deploy new revision with no traffic
gcloud run deploy myapp \
  --image=gcr.io/PROJECT/myapp:TAG \
  --no-traffic \
  --region=us-central1

# Verify the new revision
curl -H "Host: myapp.example.com" https://NEW_REVISION_URL/api/health

# Route traffic to new revision
gcloud run services update-traffic myapp \
  --to-latest \
  --region=us-central1
```

**First deploy gotcha:** `--no-traffic` fails if the service does not yet exist (no previous revision to serve traffic). Detect this and use a normal deploy for the first time:

```bash
if ! gcloud run services describe myapp --region=us-central1 &>/dev/null; then
  # First deploy — no --no-traffic
  gcloud run deploy myapp --image=IMAGE --allow-unauthenticated
else
  # Subsequent deploys — blue/green
  gcloud run deploy myapp --image=IMAGE --no-traffic
fi
```

## Staging-First Rule

**Never deploy directly to production.** Every change goes through staging first.

1. Deploy to staging with the same image tag
2. Run smoke tests against staging
3. Manually verify key user flows if UI changed
4. Deploy the verified image to production

The staging environment must mirror production in every way except data volume and domain. Same Cloud Run config, same env var structure, same secret references.

## Cloud Build Patterns

### Substitutions

```yaml
substitutions:
  _DEPLOY_ENV: staging
  _TAG: latest

steps:
  - name: gcr.io/cloud-builders/docker
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/myapp:${_TAG}', '.']
```

**Gotcha:** `$COMMIT_SHA` is only available in trigger-based builds, not manual `gcloud builds submit`. Use a `_TAG` substitution for manual builds.

### Shell Variable Escaping

In `cloudbuild.yaml`, use `$$` to escape shell variables:

```yaml
- name: bash
  script: |
    RESULT=$$(curl -s https://example.com)
    echo "$$RESULT"
```

### Step Dependencies and Parallelism

```yaml
steps:
  - id: lint
    name: node:20
    script: npm run lint
  - id: typecheck
    name: node:20
    script: npm run typecheck
  - id: test
    name: node:20
    script: npm test
    waitFor: ['lint', 'typecheck']  # run after lint+typecheck, which run in parallel
  - id: build
    name: gcr.io/cloud-builders/docker
    waitFor: ['test']
```

## Kaniko Caching

Use Kaniko for faster Docker builds in Cloud Build by caching layers:

```yaml
- name: gcr.io/kaniko-project/executor
  args:
    - --destination=gcr.io/$PROJECT_ID/myapp:$COMMIT_SHA
    - --cache=true
    - --cache-ttl=72h
```

## Rollback Procedures

### Cloud Run Rollback

```bash
# List revisions
gcloud run revisions list --service=myapp --region=us-central1

# Route 100% traffic to a previous revision
gcloud run services update-traffic myapp \
  --to-revisions=myapp-00042-abc=100 \
  --region=us-central1
```

### Rollback Decision Criteria

- Error rate exceeds 1% (baseline)
- Latency p99 exceeds 2x normal
- Health check failures
- Critical user flow broken

Rollback first, investigate second. Restoring service takes priority over understanding the bug.

## Deploy Scripts vs Raw Commands

**Always use deploy scripts.** Never run raw `gcloud run deploy` or `gcloud builds submit` manually.

Deploy scripts encapsulate:
- Pre-deploy CI checks (lint, typecheck, test)
- Correct substitution values
- Image tagging conventions
- Blue/green logic
- Post-deploy verification
- Rollback instructions on failure

```bash
# GOOD
bin/deploy-staging.sh dashboard

# BAD
gcloud run deploy myapp-staging --image=gcr.io/PROJECT/myapp:latest --region=us-central1
```

## `.gcloudignore` vs `.dockerignore`

These serve different purposes:
- `.dockerignore` — Files excluded from Docker build context
- `.gcloudignore` — Files excluded from `gcloud builds submit` upload

CI needs `test/` and `.gitignore` in the upload even though Docker does not need them in the build context. Keep these files aligned but not identical.

## Infrastructure as Code (IaC)

IaC is not required on day one — you can start with manual setup and deploy scripts. But as infrastructure grows beyond a handful of resources, managing it manually becomes error-prone and unreproducible. Plan for IaC as an early-to-mid project milestone.

### When to Adopt IaC

| Stage | Approach | When it breaks down |
|-------|----------|-------------------|
| Sprint 1-3 | Manual setup + deploy scripts | Works fine for 1-2 services |
| Sprint 4-8 | Growing pain — secrets, IAM, DNS, multiple envs | Manual drift between staging/prod, forgotten config |
| Sprint 8+ | IaC | Reproducible, reviewable, recoverable |

**Signals you need IaC now:**
- You've manually configured something in staging that you forgot to replicate in production
- A team member can't recreate the infrastructure from documentation alone
- You have more than 5 cloud resources (services, databases, buckets, secrets, DNS records)
- You need a third environment (dev, staging, production)

### Tool Recommendation: OpenTofu

We recommend **[OpenTofu](https://opentofu.org/)** over Terraform for new projects:

- **License:** OpenTofu is MPL 2.0 (genuinely open source). Terraform switched to BSL 1.1 in August 2023, which restricts "competitive use" — an unpredictable liability for projects that may evolve in unexpected directions.
- **Compatibility:** OpenTofu is a 1:1 drop-in fork. Same HCL syntax, same state files, same provider ecosystem. Migration between the two is trivial.
- **Governance:** OpenTofu is under the Linux Foundation with open community governance. Terraform is controlled by HashiCorp/IBM.
- **Ecosystem:** All major cloud providers (GCP, AWS, Azure) have OpenTofu-compatible providers.

Other viable options: **Pulumi** (TypeScript-native IaC, good for teams that prefer code over HCL), **CDK for Terraform** (TypeScript wrapper over HCL), or cloud-native tools like **Google Cloud Deployment Manager**.

### What to Manage with IaC

**Start with these (high-value, low-effort):**
- Cloud Run service definitions (CPU, memory, scaling, env vars)
- Secret Manager secrets and IAM bindings
- Artifact Registry repositories
- IAM service accounts and role bindings

**Add later as complexity grows:**
- DNS records and SSL certificates
- Cloud Build triggers
- VPC networks and firewall rules
- Database instances (Firestore indexes, Cloud SQL)
- Monitoring dashboards and alert policies

**Keep out of IaC (manage manually or via scripts):**
- Secret *values* (IaC manages the secret resource, not its content)
- One-time setup tasks (initial project creation, billing)
- Data migrations

### IaC Project Structure

```
infra/
├── main.tf              # Provider config, backend state
├── variables.tf         # Input variables (project ID, region, env)
├── cloud-run.tf         # Service definitions
├── secrets.tf           # Secret Manager resources + IAM
├── iam.tf               # Service accounts and bindings
├── artifact-registry.tf # Container registry
├── environments/
│   ├── staging.tfvars   # Staging variable values
│   └── production.tfvars # Production variable values
└── README.md            # Setup instructions
```

### IaC Ground Rules

1. **State in remote backend** — Never store `.tfstate` locally. Use GCS bucket with versioning enabled.
2. **Environment parity** — Same modules for staging and production, different `.tfvars` files.
3. **No secrets in state** — Use `sensitive = true` for secret references. Rotate state encryption keys.
4. **Plan before apply** — Always `tofu plan` and review before `tofu apply`. In CI, plan on PR, apply on merge.
5. **Import before rewrite** — If resources already exist manually, `tofu import` them rather than destroying and recreating.

## Project Infrastructure Checklist

Use this checklist when setting up a new project's infrastructure. Not everything is needed on day one — items are ordered by typical adoption timeline.

### Sprint 1 — Minimum Viable Infrastructure
- [ ] Source control repository (GitHub)
- [ ] Local development environment (`bin/local-stack.sh`)
- [ ] CI pipeline (lint + typecheck + test on every push)
- [ ] Package manager and dependency lockfile

### Sprint 2-3 — First Deployment
- [ ] Docker multi-stage build working locally
- [ ] Artifact Registry / container registry set up
- [ ] Cloud Run staging service deployed
- [ ] Deploy scripts (`bin/deploy-staging.sh`)
- [ ] Staging URL accessible
- [ ] Secrets in Secret Manager (not env files or hardcoded)

### Sprint 4-6 — Production Readiness
- [ ] Production environment mirroring staging config
- [ ] Blue/green deployment with `--no-traffic` + traffic routing
- [ ] Custom domain + SSL certificate
- [ ] Production deploy script with confirmation prompt
- [ ] Health check endpoint (`GET /health`)
- [ ] Error tracking / structured logging

### Sprint 6-10 — Operational Maturity
- [ ] Monitoring dashboards (request rate, error rate, latency)
- [ ] Alerting on error rate spikes and health check failures
- [ ] Secret rotation procedure documented and tested
- [ ] Backup and recovery procedure for stateful data
- [ ] Load testing baseline established
- [ ] Artifact cleanup policy (prune old container images)

### Sprint 10+ — Scale & Governance
- [ ] Infrastructure as Code (OpenTofu / Pulumi)
- [ ] Separate IAM service accounts per service
- [ ] Network security (VPC, firewall rules if applicable)
- [ ] Cost monitoring and budget alerts
- [ ] Disaster recovery plan documented
- [ ] Compliance requirements addressed (if applicable)
