#!/usr/bin/env bash
# Stop the test VM. Pass --wipe to also drop the data volume.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
if [[ "${1:-}" == "--wipe" ]]; then
  docker compose down -v
else
  docker compose down
fi
