---
name: refactor
description: Analyze code for duplication, complexity, dead code, and extraction opportunities. Produces a prioritized refactoring plan and can execute changes with test verification.
---

# Refactor Skill

You are performing code analysis and refactoring for CAPTHCA land. The user invoked `/refactor $ARGUMENTS`.

## Determine Mode

Parse arguments:

| Argument | Mode | Action |
|----------|------|--------|
| (empty) | Full scan | Analyze entire `src/` and `lib/` for code health issues |
| `FILE` | Single file | Deep analysis of one file |
| `MODULE` | Module scope | Analyze a directory/module (e.g., `lib/cloud/`, `dashboard/lib/`) |
| `--fix FILE` | Execute | Refactor a specific file with test verification |
| `--dupes` | Duplication scan | Find duplicated code across the codebase |
| `--dead` | Dead code scan | Find unused exports, unreachable code, orphan files |
| `--complexity` | Complexity scan | Find functions exceeding complexity thresholds |

## Mode: Full Scan (`/refactor`)

Systematically analyze the codebase for code health issues.

### Step 1: File Size Scan

Find files exceeding the 300-line guideline:

```
find src/ lib/ dashboard/lib/ dashboard/app/ -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -rn
```

Flag files over 300 lines — these are extraction candidates.

### Step 2: Function Length Scan

Search for long functions (rough heuristic — functions with many lines between opening and closing braces):

```
grep -n "function\|=> {" --include="*.ts" --include="*.tsx" -r src/ lib/ dashboard/
```

Read flagged files and identify functions over 30 lines — these need decomposition.

### Step 3: Duplication Scan

Search for repeated patterns:

1. **Identical imports repeated across files:**
   ```
   grep -rn "^import" --include="*.ts" src/ lib/ | sort -t: -k2 | uniq -d -f1
   ```

2. **Repeated code blocks** — look for functions with similar signatures and bodies:
   - Find all exported function names across files
   - Cross-reference for similar names (e.g., `validateInput` in multiple files)
   - Read and compare suspected duplicates

3. **Copy-paste patterns** — search for distinctive multi-line blocks:
   ```
   grep -rn "try {" --include="*.ts" -A 10 src/ lib/
   ```
   Look for identical try/catch patterns that should be abstracted.

### Step 4: Dead Code Scan

1. **Unused exports** — for each exported function/class/type:
   ```
   grep -rn "export function\|export class\|export type\|export interface\|export const" --include="*.ts" src/ lib/
   ```
   For each export, check if it's imported anywhere else:
   ```
   grep -rn "import.*{.*EXPORT_NAME" --include="*.ts" --include="*.tsx" .
   ```

2. **Orphan files** — files not imported by anything:
   ```
   # List all .ts files, then check which are never imported
   ```

3. **Commented-out code** — blocks of commented code that should be deleted:
   ```
   grep -rn "^[\t ]*//.*function\|^[\t ]*//.*const\|^[\t ]*//.*return" --include="*.ts" src/ lib/
   ```

### Step 5: Dependency Analysis

Map module dependencies to find:
- **Circular dependencies** — A imports B imports A
- **God modules** — files imported by >10 others (fragile, hard to change)
- **Tangled clusters** — groups of files with bidirectional dependencies

```
grep -rn "^import.*from" --include="*.ts" src/ lib/ dashboard/lib/
```

Build a dependency map and flag issues.

### Step 6: Produce Report

```markdown
## Code Health Report — CAPTHCA land
**Date:** [today]
**Scope:** [full | file | module]

### Summary
- Files analyzed: N
- Issues found: N (Critical: N, Warning: N, Info: N)
- Estimated effort: [small | medium | large]

---

### Critical (refactor now — blocking maintainability)

#### REF-001: [Title]
- **Type:** [Duplication | Long File | Long Function | Dead Code | Circular Dep | God Module]
- **Location:** `file:line`
- **Description:** [What's wrong and why it hurts]
- **Impact:** [What breaks or slows down when this isn't fixed]
- **Suggested fix:** [Specific extraction/refactoring steps]
- **Safety:** [Tests exist | Tests needed first]

---

### Warning (refactor soon — increasing tech debt)

#### REF-002: ...

---

### Info (refactor when touching — opportunistic)

#### REF-003: ...

---

### Clean Areas
- [x] No circular dependencies
- [x] No files over 300 lines
- [x] No functions over 30 lines
- [x] No dead exports found
- [x] No commented-out code blocks
[... list all checks that passed]

---

### Recommended Refactoring Order
1. [Highest impact, lowest risk] — REF-001
2. [Next priority] — REF-002
3. ...

Rationale: [Why this order — dependency chain, risk level, test coverage]
```

## Mode: Single File (`/refactor src/auth.ts`)

Deep analysis of one file:

1. **Read the file completely**
2. **Measure:**
   - Total lines
   - Number of exports
   - Number of functions/methods
   - Longest function (line count)
   - Number of imports
   - Cyclomatic complexity estimate (count `if`, `else`, `&&`, `||`, `?`, `catch`, `case`)
3. **Check:**
   - Does it do one thing? (single responsibility)
   - Are there functions that could be extracted to a separate module?
   - Are there repeated patterns within the file?
   - Are there functions that are hard to test in isolation?
   - Is there dead code (unreachable branches, unused variables)?
   - Are there magic numbers or hardcoded strings that should be constants?
4. **Produce a focused report** with specific line numbers and extraction suggestions

