#!/usr/bin/env bash
# ============================================================================
# CAPTHCA land — Check domain mapping and SSL status
# Usage: bin/domain-status.sh [domain]
# ============================================================================
set -euo pipefail

PROJECT="capthca-489205"
REGION="us-central1"
DOMAIN="${1:-}"

if [ -z "$DOMAIN" ]; then
	echo "==> All domain mappings for $PROJECT:"
	echo ""
	gcloud beta run domain-mappings list \
		--project="$PROJECT" \
		--region="$REGION" \
		--format="table(metadata.name,spec.routeName,status.conditions[0].status:label=READY,status.conditions[1].status:label=CERT)"
	echo ""
	echo "Usage: bin/domain-status.sh <domain> for details"
else
	echo "==> Domain: $DOMAIN"
	echo ""

	# DNS check
	echo "--- DNS ---"
	nslookup "$DOMAIN" 8.8.8.8 2>/dev/null | grep -A2 "Non-authoritative" || echo "DNS not resolving"
	echo ""

	# SSL cert status
	echo "--- SSL Certificate ---"
	gcloud beta run domain-mappings describe \
		--domain="$DOMAIN" \
		--project="$PROJECT" \
		--region="$REGION" \
		--format="yaml(status.conditions)" 2>&1
	echo ""

	# Service info
	SERVICE=$(gcloud beta run domain-mappings describe \
		--domain="$DOMAIN" \
		--project="$PROJECT" \
		--region="$REGION" \
		--format="value(spec.routeName)" 2>/dev/null)
	if [ -n "$SERVICE" ]; then
		echo "--- Service: $SERVICE ---"
		gcloud run services describe "$SERVICE" \
			--project="$PROJECT" \
			--region="$REGION" \
			--format="table(status.url,status.traffic[].percent,status.traffic[].revisionName)" 2>/dev/null
	fi
fi
