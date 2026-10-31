import { readFileSync } from 'fs';
import { join } from 'path';
import type { CSSProperties } from 'react';

// Shared look for the root OG image and the per-page docs OG images,
// so link previews on X / Mastodon / LinkedIn read as one brand.

export const ogSize = { width: 1200, height: 630 };

export const ogFrameStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '54px 64px 48px',
  color: '#1c140d',
  backgroundColor: '#fffbeb',
  backgroundImage:
    'linear-gradient(rgba(245, 158, 11, 0.11) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.11) 1px, transparent 1px), radial-gradient(circle at 88% 18%, rgba(249, 115, 22, 0.18), transparent 32%)',
  backgroundSize: '64px 64px, 64px 64px, 100% 100%',
};

export function ogLogoSrc(): string {
  const logoData = readFileSync(join(process.cwd(), 'public/images/logo-light.png'));
  return `data:image/png;base64,${logoData.toString('base64')}`;
}

// Satori has no reliable line clamping, so cap long text by length and
// cut at a word boundary. Keeps descriptions from overflowing the footer.
export function ogTruncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).replace(/[\s,;:.(-]+$/, '')}...`;
}
