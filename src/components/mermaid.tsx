'use client';

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import mermaid from 'mermaid';

// Amber-tinted Mermaid theme matching the Fumadocs Fd color tokens.
// Both palettes are kept in sync with src/app/theme.css.
const lightTheme = {
  theme: 'base' as const,
  themeVariables: {
    fontFamily: 'var(--font-sans), system-ui, sans-serif',
    fontSize: '14px',
    primaryColor: 'hsl(35, 30%, 98%)',
    primaryTextColor: 'hsl(24, 10%, 20%)',
    primaryBorderColor: 'hsl(38, 92%, 50%)',
    lineColor: 'hsl(24, 70%, 45%)',
    secondaryColor: 'hsl(35, 50%, 95%)',
    tertiaryColor: 'hsl(35, 80%, 92%)',
    mainBkg: 'hsl(35, 30%, 98%)',
    clusterBkg: 'hsl(35, 50%, 95%)',
    clusterBorder: 'hsl(38, 60%, 70%)',
    edgeLabelBackground: 'hsl(35, 30%, 98%)',
  },
};

const darkTheme = {
  theme: 'base' as const,
  themeVariables: {
    fontFamily: 'var(--font-sans), system-ui, sans-serif',
    fontSize: '14px',
    primaryColor: 'hsl(24, 15%, 12%)',
    primaryTextColor: 'hsl(35, 30%, 92%)',
    primaryBorderColor: 'hsl(38, 85%, 58%)',
    lineColor: 'hsl(38, 70%, 60%)',
    secondaryColor: 'hsl(24, 15%, 16%)',
    tertiaryColor: 'hsl(24, 15%, 20%)',
    mainBkg: 'hsl(24, 15%, 12%)',
    clusterBkg: 'hsl(24, 15%, 16%)',
    clusterBorder: 'hsl(38, 50%, 35%)',
    edgeLabelBackground: 'hsl(24, 15%, 12%)',
  },
};

function getIsDark() {
  return document.documentElement.classList.contains('dark');
}

function subscribeToTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

export function Mermaid({ chart }: { chart: string }) {
  const id = useId().replaceAll(':', '');
  const [svg, setSvg] = useState<string>('');
  const isDark = useSyncExternalStore(subscribeToTheme, getIsDark, () => false);

  useEffect(() => {
    let cancelled = false;
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      ...(isDark ? darkTheme : lightTheme),
    });
    mermaid
      .render(`mermaid-${id}`, chart)
      .then(({ svg }) => {
        if (!cancelled) setSvg(svg);
      })
      .catch(() => {
        if (!cancelled) setSvg('');
      });
    return () => {
      cancelled = true;
    };
  }, [chart, id, isDark]);

  const [zoomed, setZoomed] = useState(false);

  if (!svg) {
    return (
      <div className="border-fd-border bg-fd-card my-6 flex justify-center overflow-x-auto rounded-lg border p-4" />
    );
  }

  return (
    <>
      <div className="border-fd-border bg-fd-card group relative my-6 overflow-x-auto rounded-lg border p-4">
        <button
          type="button"
          onClick={() => setZoomed(true)}
          aria-label="Zoom diagram"
          className="border-fd-border bg-fd-card/80 text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent absolute top-2 right-2 z-10 rounded-md border p-1.5 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        >
          <ExpandIcon />
        </button>
        <div
          className="flex cursor-zoom-in justify-center"
          onClick={() => setZoomed(true)}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
      {zoomed && <ZoomOverlay svg={svg} onClose={() => setZoomed(false)} />}
    </>
  );
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 8;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function ZoomOverlay({ svg, onClose }: { svg: string; onClose: () => void }) {
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  // Scale at which the diagram fits the viewport. 100% in the readout maps
  // to this, not to the SVG's (tiny) native size.
  const [fitScale, setFitScale] = useState(1);

  const reset = useCallback(() => {
    setScale(fitScale);
    setTx(0);
    setTy(0);
  }, [fitScale]);

  // On open, scale the diagram up to fill the screen (with a margin), so it
  // lands at about screen width instead of its small native size. Layout
  // effect: measured and applied before paint, no flash at scale 1.
  useLayoutEffect(() => {
    const surface = surfaceRef.current;
    const content = contentRef.current;
    if (!surface || !content) return;
    // offsetWidth/Height are the untransformed (native) box; transform does
    // not affect layout, so this is stable regardless of current scale.
    const w = content.offsetWidth;
    const h = content.offsetHeight;
    if (!w || !h) return;
    const fit = clamp(
      Math.min((surface.clientWidth * 0.92) / w, (surface.clientHeight * 0.92) / h),
      MIN_SCALE,
      MAX_SCALE,
    );
    setFitScale(fit);
    setScale(fit);
  }, []);

  // Esc to close, lock background scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    setScale((s) => clamp(s * factor, MIN_SCALE, MAX_SCALE));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, tx, ty };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setTx(drag.current.tx + (e.clientX - drag.current.x));
    setTy(drag.current.ty + (e.clientY - drag.current.y));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    (e.target as Element).releasePointerCapture(e.pointerId);
    drag.current = null;
  };

  return (
    <div
      className="bg-fd-background/90 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={surfaceRef}
        className="absolute inset-0 flex cursor-grab touch-none items-center justify-center overflow-hidden active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div
          ref={contentRef}
          className="select-none [&_svg]:max-w-none"
          style={{
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
            transformOrigin: 'center center',
            willChange: 'transform',
          }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
      <div className="absolute top-4 right-4 z-10 flex gap-1" onClick={(e) => e.stopPropagation()}>
        <ToolButton
          label="Zoom out"
          onClick={() => setScale((s) => clamp(s / 1.2, MIN_SCALE, MAX_SCALE))}
        >
          &minus;
        </ToolButton>
        <ToolButton label="Reset zoom" onClick={reset}>
          {Math.round((scale / fitScale) * 100)}%
        </ToolButton>
        <ToolButton
          label="Zoom in"
          onClick={() => setScale((s) => clamp(s * 1.2, MIN_SCALE, MAX_SCALE))}
        >
          +
        </ToolButton>
        <ToolButton label="Close" onClick={onClose}>
          &times;
        </ToolButton>
      </div>
    </div>
  );
}

function ToolButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="border-fd-border bg-fd-card text-fd-foreground hover:bg-fd-accent min-w-9 rounded-md border px-2 py-1 text-sm tabular-nums shadow-sm"
    >
      {children}
    </button>
  );
}

function ExpandIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 3h6v6" />
      <path d="M9 21H3v-6" />
      <path d="M21 3l-7 7" />
      <path d="M3 21l7-7" />
    </svg>
  );
}
