#!/usr/bin/env bash
# Autonomous walkthrough of the core install pages against the test VM.
# Reads meta.json nav ordering, runs each page's extracted .sh inside
# the VM over SSH, captures per-page stdout + stderr + exit code, and
# writes a structured summary at testing/runs/<timestamp>/SUMMARY.md.
#
# The runner never halts on failure: every failure is data. Triage is
# a morning-after job.
#
# Usage:
#   testing/run-walk.sh                       # VM walk, signet (default)
#   testing/run-walk.sh --mainnet             # full mainnet IBD (~700 GB!)
#   testing/run-walk.sh --signet              # force signet (the default)
#   testing/run-walk.sh --only bitcoin        # one section only
#   testing/run-walk.sh --target pi           # walk a real Raspberry Pi
#                                             # (defaults to mainnet) via
#                                             # testing/pi/ssh.sh
#                                             # (set RASPIBOLT_PI_HOST etc.)
#
# The VM defaults to signet so the walk never does a full mainnet IBD that
# fills the host disk (on WSL2 that crashes the whole VM). See
# testing/vm/README.md.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

# ── Arg parsing ────────────────────────────────────────────
# CHAIN selects the Bitcoin network the walk runs on. The VM defaults to
# signet: a tutorial-validation box has no business doing a ~700 GB mainnet
# IBD that fills the host disk (and on WSL2 grows the VHDX until C: is full
# and the whole VM crashes). A real Pi (--target pi) defaults to mainnet,
# the actual guide target. Override either way with --mainnet / --signet.
CHAIN=""
ONLY=""
TARGET="vm"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --signet)   CHAIN="signet"; shift ;;
    --mainnet)  CHAIN="mainnet"; shift ;;
    --only)     ONLY="$2"; shift 2 ;;
    --target)   TARGET="$2"; shift 2 ;;
    *) echo "unknown flag: $1" >&2; exit 2 ;;
  esac
done

if [[ -z "$CHAIN" ]]; then
  case "$TARGET" in
    pi) CHAIN="mainnet" ;;
    *)  CHAIN="signet" ;;
  esac
fi

SSH="$SCRIPT_DIR/$TARGET/ssh.sh"
if [[ ! -x "$SSH" ]]; then
  echo "[run] target '$TARGET' has no executable ssh wrapper at $SSH" >&2
  exit 2
fi

# ── Core pipeline order ───────────────────────────────────
# Curated. Skip: backstory, architecture, faq, troubleshooting (prose),
# raspberry-pi/{index,preparations,operating-system} (0-block pages,
# the last two are GUI / flashing the SSD). Bonus pages are excluded
# from the core walk entirely; they're optional extras.
# Each entry: "page:timeout_seconds". Timeout caps per-page wall time
# so a `journalctl -f` or `tail -f` on a daemon that never exits can't
# hang the whole walk. Values are generous; pages hitting timeout are
# a signal of a blocking-command bug, not a real slow step.
PIPELINE=(
  "raspberry-pi/remote-access:120"
  "raspberry-pi/system-configuration:600"
  "raspberry-pi/security:300"
  "raspberry-pi/privacy:300"
  "bitcoin/bitcoin-client:1200"
  "bitcoin/electrum-server:3000"
  "bitcoin/blockchain-explorer:900"
  "lightning/lightning-client:600"
  "lightning/web-app:900"
  "lightning/mobile-app:180"
  "lightning/channel-backup:180"
)

if [[ -n "$ONLY" ]]; then
  filtered=()
  for entry in "${PIPELINE[@]}"; do
    page="${entry%%:*}"
    [[ "$page" == "$ONLY"* ]] && filtered+=("$entry")
  done
  PIPELINE=("${filtered[@]}")
fi

# ── Run setup ─────────────────────────────────────────────
TS="$(date +%Y%m%d-%H%M%S)"
RUN_DIR="$REPO_ROOT/testing/runs/$TS"
mkdir -p "$RUN_DIR/pages"
SUMMARY="$RUN_DIR/SUMMARY.md"

