# RaspiBolt v4: open decisions and deferred work

Tracking file for non-urgent items: open design decisions, deferred content work, tooling nice-to-haves. One place to look when a session starts, without touching `CLAUDE.md` (which is in the prompt cache; every edit invalidates it).

Add new items at the top of the relevant section. Strike items by moving them to the "Done" section with the commit hash, or just delete them.

---

## Open decisions

(none)

---

## Pre-cutover checklist

Items to clear before merging v4 to upstream `raspibolt/raspibolt` master:

- **Tag `v3-final`** on the last v3 commit of upstream master, push, then merge v4. Archive plan posted upstream: [raspibolt/raspibolt#1527](https://github.com/raspibolt/raspibolt/issues/1527) (open, awaiting community feedback on whether a rendered v3 site must stay online and where the pointer goes). Resolve that thread before tagging.
- **Add "Looking for v3?" pointer** in v4 footer linking to `https://github.com/raspibolt/raspibolt/tree/v3-final`.
- **Test Tailscale install flow on a Pi 5 Trixie** (see Deferred content below).

---

## Deferred content

- **Bonus sections** (`guide/bonus/**`) are stubs with v3 source links. Full content migration deferred until the main path is battle-tested.
- **Test Tailscale install flow on a Pi 5 Trixie**. The privacy.mdx Tailscale steps are written from upstream docs but haven't been walked on real hardware. Verify before v4 goes live.

---

## Deferred tooling

- **Playwright for web-UI screenshots**. Automate screenshots of RTL, BTC RPC Explorer, Mempool via headless browser. Desktop apps (Sparrow, Raspberry Pi Imager) stay manual. Requires self-hosted runner decision (public repo + self-hosted = fork-PR security concern).
- **CI end-to-end install test in VM**. Weekly Vagrant + Debian 13 Trixie run of the full Hardware + Bitcoin install. Catches upstream package changes before readers hit them. Needs self-hosted runner.
- **Browserless for mobile reading audit**. Self-hosted rendering, not publicly accessible.
- **Bonus page triage**. Pick the ~8 most-demand bonus pages (Mempool, Sparrow Terminal, Fulcrum, LNbits, ThunderHub, ...) and do full v4 rewrites; cut the rest from nav.
- **OG image polish** per page for social sharing. Fumadocs generates them; audit quality.
- **eslint-plugin-mdx** is configured but currently runs on zero files. Either force-include via CLI globs or accept that markdownlint covers MDX adequately.
- **Unit tests for Fumadocs-specific helpers**. Only `lib/remark-variables.ts` has tests. If we add more build-time plugins, wire them the same way.
- **Image optimisation** pending first content page that actually uses images. Decide on `sharp` via `next/image` (needs `output: 'export'` compatibility check) vs pre-optimised PNGs committed to `public/images/`.
- **Preview deploys for PRs**. Not doing this now (user decision). Revisit if the project starts receiving external content PRs.
