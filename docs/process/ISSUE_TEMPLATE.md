# Issue Report Template

Use this template for reporting bugs, vulnerabilities, and incidents.

---

## Template

```markdown
# {Short descriptive title}

## Severity
{Critical | High | Medium | Low}

## Category
{Bug | Vulnerability | Performance | Data Integrity | UX | Infrastructure}

## Description
{Clear, concise description of the issue. What is happening that should not be?}

## Steps to Reproduce
1. {Step 1}
2. {Step 2}
3. {Step 3}

## Expected Behavior
{What should happen instead?}

## Actual Behavior
{What actually happens? Include error messages, status codes, screenshots if applicable.}

## Impact
{Who is affected? How many users? What is the blast radius?
 Is data at risk? Is the service degraded or down?}

## Environment
- **Branch/Commit:** {branch name or commit SHA}
- **Environment:** {local | staging | production}
- **Browser/Client:** {if applicable}
- **Relevant Config:** {env vars, feature flags, etc.}

## Suggested Fix
{Optional: If you have an idea for how to fix this, describe it here.
 Include file paths, code references, or architectural changes.}

## Related Issues
{Links to related issues, PRs, or audit items. "None" if standalone.}
```

---

## Severity Definitions

| Severity | Definition | Response Time |
|----------|-----------|---------------|
| **Critical** | Service down, data loss, security breach, auth bypass | Immediate — drop everything |
| **High** | Major feature broken, data corruption risk, significant security weakness | Same sprint — prioritize |
| **Medium** | Feature degraded, workaround exists, minor security issue | Next sprint — schedule |
| **Low** | Cosmetic, minor inconvenience, best-practice improvement | Backlog — address when convenient |

---

## Category Definitions

| Category | Examples |
|----------|---------|
| **Bug** | Feature not working as designed, incorrect data returned, crash |
| **Vulnerability** | Auth bypass, injection, data exposure, missing access control |
| **Performance** | Slow response times, memory leak, N+1 queries, timeout |
| **Data Integrity** | Stale data, orphaned records, inconsistent state, missing migrations |
| **UX** | Confusing UI, missing feedback, accessibility issue, broken layout |
| **Infrastructure** | Deployment failure, certificate expiry, resource exhaustion, monitoring gap |

---

## Examples

### Critical Vulnerability

```markdown
# Auth bypass on /api/admin/* routes

## Severity
Critical

## Category
Vulnerability

## Description
Admin API routes are accessible without authentication. The auth middleware
is not applied to routes under /api/admin/, allowing any unauthenticated
request to access admin functionality.

## Steps to Reproduce
1. Open a terminal (no login/auth)
2. Run: curl https://staging.example.com/api/admin/users
3. Observe: 200 response with full user list

## Expected Behavior
Should return 401 Unauthorized for unauthenticated requests.

## Actual Behavior
Returns 200 with full response body containing user data.

## Impact
Any internet user can access admin endpoints. User data (emails, roles)
is exposed. Admin actions (create/delete users) can be performed by anyone.

## Environment
- Branch: main (commit abc1234)
- Environment: staging and production
- Relevant Config: Middleware chain in src/middleware.ts

## Suggested Fix
Add auth middleware to the /api/admin/* route matcher in src/middleware.ts.
The matcher currently only protects /api/users/* routes.

## Related Issues
None
```

### Medium Bug

```markdown
# Dashboard shows stale data after creating a new item

## Severity
Medium

## Category
Bug

## Description
After creating a new item via the dashboard form, the item list does not
refresh. The user must manually reload the page to see the new item.

## Steps to Reproduce
1. Navigate to /dashboard/items
2. Click "Add Item"
3. Fill form and submit
4. Observe: success toast appears, but item list unchanged

## Expected Behavior
Item list should refresh automatically after successful creation,
showing the new item.

## Actual Behavior
Item list shows stale data. New item only appears after full page reload.

## Impact
UX inconvenience. Users may think creation failed and submit duplicates.

## Environment
- Branch: sprint5/item-creation
- Environment: local
- Browser: Chrome 120

## Suggested Fix
Invalidate the SWR cache key for /api/items after successful POST in
src/components/ItemForm.tsx. Call `mutate("/api/items")` in the
onSuccess callback.

## Related Issues
None
```

---

## Workflow

1. **Report** — Fill out this template and add to the project's issue tracker or TODO.md
2. **Triage** — Assign severity and priority during sprint planning
3. **Schedule** — Critical/High go into current sprint; Medium into next sprint; Low into backlog
4. **Fix** — Create a task using TASK_TEMPLATE.md with the fix
5. **Verify** — Confirm the fix addresses the issue using the Steps to Reproduce
6. **Close** — Mark as resolved with reference to the fix commit/PR
