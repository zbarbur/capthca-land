#!/usr/bin/env bash
# ============================================================================
# Sync From Template — Pull improvements from the upstream template
#
# Advisory-only: shows what changed in the template since your project
# was created (or last synced). You decide what to adopt.
#
# Usage:
#   bin/sync-from-template.sh                    # compare against latest
#   bin/sync-from-template.sh --dry-run          # show what would change (no modifications)
#   bin/sync-from-template.sh --tag v1.1.0       # compare against specific tag
#   bin/sync-from-template.sh --interactive       # prompt per file
#   bin/sync-from-template.sh --apply FILE        # accept one file from template
#
# The script reads .template-version for the last synced SHA and uses it
# to diff only the changes since the last sync.
# ============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

VERSION_FILE="$PROJECT_DIR/.template-version"
TARGET_TAG=""
MODE="report"
DRY_RUN=false
APPLY_FILE=""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ── Read .template-version ───────────────────────────────────────────
read_template_version() {
	if [ ! -f "$VERSION_FILE" ]; then
		echo ""
		return
	fi
	local sha
	sha=$(grep '^TEMPLATE_SHA=' "$VERSION_FILE" 2>/dev/null | cut -d= -f2 || true)
	echo "$sha"
}

read_template_repo() {
	if [ ! -f "$VERSION_FILE" ]; then
		echo ""
		return
	fi
	local repo
	repo=$(grep '^TEMPLATE_REPO=' "$VERSION_FILE" 2>/dev/null | cut -d= -f2 || true)
	echo "$repo"
}

update_template_version() {
	local new_sha="$1"
	local repo
	repo=$(read_template_repo)
	if [ -z "$repo" ]; then
		repo="https://github.com/zbarbur/capthca-template"
	fi
	cat > "$VERSION_FILE" <<EOF
# Last synced template version
TEMPLATE_REPO=$repo
TEMPLATE_SHA=$new_sha
EOF
	echo -e "${GREEN}Updated .template-version with SHA: ${new_sha}${NC}"
}

# ── Parse args ─────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
	case "$1" in
		--dry-run) DRY_RUN=true; shift ;;
		--tag) TARGET_TAG="$2"; shift 2 ;;
		--interactive) MODE="interactive"; shift ;;
		--apply) MODE="apply"; APPLY_FILE="$2"; shift 2 ;;
		--setup)
			echo "Adding template remote..."
			REPO_URL=$(read_template_repo)
			if [ -z "$REPO_URL" ]; then
				REPO_URL="https://github.com/zbarbur/capthca-template"
			fi
			git remote add template "$REPO_URL" 2>/dev/null \
				&& echo "Done. Remote 'template' added (${REPO_URL})." \
				|| echo "Remote 'template' already exists."
			exit 0 ;;
		-h|--help)
			echo "Usage: bin/sync-from-template.sh [OPTIONS]"
			echo ""
			echo "Options:"
			echo "  --dry-run        Show what would change without modifying files"
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

# ── Read stored SHA ──────────────────────────────────────────────────
STORED_SHA=$(read_template_version)
if [ -z "$STORED_SHA" ] || [ "$STORED_SHA" = "initial" ]; then
	echo -e "${YELLOW}No previous sync SHA found (first sync).${NC}"
	STORED_SHA=""
fi

TEMPLATE_REMOTE="template"

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
if ! git fetch "$TEMPLATE_REMOTE" --tags --quiet 2>/dev/null; then
	echo -e "${RED}Error:${NC} Could not reach template repository."
	echo "Check your network connection or verify the remote URL:"
	echo "  git remote get-url $TEMPLATE_REMOTE"
	exit 1
fi

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

# Get the HEAD SHA of the template ref for version tracking
TEMPLATE_HEAD_SHA=$(git rev-parse "$TEMPLATE_REF" 2>/dev/null || echo "unknown")

echo -e "Comparing against: ${CYAN}${TEMPLATE_REF}${NC} (${TEMPLATE_HEAD_SHA:0:12})"
if [ -n "$STORED_SHA" ]; then
	echo -e "Last sync SHA:     ${CYAN}${STORED_SHA:0:12}${NC}"
fi
if [ "$DRY_RUN" = true ]; then
	echo -e "${YELLOW}DRY RUN — no files will be modified${NC}"
fi
echo ""

