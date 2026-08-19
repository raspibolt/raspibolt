import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';
import { appName } from '@/lib/shared';

// Root-level OG image. Shown on Twitter / Mastodon / LinkedIn / iMessage
// link previews when no page-specific OG image is set (landing, 404,
// anything outside /docs/*). Docs pages already have their own per-page
// OG route at /og/docs/[...slug].

export const dynamic = 'force-static';

export const alt = `${appName} v4 - Build your own do-everything-yourself Bitcoin node`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const logoData = readFileSync(join(process.cwd(), 'public/images/logo-light.png'));
  const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`;

  return new ImageResponse(
    <div
      style={{
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
      }}
    >
      <div
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: -1.5,
            lineHeight: 1,
          }}
        >
          <img
            src={logoSrc}
            width={72}
            height={72}
            style={{
              marginRight: 20,
              border: '1px solid rgba(120, 53, 15, 0.14)',
              borderRadius: 18,
            }}
            alt=""
          />
          <span>{appName}</span>
        </div>
        <div
          style={{
            display: 'flex',
            padding: '10px 18px',
            border: '1px solid rgba(245, 158, 11, 0.52)',
            borderRadius: 999,
            background: 'rgba(245, 158, 11, 0.12)',
            color: '#92400e',
            fontSize: 19,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          VERSION 4
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 4 }}>
        <div
          style={{
            display: 'flex',
            fontSize: 74,
            fontWeight: 800,
            letterSpacing: -4.2,
            lineHeight: 1.02,
          }}
        >
          Build your own
        </div>
        <div
          style={{
            display: 'flex',
            color: '#d65f0b',
            fontSize: 74,
            fontWeight: 800,
            letterSpacing: -4.2,
            lineHeight: 1.02,
          }}
        >
          do-everything-yourself
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 74,
            fontWeight: 800,
            letterSpacing: -4.2,
            lineHeight: 1.02,
          }}
        >
          Bitcoin node.
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#78350f',
          fontSize: 22,
        }}
      >
        <span>Bitcoin · Lightning · Self-custody</span>
        <span style={{ fontWeight: 700 }}>raspibolt.org</span>
      </div>
    </div>,
    { ...size },
  );
}
