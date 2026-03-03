# Squad Planning Guide — CAPTHCA land

## Overview

In agentic scrum, **specialist agents** serve as your team. Each agent brings deep domain expertise to specific types of tasks. This guide helps you compose the right squad for your project and assign the right specialist to each task.

---

## Available Specialists

| Specialist | Domain | Core Tools & Skills | Assign When |
|-----------|--------|-------------------|-------------|
| `node-architect` | System design, backend logic, data models | TypeScript, Node.js, database design, system architecture | Designing core modules, data schemas, system integration, complex business logic |
| `frontend-developer` | UI/UX implementation, client-side logic | React/Next.js, CSS, component architecture, state management | Building pages, components, forms, client-side validation, responsive layout |
| `api-designer` | API contracts, endpoint design | REST/GraphQL, OpenAPI, request/response design, versioning | Defining new endpoints, API refactoring, contract-first development |
| `devops-engineer` | Infrastructure, CI/CD, deployment | Docker, cloud platforms, CI pipelines, monitoring, shell scripting | Build pipelines, deployment scripts, infrastructure provisioning, monitoring setup |
| `devsecops-expert` | Security hardening, auth, secrets | Auth protocols, encryption, secrets management, security headers | Auth flows, token systems, secrets rotation, security middleware, input validation |
| `security-auditor` | Vulnerability assessment, compliance | Threat modeling, penetration testing, audit checklists | Security reviews, audit reports, vulnerability triage, compliance checks |
| `architect-reviewer` | Cross-cutting review, consistency | Architecture patterns, code review, technical debt assessment | Sprint reviews, design reviews, refactoring decisions, technical debt prioritization |

---

## Squad Composition by Project Type

### Full-Stack Web Application
```
Primary:   node-architect, frontend-developer, api-designer
Support:   devops-engineer, devsecops-expert
Review:    architect-reviewer, security-auditor
```

### Infrastructure / Platform
```
Primary:   devops-engineer, node-architect
Support:   devsecops-expert
Review:    architect-reviewer, security-auditor
```

### Security Hardening Sprint
```
Primary:   devsecops-expert, security-auditor
Support:   node-architect, api-designer
Review:    architect-reviewer
```

### API-First Service
```
Primary:   api-designer, node-architect
Support:   devops-engineer, devsecops-expert
Review:    architect-reviewer
```

### Frontend Overhaul
```
Primary:   frontend-developer
Support:   api-designer, node-architect
Review:    architect-reviewer
```

---

## Multi-Role Tasks

Some tasks require expertise from multiple domains. Use the `+` syntax in the Specialist field of your task spec:

```markdown
**Specialist:** devsecops-expert + api-designer
```

This means the task requires security expertise combined with API design knowledge. The agent executing the task should apply both lenses.

### Common Multi-Role Combinations

| Combination | Use Case |
|------------|----------|
| `node-architect + api-designer` | New service with API surface |
| `frontend-developer + devsecops-expert` | Auth UI (login, token management) |
| `devops-engineer + devsecops-expert` | Secrets management, secure deployment |
| `node-architect + devops-engineer` | Database migration, infrastructure-aware refactoring |
| `api-designer + security-auditor` | API security review, auth endpoint design |

---

## Assignment Guidelines

### Match Complexity to Expertise

| Task Complexity | Specialist Level |
|----------------|-----------------|
| **S** (Small) — config change, minor fix | Any relevant specialist |
| **M** (Medium) — new endpoint, new component | Domain specialist required |
| **L** (Large) — new subsystem, cross-cutting change | Primary + support specialists, architect review |

### When to Escalate to Review

Always assign `architect-reviewer` when:
- A task touches 3+ modules or layers
- A new architectural pattern is being introduced
- A dependency is being added or removed
- A significant refactoring is proposed

Always assign `security-auditor` when:
- Auth or authorization logic changes
- New API endpoints are exposed
- User input handling changes
- Secrets or credentials are involved
- New external integrations are added

---

## Integration with Task Template

The `Specialist` field in `TASK_TEMPLATE.md` should reference one or more specialists from this guide:

```markdown
### T{N}.{M} — Task Title
- **Specialist:** node-architect
- **Complexity:** M
```

Or for multi-role:

```markdown
### T{N}.{M} — Task Title
- **Specialist:** devsecops-expert + api-designer
- **Complexity:** L
```

---

## Growing Your Squad

As your project evolves, you may need additional specialists. To define a new specialist:

1. **Name:** Short, hyphenated identifier (e.g., `data-engineer`)
2. **Domain:** What area of expertise they cover
3. **Tools & Skills:** Specific technologies and patterns they know
4. **Assignment criteria:** When to assign tasks to this specialist

Add them to the specialists table above and reference them in task specs.

### Example Custom Specialists

| Specialist | Domain | When to Assign |
|-----------|--------|---------------|
| `data-engineer` | Data pipelines, ETL, analytics | Data processing, reporting, aggregation tasks |
| `mobile-developer` | iOS/Android, React Native | Mobile app features, platform-specific code |
| `ml-engineer` | Machine learning, model deployment | ML features, model training, inference pipelines |
| `technical-writer` | Documentation, API docs | User-facing docs, API reference, guides |
