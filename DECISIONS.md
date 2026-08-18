# RaspiBolt v4 — decisions and project history

Complements [`README.md`](./README.md) (how to contribute) and [`CLAUDE.md`](./CLAUDE.md) (content conventions). Captures **why** things are the way they are.

If a decision here becomes wrong, update this file in the same commit that changes the underlying reality.

---

## Project history

Dates from `git log --all --date=short`. Most of this document captures decisions from the first days of v4, not settled history.

- **2017** — v1 written as a Medium post (see [`backstory.mdx`](./guide/backstory.mdx)).
- **2018-03-15** — repo's first commit (`8c3a906`). Guide runs on **Jekyll** + GitHub Pages for the next several years. `raspibolt.org` becomes canonical.
- **2026-04-21** — v4 kicks off. First commits (`34955b6`, `4beceb8`) start a **Quarto** scaffold. Same day, side-by-side prototypes of Next.js + Fumadocs and hand-crafted HTML (`3f9b8fc`) lead to the pivot to Next.js + Fumadocs (`3204c6c`). Quarto attempt never shipped.
- **2026-04**: v3 content migrated section by section (hardware, Bitcoin, Lightning, bonus stubs). Landing page, styleguide, CI workflows, and Docker-based testing harness built in parallel. At that time, `feature/v4-rewrite` deployed to `stadicus.github.io/RaspiBolt` while `raspibolt.org` continued to serve v3.
- **2026-08-18**: v4 merged into `master` and deployed to `https://raspibolt.org`. `https://next.raspibolt.org` remains the noindexed staging deployment from `feature/v4-rewrite`; `https://v3.raspibolt.org` is the noindexed v3 archive at tag `v3-final`.

---

## Framework

### Why not Jekyll

- No component reuse. Callouts and download blocks were hand-written HTML, duplicated across pages.
- `_variables.yml` tokens didn't expand inside code fences, so version numbers drifted.
- No built-in search, TOC, or reading aids.

### Why not Quarto (tried and dropped 2026-04-21)

- Sidebar is hand-written YAML in `_quarto.yml`; 70+ pages makes it a toil/merge-conflict surface.
- Shortcodes can't replace real components (cards, feature grids, landing page).
- Web-polish features (hover-preview, reading progress, custom 404) need bolted-on JavaScript anyway.

### Why Next.js + [Fumadocs](https://fumadocs.dev)

Out of the box: auto-generated sidebar and TOC from the content tree, client-side search (Orama), MDX + React, light/dark mode, syntax highlighting, callouts, hover-preview cards, static export.

**Tradeoffs:**

- Node 20+ on contributor machines (v3 needed Ruby).
- Fumadocs is newer than Jekyll; MDX content stays portable if we ever migrate.
- Next.js upgrade cadence is faster than Jekyll's.

### Why MDX over plain Markdown

`<Callout type="warn">…</Callout>` with props and type checking vs. shortcodes (string-matched, no props) or raw HTML-in-Markdown (no composition). Contributors editing prose see no difference; contributors adding components get JSX ergonomics.

### Why static export

- **GitHub Pages** serves static files only; free, stable, already wired to `raspibolt.org`.
- Nothing in the guide needs a server: search is client-side, OG images are pre-rendered.

`next.config.mjs` sets `output: 'export'`. See [`.github/workflows/site-publish.yml`](./.github/workflows/site-publish.yml).

### Why Tailwind

Fumadocs ships with it. Utility classes make landing-page iteration fast. Unused classes are purged at build. Style guide lives at [`/styleguide`](./src/app/styleguide/page.tsx).

---

## Content layer

### Version tokens

