#!/usr/bin/env node
// Walks guide/**/*.mdx, parses each page as MDX, expands %versions.X%
// tokens with the same remark plugin the site uses, and emits one
// runnable shell script per page at testing/steps/<section>/<page>.sh
// plus a JSON manifest capturing every code block (bash or otherwise)
// so the runner can reason about non-bash config payloads.
//
// Interactive-editor blocks (nano, visudo, systemctl edit) are
// preserved as shell no-ops with a __MANUAL__ marker. The runner
// treats these as checkpoints for manual annotation. Many guide
// pages pair a "sudo nano /etc/foo.conf" block with a following
// config block that must be written in its place; detecting that
// pattern is the next extractor iteration, not this one.
//
// Usage:
//   node testing/extract/extract-steps.mjs              # full tree
//   node testing/extract/extract-steps.mjs bitcoin      # one section
//   node testing/extract/extract-steps.mjs bitcoin/bitcoin-client

import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises';
import { join, dirname, relative, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import { visit } from 'unist-util-visit';

// Inline token resolution, mirrors lib/versions.ts. Kept local so the
// extractor can run with plain `node --experimental-strip-types` and
// doesn't drag in the TS module graph.
const versionsJson = JSON.parse(
  await readFile(new URL('../../lib/versions.json', import.meta.url), 'utf8'),
);
const versions = versionsJson;
const files = {
  bitcoinArchive: `bitcoin-${versions.bitcoin_core}-aarch64-linux-gnu.tar.gz`,
  bitcoinSha256: 'SHA256SUMS',
  bitcoinSha256Sig: 'SHA256SUMS.asc',
  lndArchive: `lnd-linux-arm64-v${versions.lnd}.tar.gz`,
  lndSha256: `manifest-v${versions.lnd}.txt`,
};
const urls = {
  bitcoinDownload: `https://bitcoincore.org/bin/bitcoin-core-${versions.bitcoin_core}/${files.bitcoinArchive}`,
  bitcoinSha256: `https://bitcoincore.org/bin/bitcoin-core-${versions.bitcoin_core}/${files.bitcoinSha256}`,
  bitcoinSha256Sig: `https://bitcoincore.org/bin/bitcoin-core-${versions.bitcoin_core}/${files.bitcoinSha256Sig}`,
  lndDownload: `https://github.com/lightningnetwork/lnd/releases/download/v${versions.lnd}/${files.lndArchive}`,
  lndSha256: `https://github.com/lightningnetwork/lnd/releases/download/v${versions.lnd}/${files.lndSha256}`,
  nodesourceSetup: `https://deb.nodesource.com/setup_${versions.nodejs}.x`,
  nodesourceRepo: `https://deb.nodesource.com/node_${versions.nodejs}.x`,
};
const TOKEN_TABLE = { versions, files, urls };
const TOKEN_RE = /%((?:versions|files|urls)\.[a-zA-Z_][a-zA-Z0-9_]*)%/g;

// Arch-substitution for the test harness. The guide prose ships ARM64
// filenames (aarch64-linux-gnu / linux-arm64) as that's what Pi readers
// use. For amd64 CI / Docker runs we rewrite to x86_64 so binaries run
// natively, avoiding QEMU's JIT vs systemd's MemoryDenyWriteExecute.
// Set TEST_ARCH=arm64 to leave ARM64 tokens intact (real Pi / ARM VM).
const TEST_ARCH = process.env.TEST_ARCH || 'amd64';
function archRewrite(value) {
  if (TEST_ARCH !== 'amd64') return value;
  return value
    .replace(/aarch64-linux-gnu/g, 'x86_64-linux-gnu')
    .replace(/linux-arm64/g, 'linux-amd64');
}

function expandTokens(value) {
  const expanded = value.replace(TOKEN_RE, (match, path) => {
    const [scope, key] = path.split('.');
    const resolved = TOKEN_TABLE[scope]?.[key];
    if (resolved === undefined) {
      throw new Error(`unknown token ${match}`);
    }
    return resolved;
  });
  return archRewrite(expanded);
}
function remarkVariables() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === 'text' || node.type === 'inlineCode' || node.type === 'code') {
        node.value = expandTokens(node.value);
      }
    });
  };
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const GUIDE_DIR = join(REPO_ROOT, 'guide');
const OUT_DIR = join(REPO_ROOT, 'testing', 'steps');

