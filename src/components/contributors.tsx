import contributors from '../../lib/contributors.json';

type Contributor = {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
};

export function Contributors({ limit = 20 }: { limit?: number }) {
  const list = (contributors as Contributor[]).slice(0, limit);

  return (
    <div className="not-prose my-6 grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10">
      {list.map((c) => (
        <a
          key={c.login}
          href={c.html_url}
          target="_blank"
          rel="noopener noreferrer"
          title={`${c.login} - ${c.contributions} contribution${c.contributions === 1 ? '' : 's'}`}
          className="hover:bg-fd-accent group flex flex-col items-center gap-1.5 rounded-md p-2 transition-colors"
        >
          {/* Plain <img> on purpose: next.config.mjs has images.unoptimized=true
              for the static export; next/image would add no value here. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${c.avatar_url}&s=128`}
            alt={`${c.login} avatar`}
            width={56}
            height={56}
            loading="lazy"
            className="ring-fd-border h-14 w-14 rounded-full ring-1 transition group-hover:ring-amber-500/40"
          />
          <span className="text-fd-muted-foreground group-hover:text-fd-foreground line-clamp-1 text-center text-xs transition-colors">
            {c.login}
          </span>
        </a>
      ))}
    </div>
  );
}
