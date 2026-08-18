# RaspiBolt

Build your own self-sovereign Bitcoin and Lightning node on a Raspberry Pi.

- **Published guide:** <https://raspibolt.org>
- **v4 staging preview:** <https://next.raspibolt.org> *(auto-deploys from `feature/v4-rewrite`)*
- **v3 archive:** <https://v3.raspibolt.org> *(read-only, noindex)*
- **Project history and decisions:** [`DECISIONS.md`](./DECISIONS.md): why the stack, content, and tooling choices are what they are
- **Open decisions & deferred work:** [`TODO.md`](./TODO.md)

---

## Contributing content

All guide content lives in [`guide/`](./guide) as `.mdx` files, standard Markdown with a few React components (Callouts, Cards). You can edit any page directly in the GitHub UI. No Next.js knowledge required.

```
guide/
├── meta.json               Root sidebar order
├── index.mdx               /docs landing page
├── raspberry-pi/
│   ├── meta.json           Section page order
│   ├── preparations.mdx
│   └── ...
├── bitcoin/
├── lightning/
└── bonus/
```

### Writing conventions

- **Versions and download URLs** use tokens like `%versions.bitcoin_core%`, `%files.bitcoinArchive%`, `%urls.bitcoinDownload%`. Definitions live in [`lib/versions.json`](./lib/versions.json) (raw versions) and [`lib/versions.ts`](./lib/versions.ts) (derived filenames + URLs). A remark plugin resolves them at build time, even inside code fences.
- **Callouts** use Fumadocs' `<Callout type="info|warn|success|error">...</Callout>`.
- **Internal links** use bare paths: `/docs/raspberry-pi/preparations`, no file extension.
- **Code blocks** always specify a language (`bash`, `text`, `ini`, etc.) and hold **one shell command each**, so the copy button hands the reader exactly one paste-ready command. Heredocs, pipelines, and reference lists stay together; see `CLAUDE.md` for the exceptions.
- **Homepage freshness:** when a reader-facing guide change is published, update the `v4 · Updated Month YYYY` badge in [`src/app/(home)/page.tsx`](./src/app/(home)/page.tsx).

See [`CLAUDE.md`](./CLAUDE.md) for the full voice and syntax guidelines.

---

## Local development

### Prerequisites

- Linux / macOS / WSL
- Node.js ≥ 20
- Python 3.10+ (only for pre-commit + yamllint)
- Git

### First-time setup

```bash
git clone https://github.com/raspibolt/raspibolt.git
cd raspibolt
bash scripts/setup-dev.sh
```

This installs dev tools to `~/.local/bin` (no root required), runs `npm ci`, and registers the pre-commit hook.

Add `~/.local/bin` to your PATH if it isn't already:

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc && source ~/.bashrc
```

### Preview the site

```bash
npm run dev
```

Opens a live-reload Next.js dev server at <http://localhost:3000>. The site rebuilds on every save.

### Build a production bundle

```bash
npm run build         # static export to out/
npm run start         # serve out/ locally
```

### Quality checks

Run the full suite before committing (all of these run in CI too):

```bash
npm run lint          # ESLint
npm run types:check   # TypeScript (fumadocs-mdx → next typegen → tsc)
npm run format:check  # Prettier
npm test              # vitest (remark plugin tests)
npm run build         # catches MDX syntax issues

pre-commit run --all-files  # gitleaks, typos, markdownlint, yamllint, actionlint, vale
```

Individual pre-commit hooks:

```bash
pre-commit run markdownlint-cli2
pre-commit run vale      # prose style (advisory, never blocks)
```

### Git hooks

Hooks are managed by [pre-commit](https://pre-commit.com). See [`.pre-commit-config.yaml`](./.pre-commit-config.yaml).

| Hook | Blocking | What it checks |
|------|----------|----------------|
| gitleaks | ✓ | Secrets and credentials |
| shellcheck | ✓ | Shell script issues |
| typos | ✓ | Spelling |
| markdownlint | ✓ | Markdown formatting on `.mdx` |
| yamllint | ✓ | YAML syntax |
| actionlint | ✓ | GitHub Actions workflows |
| vale | ✗ (advisory) | Prose style and terminology |

Vale rules are in [`.vale/styles/RaspiBolt/`](./.vale/styles/RaspiBolt); accepted technical vocabulary is in [`.vale/styles/config/vocabularies/RaspiBolt/accept.txt`](./.vale/styles/config/vocabularies/RaspiBolt/accept.txt).

---

## Stack

- **Content:** [MDX](https://mdxjs.com) (Markdown + React components) in [`guide/`](./guide)
- **Framework:** [Next.js 16](https://nextjs.org) with static export
- **Docs theme:** [Fumadocs](https://fumadocs.dev)
- **Styling:** Tailwind CSS 4
- **Deployment:** GitHub Pages, production via [`.github/workflows/site-publish-prod.yml`](./.github/workflows/site-publish-prod.yml) and staging via [`.github/workflows/site-publish.yml`](./.github/workflows/site-publish.yml)
- **Variable resolution:** Custom [remark plugin](./lib/remark-variables.ts)

```
src/                  Next.js app (layouts, routes, components)
lib/
  versions.json       Software versions: edit here, site re-renders
  versions.ts         Derived filenames + URLs
  remark-variables.ts Build-time %token% replacement
testing/
  vm/                 Debian 13 Trixie systemd-in-docker harness
  extract/            MDX step extractor (parses guide/** shell blocks)
  run-walk.sh         End-to-end autonomous walkthrough runner
  REPORT.md           Latest walk report (per-page PASS/FAIL)
```

### Current software versions

Edit [`lib/versions.json`](./lib/versions.json) to update; every page re-renders on next build.

| Software | Version |
|----------|---------|
| Bitcoin Core | 31.1 |
| LND | 0.21.2-beta |
| Electrs | 0.11.1 |
| RTL | 0.15.11 |
| Mempool | 3.3.1 |
| Node.js | 24 LTS |

---

*RaspiBolt v4 is the current guide at <https://raspibolt.org>. RaspiBolt v3 remains available at <https://v3.raspibolt.org>.*
