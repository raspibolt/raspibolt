# Autonomous walkthrough: status report

Guide branch: `feature/v4-rewrite`
VM: Debian 13 Trixie, systemd-in-docker, native amd64 (arch-rewrite for Pi-only tokens)

## TL;DR

Built a Docker-based test harness, an MDX step extractor, and a page-by-page runner. Latest walk (2026-06-10, after the v4 review-fix round): **11 PASS / 0 FAIL / 0 SKIP** on the 11-page core pipeline (Pi setup → Bitcoin → Lightning). Three real guide bugs fixed on the way; one known open (see "Known open" below).

## The harness

- `testing/vm/` — Dockerfile + compose.yml for a systemd-enabled Debian Trixie container with `admin` user, passwordless sudo, sshd on `127.0.0.1:2222`. `up.sh` seeds admin's `authorized_keys` via `docker cp` on first boot (writable, same shape as a real Pi). `/usr/sbin/policy-rc.d` is removed at build time so apt postinst can auto-start services (Tor, Tailscale) the way Debian does on bare metal. No QEMU: instead, an arch-rewrite in the extractor substitutes `aarch64-linux-gnu` → `x86_64-linux-gnu` and `linux-arm64` → `linux-amd64` when `TEST_ARCH=amd64` so Bitcoin Core and LND binaries run natively.
- `testing/extract/extract-steps.mjs` — walks `guide/**/*.mdx`, parses each page via `remark-mdx`, expands `%versions|files|urls.X%` tokens inline, and emits one runnable `.sh` per page. Conventions it understands:
  - **`sudo su - USER` ... `exit` sessions**. Intervening blocks get wrapped in a single `sudo -u USER bash <<'__SESSION_USER__' ... __SESSION_USER__` heredoc so `VARS`, `cwd`, and file ownership persist across steps. The opener can be a standalone block or the first line of a multi-line block.
  - **Nano + config fusion**. `sudo nano PATH` followed by a non-shell (or shebang-led shell) content block becomes one `sudo tee PATH > /dev/null <<'__EOF_AUTOGEN__' ... __EOF_AUTOGEN__` emission. Inside a session, it becomes `tee PATH` (no sudo) so the file is owned by the session user.
  - **`test:skip` code fence meta**. Opt-out for laptop-side, remote-host-side, or illustrative placeholder blocks (`ssh admin@<tailscale-ip>`, `lncli closechannel --sat_per_vbyte <fee> ...`).
  - **Orphan `exit` stripping**. Bare `exit` blocks at top level (no matching `sudo su -`) are emitted as no-ops so they don't kill the wrapper mid-page.
  - **Interactive editor stripping**. Embedded `nano PATH` lines inside otherwise-runnable multi-line blocks (e.g., `cp template dest; nano dest`) are rewritten as `: # [skipped editor]` comments; the runnable remainder still executes.
- `testing/run-walk.sh` — iterates the 11-page core pipeline, ships each page's script to the VM, captures stdout+stderr+exit-code, writes `testing/runs/<ts>/SUMMARY.md`. Per-page `timeout` against blocking commands (`journalctl -f`, `cargo build`). Never halts on failure. Regenerates extraction on every run with `TEST_ARCH=amd64`.

## Walk history

