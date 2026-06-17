# RaspiBolt test VM

A systemd-in-Docker box (Debian 13 Trixie) that stands in for a freshly
flashed Raspberry Pi. The walkthrough runner (`testing/run-walk.sh`)
SSHes in and replays the shell commands extracted from the guide, page by
page, so we catch broken steps before readers do.

## Quick start

```bash
testing/vm/up.sh            # build + boot, seed SSH key, wait for sshd
testing/run-walk.sh         # walk the core install pages (signet by default)
testing/vm/down.sh          # stop the container, keep the data volume
```

SSH in by hand with `testing/vm/ssh.sh`. The box listens on
`127.0.0.1:2222`, user `admin`, key `testing/vm/id_testvm`.

## Storage: read this before a mainnet run

All node data (`/data/bitcoin`, `/data/electrs`, `/data/lnd`) lives in the
named Docker volume `vm_testvm-data`. Nothing caps its size.

The default walk runs on **signet**, which keeps the volume to a few GB.
That is deliberate. The walk only needs to prove that commands run,
services start, and configs are valid; it does not need real mainnet
history. `run-walk.sh` forces `-signet` on bitcoind's systemd unit and
points electrs, LND, and RTL at the same chain and RPC port.

A **mainnet** walk is a different animal:

```bash
testing/run-walk.sh --mainnet
```

This triggers a real initial block download. As of 2026 that is **650+ GB**
for the full archival node (the guide uses `txindex=1`, no pruning), plus
the electrs index on top. Only run it if you have the disk and a reason to.

### WSL2 warning

On Windows/WSL2 the Docker volume sits inside a dynamically growing VHDX on
your Windows drive (usually `C:`). The VHDX grows with the blockchain and
**never shrinks on its own**. A mainnet walk has filled `C:` to 100%, at
which point WSL's writes to its virtual disk fail
(`hv_storvsc ... STATUS_UNSUCCESSFUL`), the VM hangs, and Hyper-V restarts
it: a full WSL crash, not just a failed test.

If you must run mainnet under WSL2:

- Confirm free space on the *host* drive exceeds the chain size with margin.
- Better, move Docker Desktop's data root (or bind-mount `/data`) onto a
  drive other than `C:`.
- After wiping the volume, reclaim host space with
  `wsl --shutdown` then `Optimize-VHD` / `diskpart compact`; deleting the
  volume alone does not shrink the VHDX.

## Reset / cleanup

Drop the container **and** its data volume for a clean box:

```bash
testing/vm/up.sh --reset    # tear down + wipe, then rebuild fresh
# or
testing/vm/down.sh --wipe   # tear down + wipe, no rebuild
```

Both run `docker compose down -v` (which removes `vm_testvm-data`). This is
also the recovery path if the volume ever bloats: wipe it, then on WSL2
compact the VHDX as noted above.

To check current usage:

```bash
docker system df -v
```
