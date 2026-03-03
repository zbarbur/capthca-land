#!/usr/bin/env bash
# ============================================================================
# CAPTHCA land — Local Development Stack
# Usage: bin/local-stack.sh [start|stop|status|start-prod]
# ============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

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

cmd_start() {
	echo "==> Starting development stack..."
	cd "$PROJECT_DIR/dashboard"
	npm run dev &
	echo "Dashboard running at http://localhost:3000"
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
	echo "Stopped."
}

cmd_status() {
	echo "==> Service status:"
	if lsof -i:3000 &>/dev/null; then
		echo "  Dashboard: RUNNING (port 3000)"
	else
		echo "  Dashboard: STOPPED"
	fi
}

case "${1:-}" in
	start) cmd_start ;;
	start-prod) cmd_start_prod ;;
	stop) cmd_stop ;;
	status) cmd_status ;;
	*) usage ;;
esac