const INTERACTIVE_RE =
  /^\s*(sudo\s+)?(nano\b|vi\b|vim\b|visudo\b|systemctl\s+edit\b|passwd\b|ssh-keygen\s*(?!.*-f)|crontab\s+-e\b|su\s+-(?:\s|$))/m;

async function walk(dir, out = []) {
  for (const ent of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) await walk(p, out);
    else if (ent.isFile() && ent.name.endsWith('.mdx')) out.push(p);
  }
  return out;
}

async function parseMdx(src) {
  const processor = remark().use(remarkMdx).use(remarkGfm).use(remarkVariables);
  return processor.parse(src);
}

function stripFrontmatter(src) {
  if (!src.startsWith('---\n')) return src;
  const end = src.indexOf('\n---\n', 4);
  return end === -1 ? src : src.slice(end + 5);
}

function getFrontmatter(src) {
  if (!src.startsWith('---\n')) return {};
  const end = src.indexOf('\n---\n', 4);
  if (end === -1) return {};
  const fm = src.slice(4, end);
  const out = {};
  for (const line of fm.split('\n')) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

function extractBlocks(tree) {
  const blocks = [];
  visit(tree, 'code', (node) => {
    // Expand %versions.X%, %files.X%, %urls.X% tokens now. Calling
    // processor.parse() earlier does NOT run plugins — it only parses.
    // First run of the extractor shipped raw tokens to the VM, where
    // `wget %urls.bitcoinDownload%` promptly 404'd. Fix it here.
    blocks.push({
      lang: node.lang || '',
      meta: node.meta || '',
      value: expandTokens(node.value),
    });
  });
  return blocks;
}

// Detect "sudo nano /path/to/file" (admin context) or "nano /path/to/file"
// (bare, for use inside a `sudo -u USER bash` session we've already
// entered) as a single-line interactive block with a target path. The
// path is used to fuse the block with the following config block into
// one `[sudo] tee PATH <<EOF` emission.
const NANO_TARGET_RE = /^\s*sudo\s+(?:nano|vi|vim)\s+(\S+)\s*$/;
const NANO_TARGET_BARE_RE = /^\s*(?:nano|vi|vim)\s+(\S+)\s*$/;

// A "bash" block that starts with a shebang is a file's contents, not
// a command sequence. Treat it like a non-shell config body so the
// nano+config fusion picks it up.
const SHEBANG_RE = /^\s*#!/;
const isContentBlock = (b) =>
  !isShellLang(b.lang) || (isShellLang(b.lang) && SHEBANG_RE.test(b.value));

// Detect "sudo su - USER" as the opening of a user session. The guide
// convention is `sudo su - USER` ... steps as that user ... `exit`.
// The extractor groups the intervening blocks and emits them inside a
// single `sudo -u USER bash <<'__SESSION_USER__' ... __SESSION_USER__`
// heredoc so variable assignments and cwd persist across steps, file
// ownership matches, and MANUAL skipping no longer drops context.
// The opener may appear as a standalone block (just `sudo su - USER`)
// OR as the first line of a multi-line block (remaining lines become
// the first piece of the session body).
const SUDO_SU_USER_RE = /^\s*sudo\s+su\s+-\s+([a-zA-Z_][a-zA-Z0-9_-]*)\s*$/;

function detectSuOpener(block) {
  if (!isShellLang(block.lang)) return null;
  const lines = block.value.split('\n');
  // Skip leading blank lines.
  let idx = 0;
  while (idx < lines.length && lines[idx].trim() === '') idx += 1;
  if (idx >= lines.length) return null;
  const m = lines[idx].match(SUDO_SU_USER_RE);
  if (!m) return null;
  const rest = lines
    .slice(idx + 1)
    .join('\n')
    .replace(/\n+$/, '');
  return { user: m[1], rest };
}
const SHELL_LANGS = new Set(['bash', 'sh', 'shell']);
const isShellLang = (lang) => SHELL_LANGS.has(lang);
const isExitBlock = (b) => isShellLang(b.lang) && b.value.trim() === 'exit';

function hasTestSkipMeta(meta) {
  return /\btest:skip\b/.test(meta || '');
}

// `test:append` on a nano+config pair: the guide tells the reader to
// ADD a line to an existing file (e.g. the PAM stack), so the fusion
// must emit `tee -a` instead of `tee`, which would replace the file.
function hasTestAppendMeta(meta) {
  return /\btest:append\b/.test(meta || '');
}

// Strip interactive-editor invocations from the interior of a shell
// block. Used when the block isn't a clean `[sudo] nano PATH` standalone
// that the nano+config fusion can pick up. Typical offender: a block
// where the reader is expected to tweak an existing file in place, so
// the guide shows `cp template dest` then `nano dest`. The harness
// can't simulate the tweaks; we run the `cp` and leave the file alone.
// Lines are commented out so the script stays readable.
const EDITOR_LINE_RE = /^\s*(sudo\s+)?(nano|vi|vim|visudo|systemctl\s+edit)\s+\S+/;
function stripEditorLines(value) {
  return value
    .split('\n')
    .map((l) => (EDITOR_LINE_RE.test(l) ? `: # [skipped editor] ${l.trim()}` : l))
    .join('\n');
}

// A bare `exit` line at the end of a shell block is almost always the
// guide telling the reader to log out of their SSH session or leave a
// `sudo su - USER` subshell. In the extracted wrapper that's run as one
// piped bash script, a bare top-level `exit` would abort the whole page
// run prematurely. Strip it. The session-grouping pass above consumes
// standalone `exit` blocks for matched `sudo su -` sessions separately.
function stripTrailingBareExit(value) {
  const lines = value.split('\n');
  let last = lines.length - 1;
  while (last >= 0 && lines[last].trim() === '') last -= 1;
  if (last >= 0 && lines[last].trim() === 'exit') {
    lines[last] = ': # [trailing `exit` stripped]';
  }
  return lines.join('\n');
}

// Emit a block that belongs inside a `sudo -u USER bash <<EOF` session.
// Reused for the per-block loop within the session emitter. Returns the
// number of input blocks consumed (1 for a plain shell block, 2 for a
// fused nano+config pair).
function emitInSession(blocks, i, out) {
  const b = blocks[i];
  if (isShellLang(b.lang)) {
    if (hasTestSkipMeta(b.meta)) {
      out.push('echo "[test:skip] skipping block inside user session"');
      return 1;
    }
    const trimmed = b.value.trim();
    const nanoMatch = trimmed.match(NANO_TARGET_RE) || trimmed.match(NANO_TARGET_BARE_RE);
    if (nanoMatch && i + 1 < blocks.length) {
      const next = blocks[i + 1];
      if (isContentBlock(next)) {
        const path = nanoMatch[1];
        const teeCmd = hasTestAppendMeta(b.meta) ? 'tee -a' : 'tee';
        out.push(`${teeCmd} ${path} > /dev/null <<'__EOF_CFG__'`);
        for (const l of next.value.replace(/\n+$/, '').split('\n')) out.push(l);
        out.push('__EOF_CFG__');
        return 2;
      }
    }
    const cleaned = stripTrailingBareExit(stripEditorLines(b.value.replace(/\n+$/, '')));
    for (const l of cleaned.split('\n')) out.push(l);
    return 1;
  }
  // Non-shell block without preceding nano: reference-only comment.
  out.push(`# non-shell block inside user session, lang=${b.lang || '(none)'}:`);
  for (const l of b.value.split('\n')) out.push(`#   ${l}`);
  return 1;
}

function emitScript(pageRel, blocks, frontmatter) {
  const lines = [
    '#!/usr/bin/env bash',
    `# auto-generated from guide/${pageRel}`,
    `# title: ${frontmatter.title || '(unknown)'}`,
    `# description: ${frontmatter.description || ''}`,
    '#',
    '# DO NOT EDIT: regenerate via testing/extract/extract-steps.mjs',
    'set -euo pipefail',
    '',
  ];
  let stepIdx = 0;
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];
    stepIdx += 1;
    const header = `# ----- step ${stepIdx} | lang=${b.lang || '(none)'} ${b.meta ? `meta=${b.meta}` : ''}`;
    const isShell = isShellLang(b.lang);

    // An orphan `exit` block at top level (no matching `sudo su - USER`
    // opener either because the opener was test:skip'd or the prose
    // structure predates the session convention) would kill the page
    // wrapper. Emit as no-op.
    if (isShell && isExitBlock(b)) {
      lines.push(`${header} (orphan bare exit stripped)`);
      lines.push(': # [orphan `exit` stripped]');
      lines.push('');
      i += 1;
      continue;
    }

    // test:skip meta: extractor emits the block as a no-op. Used for
    // laptop-side, remote-host-side, and illustrative placeholder
    // blocks that can't run on the Pi.
    if (isShell && hasTestSkipMeta(b.meta)) {
      lines.push(`${header} (test:skip)`);
      lines.push('echo "[test:skip] skipping block"');
      for (const l of b.value.split('\n')) lines.push(`#   ${l}`);
      lines.push('');
      i += 1;
      continue;
    }

    // `sudo su - USER` ... `exit` session: collect intervening blocks,
    // emit them inside one `sudo -u USER bash <<EOF` heredoc so state
    // (cwd, VARs, file ownership) persists across steps.
    const suOpener = detectSuOpener(b);
    if (suOpener) {
      const { user, rest } = suOpener;
      let j = i + 1;
      while (j < blocks.length && !isExitBlock(blocks[j])) j += 1;
      if (j < blocks.length) {
        // Virtual first-block holds any trailing lines after the
        // `sudo su - USER` line of the opener block. Often this is
        // just a `nano PATH` line, or a cd + a real command.
        const sessionBody = [];
        if (rest.trim() !== '') {
          sessionBody.push({ lang: 'bash', meta: '', value: rest });
        }
        for (let k = i + 1; k < j; k += 1) sessionBody.push(blocks[k]);

        lines.push(
          `${header} (sudo su - ${user} session: grouping ${sessionBody.length} body blocks, closed by exit)`,
        );
        const sentinel = `__SESSION_${user.toUpperCase()}__`;
        lines.push(`sudo -u ${user} bash <<'${sentinel}'`);
        lines.push('set -uo pipefail');
        let k = 0;
        while (k < sessionBody.length) {
          k += emitInSession(sessionBody, k, lines);
        }
        lines.push(sentinel);
        lines.push('');
        // Skip past the opener, body blocks, and the closing `exit`.
        stepIdx += j - i;
        i = j + 1;
        continue;
      }
      // No matching exit found: fall through to the default path
      // which will flag this via INTERACTIVE_RE as __MANUAL__.
    }

    // Fuse "sudo nano PATH" + next non-shell block into `sudo tee PATH`.
    // If the nano opener has `test:skip`, skip both the opener and the
    // content block so neither runs in the test env.
    if (isShell) {
      const nanoMatch = b.value.trim().match(NANO_TARGET_RE);
      if (nanoMatch && i + 1 < blocks.length) {
        const next = blocks[i + 1];
        if (isContentBlock(next)) {
          const path = nanoMatch[1];
          if (hasTestSkipMeta(b.meta)) {
            lines.push(`${header} (test:skip on nano+config pair → not writing ${path})`);
            lines.push('echo "[test:skip] skipping nano+config fusion"');
            for (const l of b.value.split('\n')) lines.push(`#   ${l}`);
            for (const l of next.value.split('\n')) lines.push(`#   ${l}`);
            lines.push('');
            i += 2;
            stepIdx += 1;
            continue;
          }
          const teeCmd = hasTestAppendMeta(b.meta) ? 'tee -a' : 'tee';
          lines.push(`${header} (fused nano+config → sudo ${teeCmd} ${path})`);
          lines.push(`sudo ${teeCmd} ${path} > /dev/null <<'__EOF_AUTOGEN__'`);
          for (const l of next.value.replace(/\n+$/, '').split('\n')) lines.push(l);
          lines.push('__EOF_AUTOGEN__');
          lines.push('');
          i += 2;
          stepIdx += 1; // account for the consumed second block
          continue;
        }
      }
    }

    if (isShell) {
      if (INTERACTIVE_RE.test(b.value)) {
        // If the only interactive bits are editor invocations embedded
        // in a larger block (cd; nano; ...), strip the editor lines and
        // keep the rest. Fall back to the old wholesale __MANUAL__ skip
        // only when the block has no runnable content left.
        const cleaned = stripEditorLines(b.value.replace(/\n+$/, ''));
        const hasRunnable = cleaned
          .split('\n')
          .some((l) => l.trim() !== '' && !l.trim().startsWith(':') && !l.trim().startsWith('#'));
        if (hasRunnable && !INTERACTIVE_RE.test(cleaned)) {
          lines.push(`${header} (editor lines stripped, remainder kept)`);
          for (const l of stripTrailingBareExit(cleaned).split('\n')) lines.push(l);
          lines.push('');
        } else {
          lines.push(header);
          lines.push('echo "__MANUAL__ interactive editor block, skipping:"');
          for (const l of b.value.split('\n')) lines.push(`#   ${l}`);
          lines.push('');
        }
      } else {
        lines.push(header);
        lines.push(stripTrailingBareExit(b.value.replace(/\n+$/, '')));
        lines.push('');
      }
    } else {
      lines.push(`${header} (non-shell, emitted as reference only)`);
      for (const l of b.value.split('\n')) lines.push(`#| ${l}`);
      lines.push('');
    }
    i += 1;
  }
  return lines.join('\n');
}

