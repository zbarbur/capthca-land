#!/usr/bin/env bash
# ============================================================================
# CAPTHCA land — Deploy to Production
# Usage: bin/deploy-production.sh [service]
#
# ALWAYS deploy to staging first. This script requires confirmation.
# NEVER use raw 'gcloud run deploy' for production.
# ============================================================================
set -euo pipefail

SERVICE="${1:-dashboard}"

echo "==> PRODUCTION DEPLOYMENT: '$SERVICE'"
echo ""
echo "Pre-flight checklist:"
echo "  1. Staging deployed and verified?"
echo "  2. CI passing on main?"
echo "  3. No uncommitted changes?"
echo ""
read -p "Continue with production deploy? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
	echo "Aborted."
	exit 1
fi

echo ""
echo "==> TODO: Configure your production deploy command here."
echo "    Example: gcloud builds submit --no-source --config=cloudbuild-deploy.yaml"
echo ""
echo "    See docs/guides/DEPLOYMENT.md for patterns."
