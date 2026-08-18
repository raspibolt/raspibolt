import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Boxes,
  Crown,
  EyeOff,
  Zap,
  Server,
  Database,
  Search,
  Clock,
  Globe,
  Send,
} from 'lucide-react';
import { appDescription, appName, appTagline } from '@/lib/shared';

// Use an absolute title so the root layout's `%s · RaspiBolt` template
// doesn't append a redundant suffix on the landing page. OG and Twitter
// metadata inherit from the root layout; no override needed here.
export const metadata: Metadata = {
  title: { absolute: `${appName} - ${appTagline}` },
  description: appDescription,
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-amber-50/60 via-transparent to-orange-50/40 dark:from-amber-950/20 dark:via-transparent dark:to-orange-950/10" />
        <div className="absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f59e0b1a_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b1a_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="inline-flex items-center rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold tracking-widest text-amber-700 uppercase dark:text-amber-300">
            v4 &middot; Updated August 2026
          </div>
          <h1 className="text-fd-foreground mt-4 text-5xl font-bold tracking-tight md:text-7xl">
            Build your own{' '}
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
              do-everything-yourself
            </span>{' '}
            Bitcoin full node.
          </h1>
          <p className="text-fd-muted-foreground mt-6 max-w-2xl text-xl leading-relaxed">
            Become a sovereign peer in the Bitcoin and Lightning networks, on a small, cheap
            Raspberry Pi sitting in the corner of your room.
          </p>
          <p className="mt-4 text-xl font-semibold tracking-tight text-amber-700 dark:text-amber-300">
            No need to trust anyone else.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/docs/backstory"
              className="group inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-semibold text-amber-950 shadow-lg shadow-amber-500/30 transition hover:bg-amber-400 hover:shadow-amber-500/40"
            >
              Start building
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-16 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
            <Stat value="A weekend" label="To build" />
            <Stat value="~700 GB" label="Blockchain validated" />
            <Stat value="24/7" label="Always online" />
            <Stat value="100%" label="Self-sovereignty" />
          </div>
        </div>
      </section>

      {/* ─────────────────── Why run a node? ─────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20 md:py-28">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold tracking-widest text-amber-700 uppercase dark:text-amber-400">
            Why bother?
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            There are plenty of reasons to run your own node.
          </h2>
          <p className="text-fd-muted-foreground mt-4 text-lg leading-relaxed">
            Any one of these is enough. Combined, they&apos;re hard to argue with.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Reason
            icon={<Boxes className="h-5 w-5" />}
            title="Keep Bitcoin decentralized"
            description="Your node helps enforce Bitcoin's consensus rules. Every additional full node makes the network harder to capture."
          />
          <Reason
            icon={<Crown className="h-5 w-5" />}
            title="Take back your sovereignty"
            description="Your node validates your own transactions. No third-party tells you what happened on-chain, you check for yourself."
          />
          <Reason
            icon={<EyeOff className="h-5 w-5" />}
            title="Improve your privacy"
            description="Connect your wallets directly to your own node and stop broadcasting your financial history to external servers."
          />
          <Reason
            icon={<Zap className="h-5 w-5" />}
            title="Be part of Lightning"
            description="Run a Lightning node for everyday payments and help build a reliable, decentralized payment network on top of Bitcoin."
          />
        </div>

        <div className="mt-16 flex items-center justify-center gap-4">
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/60 md:w-24" />
          <p className="text-fd-muted-foreground text-center text-xl italic">
            Did we mention that it&apos;s fun, as well?
          </p>
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/60 md:w-24" />
        </div>
      </section>

      {/* ─────────────────── What you'll run ─────────────────── */}
      <section className="border-fd-border bg-fd-muted/20 border-y">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="mb-6">
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/images/logo-light.png`}
                alt="RaspiBolt"
                className="ring-fd-border h-16 w-16 rounded-xl ring-1 dark:hidden"
              />
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/images/logo-dark.png`}
                alt="RaspiBolt"
                className="ring-fd-border hidden h-16 w-16 rounded-xl ring-1 dark:block"
              />
            </div>
            <div className="text-xs font-semibold tracking-widest text-amber-700 uppercase dark:text-amber-400">
              What you&apos;ll run
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              A complete self-sovereignty stack.
            </h2>
            <p className="text-fd-muted-foreground mt-4 text-lg leading-relaxed">
              Standard Debian Linux commands throughout, so the guide also works on other hardware
              and cloud servers. The core is carefully maintained and kept up to date.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Feature
              icon={<Server className="h-5 w-5" />}
              title="Bitcoin Core"
              description="Direct, trustless participation in the Bitcoin peer-to-peer network. Every block and every transaction, validated by you."
            />
            <Feature
              icon={<Database className="h-5 w-5" />}
              title="Electrum server"
              description="Connect your own wallets (including hardware wallets) to your own node instead of a stranger's."
            />
            <Feature
              icon={<Search className="h-5 w-5" />}
              title="Blockchain explorer"
              description="Private, local block and transaction lookup. No information leaks to third-party explorers."
            />
            <Feature
              icon={<Zap className="h-5 w-5" />}
              title="Lightning"
              description="Full Lightning node with long-term channels, plus web and mobile management interfaces."
            />
            <Feature
              icon={<Clock className="h-5 w-5" />}
              title="Always on, always synced"
              description="Services stay available 24/7, quietly keeping themselves up to date while you sleep."
            />
            <Feature
              icon={<Globe className="h-5 w-5" />}
              title="Reachable from anywhere"
              description="A Tailscale mesh VPN lets you reach the Pi from any device, anywhere, no open ports, no dynamic DNS."
            />
          </div>
        </div>
      </section>

      {/* ─────────────────── Who this is for ─────────────────── */}
      <section className="mx-auto w-full max-w-4xl px-6 py-20 md:py-28">
        <div className="text-xs font-semibold tracking-widest text-amber-700 uppercase dark:text-amber-400">
          Who this is for
        </div>
        <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
          Foolproof instructions, no shortcuts.
        </h2>
        <div className="text-fd-foreground mt-6 space-y-4 text-lg leading-relaxed">
          <p>
            The goal is to do everything yourself. Shortcuts that involve trusting someone else
            aren&apos;t allowed here, that&apos;s the whole point.
          </p>
          <p>
            This makes the guide technical, but the path is as straightforward as we can make it.
            Along the way you&apos;ll pick up a working understanding of Linux, Bitcoin, and
            Lightning, not because you have to memorize it, but because you&apos;ll actually use it.
          </p>
          <p className="text-fd-muted-foreground">
            If you enjoy tinkering, care about self-sovereignty, and have a weekend to spare, this
            guide is for you.
          </p>
        </div>
      </section>

      {/* ─────────────────── Community ─────────────────── */}
      <section className="border-fd-border border-t">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 md:py-24">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold tracking-widest text-amber-700 uppercase dark:text-amber-400">
              Community
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              You&apos;re not alone.
            </h2>
            <p className="text-fd-muted-foreground mt-4 text-lg leading-relaxed">
              RaspiBolt started in 2017 as a Medium post. It has grown into a community project with
              many contributors, thousands of nodes running in the wild, and help available wherever
              Bitcoiners gather.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <CommunityLink
              icon={<GitHubIcon />}
              title="GitHub"
              description="Issues, knowledge base, contributions"
              href="https://github.com/raspibolt/raspibolt/issues"
            />
            <CommunityLink
              icon={<RedditIcon />}
              title="Reddit"
              description="r/raspibolt for questions & discussion"
              href="https://www.reddit.com/r/raspibolt/"
            />
            <CommunityLink
              icon={<Send className="h-5 w-5" />}
              title="Telegram"
              description="t.me/raspibolt for real-time help"
              href="https://t.me/raspibolt"
            />
          </div>
        </div>
      </section>

      {/* ─────────────────── Final CTA ─────────────────── */}
      <section className="border-fd-border bg-fd-muted/30 border-t">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
            Ready to build your own?
          </h2>
          <p className="text-fd-muted-foreground mx-auto mt-5 max-w-xl text-lg leading-relaxed">
            Grab a Raspberry Pi, a 2 TB SSD, and a weekend. The guide opens with a short backstory,
            then walks you through every step.
          </p>
          <div className="mt-10 flex justify-center">
            <Link
              href="/docs/backstory"
              className="group inline-flex items-center gap-2 rounded-xl bg-amber-500 px-7 py-3.5 text-base font-semibold text-amber-950 shadow-lg shadow-amber-500/30 transition hover:bg-amber-400 hover:shadow-amber-500/40"
            >
              Start building
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="text-fd-muted-foreground mt-12 space-y-2 text-sm">
            <p>
              Running an earlier RaspiBolt? A clean rebuild is the recommended path, see the{' '}
              <Link
                href="/docs/faq"
                className="underline underline-offset-2 hover:text-amber-700 dark:hover:text-amber-400"
              >
                FAQ
              </Link>{' '}
              for details.
            </p>
            <p>
              Looking for older versions? The archived{' '}
              <a
                href="https://v3.raspibolt.org"
                className="underline underline-offset-2 hover:text-amber-700 dark:hover:text-amber-400"
              >
                v3
              </a>{' '}
              and{' '}
              <a
                href="https://v2.raspibolt.org"
                className="underline underline-offset-2 hover:text-amber-700 dark:hover:text-amber-400"
              >
                v2
              </a>{' '}
              guides stay online, and the{' '}
              <a
                href="https://github.com/raspibolt/raspibolt/tree/1.0"
                className="underline underline-offset-2 hover:text-amber-700 dark:hover:text-amber-400"
              >
                v1 source
              </a>{' '}
              is on GitHub.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────── Copyright ─────────────────── */}
      <footer className="border-fd-border border-t">
        <div className="mx-auto max-w-6xl px-6 py-6 text-center">
          <p className="text-fd-muted-foreground text-xs leading-relaxed">
            Copyright (c) 2017-2020 Stadicus
            <br />
            Copyright (c) 2021-{new Date().getFullYear()} RaspiBolt contributors
          </p>
        </div>
      </footer>
    </main>
  );
}

