#!/usr/bin/env bash
# ============================================================================
# Sync From Template — Pull improvements from the upstream template
#
# Advisory-only: shows what changed in the template since your project
# was created (or last synced). You decide what to adopt.
#
# Usage:
#   bin/sync-from-template.sh                    # compare against latest tag
#   bin/sync-from-template.sh --tag v1.1.0       # compare against specific tag
#   bin/sync-from-template.sh --interactive       # prompt per file
#   bin/sync-from-template.sh --apply FILE        # accept one file from template
#
# Setup (first time only):
#   git remote add template https://github.com/zbarbur/agentic-scrum-template.git
#
# The template remote is fetch-only — you never push to it.
# ============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

TEMPLATE_REMOTE="template"
TARGET_TAG=""
MODE="report"
APPLY_FILE=""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ── Parse args ─────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
	case "$1" in
		--tag) TARGET_TAG="$2"; shift 2 ;;
		--interactive) MODE="interactive"; shift ;;
		--apply) MODE="apply"; APPLY_FILE="$2"; shift 2 ;;
		--setup)
			echo "Adding template remote..."
			git remote add "$TEMPLATE_REMOTE" https://github.com/zbarbur/agentic-scrum-template.git 2>/dev/null \
				&& echo "Done. Remote 'template' added." \
				|| echo "Remote 'template' already exists."
			exit 0 ;;
		-h|--help)
			echo "Usage: bin/sync-from-template.sh [OPTIONS]"
			echo ""
			echo "Options:"
			echo "  --tag VERSION    Compare against specific template tag (default: latest)"
			echo "  --interactive    Prompt for each changed file (accept/diff/skip)"
			echo "  --apply FILE     Accept a single file from the template"
			echo "  --setup          Add the template git remote (first time only)"
			echo "  -h, --help       Show this help"
			echo ""
			echo "First time? Run: bin/sync-from-template.sh --setup"
			exit 0 ;;
		*) echo "Unknown arg: $1. Use --help for usage."; exit 1 ;;
	esac
done

# ── Verify remote exists ──────────────────────────────────────────────
if ! git remote get-url "$TEMPLATE_REMOTE" &>/dev/null; then
	echo -e "${RED}Error:${NC} Remote '$TEMPLATE_REMOTE' not found."
	echo ""
	echo "Run this first:"
	echo "  bin/sync-from-template.sh --setup"
	exit 1
fi

# ── Fetch latest from template ─────────────────────────────────────────
echo -e "${BOLD}Fetching template updates...${NC}"
git fetch "$TEMPLATE_REMOTE" --tags --quiet 2>/dev/null

# ── Determine target ref ──────────────────────────────────────────────
if [ -n "$TARGET_TAG" ]; then
	TEMPLATE_REF="$TARGET_TAG"
else
	# Find the latest tag on the template remote
	TEMPLATE_REF=$(git tag -l "v*" --sort=-v:refname | head -1)
	if [ -z "$TEMPLATE_REF" ]; then
		TEMPLATE_REF="$TEMPLATE_REMOTE/main"
		echo -e "${YELLOW}No tags found, comparing against ${TEMPLATE_REMOTE}/main${NC}"
	fi
fi

echo -e "Comparing against: ${CYAN}${TEMPLATE_REF}${NC}"
echo ""

# ── Find last sync point ──────────────────────────────────────────────
# Check for a sync marker in CHANGELOG.md or use the initial commit
LAST_SYNC=$(grep -oP 'Template sync: \K[v\d.]+' CHANGELOG.md 2>/dev/null | tail -1 || true)
if [ -n "$LAST_SYNC" ]; then
	echo -e "Last sync: ${CYAN}${LAST_SYNC}${NC}"
else
	echo -e "Last sync: ${YELLOW}never (comparing all files)${NC}"
fi
echo ""

