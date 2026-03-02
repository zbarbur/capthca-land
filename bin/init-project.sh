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

echo ""
echo "==> Configuration:"
echo "    Name:        $PROJECT_NAME"
echo "    Slug:        $PROJECT_SLUG"
echo "    Description: $PROJECT_DESCRIPTION"
echo "    Author:      $AUTHOR"
echo "    Team:        $TEAM_NAME"
echo "    Env Prefix:  $ENV_PREFIX"
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

	# Only process text files
	if file "$file" | grep -q "text"; then
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
echo ""
echo "Optional: Delete dashboard/ if you don't need a Next.js frontend."