function emitManifest(pageRel, blocks, frontmatter) {
  return JSON.stringify(
    {
      page: pageRel,
      title: frontmatter.title,
      description: frontmatter.description,
      blocks: blocks.map((b, i) => ({
        idx: i + 1,
        lang: b.lang,
        meta: b.meta,
        interactive:
          (b.lang === 'bash' || b.lang === 'sh' || b.lang === 'shell') &&
          INTERACTIVE_RE.test(b.value),
        lines: b.value.split('\n').length,
        preview: b.value.slice(0, 120).replace(/\n/g, ' ↵ '),
      })),
    },
    null,
    2,
  );
}

async function processPage(absPath) {
  const src = await readFile(absPath, 'utf8');
  const frontmatter = getFrontmatter(src);
  const tree = await parseMdx(src);
  const blocks = extractBlocks(tree);
  const pageRel = relative(GUIDE_DIR, absPath);
  const pageBase = pageRel.replace(/\.mdx$/, '');

  const shellPath = join(OUT_DIR, `${pageBase}.sh`);
  const manifestPath = join(OUT_DIR, `${pageBase}.json`);
  await mkdir(dirname(shellPath), { recursive: true });
  await writeFile(shellPath, emitScript(pageRel, blocks, frontmatter));
  await writeFile(manifestPath, emitManifest(pageRel, blocks, frontmatter));

  const stats = {
    page: pageRel,
    total: blocks.length,
    bash: blocks.filter((b) => ['bash', 'sh', 'shell'].includes(b.lang)).length,
    interactive: blocks.filter(
      (b) => ['bash', 'sh', 'shell'].includes(b.lang) && INTERACTIVE_RE.test(b.value),
    ).length,
    otherLangs: [
      ...new Set(
        blocks.map((b) => b.lang).filter((l) => l && !['bash', 'sh', 'shell'].includes(l)),
      ),
    ],
  };
  return stats;
}