# ── Single file apply mode ────────────────────────────────────────────
if [ "$MODE" = "apply" ]; then
	if [ -z "$APPLY_FILE" ]; then
		echo -e "${RED}Error:${NC} --apply requires a file path."
		exit 1
	fi

	echo -e "Applying ${CYAN}${APPLY_FILE}${NC} from template..."

	# Check if file exists in template
	if ! git show "${TEMPLATE_REF}:${APPLY_FILE}" &>/dev/null; then
		echo -e "${RED}Error:${NC} File not found in template at ${TEMPLATE_REF}."
		exit 1
	fi

	# Create parent directory if needed
	mkdir -p "$(dirname "$APPLY_FILE")"

	# Extract file from template
	git show "${TEMPLATE_REF}:${APPLY_FILE}" > "$APPLY_FILE"
	echo -e "${GREEN}Applied.${NC} Review the file and commit when ready."
	exit 0
fi

# ── Build file comparison ──────────────────────────────────────────────
echo -e "${BOLD}═══ TEMPLATE CHANGES ═══${NC}"
echo ""

# Get list of all files in the template (excluding node_modules, .git)
TEMPLATE_FILES=$(git ls-tree -r --name-only "$TEMPLATE_REF" 2>/dev/null | grep -v "^node_modules/" | grep -v "^package-lock.json" | sort)

NEW_FILES=()
UPDATED_FILES=()
SAME_FILES=()

for file in $TEMPLATE_FILES; do
	if [ ! -f "$file" ]; then
		# File exists in template but not in project
		NEW_FILES+=("$file")
	else
		# File exists in both — compare
		TEMPLATE_CONTENT=$(git show "${TEMPLATE_REF}:${file}" 2>/dev/null || true)
		LOCAL_CONTENT=$(cat "$file" 2>/dev/null || true)

		if [ "$TEMPLATE_CONTENT" != "$LOCAL_CONTENT" ]; then
			UPDATED_FILES+=("$file")
		else
			SAME_FILES+=("$file")
		fi
	fi
done

