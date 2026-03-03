---
name: rollback
description: Rollback a staging or production deployment to a previous revision. Lists recent revisions, shows context, and executes the rollback.
---

# Rollback Skill

You are rolling back a deployment for {{PROJECT_NAME}}. The user invoked `/rollback $ARGUMENTS`.

## Determine Target

Parse arguments:
- `/rollback` or `/rollback staging` — rollback staging
- `/rollback production` or `/rollback prod` — rollback production (extra confirmation required)

## Gather Context

1. **List recent revisions**:
   ```bash
   gcloud run revisions list --service=SERVICE_NAME --region=REGION --limit=5
   ```

2. **Show current traffic split**:
   ```bash
   gcloud run services describe SERVICE_NAME --region=REGION --format="value(status.traffic)"
   ```

3. **Check recent error logs** (if available):
   ```bash
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=SERVICE_NAME AND severity>=ERROR" --limit=10 --format="table(timestamp,textPayload)"
   ```

4. Present the revision list and ask which revision to rollback to.

## Execute Rollback

1. **Confirm** with the user: "Route 100% traffic to revision X?"
2. For production: require explicit "yes" confirmation

```bash
gcloud run services update-traffic SERVICE_NAME \
  --to-revisions=REVISION_NAME=100 \
  --region=REGION
```

3. **Verify**: Health check against the service URL after traffic shift
4. **Report**: Confirm rollback completed, show active revision

## Rollback Decision Criteria

If the user asks "should I rollback?", evaluate:
- Error rate exceeding baseline → **yes, rollback**
- Latency p99 exceeding 2x normal → **yes, rollback**
- Health check failures → **yes, rollback**
- Minor UI issues → **no, fix forward**

**Rollback first, investigate second.** Restoring service takes priority over understanding the bug.

## Important Rules

- NEVER rollback production without explicit user confirmation
- ALWAYS verify health after rollback
- Record the rollback in the sprint notes (mention in next handover)