# ── Single file apply mode ────────────────────────────────────────────
if [ "$MODE" = "apply" ]; then
	if [ -z "$APPLY_FILE" ]; then
		echo -e "${RED}Error:${NC} --apply requires a file path."
		exit 1
	fi

	if [ "$DRY_RUN" = true ]; then
		echo -e "[DRY RUN] Would apply ${CYAN}${APPLY_FILE}${NC} from template."
		if git show "${TEMPLATE_REF}:${APPLY_FILE}" &>/dev/null; then
			echo -e "  File exists in template at ${TEMPLATE_REF}."
		else
			echo -e "  ${RED}File not found in template at ${TEMPLATE_REF}.${NC}"
		fi
		exit 0
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

	# Update version file
	update_template_version "$TEMPLATE_HEAD_SHA"
	exit 0
fi

# ── Build file comparison ──────────────────────────────────────────────
echo -e "${BOLD}═══ TEMPLATE CHANGES ═══${NC}"
echo ""

# Placeholder patterns to filter out (project name substitutions)
PLACEHOLDER_PATTERNS=(
	"capthca-template"
	"CAPTHCA-TEMPLATE"
	"capthca_template"
	"your-project"
	"YOUR_PROJECT"
)

# Check if a diff is only placeholder substitutions
is_placeholder_only_diff() {
	local file="$1"
	local diff_output
	diff_output=$(diff <(git show "${TEMPLATE_REF}:${file}" 2>/dev/null) "$file" 2>/dev/null || true)

	if [ -z "$diff_output" ]; then
		return 1  # No diff at all
	fi

	# Get only the changed lines (lines starting with < or >)
	local changed_lines
	changed_lines=$(echo "$diff_output" | grep '^[<>]' || true)

	if [ -z "$changed_lines" ]; then
		return 1
	fi

	# Check if every changed line is just a placeholder substitution
	while IFS= read -r line; do
		local is_placeholder=false
		for pattern in "${PLACEHOLDER_PATTERNS[@]}"; do
			if echo "$line" | grep -qi "$pattern" 2>/dev/null; then
				is_placeholder=true
				break
			fi
		done
		if [ "$is_placeholder" = false ]; then
			return 1  # Found a non-placeholder change
		fi
	done <<< "$changed_lines"

	return 0  # All changes are placeholder substitutions
}

# Get list of all files in the template (excluding node_modules, .git)
TEMPLATE_FILES=$(git ls-tree -r --name-only "$TEMPLATE_REF" 2>/dev/null | grep -v "^node_modules/" | grep -v "^package-lock.json" | sort)

NEW_FILES=()
UPDATED_FILES=()
SAME_FILES=()
PLACEHOLDER_FILES=()
DELETED_FILES=()

for file in $TEMPLATE_FILES; do
	if [ ! -f "$file" ]; then
		# File exists in template but not in project
		NEW_FILES+=("$file")
	else
		# File exists in both — compare
		TEMPLATE_CONTENT=$(git show "${TEMPLATE_REF}:${file}" 2>/dev/null || true)
		LOCAL_CONTENT=$(cat "$file" 2>/dev/null || true)

		if [ "$TEMPLATE_CONTENT" != "$LOCAL_CONTENT" ]; then
			if is_placeholder_only_diff "$file"; then
				PLACEHOLDER_FILES+=("$file")
			else
				UPDATED_FILES+=("$file")
			fi
		else
			SAME_FILES+=("$file")
		fi
	fi
done

# If we have a stored SHA, check for files deleted in template since last sync
if [ -n "$STORED_SHA" ] && git cat-file -e "$STORED_SHA" 2>/dev/null; then
	OLD_FILES=$(git ls-tree -r --name-only "$STORED_SHA" 2>/dev/null | sort)
	NEW_TREE_FILES=$(git ls-tree -r --name-only "$TEMPLATE_REF" 2>/dev/null | sort)
	while IFS= read -r file; do
		if [ -n "$file" ] && [ -f "$file" ]; then
			DELETED_FILES+=("$file")
		fi
	done < <(comm -23 <(echo "$OLD_FILES") <(echo "$NEW_TREE_FILES"))
fi

