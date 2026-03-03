# Code Health Guide

Principles and patterns for keeping CAPTHCA land maintainable as it grows. This guide covers module design, duplication, complexity management, and test-driven refactoring.

## Core Principles

### 1. Single Responsibility

Every module (file) should have one reason to change. If you find yourself saying "this file handles auth **and** token generation **and** rate limiting," it's doing too much.

**Test:** Can you describe what the module does in one sentence without using "and"?

```
✓ "Validates API tokens against stored hashes"
✗ "Handles auth, generates tokens, and checks rate limits"
```

### 2. Rule of Three

Don't extract on first use. When you see the same pattern a **third** time, extract it.

```
First time  → Write it inline
Second time → Note the duplication, leave it
Third time  → Extract to a shared function
```

Why: Premature abstraction creates the wrong abstraction. Two instances might look similar but diverge later. Three confirms the pattern is real.

### 3. Depth Over Width

Prefer deep module hierarchies over wide files. A 50-line file that imports 3 focused helpers is better than a 300-line file that does everything inline.

```
✗ lib/auth.ts (400 lines — validation, hashing, tokens, sessions, RBAC)

✓ lib/auth/
    validate.ts    (60 lines — input validation)
    hash.ts        (40 lines — password + token hashing)
    tokens.ts      (80 lines — generate, verify, revoke)
    sessions.ts    (50 lines — create, refresh, destroy)
    index.ts       (10 lines — re-exports public API)
```

### 4. Explicit Dependencies

Every module should declare what it needs through imports, not reach into global state or rely on implicit initialization order.

```typescript
// ✗ Implicit — depends on global init order
const db = globalThis.__db;

// ✓ Explicit — declares the dependency
import { getDb } from "../lib/database.ts";
```

### 5. Testability as Design Feedback

If code is hard to test, it's poorly designed. Difficulty writing tests is a signal to refactor, not to skip testing.

| Hard to test | Design problem | Fix |
|-------------|----------------|-----|
| Need to mock 10 things | Too many dependencies | Extract pure logic |
| Can't test without a server | Logic buried in route handler | Extract to lib/ module |
| Tests are 3x the code | Complex branching | Simplify with early returns |
| Need real database | No abstraction layer | Add interface + local impl |

## File Size Guidelines

| Lines | Status | Action |
|-------|--------|--------|
| < 100 | Healthy | No action needed |
| 100-200 | Normal | Monitor growth |
| 200-300 | Watch | Plan extraction if still growing |
| 300-500 | Warning | Extract before adding more code |
| 500+ | Critical | Refactor now — this is blocking maintainability |

**When splitting a file:**
1. Identify clusters of functions that work together
2. Create a new file for each cluster
3. Move functions and their private helpers together
4. Update imports in all consuming files
5. Create an `index.ts` if the module has many entry points
6. Run tests after each move — not at the end

## Function Design

### Length

Functions should be short enough to understand without scrolling. Aim for **< 30 lines**. If longer, look for extraction opportunities.

**Not a hard rule** — a well-structured 40-line function can be clearer than 4 scattered 10-line functions. Use judgment.

### Complexity

Count decision points: `if`, `else if`, `case`, `catch`, `&&`, `||`, `??`, ternary `?`

| Complexity | Status | Action |
|-----------|--------|--------|
| 1-5 | Simple | No action |
| 6-10 | Moderate | Consider simplification |
| 11-15 | Complex | Should refactor |
| 16+ | Unmaintainable | Must refactor |

**Simplification patterns:**

```typescript
// ✗ Deep nesting
function process(input: Input) {
	if (input.type === "a") {
		if (input.valid) {
			if (input.data) {
				// actual logic buried 3 levels deep
			}
		}
	}
}

// ✓ Early returns (guard clauses)
function process(input: Input) {
	if (input.type !== "a") return;
	if (!input.valid) return;
	if (!input.data) return;

	// actual logic at top level
}
```

```typescript
// ✗ Long switch/if-else chain
function getHandler(type: string) {
	if (type === "a") return handleA;
	if (type === "b") return handleB;
	if (type === "c") return handleC;
	// ... 10 more
}

// ✓ Lookup table
const handlers: Record<string, Handler> = {
	a: handleA,
	b: handleB,
	c: handleC,
};

function getHandler(type: string) {
	return handlers[type];
}
```

### Parameters

Functions with > 4 parameters are hard to call correctly. Use an options object:

```typescript
// ✗ Too many positional params
function createUser(name: string, email: string, role: string, tenantId: string, notify: boolean) {}

// ✓ Options object
interface CreateUserOptions {
	name: string;
	email: string;
	role: AppRole;
	tenantId: string;
	notify?: boolean;  // optional with default
}
function createUser(options: CreateUserOptions) {}
```

## Duplication Patterns

### When Duplication is Acceptable

- **Two instances** of similar code (Rule of Three — not yet worth extracting)
- **Test setup code** — some repetition in tests improves readability
- **Configuration** — copying a config block is clearer than abstracting it

### When Duplication Must Be Eliminated

- **Three or more** identical patterns → extract
- **Business logic** duplicated across modules → single source of truth
- **Validation rules** repeated at multiple API boundaries → shared schema
- **Error handling** patterns identical across routes → middleware or shared handler

### Extraction Patterns