## Mode: Duplication Scan (`/refactor --dupes`)

Focused scan for duplicated code:

1. **Find similar function signatures** across files
2. **Find repeated utility patterns:**
   ```
   grep -rn "\.map(\|\.filter(\|\.reduce(" --include="*.ts" src/ lib/
   ```
   Check for identical transformation chains.

3. **Find repeated error handling patterns:**
   ```
   grep -rn "catch" --include="*.ts" -A 5 src/ lib/
   ```
   Identify identical catch blocks → extract to shared error handler.

4. **Find repeated validation patterns:**
   ```
   grep -rn "if (!.*) {" --include="*.ts" -A 3 src/ lib/ dashboard/lib/
   ```
   Identify identical guard clauses → extract to validation module.

5. **Report** each duplication with:
   - All locations (file:line)
   - The repeated code
   - Suggested shared module/function to extract

## Mode: Dead Code Scan (`/refactor --dead`)

Focused scan for unused code:

1. **Unused exports** — cross-reference every export against all imports
2. **Unused dependencies** — check package.json deps against actual imports
3. **Unreachable code** — `return` followed by more code, always-true/false conditions
4. **Orphan files** — .ts files not imported anywhere
5. **Commented-out code** — substantial blocks (>3 lines) of commented code
6. **Deprecated code** — functions with `@deprecated` that have no remaining callers

Report each with location and confidence level (definite | probable | needs review).

## Mode: Complexity Scan (`/refactor --complexity`)

Focused scan for complex code:

1. **Cyclomatic complexity** — count decision points per function:
   - `if`, `else if`, `case`, `catch`, `&&`, `||`, `??`, ternary `?`
   - Flag functions with complexity > 10

2. **Nesting depth** — flag functions with > 3 levels of nesting:
   ```
   grep -n "if\|for\|while\|switch\|try" --include="*.ts" FILE
   ```

3. **Parameter count** — flag functions with > 4 parameters (use options object instead)

4. **Return points** — flag functions with > 3 return statements

5. **Long boolean expressions** — flag conditions spanning multiple lines

Report each with location, measured value, threshold, and simplification strategy.

## Mode: Execute Refactoring (`/refactor --fix src/auth.ts`)

Safely refactor a specific file:

### Step 1: Pre-flight

1. **Read the file** completely
2. **Find all tests** that cover this file:
   ```
   grep -r "auth" test/ --include="*.test.ts" -l
   ```
3. **Run existing tests** to establish baseline:
   ```bash
   npm test
   ```
4. **If no tests exist** — STOP. Report:
   ```
   Cannot safely refactor src/auth.ts — no test coverage found.
   Create tests first: /test add src/auth.ts
   Then retry: /refactor --fix src/auth.ts
   ```

### Step 2: Plan

Present the refactoring plan:
- What will change (specific functions, extractions, renames)
- What will NOT change (public API, behavior, side effects)
- New files to create (if extracting modules)
- Files that need import updates

**Ask user to confirm before proceeding.**

### Step 3: Execute

Apply changes in this order:
1. Extract new modules (if any) — write new files first
2. Update the target file — replace inline code with imports
3. Update other files — fix imports that reference moved code
4. Run linter: `npx biome check --write .`
5. Run tests: `npm test`

### Step 4: Verify

1. **All tests pass** — if not, revert and report what broke
2. **No new lint errors** — if any, fix them
3. **Behavior preserved** — no public API changes unless explicitly planned
4. Report what was done and the before/after metrics (lines, exports, complexity)

## Severity Classification

| Severity | Criteria | When to Fix |
|----------|----------|-------------|
| **Critical** | Actively blocking development — circular deps, 500+ line files, duplicated business logic | This sprint |
| **Warning** | Growing tech debt — 300+ line files, functions > 30 lines, repeated patterns | Next sprint |
| **Info** | Opportunistic — slight duplication, minor complexity, style inconsistency | When touching the file |

## Code Smell Catalog

When analyzing, look for these specific patterns:

| Smell | Signal | Fix |
|-------|--------|-----|
| **God module** | File imported by >10 others, >300 lines | Split by responsibility |
| **Shotgun surgery** | Changing one feature requires editing 5+ files | Consolidate related logic |
| **Feature envy** | Function uses more from another module than its own | Move to the other module |
| **Primitive obsession** | Passing raw strings/numbers instead of typed objects | Create value types |
| **Long parameter list** | Function takes >4 params | Use options object |
| **Divergent change** | File changes for unrelated reasons | Split by change reason |
| **Dead code** | Unused exports, commented blocks, unreachable branches | Delete it |
| **Duplicated logic** | Same pattern in 3+ places | Extract shared function |
| **Nested callbacks** | >3 levels of nesting | Flatten with early returns or extract |
| **Magic numbers** | Hardcoded values without explanation | Extract to named constants |

## Important Rules

- **NEVER refactor without tests** — if no tests exist, report and stop (suggest `/test add` first)
- **Run tests before AND after** every change — if tests break, revert
- **Preserve public API** — refactoring changes structure, not behavior
- **One refactoring at a time** — don't combine extraction + rename + restructure in one pass
- **Smallest possible change** — extract one function, verify, then extract the next
- **Always read the code first** — never suggest refactoring based on file names or line counts alone
- **Reference `docs/guides/CODE_HEALTH.md`** for project-specific modularity standards
- **Flag tech debt items** — suggest additions to KANBAN.md for issues that can't be fixed immediately
