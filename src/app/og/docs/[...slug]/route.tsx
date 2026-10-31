import { getPageImage, source } from '@/lib/source';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';
import { appName } from '@/lib/shared';
import { ogFonts, ogFrameStyle, ogLogoSrc, ogSize, ogTruncate } from '@/lib/og';

export const revalidate = false;

// Section label shown top right, taken from the section's meta.json title
// so it matches the sidebar. Top-level pages (faq, backstory) get none.
function sectionTitle(slugs: string[]): string | undefined {
  if (slugs.length < 2) return undefined;
  try {
    const meta = JSON.parse(
      readFileSync(join(process.cwd(), 'guide', slugs[0], 'meta.json'), 'utf8'),
    ) as { title?: string };
    return meta.title;
  } catch {
    return undefined;
  }
}

export async function GET(_req: Request, { params }: RouteContext<'/og/docs/[...slug]'>) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  const section = sectionTitle(page.slugs);
  const description = page.data.description ? ogTruncate(page.data.description, 150) : undefined;

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
            fontWeight: 700,
            letterSpacing: -1.5,
            lineHeight: 1,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img> only */}
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
        {section ? (
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
            {section.toUpperCase()}
          </div>
        ) : null}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            fontSize: 68,
            fontWeight: 700,
            letterSpacing: -3,
            lineHeight: 1.05,
          }}
        >
          {page.data.title}
        </div>
        {description ? (
          <div
            style={{
              display: 'flex',
              marginTop: 22,
              color: '#78350f',
              fontSize: 30,
              lineHeight: 1.35,
            }}
          >
            {description}
          </div>
        ) : null}
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
    { ...ogSize, fonts: ogFonts() },
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImage(page).segments,
  }));
}
