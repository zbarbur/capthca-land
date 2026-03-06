#!/usr/bin/env bash
# ============================================================================
# CAPTHCA land — Local Development Stack
# Usage: bin/local-stack.sh [start|stop|status|start-prod]
# ============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

FIRESTORE_EMULATOR_PORT=8080

usage() {
	echo "Usage: bin/local-stack.sh <command>"
	echo ""
	echo "Commands:"
	echo "  start       Start the development server (with hot reload)"
	echo "  start-prod  Start in production mode (for performance testing)"
	echo "  stop        Stop all running services"
	echo "  status      Show running service status"
	echo ""
	echo "IMPORTANT: Always use this script, never raw 'npm run dev'."
}

start_firestore_emulator() {
	# Try real Firestore emulator (requires Java 8+)
	if command -v gcloud &>/dev/null && java -version &>/dev/null; then
		echo "==> Starting Firestore emulator on port $FIRESTORE_EMULATOR_PORT..."
		export FIRESTORE_EMULATOR_HOST="localhost:$FIRESTORE_EMULATOR_PORT"
		gcloud emulators firestore start --host-port="localhost:$FIRESTORE_EMULATOR_PORT" &>/dev/null &
		echo "Firestore emulator at $FIRESTORE_EMULATOR_HOST"
	else
		echo "==> Firestore emulator unavailable (needs gcloud + Java 8+)."
		echo "    Using in-memory store for local development."
	fi
}

cmd_start() {
	echo "==> Starting development stack..."
	start_firestore_emulator
	cd "$PROJECT_DIR/dashboard"
	FIRESTORE_EMULATOR_HOST="localhost:$FIRESTORE_EMULATOR_PORT" npm run dev &
	echo ""
	echo "Dashboard running at http://localhost:3000"
	echo "Firestore emulator at localhost:$FIRESTORE_EMULATOR_PORT"
}

cmd_start_prod() {
	echo "==> Starting production-mode stack (for performance testing)..."
	cd "$PROJECT_DIR/dashboard"
	npm run build && npm run start &
	echo "Dashboard running at http://localhost:3000 (production mode)"
}

cmd_stop() {
	echo "==> Stopping development stack..."
	# Kill Next.js dev server
	lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null || true
	# Kill Firestore emulator
	lsof -ti:$FIRESTORE_EMULATOR_PORT 2>/dev/null | xargs kill -9 2>/dev/null || true
	echo "Stopped."
}

cmd_status() {
	echo "==> Service status:"
	if lsof -i:3000 &>/dev/null; then
		echo "  Dashboard:  RUNNING (port 3000)"
	else
		echo "  Dashboard:  STOPPED"
	fi
	if lsof -i:$FIRESTORE_EMULATOR_PORT &>/dev/null; then
		echo "  Firestore:  RUNNING (port $FIRESTORE_EMULATOR_PORT)"
	else
		echo "  Firestore:  STOPPED"
	fi
}

case "${1:-}" in
	start) cmd_start ;;
	start-prod) cmd_start_prod ;;
	stop) cmd_stop ;;
	status) cmd_status ;;
	*) usage ;;
esac