Versions live in `lib/versions.json` (raw, read by scripts via `jq`) and `lib/versions.ts` (derived filenames + URLs, type-checked). [`lib/remark-variables.ts`](./lib/remark-variables.ts) expands `%versions.X%`, `%files.X%`, `%urls.X%` at MDX compile time, **including inside fenced code blocks** (which Jekyll couldn't). Tests in `lib/remark-variables.test.ts`.

### Directory layout

```
guide/                   all content — contributors work here only
  meta.json              sidebar order
  {raspberry-pi,bitcoin,lightning,bonus}/
  architecture.mdx  backstory.mdx  faq.mdx  troubleshooting.mdx
src/                     Next.js app
lib/                     build-time plugins + shared helpers
```

Content PRs never touch `src/`; reviewers can merge `guide/**` changes without reading app code.

### Internal links

Bare, absolute, extensionless: `/docs/raspberry-pi/preparations`. No `.mdx`, no `.html`, no `../` relative paths. `linkcheck.yml` (Lychee) fails the build on broken links.

### Components in use

`<Callout type="info|warn|success|error">`, `<Screenshot>`, `<Cards>/<Card>`, plus Fumadocs' `Tabs` and `Steps`. New components require a pattern appearing on 3+ pages; prose is preferred otherwise.

---

## Guide content

### Target platform

- **Raspberry Pi 5** (or Pi 4 with 8 GB RAM) on **Debian 13 "Trixie"** (via Raspberry Pi OS).
- **aarch64** download URLs; the test harness rewrites them to amd64 when running the Debian-13-in-Docker harness on a non-Pi box.

Rejected alternatives: Ubuntu Server ARM64 (PaspiOS has better first-party Pi 5 support), NixOS (wrong audience for a first-time node operator), Docker Compose (hides the systemd-unit boundaries readers come here to learn).

### Software choices

| Choice                               | One-line reason                                                                                 |
| ------------------------------------ | ----------------------------------------------------------------------------------------------- |
| **Bitcoin Core**                     | Reference implementation.                                                                       |
| **LND** (vs CLN / Eclair)            | Most mature third-party tooling (RTL, Zeus, LNbits).                                            |
| **Electrs** (vs ElectrumX / Fulcrum) | Rust, single binary, minimal config.                                                            |
| **RTL** (vs ThunderHub / LNbits)     | Focused on LND node management.                                                                 |
| **Tor** for Bitcoin Core + LND P2P   | Hides reader's IP from peer networks.                                                           |
| **Tailscale** for remote admin       | v4 swaps from Tor hidden-service SSH (commit `9eea6aa`). Faster, survives ISP churn, WireGuard. |
| **Caddy** reverse proxy              | Three-line HTTPS config with automatic ACME.                                                    |
| **stunnel**                          | Wraps Electrs TCP in TLS for Electrum clients.                                                  |

Where the tradeoff is genuinely contested (LND vs CLN), the reasoning sits on the page the reader encounters. This table is the overview.

### Sidebar order

Backstory → Architecture → Hardware → Bitcoin → Lightning → Bonus → Reference (Troubleshooting, FAQ).

Matches installation order. Bonus sits after the main path because those pages only make sense once the core is running; most are currently stubs (see [`TODO.md`](./TODO.md)).

### Fresh install, not in-place v3 → v4

See [FAQ](./guide/faq.mdx#can-i-migrate-an-older-raspibolt-to-v4). v4 changes reverse proxy, OS version, and secrets layout. Restore LND channel backup and SCB; reinstall the rest.

### Voice

Full style guide in [`CLAUDE.md`](./CLAUDE.md). Short version: second person, active, present tense, one action per step. Banned patterns (em-dashes, "leverage", "seamlessly", "not just X, it's Y", platitude openers) are stripped on sight; they read as LLM filler.

---

## Design

### Typography

**Geist sans + mono** (Vercel, open source). One family keeps rendering consistent between prose and `<code>`.

### Brand colour

**Amber** (`#f59e0b` family), not bitcoin orange (`#f7931a`). Bitcoin orange is everywhere (exchanges, wallets, explorers) and fails WCAG contrast on white at body-text sizes. Bitcoin orange still appears in specific spots (v4 badge gradient, dark-mode CTA).

### Light + dark mode

Both first-class. Syntax highlighting: Vitesse light / Vitesse dark (shiki). Components must work in both modes.

### Mermaid diagrams

[`guide/architecture.mdx`](./guide/architecture.mdx) uses Mermaid `graph` blocks. Diffable in git, renders in GitHub's web view, no vector tool needed. If we ever need pixel-perfect layout, commit SVG.

---

## Testing + quality gates

### Pre-commit (blocking except Vale)

gitleaks, shellcheck, typos, markdownlint (scoped to `guide/**/*.mdx`), yamllint, actionlint, Prettier, Vale (advisory). See `.pre-commit-config.yaml`.

Vale is advisory because style calls are judgement calls; blocking would force either accept-all or ignore-comments everywhere.

### CI

| Workflow                                                   | Purpose                                                     |
| ---------------------------------------------------------- | ----------------------------------------------------------- |
| [`lint.yml`](./.github/workflows/lint.yml)                 | Pre-commit + ESLint + TypeScript check.                     |
| [`linkcheck.yml`](./.github/workflows/linkcheck.yml)       | Lychee: internal and external links in the built site.      |
| [`quality.yml`](./.github/workflows/quality.yml)           | Lighthouse (perf, a11y, best-practices, SEO) + pa11y (axe). |
| [`site-publish.yml`](./.github/workflows/site-publish.yml) | Build and force-push `out/` to `gh-pages`.                  |

### Why SEO and a11y are `warn` not `error`

- SEO: staging gets `noindex` + `Disallow: /` from [`src/app/robots.ts`](./src/app/robots.ts) (we don't want staging competing with production in search); Lighthouse interprets that as a low SEO score. Architecturally correct; false signal in CI.
- a11y: Fumadocs' Shiki code tokens produce axe contrast errors in light mode that we can't fix without forking Fumadocs.

Specific rules stay at `error` (`html-has-lang`, `image-alt`, `link-name`, `meta-description`).

### pa11y: axe only

`.pa11yci.json` runs axe, not HTMLCS. HTMLCS WCAG error codes can't be enumerated locally because Chrome doesn't run in our WSL dev env.

### Autonomous walk harness

`testing/` parses shell blocks from `guide/**/*.mdx`, expands tokens, groups `sudo su - USER` / `exit` into heredocs, rewrites ARM64 URLs to amd64, skips `test:skip` blocks, and runs the combined script in a Debian 13 Trixie systemd-in-docker container. Output: `testing/REPORT.md`.

Not in CI (needs a privileged container). Has caught real guide bugs: missing `xxd` in mobile-app install, a `curl … | bash,` trailing comma that silently installed the wrong Node.

---

## Deployment

| Environment | URL                          | Source branch        |
| ----------- | ---------------------------- | -------------------- |
| Staging     | `https://next.raspibolt.org` | `feature/v4-rewrite` |
| Production  | `https://raspibolt.org`      | `master`             |
| Archive     | `https://v3.raspibolt.org`   | `v3-final`           |

Staging is noindexed. Both staging and production deploy through GitHub Pages Actions; the archive remains a separate, noindexed v3 site.

### basePath

Both current deployments serve at the domain root. `next.config.mjs` still supports an optional `NEXT_PUBLIC_BASE_PATH` for an alternate preview:

```js
basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
```

Next.js rewrites `<Link>` and `<Image>` automatically; **plain `<img src="/…">` tags need the prefix applied manually** (see [`src/lib/layout.shared.tsx`](./src/lib/layout.shared.tsx)).

---

## SEO

Each docs page: front-matter `title` + `description`, per-page OG image built at build time ([`src/app/og/docs/[...slug]/route.tsx`](./src/app/og/docs/[...slug]/route.tsx)), JSON-LD `TechArticle` + `BreadcrumbList` (commit `789aa4e`), Twitter `summary_large_image`.

Landing page has its own OG image at [`src/app/opengraph-image.tsx`](./src/app/opengraph-image.tsx). Sitemap and robots are Next.js metadata routes, not hand-maintained.

---

## Document map

| File                         | Scope                                                              |
| ---------------------------- | ------------------------------------------------------------------ |
| `README.md`                  | Local dev setup, contributor first-read.                           |
| `CLAUDE.md`                  | Content conventions, writing voice, autonomy model.                |
| `DECISIONS.md` _(this file)_ | Why the framework, content, and tooling choices are what they are. |
| `TODO.md`                    | Open decisions and deferred work; short-lived.                     |
