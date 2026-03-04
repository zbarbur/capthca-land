#!/usr/bin/env bash
# ============================================================================
# CAPTHCA land — Deploy to Staging
# Usage: bin/deploy-staging.sh [service] [--skip-checks]
#
# Runs full CI checks before deploying unless --skip-checks is passed.
# NEVER use raw 'gcloud run deploy' — this script encodes the correct
# flags, regions, and configurations.
# ============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

SKIP_CHECKS=false
SERVICE="${1:-dashboard}"

for arg in "$@"; do
	case "$arg" in
		--skip-checks) SKIP_CHECKS=true ;;
	esac
done

echo "==> Deploying '$SERVICE' to staging..."

# Run CI checks unless skipped
if [ "$SKIP_CHECKS" = false ]; then
	echo "==> Running CI checks (lint + typecheck + test)..."
	cd "$PROJECT_DIR"
	npm run ci
	echo "==> CI checks passed."
fi

echo "==> Submitting Cloud Build (staging)..."
cd "$PROJECT_DIR"
gcloud builds submit \
	--project=capthca-489205 \
	--config=cloudbuild.yaml \
	--region=us-central1
