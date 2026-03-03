#!/usr/bin/env bash
# ============================================================================
# CAPTHCA land — Demo Data Generator
# Usage: bin/gen-demo.sh [--count N] [--dry-run]
#
# Generates realistic demo data for development and staging.
# This should be the single source of truth for demo data —
# never hand-edit data files directly.
# ============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "==> Generating demo data..."
echo ""
echo "==> TODO: Implement demo data generation."
echo "    Create a TypeScript script (e.g., bin/gen-demo-data.ts) and call it here."
echo "    See docs/guides/DATA_INTEGRITY.md for write verification patterns."
echo ""
echo "    Example: npx tsx bin/gen-demo-data.ts \"\$@\""
