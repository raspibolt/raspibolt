/**
 * Remark plugin: resolves %versions.X%, %files.X%, and %urls.X% tokens at
 * build time — in text, inline code, and fenced code blocks.
 *
 * Contributors write:
 *   ```bash
 *   wget %urls.bitcoinDownload%
 *   ```
 *
 * At render time this becomes:
 *   wget https://bitcoincore.org/bin/bitcoin-core-31.1/bitcoin-31.1-aarch64-linux-gnu.tar.gz
 *
 * The token syntax uses %…% because MDX already claims `{…}` for JSX
 * expressions. The lookup map lives in lib/versions.ts — update the
 * version there and every page re-renders with the new string.
 */

import type { Root, Text, InlineCode, Code } from 'mdast';
import { visit } from 'unist-util-visit';
import { resolveToken } from './versions';

const TOKEN_RE = /%((?:versions|files|urls)\.[a-zA-Z_][a-zA-Z0-9_]*)%/g;

function replaceInValue(value: string): string {
  if (!TOKEN_RE.test(value)) return value;
  TOKEN_RE.lastIndex = 0;
  return value.replace(TOKEN_RE, (match, path) => {
    const resolved = resolveToken(path);
    if (resolved === undefined) {
      throw new Error(
        `[remark-variables] unknown token "${match}". ` +
          `Update lib/versions.ts or fix the spelling.`,
      );
    }
    return resolved;
  });
}

export function remarkVariables() {
  return (tree: Root) => {
    visit(tree, (node) => {
      if (node.type === 'text') {
        (node as Text).value = replaceInValue((node as Text).value);
      } else if (node.type === 'inlineCode') {
        (node as InlineCode).value = replaceInValue((node as InlineCode).value);
      } else if (node.type === 'code') {
        (node as Code).value = replaceInValue((node as Code).value);
      }
    });
  };
}