async function main() {
  const filter = process.argv[2];
  const all = await walk(GUIDE_DIR);
  const pages = filter
    ? all.filter((p) => relative(GUIDE_DIR, p).startsWith(filter.replace(/\.mdx$/, '')))
    : all;

  console.log(`extracting ${pages.length} pages`);
  const summary = [];
  for (const p of pages) {
    try {
      summary.push(await processPage(p));
    } catch (err) {
      console.error(`FAIL ${relative(GUIDE_DIR, p)}: ${err.message}`);
    }
  }

  // Summary table
  const sorted = summary.sort((a, b) => a.page.localeCompare(b.page));
  const fmt = (s, w) => String(s).padEnd(w);
  console.log();
  console.log(fmt('page', 46), fmt('blocks', 7), fmt('bash', 5), fmt('manual', 7), 'other-langs');
  console.log('-'.repeat(90));
  for (const s of sorted) {
    console.log(
      fmt(s.page, 46),
      fmt(s.total, 7),
      fmt(s.bash, 5),
      fmt(s.interactive, 7),
      s.otherLangs.join(',') || '-',
    );
  }
  const totals = summary.reduce(
    (a, s) => ({
      total: a.total + s.total,
      bash: a.bash + s.bash,
      interactive: a.interactive + s.interactive,
    }),
    { total: 0, bash: 0, interactive: 0 },
  );
  console.log('-'.repeat(90));
  console.log(
    fmt(`TOTAL (${sorted.length} pages)`, 46),
    fmt(totals.total, 7),
    fmt(totals.bash, 5),
    fmt(totals.interactive, 7),
  );

  await writeFile(
    join(OUT_DIR, 'summary.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), pages: sorted, totals }, null, 2),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