MODE="$CHAIN"

case "$TARGET" in
  vm) TARGET_DESC="raspibolt-testvm (Debian 13 Trixie, systemd-in-docker)" ;;
  pi) TARGET_DESC="real Pi at ${RASPIBOLT_PI_USER:-admin}@${RASPIBOLT_PI_HOST:-?}:${RASPIBOLT_PI_PORT:-22}" ;;
  *)  TARGET_DESC="$TARGET" ;;
esac

cat > "$SUMMARY" <<EOF
# Walkthrough: $TS

- Started: $(date -Iseconds)
- Mode: $MODE
- Target: $TARGET_DESC
- Guide sha: $(cd "$REPO_ROOT" && git rev-parse --short HEAD)
- Guide branch: $(cd "$REPO_ROOT" && git rev-parse --abbrev-ref HEAD)

## Per-page result

| Page | Blocks run | Exit code | Notes |
|---|---|---|---|
EOF

# Refresh extraction so runner sees current guide prose.
# TEST_ARCH=amd64 rewrites the ARM64 download filenames to x86_64 so
# Bitcoin Core / LND binaries run natively under Docker (no QEMU). Set
# TEST_ARCH=arm64 to preserve ARM64 tokens (real Pi / ARM VM runs).
echo "[run] regenerating steps from current guide prose (TEST_ARCH=${TEST_ARCH:-amd64})"
TEST_ARCH="${TEST_ARCH:-amd64}" \
  node "$REPO_ROOT/testing/extract/extract-steps.mjs" >/dev/null

# Verify target reachable
if ! "$SSH" 'true' 2>/dev/null; then
  echo "[run] target '$TARGET' not reachable via $SSH" >&2
  case "$TARGET" in
    vm) echo "[run] hint: run testing/vm/up.sh first" >&2 ;;
    pi) echo "[run] hint: check RASPIBOLT_PI_HOST, ssh key, and that the Pi accepts ${RASPIBOLT_PI_USER:-admin}@${RASPIBOLT_PI_HOST:-<host>}" >&2 ;;
  esac
  exit 1
fi

# ── Signet overlay ────────────────────────────────────────
# Rewrite a page's extracted script in place so the walk runs on signet
# instead of mainnet. Applied to the wrapper before it ships over SSH, so
# the guide prose (and the committed steps/*.sh) stay pure mainnet.
#
# The chain is forced on bitcoind's systemd ExecStart (-signet), not only
# in bitcoin.conf: the bitcoin-client page rewrites bitcoin.conf again
# after the (simulated) sync, which would drop a conf-only chain line. A
# command-line flag survives that rewrite and every systemctl restart.
# electrs, LND, RTL, and the SCB watcher are pointed at the same chain,
# RPC port (signet = 38332), and chain/bitcoin/<net>/ data subdir.
apply_signet_overlay() {
  local page="$1" file="$2"

  if [[ "$page" == "bitcoin/bitcoin-client" ]]; then
    sed -i -E \
      -e 's|(/usr/local/bin/bitcoind -daemon) \\$|\1 -signet \\|' \
      -e '/^__EOF_CFG__$/i signet=1' \
      "$file"
  fi

  # Network-specific rewrites. Safe to attempt on every page: each is a
  # no-op where the pattern is absent.
  sed -i -E \
    -e 's/^network = "bitcoin"$/network = "signet"/' \
    -e 's/^bitcoin\.mainnet=true$/bitcoin.signet=true/' \
    -e 's|127\.0\.0\.1:8332|127.0.0.1:38332|g' \
    -e 's|chain/bitcoin/mainnet/|chain/bitcoin/signet/|g' \
    "$file"
}

# ── Per-page runner ───────────────────────────────────────
total_pass=0
total_fail=0
total_skip=0

