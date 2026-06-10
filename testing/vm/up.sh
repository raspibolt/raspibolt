#!/usr/bin/env bash
# Bring up the RaspiBolt test VM (systemd-in-docker).
# Usage: testing/vm/up.sh [--reset]
#
# --reset   tear the container + data volume down first (fresh box).
#
# Generates an isolated SSH keypair on first run, mounts the pubkey
# into the container as admin's authorized_keys, then waits until
# sshd answers on 127.0.0.1:2222.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

KEY="$SCRIPT_DIR/id_testvm"
PUB="$KEY.pub"

if [[ "${1:-}" == "--reset" ]]; then
  docker compose down -v 2>/dev/null || true
  docker volume rm vm_testvm-data 2>/dev/null || true
fi

if [[ ! -f "$KEY" ]]; then
  echo "[vm] generating isolated SSH key at $KEY"
  ssh-keygen -t ed25519 -N '' -f "$KEY" -C 'raspibolt-testvm' >/dev/null
fi

echo "[vm] building + starting container"
docker compose up -d --build

echo "[vm] seeding admin authorized_keys via docker cp (rw, real-Pi shape)"
# Give systemd a beat to create /home/admin (it exists from the image,
# but a fresh container may still be booting useradd's runtime state).
for _ in {1..20}; do
  if docker exec raspibolt-testvm test -d /home/admin 2>/dev/null; then
    break
  fi
  sleep 0.5
done
docker exec raspibolt-testvm install -d -m 0700 -o admin -g admin /home/admin/.ssh
docker cp "$PUB" raspibolt-testvm:/home/admin/.ssh/authorized_keys
docker exec raspibolt-testvm chown admin:admin /home/admin/.ssh/authorized_keys
docker exec raspibolt-testvm chmod 600 /home/admin/.ssh/authorized_keys

echo "[vm] waiting for sshd on 127.0.0.1:2222"
for _ in {1..60}; do
  if ssh -i "$KEY" \
         -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
         -o ConnectTimeout=2 -o LogLevel=ERROR \
         -p 2222 admin@127.0.0.1 'echo ok' >/dev/null 2>&1; then
    echo "[vm] ready"
    exit 0
  fi
  sleep 1
done

echo "[vm] sshd did not come up in 60s" >&2
docker compose logs --tail=50 raspibolt-vm >&2
exit 1