# ── Report: New files ──────────────────────────────────────────────────
if [ ${#NEW_FILES[@]} -gt 0 ]; then
	echo -e "${GREEN}[ADD] Files in template not in your project:${NC}"
	for file in "${NEW_FILES[@]}"; do
		size=$(git show "${TEMPLATE_REF}:${file}" 2>/dev/null | wc -l | tr -d ' ')
		echo -e "  ${GREEN}+${NC} $file  ${CYAN}(${size} lines)${NC}"
	done
	echo ""
fi

# ── Report: Updated files ─────────────────────────────────────────────
if [ ${#UPDATED_FILES[@]} -gt 0 ]; then
	echo -e "${YELLOW}[MODIFY] Files that differ from template:${NC}"
	for file in "${UPDATED_FILES[@]}"; do
		diff_stats=$(diff <(git show "${TEMPLATE_REF}:${file}" 2>/dev/null) "$file" 2>/dev/null | grep -c "^[<>]" || echo "?")
		echo -e "  ${YELLOW}~${NC} $file  ${CYAN}(${diff_stats} lines differ)${NC}"
	done
	echo ""
fi

# ── Report: Deleted files ─────────────────────────────────────────────
if [ ${#DELETED_FILES[@]} -gt 0 ]; then
	echo -e "${RED}[DELETE] Files removed from template since last sync:${NC}"
	for file in "${DELETED_FILES[@]}"; do
		echo -e "  ${RED}-${NC} $file"
	done
	echo ""
fi

# ── Report: Placeholder-only diffs ────────────────────────────────────
if [ ${#PLACEHOLDER_FILES[@]} -gt 0 ]; then
	echo -e "[PLACEHOLDER] ${#PLACEHOLDER_FILES[@]} files differ only in project name substitutions (skipped)"
	echo ""
fi

# ── Report: Unchanged ─────────────────────────────────────────────────
echo -e "[SAME] ${#SAME_FILES[@]} files unchanged"
echo ""

# ── Summary ────────────────────────────────────────────────────────────
TOTAL_CHANGES=$(( ${#NEW_FILES[@]} + ${#UPDATED_FILES[@]} + ${#DELETED_FILES[@]} ))
echo -e "${BOLD}═══ SUMMARY ═══${NC}"
echo -e "  Template ref:    ${CYAN}${TEMPLATE_REF}${NC}"
echo -e "  Template SHA:    ${CYAN}${TEMPLATE_HEAD_SHA:0:12}${NC}"
echo -e "  Add files:       ${GREEN}${#NEW_FILES[@]}${NC}"
echo -e "  Modify files:    ${YELLOW}${#UPDATED_FILES[@]}${NC}"
echo -e "  Delete files:    ${RED}${#DELETED_FILES[@]}${NC}"
echo -e "  Placeholder:     ${#PLACEHOLDER_FILES[@]}"
echo -e "  Unchanged:       ${#SAME_FILES[@]}"
echo -e "  Total changes:   ${BOLD}${TOTAL_CHANGES}${NC}"
echo ""

if [ "$TOTAL_CHANGES" -eq 0 ]; then
	echo -e "${GREEN}Your project is up to date with the template.${NC}"
	if [ "$DRY_RUN" = false ]; then
		update_template_version "$TEMPLATE_HEAD_SHA"
	fi
	exit 0
fi

# ── Dry run stops here ────────────────────────────────────────────────
if [ "$DRY_RUN" = true ]; then
	echo -e "${YELLOW}DRY RUN complete — no files were modified.${NC}"
	echo "Run without --dry-run to apply changes."
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
		echo -e "${GREEN}[ADD]${NC} $file"
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
		echo -e "${YELLOW}[MODIFY]${NC} $file"
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

	# Process deleted files
	for file in "${DELETED_FILES[@]}"; do
		echo -e "${RED}[DELETE]${NC} $file"
		while true; do
			read -p "  (d)elete / (s)kip: " choice
			case "$choice" in
				d|delete)
					rm "$file"
					echo -e "  ${RED}Deleted.${NC}"
					ACCEPTED=$((ACCEPTED + 1))
					break ;;
				s|skip)
					echo -e "  ${YELLOW}Skipped.${NC}"
					SKIPPED=$((SKIPPED + 1))
					break ;;
				*) echo "  Enter d or s" ;;
			esac
		done
		echo ""
	done

	echo -e "${BOLD}═══ DONE ═══${NC}"
	echo -e "  Accepted: ${GREEN}${ACCEPTED}${NC}"
	echo -e "  Skipped:  ${YELLOW}${SKIPPED}${NC}"
	echo ""

	# Update version file after interactive sync
	update_template_version "$TEMPLATE_HEAD_SHA"

	if [ "$ACCEPTED" -gt 0 ]; then
		echo "Review accepted changes, then commit:"
		echo "  git add -A && git commit -m 'Sync from template ${TEMPLATE_REF}'"
	fi
else
	# Report mode — show next steps
	echo -e "${BOLD}═══ NEXT STEPS ═══${NC}"
	echo ""
	echo "Review changes and decide what to adopt:"
	echo ""
	echo "  # Dry run (see what would change):"
	echo "  bin/sync-from-template.sh --dry-run"
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
