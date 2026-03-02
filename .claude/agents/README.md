# Specialist Agent Definitions

Source: [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents)

These agent definitions configure Claude Code's specialist subagents for this project.
Each file defines a role with specific expertise, available tools, and usage guidelines.

## Available Specialists

| Agent | File | Domain |
|-------|------|--------|
| Node Architect | `node-architect.md` | System design, Node.js/TS patterns, performance |
| Frontend Developer | `frontend-developer.md` | React/Next.js, UI/UX, client-side logic |
| API Designer | `api-designer.md` | REST/GraphQL, OpenAPI, request/response schemas |
| DevOps Engineer | `devops-engineer.md` | CI/CD, Docker, cloud infrastructure |
| DevSecOps Expert | `devsecops-expert.md` | Security in SDLC, auth systems, threat modeling |
| Security Auditor | `security-auditor.md` | Read-only review, vulnerability assessment |
| Architect Reviewer | `architect-reviewer.md` | Cross-cutting design review, pattern validation |

## Usage in Task Templates

The `Specialist` field in `docs/process/TASK_TEMPLATE.md` maps directly to these roles:

- **Single specialist:** `node-architect`
- **Multi-role task:** `frontend-developer + api-designer`

## Adding Custom Specialists

Create a new `.md` file in this directory following the same structure:
1. Expertise summary
2. Responsibilities list
3. Available tools
4. When to assign
5. Key principles