**Extract function** — same logic, different inputs:
```typescript
// Before: duplicated in 3 route handlers
const tenantId = req.params.tenantId;
if (!tenantId || !isValidUUID(tenantId)) {
	return Response.json({ error: "Invalid tenant ID" }, { status: 400 });
}

// After: shared validation
function requireTenantId(params: Record<string, string>): string {
	const tenantId = params.tenantId;
	if (!tenantId || !isValidUUID(tenantId)) {
		throw new ValidationError("Invalid tenant ID");
	}
	return tenantId;
}
```

**Extract module** — cluster of related functions:
```typescript
// Before: auth.ts has token generation, validation, hashing, listing, revocation

// After: split by responsibility
// lib/auth/hash.ts — hashing utilities
// lib/auth/tokens.ts — token lifecycle (generate, validate, revoke)
// lib/auth/index.ts — re-exports public API
```

**Extract interface** — shared behavior across implementations:
```typescript
// Before: GCS and local storage have similar methods but no shared contract

// After: shared interface
interface ObjectStorage {
	put(path: string, data: Buffer): Promise<void>;
	get(path: string): Promise<Buffer>;
	list(prefix: string): Promise<string[]>;
	delete(path: string): Promise<void>;
}
```

## Module Dependency Health

### Healthy Patterns

- **Acyclic dependencies** — A → B → C, never C → A
- **Layered architecture** — routes → lib → shared, never upward
- **Narrow interfaces** — modules expose minimal public API
- **Direction of dependency** — concrete depends on abstract (depend on interfaces, not implementations)

### Unhealthy Patterns

| Pattern | Signal | Fix |
|---------|--------|-----|
| **Circular dependency** | A imports B, B imports A | Extract shared types to a third module |
| **God module** | One file imported by everything | Split by responsibility |
| **Shotgun surgery** | Small change requires editing 5+ files | Consolidate related logic |
| **Feature envy** | Function uses more from another module than its own | Move it to where the data lives |
| **Hub and spoke** | Everything goes through one file | Introduce direct module-to-module imports |

### Dependency Direction

```
Routes/Handlers (thin — delegate to lib)
      ↓
Library modules (business logic)
      ↓
Shared utilities (pure functions, types, interfaces)
      ↓
External packages (npm dependencies)
```

**Never** import upward (lib should not import from routes). **Never** import sideways between feature modules without going through a shared interface.

## Test-Driven Refactoring

The safest way to refactor is with tests as your safety net.

### The Refactoring Loop

```
1. Run tests → all green (baseline)
2. Make ONE structural change (extract, move, rename)
3. Run tests → must still be green
4. Repeat from step 2
5. Run linter → clean
6. Commit
```

### When Tests Don't Exist

**Do not refactor untested code.** Instead:

1. Write characterization tests — tests that capture current behavior (even if the behavior seems wrong)
2. Verify characterization tests pass
3. Now refactor using the loop above
4. After refactoring, review characterization tests — update any that tested implementation details rather than behavior

### What Tests Should Survive Refactoring

| Should survive | Should NOT survive |
|---------------|-------------------|
| Tests of public API behavior | Tests of internal function names |
| Tests of input → output | Tests of implementation details |
| Tests of error cases | Tests of private helper methods |
| Integration tests | Tests that mock internals |

If many tests break during a refactoring that doesn't change behavior, the tests were too tightly coupled to implementation. Fix the tests to test behavior instead.

## Code Smell Quick Reference

| Smell | Detection | Typical Fix |
|-------|-----------|-------------|
| Long function (>30 lines) | Line count | Extract helper functions |
| Long file (>300 lines) | Line count | Split into focused modules |
| Deep nesting (>3 levels) | Indentation | Guard clauses, early returns |
| Long parameter list (>4) | Signature width | Options object |
| Duplicated code (3+ places) | Pattern matching | Extract shared function |
| Dead code | Unused exports/variables | Delete it |
| Commented-out code | Visual scan | Delete it (git has history) |
| Magic numbers | Inline literals | Named constants |
| God module | Import count | Split by responsibility |
| Circular dependency | Import graph | Extract shared types |
| Feature envy | Data access patterns | Move function to data owner |
| Primitive obsession | Raw string/number passing | Create value types |

## Refactoring and Tech Debt

### When to Refactor

- **During feature work** — if the file you're changing has issues, fix them (the "boy scout rule")
- **Dedicated tech debt sprint** — when accumulated debt is blocking velocity
- **Before adding complexity** — if a module is already 280 lines, refactor before adding more

### When NOT to Refactor

- **Before a deadline** — ship first, refactor next sprint
- **Without tests** — write tests first
- **Speculatively** — don't refactor for hypothetical future requirements
- **Working code with no changes planned** — if no one needs to touch it, leave it alone

### Tracking Tech Debt

When you spot an issue but can't fix it now:

1. Add it to `docs/process/KANBAN.md` under **Tech Debt**
2. Include: file path, what's wrong, estimated effort (S/M/L)
3. Reference it in sprint planning — tech debt items should be ~20% of sprint capacity

Example KANBAN entry:
```markdown
- [ ] **Refactor auth module** — `lib/auth.ts` is 450 lines with token generation,
      validation, and session management mixed together. Extract into `lib/auth/` module
      with separate files per responsibility. (M) — Sprint 8 candidate
```

## Related Resources

- **`/refactor`** — Skill for automated code health analysis
- **`/review`** — Code review includes a code health checklist
- **`/test add FILE`** — Generate tests before refactoring
- **`docs/process/CODING_STANDARDS.md`** — Module size rules and naming conventions
