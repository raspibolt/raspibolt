/**
 * Software versions — single source of truth for the guide.
 *
 * The raw version strings live in `versions.json` so shell scripts
 * (testing/test-runner.sh) can read them with plain `jq`. Derived
 * filenames and download URLs are composed here in TypeScript.
 *
 * Reference from MDX:
 *   %versions.bitcoin_core%     → "31.1"
 *   %files.bitcoinArchive%      → "bitcoin-31.1-aarch64-linux-gnu.tar.gz"
 *   %urls.bitcoinDownload%      → "https://bitcoincore.org/bin/bitcoin-core-31.1/bitcoin-31.1-aarch64-linux-gnu.tar.gz"
 *
 * The tokens also work inside fenced code blocks — a remark plugin
 * (lib/remark-variables.ts) resolves them at build time.
 */

import rawVersions from './versions.json' with { type: 'json' };

export const versions = rawVersions as {
  bitcoin_core: string;
  lnd: string;
  electrs: string;
  rtl: string;
  mempool: string;
  nodejs: string;
};

export type VersionKey = keyof typeof versions;

/**
 * Derived release-archive filenames. Target: 64-bit ARM (Pi 5, Pi 4 8GB).
 */
export const files = {
  bitcoinArchive: `bitcoin-${versions.bitcoin_core}-aarch64-linux-gnu.tar.gz`,
  bitcoinSha256: 'SHA256SUMS',
  bitcoinSha256Sig: 'SHA256SUMS.asc',
  lndArchive: `lnd-linux-arm64-v${versions.lnd}.tar.gz`,
  lndSha256: `manifest-v${versions.lnd}.txt`,
} as const;

export type FileKey = keyof typeof files;

/**
 * Fully-qualified download URLs.
 */
export const urls = {
  bitcoinDownload: `https://bitcoincore.org/bin/bitcoin-core-${versions.bitcoin_core}/${files.bitcoinArchive}`,
  bitcoinSha256: `https://bitcoincore.org/bin/bitcoin-core-${versions.bitcoin_core}/${files.bitcoinSha256}`,
  bitcoinSha256Sig: `https://bitcoincore.org/bin/bitcoin-core-${versions.bitcoin_core}/${files.bitcoinSha256Sig}`,
  lndDownload: `https://github.com/lightningnetwork/lnd/releases/download/v${versions.lnd}/${files.lndArchive}`,
  lndSha256: `https://github.com/lightningnetwork/lnd/releases/download/v${versions.lnd}/${files.lndSha256}`,
  nodesourceSetup: `https://deb.nodesource.com/setup_${versions.nodejs}.x`,
  nodesourceRepo: `https://deb.nodesource.com/node_${versions.nodejs}.x`,
} as const;

export type UrlKey = keyof typeof urls;

/**
 * Generic token lookup used by the remark plugin.
 * Accepts `versions.X`, `files.X`, `urls.X` as dotted paths.
 */
export function resolveToken(path: string): string | undefined {
  const [scope, key] = path.split('.');
  const map: Record<string, Record<string, string>> = { versions, files, urls };
  return map[scope]?.[key];
}
