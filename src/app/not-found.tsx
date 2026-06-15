'use client';

import Link from 'next/link';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { ArrowRight, Search, Home, BookOpen, Cpu, Bitcoin, Zap, HelpCircle } from 'lucide-react';

// Custom 404 page. Lands anyone who follows a stale raspibolt.org link, a
// typo, or a renamed section. Offers three paths forward: search, jump to a
// popular page, or go home.

function QuickLink({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="hover:bg-fd-accent group bg-fd-card border-fd-border flex flex-col gap-2 rounded-lg border p-4 transition-colors hover:border-amber-500/40"
    >
      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/10">
          {icon}
        </span>
        <span className="text-fd-foreground font-semibold">{title}</span>
      </div>
      <p className="text-fd-muted-foreground text-sm leading-relaxed">{description}</p>
    </Link>
  );
}

export default function NotFound() {
  const { setOpenSearch } = useSearchContext();
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col px-6 py-16 md:py-24">
      <p className="text-sm font-semibold tracking-widest text-amber-700 uppercase dark:text-amber-400">
        404
      </p>
      <h1 className="text-fd-foreground mt-3 text-4xl font-bold tracking-tight md:text-5xl">
        That page isn&apos;t here.
      </h1>
      <p className="text-fd-muted-foreground mt-4 max-w-xl text-lg leading-relaxed">
        The URL might be from an older version of the guide, renamed in the v4 rewrite, or just
        mistyped. Three ways out:
      </p>
      <p className="text-fd-muted-foreground mt-3 text-sm">
        Looking for the previous{' '}
        <a
          href="https://v3.raspibolt.org"
          className="underline underline-offset-2 hover:text-amber-700 dark:hover:text-amber-400"
        >
          v3 guide
        </a>
        ? It stays archived there.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setOpenSearch(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 font-medium text-white shadow-sm shadow-amber-500/30 transition hover:bg-amber-600 hover:shadow-amber-500/40"
        >
          <Search className="h-4 w-4" />
          Search the guide
        </button>
        <Link
          href="/"
          className="border-fd-border bg-fd-background text-fd-foreground hover:bg-fd-accent inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 font-medium transition"
        >
          <Home className="h-4 w-4" />
          Back to the landing
        </Link>
      </div>

      <h2 className="text-fd-foreground mt-14 text-xl font-semibold">Jump straight to a section</h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <QuickLink
          href="/docs/backstory"
          icon={<BookOpen className="h-4 w-4" />}
          title="Backstory"
          description="Why this guide exists, what a full node actually does."
        />
        <QuickLink
          href="/docs/architecture"
          icon={<ArrowRight className="h-4 w-4" />}
          title="Architecture"
          description="How Bitcoin Core, Electrs, LND, Tor, and Tailscale fit together."
        />
        <QuickLink
          href="/docs/raspberry-pi"
          icon={<Cpu className="h-4 w-4" />}
          title="Hardware"
          description="From bare hardware to a hardened Bitcoin-ready computer."
        />
        <QuickLink
          href="/docs/bitcoin"
          icon={<Bitcoin className="h-4 w-4" />}
          title="Bitcoin"
          description="Bitcoin Core, Electrs, block explorer, desktop wallet."
        />
        <QuickLink
          href="/docs/lightning"
          icon={<Zap className="h-4 w-4" />}
          title="Lightning"
          description="LND, RTL, Zeus on mobile, channel backup automation."
        />
        <QuickLink
          href="/docs/troubleshooting"
          icon={<HelpCircle className="h-4 w-4" />}
          title="Troubleshooting"
          description="SSH lockout, stuck IBD, UAS SSD quirks, fail2ban, and more."
        />
      </div>
    </main>
  );
}
