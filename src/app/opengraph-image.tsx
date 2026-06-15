import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';
import { appName, appTagline } from '@/lib/shared';

// Root-level OG image. Shown on Twitter / Mastodon / LinkedIn / iMessage
// link previews when no page-specific OG image is set (landing, 404,
// anything outside /docs/*). Docs pages already have their own per-page
// OG route at /og/docs/[...slug].

export const dynamic = 'force-static';

export const alt = `${appName} - ${appTagline}`;
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
        alignItems: 'center',
        padding: '80px',
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      }}
    >
      <img
        src={logoSrc}
        width={200}
        height={200}
        style={{ borderRadius: 44, border: '1px solid rgba(120, 53, 15, 0.15)' }}
        alt=""
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginLeft: 64,
          color: '#78350f',
        }}
      >
        <div
          style={{
            fontSize: 128,
            fontWeight: 800,
            letterSpacing: -4,
            lineHeight: 1,
          }}
        >
          {appName}
        </div>
        <div
          style={{
            fontSize: 32,
            marginTop: 20,
            color: '#92400e',
            lineHeight: 1.3,
            maxWidth: 560,
          }}
        >
          {appTagline}
        </div>
      </div>
    </div>,
    { ...size },
  );
}
