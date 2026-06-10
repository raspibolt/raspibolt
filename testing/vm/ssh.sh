#!/usr/bin/env bash
# Wrapper around ssh into the test VM. Args forwarded to ssh.
# Examples:
#   testing/vm/ssh.sh                  # interactive shell
#   testing/vm/ssh.sh 'uname -a'       # one-shot
#   testing/vm/ssh.sh -T < script.sh   # pipe a script in

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KEY="$SCRIPT_DIR/id_testvm"
exec ssh -i "$KEY" \
  -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
  -o LogLevel=ERROR \
  -p 2222 admin@127.0.0.1 "$@"