/* ───────────────────── Component bits ───────────────────── */

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function RedditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-fd-border bg-fd-background/50 rounded-xl border px-4 py-3 backdrop-blur">
      <div className="text-fd-foreground text-2xl font-bold">{value}</div>
      <div className="text-fd-muted-foreground mt-1 text-xs tracking-wide uppercase">{label}</div>
    </div>
  );
}

function Reason({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group border-fd-border bg-fd-card relative rounded-2xl border p-6 transition hover:-translate-y-0.5 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/10 text-amber-700 dark:text-amber-300">
        {icon}
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="text-fd-muted-foreground mt-2 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group border-fd-border bg-fd-background/60 relative rounded-xl border p-5 backdrop-blur transition hover:border-amber-500/40">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300">
          {icon}
        </div>
        <h3 className="font-semibold tracking-tight">{title}</h3>
      </div>
      <p className="text-fd-muted-foreground mt-3 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function CommunityLink({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="group border-fd-border bg-fd-card hover:bg-fd-accent flex items-center gap-4 rounded-xl border p-5 transition hover:border-amber-500/40"
    >
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold tracking-tight">{title}</div>
        <div className="text-fd-muted-foreground text-sm">{description}</div>
      </div>
      <ArrowRight className="text-fd-muted-foreground h-4 w-4 transition group-hover:translate-x-0.5 group-hover:text-amber-700 dark:group-hover:text-amber-400" />
    </a>
  );
}
