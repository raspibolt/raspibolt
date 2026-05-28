#!/usr/bin/env bash
# Wrapper around ssh into a real Raspberry Pi for guide walkthroughs.
# Mirrors testing/vm/ssh.sh but reads target host, port, user and key
# from environment variables so the same script works against any Pi
# without changes.
#
# Required env vars (no defaults that would silently pick the wrong host):
#   RASPIBOLT_PI_HOST   IP or hostname of the target Pi, e.g. 192.168.1.42
#
# Optional, with safe defaults that match the guide's own conventions:
#   RASPIBOLT_PI_PORT   SSH port, default 22
#   RASPIBOLT_PI_USER   SSH user, default 'admin' (the guide's convention)
#   RASPIBOLT_PI_KEY    Path to private key. If unset, ssh-agent or
#                       ~/.ssh/config is used.
#
# Examples:
#   RASPIBOLT_PI_HOST=raspibolt.local testing/pi/ssh.sh uname -a
#   RASPIBOLT_PI_HOST=192.168.1.42 RASPIBOLT_PI_KEY=~/.ssh/id_pi \
#     testing/pi/ssh.sh -T < script.sh

set -euo pipefail

: "${RASPIBOLT_PI_HOST:?RASPIBOLT_PI_HOST not set. Export it first, e.g. 'export RASPIBOLT_PI_HOST=raspibolt.local'.}"
PORT="${RASPIBOLT_PI_PORT:-22}"
USER="${RASPIBOLT_PI_USER:-admin}"

ssh_opts=(-o LogLevel=ERROR)
[[ -n "${RASPIBOLT_PI_KEY:-}" ]] && ssh_opts+=(-i "$RASPIBOLT_PI_KEY")

exec ssh "${ssh_opts[@]}" -p "$PORT" "$USER@$RASPIBOLT_PI_HOST" "$@"
