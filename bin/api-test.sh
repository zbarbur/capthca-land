#!/usr/bin/env bash
# ============================================================================
# CAPTHCA land — API Test Helper
# Usage: bin/api-test.sh [curl-args] /api/path
#
# Sends authenticated requests to the local dev server.
# Automatically includes auth headers.
# ============================================================================
set -euo pipefail

BASE_URL="${CAPTHCA_LAND_API_URL:-http://localhost:3000}"
TOKEN="${CAPTHCA_LAND_TOKEN:-}"

if [ -z "$TOKEN" ]; then
	echo "Warning: No CAPTHCA_LAND_TOKEN set. Request will be unauthenticated."
	echo "Set CAPTHCA_LAND_TOKEN=your-api-token for authenticated requests."
	echo ""
fi

# Build curl args
CURL_ARGS=()
if [ -n "$TOKEN" ]; then
	CURL_ARGS+=(-H "Authorization: Bearer $TOKEN")
fi
CURL_ARGS+=(-H "Content-Type: application/json")

# Extract path (last argument)
ARGS=("$@")
PATH_ARG="${ARGS[-1]}"
OTHER_ARGS=("${ARGS[@]:0:$((${#ARGS[@]}-1))}")

echo "==> ${OTHER_ARGS[*]:-GET} ${BASE_URL}${PATH_ARG}"
curl -s "${OTHER_ARGS[@]}" "${CURL_ARGS[@]}" "${BASE_URL}${PATH_ARG}" | jq . 2>/dev/null || cat
echo ""