| Walk  | Pass / Fail | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | 3 / 8       | Shakedown. Blocking `journalctl -f` / `tail -f` hung the runner — fixed with timeouts + sed-rewrites. `apt install` aborts non-interactively without `-y` — fixed with VM-side `Assume-Yes`. `/usr/sbin` absent from non-root PATH — fixed via `/etc/environment`.                                                                                                                                                                                 |
| 2     | 4 / 7       | Blockchain-explorer green. Surfaced raw `%versions%` tokens shipping to VM (`remark().parse()` doesn't run plugins). `sudo nano PATH` + config-block pattern unrecoverable as `__MANUAL__`. Both fixed.                                                                                                                                                                                                                                            |
| 3     | 4 / 7       | Tokens + nano-fusion work. Electrs `cargo build` advanced but failed on `clang-sys` — real guide bug, missing `libclang-dev` + `pkg-config`. Fixed. `bitcoind` failed under QEMU + systemd hardening (`MemoryDenyWriteExecute` vs QEMU JIT).                                                                                                                                                                                                       |
| 4     | 4 / 7       | `su -` regex fixed. `lightning/lightning-client` PASS. Laptop-side blocks (`remote-access`, `privacy` placeholder) still fail. `bitcoind` still fails QEMU. `blockchain-explorer` regressed: skipped `sudo su - btcrpcexplorer` block dropped `VERSION=...`.                                                                                                                                                                                       |
| 5     | 8 / 3       | Dropped QEMU; switched to amd64-arch-rewrite (no more `mprotect` / glibc-loader issues). Removed `policy-rc.d` (Tor/Tailscale auto-start). `docker cp` the authorized_keys. `sudo su - USER` session grouping fixed `bitcoin-client`, `electrum-server`, `blockchain-explorer`. Remaining: `security` hit `/boot/firmware/config.txt`, `lightning-client` hit sudo-inside-`sudo su - lnd`, `channel-backup` hit `lncli` placeholder syntax errors. |
| **6** | **11 / 0**  | Final. Security `/boot/firmware/config.txt` marked `test:skip` (Pi-firmware-only). Lightning-client fixed: real guide bug, `sudo install` runs inside `sudo su - lnd` session where `lnd` user (no sudoer, no password) can't auth. Added explicit `exit` before the install and `sudo su - lnd` after. Channel-backup: interactive `lncli create` + external-SSH blocks marked `test:skip`.                                                       |
| **7** | **11 / 0**  | Re-validation after the v4 review-fix round (2026-06-10): one-command-per-block sweep, `bitcoin.basefee`/`feerate` moved to `[Bitcoin]` in lnd.conf, new `test:append` fusion writes the PAM limits lines with `tee -a` instead of replacing the files, Node.js version tokens resolved via the extractor mirror. All green, no regressions.                                                                                                       |

## Real guide bugs found and fixed

1. **`guide/bitcoin/electrum-server.mdx` — missing Electrs build deps** (walk 3). `sudo apt install cargo clang cmake build-essential` lacked `libclang-dev` + `pkg-config`, so `clang-sys` failed at `cargo build`. Fixed.
2. **`guide/bitcoin/blockchain-explorer.mdx` — NodeSource install line had trailing comma** (walk 5). `curl ... | sudo -E bash,` ran a command literally named `bash,`; NodeSource repo never got added; `apt install nodejs` silently fell through to Debian's Node 20 which no longer bundles `npm`. Fixed.
3. **`guide/lightning/mobile-app.mdx` — `xxd` never installed** (walk 5). The macaroon-hex step uses `xxd`, but on Debian 13 it's a separate package. Added to the apt install line.
4. **`guide/lightning/lightning-client.mdx` — `sudo install` runs inside `sudo su - lnd` session** (walk 6). `lnd` is created with `--disabled-password`, so `sudo install ...` as the `lnd` user hangs on a TTY prompt and no password can satisfy it. Restructured the Install section: explicit `exit` before the install (runs as admin), re-enter `sudo su - lnd` for the password-file + lnd.conf steps.

## Fifth real guide bug (fixed, from this round)

**Electrs tag verification switched from GPG to SSH** as of v0.11.1. Roman publishes the ed25519 signing key at [github.com/romanz/keys](https://github.com/romanz/keys), whose `README.md` is PGP-signed by the old GPG key (`15C8 C357 4AE4 F1E2 5F3F 35C5 87CA E5FA 4691 7CBB`), binding the transition. Guide now writes the key into `~/.config/git/allowed_signers`, sets `gpg.format=ssh` + `gpg.ssh.allowedSignersFile`, and verifies with `git verify-tag v%versions.electrs%`. Expected output pinned to `Good "git" signature for git@romanzey.de with ED25519 key SHA256:GifMn7F2swVKyn6MewbQHrYCs4i/bPK7gnwxhuPz/YA`.

## Container-specific stubs on the test env

These aren't guide bugs; they disappear on real Pi hardware (Phase C).

- **`bitcoind` + QEMU JIT vs `MemoryDenyWriteExecute`** — obsolete with arch-rewrite, but noted for any future test that pins ARM binaries.
- **`/boot/firmware/config.txt`** — Pi-firmware-only path. Marked `test:skip` in `security.mdx`.
- **`/data/lnd/data/chain/bitcoin/mainnet/...`** — appears only after LND has actually run with a wallet. The tests install + unit-enable LND; actually running + unlocking LND takes a wallet seed and chain sync, which is Phase C work. Marked `test:skip` on reader-side verification commands (`lncli getinfo`, channel ops).

## Extractor conventions (for future contributors)

- Wrap a reader's "become USER, do stuff, exit" in `sudo su - USER` ... `exit` exactly. Any shape the extractor recognises becomes one `sudo -u USER bash <<EOF ...` session in the test wrapper.
- Mark a `sudo nano PATH` block whose following content block ADDS a line to an existing file with `test:append`; the fusion then emits `tee -a` instead of a replacing `tee` (e.g. the PAM limits lines in `security.mdx`).
- Mark code fences that a test harness can't run with `test:skip`:
  - ` ```bash test:skip ` for laptop-side, remote-host-side, or placeholder blocks.
  - Works for standalone `sudo su - USER` blocks too (suppresses the session grouping).
- For file-write blocks, favour `sudo nano PATH` followed by the content in the next fence. The extractor will fuse them.
- A lone top-level `exit` (reader instruction to log out) is fine and gets stripped.

## Artifact locations

- `testing/runs/20260610-114301/` — latest green run (post review fixes). Per-page logs + `SUMMARY.md`.
- `testing/runs/20260422-105902/` — final green run of the original harness round.
- `testing/steps/` — latest extraction, one `.sh` + `.json` per guide page.

## Next: Phase C (real Pi 5)

The container harness is done. Next qualitative step is running the
same extracted scripts against an actual Raspberry Pi 5 over SSH.

What changes on real hardware:

- Drop the `TEST_ARCH=amd64` arch-rewrite; leave tokens at ARM64.
- Remove the `test:skip` bypass on `/boot/firmware/config.txt`,
  `lsblk`, `hdparm`, `sudo tailscale up`. All of these become real
  on-hardware operations.
- `bitcoind` actually does IBD. Signet ~2h end to end, mainnet ~3 days
  (IBD is the long pole).
- `electrs` actually indexes. On a Pi 5 with NVMe, 8-12h for the
  first pass per the guide callout.
- Real Tor hidden-service + Lightning peer connectivity.

What stays the same:

- The extractor. Remove the arch-rewrite conditional and re-run.
- The `sudo su - USER` session shape, `test:skip` meta, and extractor
  conventions documented above.
- The page runner. Point `ssh.sh` at the Pi's tailnet IP instead of
  `127.0.0.1:2222`.

Expected-output harvest will grow considerably in Phase C: `lncli
getinfo` with a real `identity_pubkey`, `bitcoind getblockchaininfo`,
`electrs` tip-caught-up log lines, `ufw status verbose` post-config.
Harvest from the live Pi, paste verbatim, per the
`feedback_no_fabricated_output` rule.

One still-open item that the Pi run will validate: the Electrs
SSH-verify flow (from `github.com/romanz/keys` into
`~/.config/git/allowed_signers`) works under amd64 + fresh admin user
in the container. A Pi that's already had `gpg.format=ssh` tuned will
not re-test this; start from a freshly-flashed Pi OS for the Phase C
pass.