run_page() {
  local entry="$1"
  local page="${entry%%:*}"
  local timeout_s="${entry##*:}"
  [[ "$timeout_s" == "$page" ]] && timeout_s=300
  local script="$REPO_ROOT/testing/steps/${page}.sh"
  local log="$RUN_DIR/pages/${page//\//__}.log"
  mkdir -p "$(dirname "$log")"

  if [[ ! -f "$script" ]]; then
    echo "[run] SKIP $page (no extracted script)"
    echo "| \`$page\` | - | skip | script missing |" >> "$SUMMARY"
    ((total_skip++)) || true
    return 0
  fi

  local bash_blocks
  bash_blocks=$(grep -c '^# ----- step .* lang=\(bash\|sh\|shell\)' "$script" || true)
  if [[ "$bash_blocks" == "0" ]]; then
    echo "[run] SKIP $page (no bash blocks to run)"
    echo "| \`$page\` | 0 | skip | no bash blocks |" >> "$SUMMARY"
    ((total_skip++)) || true
    return 0
  fi

  echo "[run] =============================="
  echo "[run] $page  ($bash_blocks bash blocks)"
  echo "[run] =============================="

  # Relax: we remove set -e because one bad step shouldn't stop the
  # whole page script; we want to see what does and doesn't work.
  # Preserve unset-var safety (-u) and pipefail, add -x for trace, and
  # record failures so a page with any failed command cannot be reported
  # as PASS after the remaining steps have run.
  # Rewrite blocking commands on the fly: `journalctl -f` and
  # `tail -f` would hang the page; replace with a single-shot read.
  # Also rewrite `watch` to a one-shot equivalent.
  local wrapper
  wrapper=$(mktemp)
  {
    echo '#!/usr/bin/env bash'
    echo 'set -uo pipefail'
    echo 'set +e'
    echo 'set -x'
    echo 'failures=0'
    echo 'trap '\''rc=$?; ((failures++)); printf "[walk] command failed (rc=%s): %s\\n" "$rc" "$BASH_COMMAND" >&2'\'' ERR'
    sed -e '1,/^set -euo pipefail$/d' "$script" \
      | sed -E \
          -e 's/journalctl +-f +/journalctl --no-pager -n 50 /g' \
          -e 's/ tail +-f +/ tail -n 50 /g' \
          -e 's/^watch +/echo "[skipped watch] "/g' \
          -e 's/^sudo +-u +bitcoin +bitcoin-cli +-netinfo +[0-9]+.*/sudo -u bitcoin bitcoin-cli getconnectioncount/g'
    echo 'if (( failures > 0 )); then exit 1; fi'
  } > "$wrapper"

  [[ "$CHAIN" == "signet" ]] && apply_signet_overlay "$page" "$wrapper"

  local rc=0
  "$SSH" "timeout --foreground $timeout_s bash -s" \
    < "$wrapper" > "$log" 2>&1 || rc=$?
  rm -f "$wrapper"
  [[ $rc -eq 124 ]] && echo "[run] TIMEOUT after ${timeout_s}s" >> "$log"

  if [[ $rc -eq 0 ]]; then
    echo "[run] PASS $page"
    ((total_pass++)) || true
    echo "| \`$page\` | $bash_blocks | 0 | ok |" >> "$SUMMARY"
  else
    echo "[run] FAIL $page rc=$rc (continuing; see $log)"
    ((total_fail++)) || true
    local errline
    errline=$(grep -F '[walk] command failed' "$log" | tail -1 | head -c 200 || true)
    echo "| \`$page\` | $bash_blocks | $rc | failure: \`${errline//|/\\|}\` |" >> "$SUMMARY"
  fi
}

for entry in "${PIPELINE[@]}"; do
  run_page "$entry"
done

# ── Final summary ─────────────────────────────────────────
cat >> "$SUMMARY" <<EOF

## Totals

- Passed: $total_pass
- Failed: $total_fail
- Skipped: $total_skip
- Finished: $(date -Iseconds)
EOF

echo "[run] done. Summary: $SUMMARY"
echo "[run] pass=$total_pass fail=$total_fail skip=$total_skip"
