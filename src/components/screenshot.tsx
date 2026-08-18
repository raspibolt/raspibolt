type Props = {
  src: string;
  alt: string;
  caption?: string;
  /** Mark UI screenshots whose app has likely evolved since capture. */
  stale?: boolean;
  /** Float the figure so surrounding prose wraps around it (md+ only). */
  float?: 'left' | 'right';
};

// Next.js only rewrites <Link> and <Image> for basePath; plain <img>
// needs the prefix applied manually when an alternate preview uses one.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function Screenshot({ src, alt, caption, stale, float }: Props) {
  const resolvedSrc = src.startsWith('/') ? `${basePath}${src}` : src;
  const isFloat = float === 'left' || float === 'right';
  const figureClass = isFloat
    ? `relative my-4 md:mb-4 ${
        float === 'right' ? 'md:float-right md:ml-6' : 'md:float-left md:mr-6'
      } md:w-[min(45%,320px)]`
    : 'relative my-8';
  return (
    <figure className={figureClass}>
      {/* amber glow; skipped for float variant to keep inline layout clean */}
      {!isFloat && (
        <div
          aria-hidden="true"
          className="absolute -inset-6 rounded-3xl bg-amber-500/20 blur-3xl dark:bg-amber-500/15"
        />
      )}
      <img
        src={resolvedSrc}
        alt={alt}
        className="relative w-full rounded-xl border border-purple-900/60 shadow-2xl shadow-amber-900/10 dark:border-purple-800/70 dark:shadow-amber-900/30"
      />
      {(caption || stale) && (
        <figcaption className="text-fd-muted-foreground mt-3 flex flex-wrap items-center justify-center gap-2 text-center text-sm">
          {stale && (
            <span className="inline-flex items-center rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-900 dark:text-amber-300">
              probably outdated
            </span>
          )}
          {caption && <span>{caption}</span>}
        </figcaption>
      )}
    </figure>
  );
}
