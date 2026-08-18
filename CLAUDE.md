# RaspiBolt: Development Guidelines

RaspiBolt is a self-custody Bitcoin and Lightning full-node guide for technically capable hobbyists. People who can follow terminal commands but may not be Bitcoin experts. The guide walks through a complete setup on a Raspberry Pi, from flashing the OS to running Lightning payments.

**Current state:** RaspiBolt v4 runs on Next.js + Fumadocs (MDX) at https://raspibolt.org. The feature branch `feature/v4-rewrite` auto-deploys to the staging preview at https://next.raspibolt.org. The v3 guide is archived at https://v3.raspibolt.org. The reasoning behind the stack (including why Quarto was tried and dropped) is captured in [`DECISIONS.md`](./DECISIONS.md).

---

## Working Rules

- **Maximal autonomous.** Make content and technical decisions independently and document them briefly in the commit message. Only escalate when the escalation model says so.
- **Push back when warranted.** Flag questionable directions with reasoning and an alternative. Then accept the decision and execute professionally.
- **Opinions are required.** "Whatever you prefer" is not an answer. Recommend and justify.
- **Plain language.** No padding, no hedging. If something needs to be said, say it once, clearly.
- **Think end-to-end.** A content change might affect the nav structure, the variables file, the test runner, or the link checker. Own the full impact.

---

## Autonomy Model

### Level 0: Autonomous

No approval needed. Act and commit.

1. Write, migrate, or rewrite any content section
2. Make prose decisions: structure, wording, what to cut from v3, what to rewrite
3. Commit and push to the branch for the change
4. Update software versions in `lib/versions.json`
5. Fix lint/spell/markdownlint failures
6. Update `testing/test-runner.sh` tests to match migrated content
7. Add or update Vale vocabulary entries for new technical terms

### Level 1: Inform

Act autonomously, but report the outcome.

1. Section complete (all pages of a section migrated and passing checks)
2. Structural changes to the sidebar nav (`guide/**/meta.json`)
3. New Fumadocs / MDX component introduced
4. Software version bump (state old → new version)

### Level 2: Ask

Present a recommendation and wait for approval.

1. Add a new section not present in v3
2. Drop an entire section or page
3. Change the target hardware platform assumptions
4. Introduce a new tool or dependency
5. Structural changes to the build or CI pipeline

### Level 3: Instruction only

Only on explicit instruction.

1. Merge a pull request into `master`
2. Change the production deployment workflow or its repository guard
3. Change the `CNAME` or published domain configuration
4. Force-push to any branch

---

## Content Guidelines

### Voice and audience

- Second person ("you"), active voice, present tense.
- Direct and instructional. Tell the reader what to do and why.
- Assume the reader can follow terminal commands, but explain the *why* behind security-critical steps.
- One idea per sentence, one action per step.

### Banned writing patterns

These are hard rules. They exist because each of them is a reliable "this was written by an LLM" signal, and because in every case a plainer word or a cleaner sentence does the job better.

**Typography (ASCII only):**

- No em-dashes (`—`). Use a comma, a semicolon, a colon, a period plus new sentence, or parentheses, whichever fits.
- No en-dashes in ranges. Write `2-3 hours`, not `2–3 hours`.
- No curly quotes. Use straight `'` and `"`.
- No ellipsis character (`…`). Use three dots `...` or end the sentence.

**Word-level:**

- No "leverage" (verb). Use "use".
- No "utilize" / "utilization". Use "use" / "usage".
- No "seamlessly", "effortlessly", "robustly", "elegantly". Pick a specific verb, or delete the adverb.
- No "crucial", "pivotal", "vital". Use "important", or say the actual thing.
- No "essentially", "fundamentally", "at its core". Delete, or say the actual thing.
- No "simply", "just", "easy" as filler adjectives. (Older rule, still applies.)

**Structural:**

- No "It's not just X, it's Y" / "not merely X but Y". Say Y directly.
- No "Worth noting that..." / "It's worth mentioning...". If it's worth saying, just say it.
- No generic platitude openers ("In today's fast-paced world", "Let's dive in", "buckle up"). Start with the point.

**Keep** (these are voice markers, not tells):

- "This is why..." to motivate the next step.
- "Main takeaway:" summaries at the end of a major subsection.
- Rhetorical question openers on section intros.
- "It sounds X but Y" reassurance pattern.
- "But" openers, single-word punch ("Seriously.", "Almost.").

### MDX syntax (Fumadocs)

**Software versions and download URLs.** Use `%scope.key%` tokens. A remark plugin (see `lib/remark-variables.ts`) resolves them at build time from `lib/versions.ts` (raw versions in `lib/versions.json`):

```
%versions.bitcoin_core%     → "31.1"
%files.bitcoinArchive%      → "bitcoin-31.1-aarch64-linux-gnu.tar.gz"
%urls.bitcoinDownload%      → "https://bitcoincore.org/bin/bitcoin-core-31.1/bitcoin-31.1-aarch64-linux-gnu.tar.gz"
```

Tokens work inside fenced code blocks, inline code, and flowing text. To bump a version, edit `lib/versions.json`; to add a derived filename or URL, edit `lib/versions.ts`. Every page re-renders with the new string.

**Callouts.** Fumadocs' `<Callout>` component:

```mdx
<Callout type="info">
Informational note.
</Callout>

<Callout type="warn" title="Risk or irreversible action">
Body text.
</Callout>
```

`type` accepts `info`, `warn`, `success`, `error`.

**Code blocks.** Always specify the language. **One shell command per block** so the copy button gives the reader exactly one paste-ready command at a time. This was the explicit feedback from reviewers on the v4 preview: a single block with multiple commands forces the reader to paste them all at once, which fails in some terminals and obscures which command does what.