# ── Report: New files ──────────────────────────────────────────────────
if [ ${#NEW_FILES[@]} -gt 0 ]; then
	echo -e "${GREEN}[NEW] Files in template not in your project:${NC}"
	for file in "${NEW_FILES[@]}"; do
		# Get file size from template
		size=$(git show "${TEMPLATE_REF}:${file}" 2>/dev/null | wc -l | tr -d ' ')
		echo -e "  ${GREEN}+${NC} $file  ${CYAN}(${size} lines)${NC}"
	done
	echo ""
fi

# ── Report: Updated files ─────────────────────────────────────────────
if [ ${#UPDATED_FILES[@]} -gt 0 ]; then
	echo -e "${YELLOW}[UPDATED] Files that differ from template:${NC}"
	for file in "${UPDATED_FILES[@]}"; do
		# Count diff lines
		diff_stats=$(diff <(git show "${TEMPLATE_REF}:${file}" 2>/dev/null) "$file" 2>/dev/null | grep -c "^[<>]" || echo "?")
		echo -e "  ${YELLOW}~${NC} $file  ${CYAN}(${diff_stats} lines differ)${NC}"
	done
	echo ""
fi

# ── Report: Unchanged ─────────────────────────────────────────────────
echo -e "[SAME] ${#SAME_FILES[@]} files unchanged"
echo ""

# ── Summary ────────────────────────────────────────────────────────────
TOTAL_CHANGES=$(( ${#NEW_FILES[@]} + ${#UPDATED_FILES[@]} ))
echo -e "${BOLD}═══ SUMMARY ═══${NC}"
echo -e "  Template ref:  ${CYAN}${TEMPLATE_REF}${NC}"
echo -e "  New files:     ${GREEN}${#NEW_FILES[@]}${NC}"
echo -e "  Updated files: ${YELLOW}${#UPDATED_FILES[@]}${NC}"
echo -e "  Unchanged:     ${#SAME_FILES[@]}"
echo -e "  Total changes: ${BOLD}${TOTAL_CHANGES}${NC}"
echo ""

if [ "$TOTAL_CHANGES" -eq 0 ]; then
	echo -e "${GREEN}Your project is up to date with the template.${NC}"
	exit 0
fi

# ── Interactive mode ───────────────────────────────────────────────────
if [ "$MODE" = "interactive" ]; then
	echo -e "${BOLD}═══ INTERACTIVE REVIEW ═══${NC}"
	echo ""
	echo "For each file: (a)ccept template version, (d)iff, (s)kip"
	echo ""

	ACCEPTED=0
	SKIPPED=0

	# Process new files
	for file in "${NEW_FILES[@]}"; do
		echo -e "${GREEN}[NEW]${NC} $file"
		while true; do
			read -p "  (a)ccept / (d)iff / (s)kip: " choice
			case "$choice" in
				a|accept)
					mkdir -p "$(dirname "$file")"
					git show "${TEMPLATE_REF}:${file}" > "$file"
					echo -e "  ${GREEN}Accepted.${NC}"
					ACCEPTED=$((ACCEPTED + 1))
					break ;;
				d|diff)
					echo "--- (file does not exist locally) ---"
					git show "${TEMPLATE_REF}:${file}" | head -30
					echo "  ... (showing first 30 lines)"
					echo "" ;;
				s|skip)
					echo -e "  ${YELLOW}Skipped.${NC}"
					SKIPPED=$((SKIPPED + 1))
					break ;;
				*) echo "  Enter a, d, or s" ;;
			esac
		done
		echo ""
	done

	# Process updated files
	for file in "${UPDATED_FILES[@]}"; do
		echo -e "${YELLOW}[UPDATED]${NC} $file"
		while true; do
			read -p "  (a)ccept template / (d)iff / (s)kip: " choice
			case "$choice" in
				a|accept)
					git show "${TEMPLATE_REF}:${file}" > "$file"
					echo -e "  ${GREEN}Accepted.${NC}"
					ACCEPTED=$((ACCEPTED + 1))
					break ;;
				d|diff)
					echo ""
					diff --color=always <(git show "${TEMPLATE_REF}:${file}" 2>/dev/null) "$file" 2>/dev/null | head -50 || true
					echo ""
					echo "  ... (showing first 50 diff lines. Full diff: diff <(git show ${TEMPLATE_REF}:${file}) ${file})"
					echo "" ;;
				s|skip)
					echo -e "  ${YELLOW}Skipped.${NC}"
					SKIPPED=$((SKIPPED + 1))
					break ;;
				*) echo "  Enter a, d, or s" ;;
			esac
		done
		echo ""
	done

	echo -e "${BOLD}═══ DONE ═══${NC}"
	echo -e "  Accepted: ${GREEN}${ACCEPTED}${NC}"
	echo -e "  Skipped:  ${YELLOW}${SKIPPED}${NC}"
	echo ""
	if [ "$ACCEPTED" -gt 0 ]; then
		echo "Review accepted changes, then commit:"
		echo "  git add -A && git commit -m 'Sync from template ${TEMPLATE_REF}'"
		echo ""
		echo "Update CHANGELOG.md with:"
		echo "  Template sync: ${TEMPLATE_REF}"
	fi
else
	# Report mode — show next steps
	echo -e "${BOLD}═══ NEXT STEPS ═══${NC}"
	echo ""
	echo "Review changes and decide what to adopt:"
	echo ""
	echo "  # Interactive mode (prompted per file):"
	echo "  bin/sync-from-template.sh --interactive"
	echo ""
	echo "  # Accept a specific file:"
	echo "  bin/sync-from-template.sh --apply docs/GOTCHAS.md"
	echo ""
	echo "  # View diff for a specific file:"
	echo "  diff <(git show ${TEMPLATE_REF}:FILE) FILE"
	echo ""
	echo "After adopting changes, record in CHANGELOG.md:"
	echo "  Template sync: ${TEMPLATE_REF}"
fi
