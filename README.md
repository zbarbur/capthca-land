# Agentic Scrum Template

A reusable GitHub template repository for building software projects with **Claude Code specialist agents** using sprint-based agile methodology. Start at Sprint 12 maturity, not Sprint 0.

## What This Provides

This template captures 12+ sprints of hard-won engineering knowledge:

- **Process methodology** — Sprint planning, execution, closure checklists, kanban board
- **Specialist agent squad** — 7 pre-defined Claude Code agent roles with clear responsibilities
- **Context management** — Three-layer system (CLAUDE.md + MEMORY.md + PROJECT_CONTEXT.md)
- **Task design system** — Templates with verifiable Definition of Done
- **Engineering guides** — Error handling, security, API design, testing, deployment, data integrity, secrets
- **112+ gotchas** — Categorized lessons from Docker, Cloud Run, CI/CD, TypeScript, security, and more
- **CI/CD templates** — Docker multi-stage builds, Cloud Build pipelines, staging-first deployment
- **Cloud abstractions** — `SecretProvider` and `ObjectStorage` interfaces with local + GCP implementations
- **Coding standards** — Biome v2, TypeScript strict, Node.js built-in test runner
- **Next.js dashboard** — Optional App Router skeleton (deletable if not needed)

## Quick Start

### 1. Use as GitHub Template

Click **"Use this template"** on GitHub, or clone directly:

```bash
git clone https://github.com/your-org/agentic-scrum-template.git my-project
cd my-project
```

### 2. Initialize Your Project

```bash
chmod +x bin/init-project.sh
bin/init-project.sh
```

This will prompt for your project name, slug, env prefix, etc., replace all `{{PLACEHOLDER}}` values, install dependencies, and verify with `npm run ci`.

### 3. Start Sprint 1

```bash
# Read the bootstrap guide
cat docs/process/BOOTSTRAP.md

# Compose your specialist squad
cat docs/process/SQUAD_PLANNING.md

# Follow the sprint start checklist
cat docs/process/SPRINT_START_CHECKLIST.md
```

## Directory Overview

```
├── CLAUDE.md                    # Claude Code project rules (auto-loaded)
├── TODO.md                      # Active sprint tasks only
├── bin/                         # Project scripts (ALWAYS use these)
│   ├── init-project.sh          # Post-clone setup
│   ├── local-stack.sh           # Local dev management
│   ├── deploy-staging.sh        # Staging deploy with CI gate
│   ├── deploy-production.sh     # Production deploy with confirmation
│   ├── api-test.sh              # API testing helper
│   └── gen-demo.sh              # Demo data generation
├── src/                         # Application source
├── lib/cloud/                   # Cloud abstraction layer
│   ├── secrets.ts               # SecretProvider interface + impls
│   └── storage.ts               # ObjectStorage interface + impls
├── dashboard/                   # Next.js 14 skeleton (optional)
├── test/                        # Tests (Node.js built-in runner)
│   ├── example.test.ts
│   ├── infra/                   # Infrastructure tests
│   └── live/                    # Env-var-gated smoke tests
├── docs/
│   ├── process/                 # Methodology & planning
│   │   ├── AGENTIC_SCRUM_MANIFEST.md
│   │   ├── SQUAD_PLANNING.md
│   │   ├── TASK_TEMPLATE.md
│   │   ├── DEFINITION_OF_DONE.md
│   │   ├── SPRINT_START_CHECKLIST.md
│   │   ├── SPRINT_END_CHECKLIST.md
│   │   ├── KANBAN.md
│   │   ├── PROJECT_CONTEXT.md
│   │   ├── CODING_STANDARDS.md
│   │   ├── BOOTSTRAP.md
│   │   └── ISSUE_TEMPLATE.md
│   ├── guides/                  # Engineering knowledge base
│   │   ├── ERROR_HANDLING.md
│   │   ├── SECURITY.md
│   │   ├── API_DESIGN.md
│   │   ├── TESTING.md
│   │   ├── DEPLOYMENT.md
│   │   ├── DATA_INTEGRITY.md
│   │   ├── SECRET_MANAGEMENT.md
│   │   └── CONTEXT_MAINTENANCE.md
│   └── GOTCHAS.md               # 112+ categorized lessons
├── .claude/
│   ├── agents/                  # 7 specialist agent definitions
│   └── MEMORY.md                # Persistent memory skeleton
├── Dockerfile                   # Multi-stage build template
├── cloudbuild.yaml              # CI + staging pipeline
├── cloudbuild-deploy.yaml       # Production deploy pipeline
├── biome.json                   # Biome v2 linter/formatter
├── tsconfig.json                # TypeScript strict config
└── package.json                 # Scripts, devDeps, lint-staged
```

## Customization Guide

### Keep Everything
Best for full-stack web apps with a dashboard, API, and cloud deployment.

### Remove `dashboard/`
If you don't need a Next.js frontend, delete the `dashboard/` directory and remove the dashboard-specific entries from `biome.json`, `tsconfig.json`, and `Dockerfile`.

### Remove Cloud Build Templates
If you're not using GCP Cloud Build, delete `cloudbuild.yaml`, `cloudbuild-deploy.yaml`, and `.gcloudignore`. Adapt `bin/deploy-*.sh` for your CI/CD system.

### Add Your Own Specialists
Create new `.md` files in `.claude/agents/` following the existing format. Reference them in task templates via the `Specialist` field.

## Sprint Workflow

```
1. KANBAN.md (backlog) → select items
2. TODO.md → write task specs using TASK_TEMPLATE.md
3. Create sprint branch: sprint{N}/main
4. Execute tasks (one commit per task)
5. Deploy to staging → verify
6. Sprint end → handover doc → update KANBAN/MEMORY
7. Merge to main via PR
```

## Key Commands

| Command | Purpose |
|---------|---------|
| `npm test` | Run tests (Node.js built-in runner) |
| `npm run ci` | Full CI check (lint + typecheck + test) |
| `npm run lint` | Biome linter |
| `npm run format` | Auto-format with Biome |
| `bin/local-stack.sh start` | Start dev environment |
| `bin/deploy-staging.sh` | Deploy to staging |

## Syncing Template Updates

When the template gets new versions (v1.1, v2.0), projects created from it can selectively adopt improvements.

### First-time setup

```bash
bin/sync-from-template.sh --setup
```

This adds the template as a read-only git remote.

### Check what changed

```bash
bin/sync-from-template.sh                  # report mode — shows what's new
bin/sync-from-template.sh --tag v2.0.0     # compare against specific version
```

Output categorizes every file as `[NEW]`, `[UPDATED]`, or `[SAME]`.

### Adopt changes selectively

```bash
bin/sync-from-template.sh --interactive    # prompted per file: accept / diff / skip
bin/sync-from-template.sh --apply docs/GOTCHAS.md   # accept one specific file
```

You're never forced to take anything. Your project-specific customizations are preserved unless you explicitly accept the template version.

## Philosophy

This template embodies three core beliefs:

1. **Start mature, not from scratch.** Every new project should benefit from lessons already learned.
2. **Agents are team members.** Specialist Claude Code agents have defined roles, responsibilities, and handoff protocols — just like human engineers.
3. **Process is infrastructure.** Sprint checklists, task templates, and context management are as important as the code itself.

## License

MIT — see [LICENSE](LICENSE).
