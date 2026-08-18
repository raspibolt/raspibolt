export const appName = 'RaspiBolt';
export const appTagline = 'Self-custody Bitcoin & Lightning on a Raspberry Pi';
export const appDescription =
  'A step-by-step guide to building your own sovereign Bitcoin and Lightning node on a Raspberry Pi. No custodian, no cloud, just you and the protocol.';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

// Canonical site URL for Open Graph, Twitter cards, sitemap, and
// canonical links. Defaults to the staging target;
// override via NEXT_PUBLIC_SITE_URL when cutting over to raspibolt.org.
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://next.raspibolt.org';

// True when we're building for the canonical production domain.
// Everything else (staging, PR previews, local dev) is treated as
// non-production and kept out of search indexes.
export const isProductionSite = siteUrl === 'https://raspibolt.org';

// Drives the "edit this page" / source links. Production (raspibolt.org)
// points at the upstream repo on master; staging and the fork keep pointing
// at the working branch so edit links resolve to the actual source of truth.
// Keyed off isProductionSite so the cutover needs no manual edit here.
export const gitConfig = isProductionSite
  ? { user: 'raspibolt', repo: 'raspibolt', branch: 'master' }
  : { user: 'Stadicus', repo: 'RaspiBolt', branch: 'feature/v4-rewrite' };
