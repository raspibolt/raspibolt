# Pi target: real-hardware walkthrough

Same harness as `testing/vm/`, pointed at an actual Raspberry Pi over SSH instead of the local systemd-in-docker container. Catches ARM64-specific issues and validates the guide against real hardware.

## When to use this

- Verifying a guide change before publishing it.
- Catching issues the x86 VM walk can't see: ARM64 binaries, real network, Tor latency, SSD vs ramdisk, real systemd-on-Raspberry-Pi-OS quirks.
- Spot-checking a single page (`--only`) after editing it.

## When not to use this

- For tight inner-loop edits during prose work. The VM walk is faster, cheaper, and good enough for ~90% of the surface.
- On a Pi that runs a production node you care about. The walk is destructive: it reinstalls packages, rewrites config files, recreates users.

## Prep on the Pi side

You need a Pi that is **safe to wipe**, with the SSD attached and its blockchain data at `/data/bitcoin` preserved (the walk recreates everything else: users, config, systemd units, certs, etc).

Recommended flow if the Pi currently runs a node you don't need anymore but want to keep the chain data:

1. **Detach the SSD physically** so the OS flash can't touch it by accident.
2. **Fresh-flash Raspberry Pi OS Trixie 64-bit** onto the boot media (microSD or NVMe). Use the standard guide settings: hostname `raspibolt`, user `admin` with **password [A]**, your SSH public key authorised at first boot.
3. **First boot, attach the SSD back.** SSH in to confirm `/data/bitcoin/blocks/` is still there.
4. **No further manual prep** is needed. The walk handles everything from this point.

If you'd rather not detach the SSD, `/data/bitcoin` survives the walk anyway (`mkdir /data/bitcoin` in the bitcoin-client step will fail with "file exists" and the walk continues; `chown` is idempotent; `bitcoind` picks up the existing chain on startup).

## Prep on the dev-machine side

Set these env vars before running:

```bash
export RASPIBOLT_PI_HOST=raspibolt.local      # or the IP
export RASPIBOLT_PI_USER=admin                # default, can omit
export RASPIBOLT_PI_PORT=22                   # default, can omit
export RASPIBOLT_PI_KEY=~/.ssh/id_ed25519     # only if not in ssh-agent
```

Smoke-test the SSH wrapper:

```bash
testing/pi/ssh.sh 'uname -a && grep PRETTY /etc/os-release'
```

You want to see `aarch64 ... GNU/Linux` and `Debian GNU/Linux 13 (trixie)`.

## Run the walk

Always set `TEST_ARCH=arm64` so the extractor keeps the ARM64 download URLs (otherwise it rewrites them to amd64 for the VM):

```bash
TEST_ARCH=arm64 testing/run-walk.sh --target pi
```

Common variants:

```bash
TEST_ARCH=arm64 testing/run-walk.sh --target pi --only raspberry-pi
TEST_ARCH=arm64 testing/run-walk.sh --target pi --only bitcoin/electrum-server
TEST_ARCH=arm64 testing/run-walk.sh --target pi --signet
```

The report lands at `testing/runs/<timestamp>/SUMMARY.md` with per-page exit codes and last trace lines.

## After the walk

The Pi is in a fully installed state. To re-run the walk, fresh-flash again. The SSD with the blockchain data does not need to be touched between runs.

A fresh flash regenerates the Pi's SSH host keys, so the next connection fails with `REMOTE HOST IDENTIFICATION HAS CHANGED`. Clear the stale entry first:

```bash
ssh-keygen -R "$RASPIBOLT_PI_HOST"
```
