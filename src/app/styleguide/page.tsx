/**
 * /styleguide, canonical reference for the RaspiBolt design system.
 *
 * Shows every token (color, typography, spacing) and every component
 * in both its states. Treat this page as the source of truth: if a
 * design change lands here, then apply it across the site.
 */
import Link from 'next/link';
import { ArrowRight, Info, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';

export const metadata = {
  title: 'Styleguide, RaspiBolt',
  description: 'Tokens, typography, and components used across the RaspiBolt site.',
};

export default function StyleguidePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16 md:py-20">
      <header className="border-fd-border border-b pb-10">
        <div className="text-xs font-semibold tracking-widest text-amber-700 uppercase dark:text-amber-400">
          Internal, design reference
        </div>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Styleguide</h1>
        <p className="text-fd-muted-foreground mt-4 max-w-2xl text-lg leading-relaxed">
          Tokens, typography, and components used across the RaspiBolt site. One page, all the
          building blocks. Edit{' '}
          <code className="rounded bg-amber-500/10 px-1.5 py-0.5 text-sm">src/app/theme.css</code>{' '}
          to change the palette, every component re-renders.
        </p>
      </header>

      {/* ─────────────── Color tokens ─────────────── */}
      <Section id="colors" label="Palette" title="Color tokens">
        <p className="text-fd-muted-foreground max-w-2xl">
          Defined in <code>src/app/theme.css</code>. Fumadocs-scoped tokens (prefixed{' '}
          <code>fd-</code>) drive built-in components; RaspiBolt-specific tokens (prefixed{' '}
          <code>rb-</code>) are used for landing-page accents.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          <Swatch name="primary" token="fd-primary" description="Amber, accent, CTAs" />
          <Swatch name="foreground" token="fd-foreground" description="Body text" />
          <Swatch name="background" token="fd-background" description="Page base" />
          <Swatch name="muted" token="fd-muted" description="Subdued surfaces" />
          <Swatch
            name="muted-foreground"
            token="fd-muted-foreground"
            description="Secondary text"
          />
          <Swatch name="accent" token="fd-accent" description="Hover states" />
          <Swatch name="border" token="fd-border" description="Dividers" />
          <Swatch name="card" token="fd-card" description="Raised surfaces" />
        </div>
        <div className="mt-8">
          <h3 className="text-sm font-semibold tracking-wide uppercase">Brand amber scale</h3>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {['50', '100', '500', '600', '700'].map((step) => (
              <div key={step} className="border-fd-border overflow-hidden rounded-lg border">
                <div
                  className="h-16"
                  style={{ backgroundColor: `var(--color-rb-amber-${step})` }}
                />
                <div className="px-3 py-2 text-xs">
                  <div className="font-mono font-semibold">amber-{step}</div>
                  <div className="text-fd-muted-foreground">rb-amber-{step}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-sm font-semibold tracking-wide uppercase">Raspberry Pi brand</h3>
          <p className="text-fd-muted-foreground mt-1 text-xs">
            Official Raspberry Pi red (#C51A4A). Use for hardware-specific callouts and Pi badges.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="border-fd-border overflow-hidden rounded-lg border">
              <div className="h-16" style={{ backgroundColor: 'var(--color-rb-raspberry)' }} />
              <div className="px-3 py-2 text-xs">
                <div className="font-mono font-semibold">raspberry</div>
                <div className="text-fd-muted-foreground">rb-raspberry</div>
              </div>
            </div>
            <div className="border-fd-border overflow-hidden rounded-lg border">
              <div
                className="h-16"
                style={{ backgroundColor: 'var(--color-rb-raspberry-muted)' }}
              />
              <div className="px-3 py-2 text-xs">
                <div className="font-mono font-semibold">raspberry-muted</div>
                <div className="text-fd-muted-foreground">rb-raspberry-muted</div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ─────────────── Typography ─────────────── */}
      <Section id="typography" label="Scale" title="Typography">
        <p className="text-fd-muted-foreground max-w-2xl">
          Inter variable for everything. Tight tracking on display headings (<code>-0.025em</code>{' '}
          for h1, <code>-0.015em</code> for h2-h4). Mono fallback is the system stack.
        </p>
        <div className="mt-8 space-y-8">
          <TypeSample
            label="Display / h1, 72px / 800 / -0.025em"
            className="text-7xl font-extrabold tracking-tight"
          >
            Build your own Bitcoin node
          </TypeSample>
          <TypeSample
            label="Page heading / h1, 40px / 800"
            className="text-4xl font-extrabold tracking-tight"
          >
            Preparations
          </TypeSample>
          <TypeSample
            label="Section / h2, 28px / 700"
            className="text-3xl font-bold tracking-tight"
          >
            Why run your own node?
          </TypeSample>
          <TypeSample label="Subsection / h3, 20px / 600" className="text-xl font-semibold">
            Check SSD performance
          </TypeSample>
          <TypeSample
            label="Lede, 19px / 400 / 1.55 line-height"
            className="text-fd-muted-foreground text-[19px] leading-relaxed"
          >
            A hobbyist&apos;s guide to building a self-sovereign Bitcoin and Lightning node on a
            Raspberry Pi.
          </TypeSample>
          <TypeSample label="Body, 16px / 400 / 1.65" className="text-base leading-relaxed">
            Before you boot a single terminal, get the hardware sorted and pick your passwords. Five
            minutes of prep saves an hour of hunting for a missing cable later.
          </TypeSample>
          <TypeSample label="Small / caption, 13px / 500" className="text-sm font-medium">
            Raspberry Pi · 1 of 7 · ~15 min read
          </TypeSample>
          <TypeSample label="Mono, Inline code" className="font-mono">
            sudo apt update && sudo apt full-upgrade
          </TypeSample>
        </div>
      </Section>

      {/* ─────────────── Buttons ─────────────── */}
      <Section id="buttons" label="Interaction" title="Buttons">
        <p className="text-fd-muted-foreground max-w-2xl">
          Two variants are enough. Primary for the single main action on a view, ghost for secondary
          affordances.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button className="group inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-semibold text-amber-950 shadow-lg shadow-amber-500/30 transition hover:bg-amber-400 hover:shadow-amber-500/40">
            Primary
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </button>
          <button className="border-fd-border bg-fd-background text-fd-foreground hover:bg-fd-accent inline-flex items-center gap-2 rounded-xl border px-6 py-3 font-semibold transition">
            Ghost
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-500/10 dark:text-amber-300">
            Tertiary (link-ish)
          </button>
        </div>
      </Section>

      {/* ─────────────── Callouts ─────────────── */}
      <Section id="callouts" label="Emphasis" title="Callouts">
        <p className="text-fd-muted-foreground max-w-2xl">
          Fumadocs <code>&lt;Callout&gt;</code> component with four types. Use sparingly, one per
          page, maybe two. Over-use dilutes signal.
        </p>
        <div className="mt-8 space-y-4">
          <StyledCallout
            type="info"
            icon={<Info className="h-5 w-5" />}
            title="Informational note"
            body="Context or hint that aids understanding. The most common callout."
          />
          <StyledCallout
            type="warn"
            icon={<AlertTriangle className="h-5 w-5" />}
            title="Risk or irreversible action"
            body="Used for SSH key backups, 'test before disabling passwords', anything that bites if you get it wrong."
          />
          <StyledCallout
            type="success"
            icon={<CheckCircle className="h-5 w-5" />}
            title="Validation step"
            body="Used after a command that confirms success, e.g. 'fail2ban-client status sshd' output looks like this."
          />
          <StyledCallout
            type="tip"
            icon={<Lightbulb className="h-5 w-5" />}
            title="Optional shortcut"
            body="Nice-to-know trick or optimization that isn't required to complete the chapter."
          />
        </div>
      </Section>

      {/* ─────────────── Cards ─────────────── */}
      <Section id="cards" label="Navigation" title="Cards">
        <p className="text-fd-muted-foreground max-w-2xl">
          Used at the bottom of overview pages to route readers to the next set of chapters. Three
          sizes, compact, standard, feature.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DemoCard
            title="Standard card"
            description="Title + one-line description. Fits 2-up or 3-up grids."
          />
          <DemoCard
            title="With icon"
            description="Adds an icon slot for visual scanning."
            icon={<Info className="h-5 w-5" />}
          />
        </div>
      </Section>

      {/* ─────────────── Code blocks ─────────────── */}
      <Section id="code" label="Commands" title="Code blocks">
        <p className="text-fd-muted-foreground max-w-2xl">
          Always with a language. Multi-command sequences live in a single fenced block so the copy
          button grabs the lot.
        </p>
        <div className="mt-8 space-y-4">
          <CodeDemo
            language="bash"
            content={`sudo apt update
sudo apt full-upgrade
sudo apt install fail2ban python3-systemd`}
          />
          <CodeDemo
            language="text"
            content={`Status: active
Default: deny (incoming), allow (outgoing), disabled (routed)
To                         Action      From
--                         ------      ----
22/tcp (SSH)               LIMIT IN    Anywhere`}
          />
        </div>
      </Section>

      {/* ─────────────── Spacing + shape ─────────────── */}
      <Section id="shape" label="Geometry" title="Radius & spacing">
        <p className="text-fd-muted-foreground max-w-2xl">
          Use <code>rounded-lg</code> (8px) for buttons and inline elements, <code>rounded-xl</code>{' '}
          (12px) for cards and code blocks, <code>rounded-2xl</code> (16px) for hero-sized surfaces.
        </p>
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { name: 'rounded-lg', cls: 'rounded-lg', size: '8px' },
            { name: 'rounded-xl', cls: 'rounded-xl', size: '12px' },
            { name: 'rounded-2xl', cls: 'rounded-2xl', size: '16px' },
          ].map((r) => (
            <div
              key={r.name}
              className={`border-fd-border bg-fd-muted flex h-28 items-center justify-center border ${r.cls}`}
            >
              <div className="text-center">
                <div className="font-mono text-sm font-semibold">{r.name}</div>
                <div className="text-fd-muted-foreground text-xs">{r.size}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <footer className="border-fd-border mt-16 border-t pt-10 text-sm">
        <p className="text-fd-muted-foreground">
          Change a token, the whole site follows. Link:{' '}
          <Link
            href="/docs"
            className="font-medium text-amber-700 underline underline-offset-2 hover:text-amber-700 dark:text-amber-300"
          >
            back to the guide
          </Link>
          .
        </p>
      </footer>
    </main>
  );
}

/* ─────────────── Section shell ─────────────── */

function Section({
  id,
  label,
  title,
  children,
}: {
  id: string;
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="border-fd-border border-b py-16">
      <div className="text-xs font-semibold tracking-widest text-amber-700 uppercase dark:text-amber-400">
        {label}
      </div>
      <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

/* ─────────────── Color swatch ─────────────── */

function Swatch({
  name,
  token,
  description,
}: {
  name: string;
  token: string;
  description: string;
}) {
  return (
    <div className="border-fd-border overflow-hidden rounded-lg border">
      <div className="h-16" style={{ backgroundColor: `var(--color-${token})` }} />
      <div className="px-3 py-2">
        <div className="font-mono text-sm font-semibold">{name}</div>
        <div className="text-fd-muted-foreground font-mono text-[10px]">--color-{token}</div>
        <div className="text-fd-muted-foreground mt-1 text-xs">{description}</div>
      </div>
    </div>
  );
}

/* ─────────────── Type sample ─────────────── */

function TypeSample({
  label,
  className,
  children,
}: {
  label: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-fd-border bg-fd-card/50 rounded-lg border p-6">
      <div className="text-fd-muted-foreground mb-3 font-mono text-[11px] tracking-wide uppercase">
        {label}
      </div>
      <div className={className}>{children}</div>
    </div>
  );
}

/* ─────────────── Callouts ─────────────── */

type CalloutType = 'info' | 'warn' | 'success' | 'tip';

function StyledCallout({
  type,
  icon,
  title,
  body,
}: {
  type: CalloutType;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  const colors: Record<CalloutType, { bg: string; border: string; text: string }> = {
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-l-blue-500',
      text: 'text-blue-700 dark:text-blue-300',
    },
    warn: {
      bg: 'bg-amber-500/10',
      border: 'border-l-amber-500',
      text: 'text-amber-800 dark:text-amber-300',
    },
    success: {
      bg: 'bg-emerald-500/10',
      border: 'border-l-emerald-500',
      text: 'text-emerald-700 dark:text-emerald-300',
    },
    tip: {
      bg: 'bg-violet-500/10',
      border: 'border-l-violet-500',
      text: 'text-violet-700 dark:text-violet-300',
    },
  };
  const c = colors[type];
  return (
    <div className={`rounded-lg border-l-4 px-5 py-4 ${c.bg} ${c.border}`}>
      <div className={`flex items-center gap-2 font-semibold ${c.text}`}>
        {icon}
        {title}
      </div>
      <p className="text-fd-foreground mt-2 text-sm leading-relaxed">{body}</p>
    </div>
  );
}

/* ─────────────── Demo card ─────────────── */

function DemoCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="group border-fd-border bg-fd-card hover:border-fd-primary/50 relative rounded-xl border p-5 transition hover:shadow-md">
      {icon && (
        <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300">
          {icon}
        </div>
      )}
      <h3 className="font-semibold tracking-tight">{title}</h3>
      <p className="text-fd-muted-foreground mt-2 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

/* ─────────────── Code demo ─────────────── */

function CodeDemo({ language, content }: { language: string; content: string }) {
  return (
    <div className="border-fd-border overflow-hidden rounded-xl border">
      <div className="border-fd-border bg-fd-muted flex items-center justify-between border-b px-4 py-2">
        <span className="text-fd-muted-foreground font-mono text-xs">{language}</span>
        <span className="text-fd-muted-foreground font-mono text-xs">Copy</span>
      </div>
      <pre className="bg-fd-card overflow-x-auto p-4 text-sm leading-relaxed">
        <code className="font-mono">{content}</code>
      </pre>
    </div>
  );
}
