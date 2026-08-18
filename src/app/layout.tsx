import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import { Provider } from '@/components/provider';
import { appDescription, appName, appTagline, isProductionSite, siteUrl } from '@/lib/shared';
import './global.css';

// Umami analytics. Separate websites for production (raspibolt.org)
// and staging (next.raspibolt.org) so traffic doesn't mix.
// isProductionSite is resolved at build time from NEXT_PUBLIC_SITE_URL.
// The script only renders in production builds; data-domains is a
// second guard so a locally served production build can't pollute
// the stats either.
const umamiWebsiteId = isProductionSite
  ? 'f6788a01-2c1f-429f-815b-73d15af26a27'
  : '3a6df4e2-9a81-4678-b782-88b940e22045';
const umamiDomains = isProductionSite ? 'raspibolt.org' : 'next.raspibolt.org';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${appName} - ${appTagline}`,
    template: `%s · ${appName}`,
  },
  description: appDescription,
  applicationName: appName,
  keywords: [
    'Bitcoin',
    'Lightning Network',
    'Raspberry Pi',
    'self-custody',
    'full node',
    'Bitcoin Core',
    'LND',
    'Electrs',
    'self-hosting',
    'sovereign node',
  ],
  authors: [{ name: 'Stadicus' }],
  creator: 'Stadicus',
  openGraph: {
    type: 'website',
    siteName: appName,
    title: `${appName} - ${appTagline}`,
    description: appDescription,
    url: siteUrl,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${appName} - ${appTagline}`,
    description: appDescription,
    creator: '@stadicus',
  },
  // Only the canonical production domain (raspibolt.org) should be
  // indexed. Staging (next.raspibolt.org) and PR previews
  // get full noindex so they don't compete with prod in search.
  robots: isProductionSite
    ? { index: true, follow: true }
    : {
        index: false,
        follow: false,
        nocache: true,
        googleBot: { index: false, follow: false, noimageindex: true },
      },
  alternates: {
    canonical: '/',
  },
};

// Geist everywhere - same family for sans and mono keeps the site
// visually coherent. Exposed as CSS variables so Tailwind's font-sans
// and font-mono utilities (wired in theme.css) resolve to these.
const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${geistSans.className}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <Provider>{children}</Provider>
        {process.env.NODE_ENV === 'production' && (
          <Script
            src="https://cloud.umami.is/script.js"
            data-website-id={umamiWebsiteId}
            data-domains={umamiDomains}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