````mdx
```bash
sudo apt update
```

```bash
sudo apt full-upgrade
```
````

Exceptions where commands stay together in one block:

- **Heredocs and multi-line configs** (`cat > file <<EOF ... EOF`). One logical write.
- **Pipelines and chains that form one command** (`curl ... | sha256sum --check`, `tar -xf ... -C /opt`). Already one shell command.
- **Multi-line single command** (a long `wget` with backslash continuations). Still one command.
- **Reference command lists** (cheat sheets with `<placeholder>` arguments, like the lncli reference). Group by topic instead of one block per command; the commands aren't paste-ready anyway, so per-command copy buttons add noise, not value.

Do *not* keep `cd somewhere` glued to the next command with `&&`. Split it:

````mdx
```bash
cd /tmp/download
```

```bash
sha256sum bitcoin-31.1-aarch64-linux-gnu.tar.gz
```
````

Add a short prose line between blocks when the next command needs context. Don't pad just to fill space.

**Internal links.** Relative paths, no file extension:

```mdx
[Remote access](/docs/raspberry-pi/remote-access)
[Bitcoin Client](/docs/bitcoin/bitcoin-client)
```

**Front matter.** Requires `title` and `description`:

```yaml
---
title: Security
description: Harden SSH, enable the firewall, add brute-force protection.
---
```

### Definition of "done" for a page

A content page is complete when:

- [ ] Front matter has both `title` and `description`
- [ ] Version numbers use `%versions.X%` tokens, never hardcoded
- [ ] Download URLs/filenames use `%urls.X%` / `%files.X%` tokens
- [ ] One shell command per ```bash block (exceptions: heredocs, pipelines, multi-line single commands)
- [ ] `<Callout>` replaces inline emoji warnings/tips
- [ ] `npm run build` completes without errors
- [ ] `pre-commit run --files guide/<path>.mdx` passes
- [ ] Internal links use `/docs/...` paths (no `.mdx`, no `.qmd`)

### Images

Images live in `public/images/` at the repo root. Reference them with root-relative paths:

```mdx
![Raspberry Pi 5 board](/images/raspberry-pi-5.png)
```

This keeps images discoverable for contributors in one place. Next.js rewrites root-relative paths automatically when a base path is configured.

Optimize PNG/JPG to <300 KB before committing (use `oxipng -o 4 file.png` or an equivalent). Screenshots of the Raspberry Pi Imager UI tend to go stale fast, so prefer numbered steps with bold UI labels over screenshots.

---

## Commit Standards

- One logical change per commit (one page, one section, one version bump)
- Conventional prefix: `content(section):`, `feat:`, `fix:`, `chore:`, `ci:`
- Imperative mood, present tense: "migrate security.mdx" not "migrated"
- Explain what changed and why if non-obvious; no boilerplate
- Never commit rendered output (`out/`, `.next/`, `.source/`)

---

## Quality Checklist

Before pushing, verify:

- [ ] `pre-commit run --all-files`: blocking hooks pass (includes Prettier auto-format)
- [ ] `npm run lint`: ESLint clean (CI-only hook, not in pre-commit)
- [ ] `npm run types:check`: TypeScript clean
- [ ] `npm run build`: site builds without errors
- [ ] All version references use `%versions.X%` / `%files.X%` / `%urls.X%` tokens
- [ ] Internal links use `/docs/...` paths (no file extensions)

---

## Project Structure

```
guide/                     MDX content; contributors work here
  meta.json                Root sidebar order
  raspberry-pi/            RPi setup section
    meta.json              Section page order
    *.mdx
  bitcoin/                 Bitcoin node section
  lightning/               Lightning section
  bonus/                   Optional extras
  backstory.mdx
  faq.mdx
  troubleshooting.mdx
src/                       Next.js app (layouts, components, routes)
  app/                     App Router pages: /, /docs/[[...slug]]
  components/              React components
  lib/
lib/                       Plugins & helpers
  versions.json            Raw software version strings (edit here)
  versions.ts              Derived filenames + URLs, token lookup
  remark-variables.ts      Build-time %token% replacement
source.config.ts           Fumadocs MDX collection config
next.config.mjs            Next.js config (static export)
testing/
  vm/                      Debian 13 Trixie systemd-in-docker harness
  extract/                 MDX step extractor (parses guide/** shell blocks)
  run-walk.sh              Autonomous end-to-end walkthrough runner
  REPORT.md                Latest walk report (per-page PASS/FAIL)
scripts/
  setup-dev.sh             One-time dev environment setup
.github/workflows/
  site-publish.yml         Build + deploy to gh-pages
  lint.yml                 shellcheck, typos, markdownlint, yamllint, actionlint, vale, tsc
```

## Software Versions

Raw version strings live in `lib/versions.json`; derived filenames and URLs are composed in `lib/versions.ts`. To bump a version, edit `versions.json` first, then check `testing/test-runner.sh` assertions.

| Software | Token |
|----------|-------|
| Bitcoin Core | `%versions.bitcoin_core%` |
| LND | `%versions.lnd%` |
| Electrs | `%versions.electrs%` |
| RTL | `%versions.rtl%` |
| Mempool | `%versions.mempool%` |
| Node.js | `%versions.nodejs%` |

Derived download filenames (`%files.bitcoinArchive%`, etc.) and full URLs (`%urls.bitcoinDownload%`, etc.) are defined in `lib/versions.ts`. Edit the template once, every page updates. The extractor (`testing/extract/extract-steps.mjs`) mirrors the derived tables; keep both in sync when adding tokens.
