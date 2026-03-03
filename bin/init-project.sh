#!/usr/bin/env bash
# ============================================================================
# Agentic Scrum Template — Project Initializer
#
# Run this after cloning/using the template to replace all placeholders
# with your project's actual values.
#
# Usage: bin/init-project.sh
# ============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "╔══════════════════════════════════════════╗"
echo "║  Agentic Scrum — Project Initializer     ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── Collect values ──────────────────────────────────────────────────────

read -p "Project name (e.g., Acme Platform): " PROJECT_NAME
if [ -z "$PROJECT_NAME" ]; then
	echo "Error: Project name is required."
	exit 1
fi

# Default slug from project name
DEFAULT_SLUG=$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-')
read -p "Project slug [$DEFAULT_SLUG]: " PROJECT_SLUG
PROJECT_SLUG="${PROJECT_SLUG:-$DEFAULT_SLUG}"

read -p "Project description: " PROJECT_DESCRIPTION
PROJECT_DESCRIPTION="${PROJECT_DESCRIPTION:-A project built with Agentic Scrum methodology.}"

read -p "Organization/Author (e.g., Acme Corp): " AUTHOR
AUTHOR="${AUTHOR:-$PROJECT_NAME}"

read -p "Team name (e.g., Platform Squad): " TEAM_NAME
TEAM_NAME="${TEAM_NAME:-$PROJECT_NAME Team}"

# Default env prefix from slug
DEFAULT_PREFIX=$(echo "$PROJECT_SLUG" | tr '-' '_' | tr '[:lower:]' '[:upper:]')_
read -p "Env var prefix [$DEFAULT_PREFIX]: " ENV_PREFIX
ENV_PREFIX="${ENV_PREFIX:-$DEFAULT_PREFIX}"

YEAR=$(date +%Y)

# ── Bug Tracker ───────────────────────────────────────────────────────

echo ""
echo "==> Bug Tracker Configuration"
echo "    Options: github, none"
read -p "Bug tracker type [none]: " TRACKER_TYPE
TRACKER_TYPE="${TRACKER_TYPE:-none}"

TRACKER_REPO=""
if [ "$TRACKER_TYPE" = "github" ]; then
	if ! command -v gh &>/dev/null; then
		echo "Warning: 'gh' CLI not found. Install it from https://cli.github.com/"
		echo "Falling back to tracker type 'none'."
		TRACKER_TYPE="none"
	else
		# Try to auto-detect repo from gh
		DETECTED_REPO=$(gh repo view --json nameWithOwner -q '.nameWithOwner' 2>/dev/null || true)
		if [ -n "$DETECTED_REPO" ]; then
			read -p "GitHub repo [$DETECTED_REPO]: " TRACKER_REPO
			TRACKER_REPO="${TRACKER_REPO:-$DETECTED_REPO}"
		else
			read -p "GitHub repo (owner/name): " TRACKER_REPO
		fi
		if [ -z "$TRACKER_REPO" ]; then
			echo "Warning: No repo provided. Falling back to tracker type 'none'."
			TRACKER_TYPE="none"
		fi
	fi
fi

echo ""
echo "==> Configuration:"
echo "    Name:        $PROJECT_NAME"
echo "    Slug:        $PROJECT_SLUG"
echo "    Description: $PROJECT_DESCRIPTION"
echo "    Author:      $AUTHOR"
echo "    Team:        $TEAM_NAME"
echo "    Env Prefix:  $ENV_PREFIX"
echo "    Tracker:     $TRACKER_TYPE${TRACKER_REPO:+ ($TRACKER_REPO)}"
echo ""
read -p "Proceed? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
	echo "Aborted."
	exit 1
fi

# ── Replace placeholders ───────────────────────────────────────────────

echo "==> Replacing placeholders..."

# Find all text files (skip node_modules, .git, binary files)
find "$PROJECT_DIR" \
	-type f \
	-not -path "*/.git/*" \
	-not -path "*/node_modules/*" \
	-not -path "*/.next/*" \
	-not -path "*/dist/*" \
	-not -name "*.png" -not -name "*.jpg" -not -name "*.ico" \
	-not -name "init-project.sh" \
	-print0 | while IFS= read -r -d '' file; do

	# Only process text files (macOS `file` reports JSON/CSV as "data", not "text")
	if file "$file" | grep -qiE "text|json|csv|yaml|xml"; then
		sed -i '' \
			-e "s|{{PROJECT_NAME}}|$PROJECT_NAME|g" \
			-e "s|{{PROJECT_SLUG}}|$PROJECT_SLUG|g" \
			-e "s|{{PROJECT_DESCRIPTION}}|$PROJECT_DESCRIPTION|g" \
			-e "s|{{AUTHOR}}|$AUTHOR|g" \
			-e "s|{{TEAM_NAME}}|$TEAM_NAME|g" \
			-e "s|{{ENV_PREFIX}}|$ENV_PREFIX|g" \
			-e "s|{{YEAR}}|$YEAR|g" \
			"$file" 2>/dev/null || true
	fi
done

echo "==> Placeholders replaced."

# ── Generate project.json ─────────────────────────────────────────────

echo "==> Writing .claude/project.json..."
cat > "$PROJECT_DIR/.claude/project.json" <<EOF
{
	"project": { "name": "$PROJECT_NAME", "slug": "$PROJECT_SLUG" },
	"tracker": { "type": "$TRACKER_TYPE", "repo": "$TRACKER_REPO" }
}
EOF

# ── Install dependencies ───────────────────────────────────────────────

echo "==> Installing dependencies..."
cd "$PROJECT_DIR"
npm install

# ── Initialize git ─────────────────────────────────────────────────────

if [ ! -d "$PROJECT_DIR/.git" ]; then
	echo "==> Initializing git repository..."
	cd "$PROJECT_DIR"
	git init
	git add -A
	git commit -m "Initial project setup from Agentic Scrum template"
fi

# ── Verify ─────────────────────────────────────────────────────────────

echo "==> Running CI checks..."
npm run ci && echo "==> All checks passed!" || echo "==> Some checks failed — review output above."

# ── Done ───────────────────────────────────────────────────────────────

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  Project initialized successfully!       ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. Read docs/process/BOOTSTRAP.md for session setup"
echo "  2. Read docs/process/SQUAD_PLANNING.md to compose your team"
echo "  3. Follow docs/process/SPRINT_START_CHECKLIST.md to plan Sprint 1"
echo "  4. Start coding!"
echo ""
echo "Key commands:"
echo "  npm test          — Run tests"
echo "  npm run ci        — Full CI check (lint + typecheck + test)"
echo "  npm run lint      — Lint only"
echo "  npm run format    — Auto-format"
echo "  /report-bug       — Report a bug (creates GitHub issue or KANBAN entry)"
echo "  /fix-bug <N>      — Investigate and fix a tracked bug"
echo ""
echo "Optional: Delete dashboard/ if you don't need a Next.js frontend."
