import { ImageResponse } from 'next/og';
import { appName } from '@/lib/shared';
import { ogFrameStyle, ogLogoSrc, ogSize } from '@/lib/og';

// Root-level OG image. Shown on Twitter / Mastodon / LinkedIn / iMessage
// link previews when no page-specific OG image is set (landing, 404,
// anything outside /docs/*). Docs pages already have their own per-page
// OG route at /og/docs/[...slug].

export const dynamic = 'force-static';

export const alt = `${appName} v4 - Build your own do-everything-yourself Bitcoin node`;
export const size = ogSize;
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    <div style={ogFrameStyle}>
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
            src={ogLogoSrc()}
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
