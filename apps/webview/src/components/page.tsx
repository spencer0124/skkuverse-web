/**
 * The shared skeleton of the content pages.
 *
 * All three long pages were built from the same four shapes — a root, a
 * padded section, a grey band between sections, and a label-plus-title heading —
 * each redeclared in its own `Record<string, React.CSSProperties>`. They are
 * here once so the pages carry content rather than layout.
 *
 * No product copy lives in this file. `.conventions.json` exempts
 * `apps/webview/src/pages/**` from the English-everywhere rule and nothing else,
 * so Korean strings belong in the pages that import this, never here.
 */
import { type CSSProperties, type ReactNode } from 'react';
import { Border, Paragraph, useAdaptive } from '@skkuverse/ui';

export function Page({ children }: { children: ReactNode }) {
  const adaptive = useAdaptive();
  return (
    <div
      style={{
        background: adaptive.background,
        color: adaptive.grey900,
        minHeight: '100vh',
        WebkitFontSmoothing: 'antialiased',
        // Keeps the last row clear of the home indicator inside the app's webview.
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {children}
    </div>
  );
}

/**
 * A titled block. `divided` draws the grey band that separates it from whatever
 * precedes it, which every section except the first one wants.
 */
export function Section({
  label,
  title,
  divided,
  children,
}: {
  label: string;
  title?: string;
  divided?: boolean;
  children: ReactNode;
}) {
  const adaptive = useAdaptive();
  return (
    <>
      {divided && <Border type="height16" height={8} />}
      <section style={{ padding: '28px 20px' }}>
        <Paragraph typography="t7" fontWeight="semibold" color={adaptive.grey500}>
          {label}
        </Paragraph>
        {title && (
          <div style={{ marginTop: 4, marginBottom: 20 }}>
            <Paragraph typography="t4" fontWeight="bold">
              {title}
            </Paragraph>
          </div>
        )}
        {children}
      </section>
    </>
  );
}

/** The grey rounded block the pages use to group related rows. */
export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  const adaptive = useAdaptive();
  return (
    <div style={{ background: adaptive.grey100, borderRadius: 16, padding: '16px 18px', ...style }}>
      {children}
    </div>
  );
}

/** A small leading dot for a note line. */
export function Bullet() {
  const adaptive = useAdaptive();
  return (
    <span
      style={{
        width: 4,
        height: 4,
        borderRadius: '50%',
        background: adaptive.grey400,
        flexShrink: 0,
      }}
    />
  );
}

export function NoteRow({ children }: { children: ReactNode }) {
  const adaptive = useAdaptive();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Bullet />
      <Paragraph typography="t6" color={adaptive.grey700}>
        {children}
      </Paragraph>
    </div>
  );
}

/**
 * A route as a vertical timeline.
 *
 * Kept hand-rolled: the connector is an absolutely positioned rule behind the
 * stop dots, and nothing in packages/ui draws that. `ListRow` would give the
 * rows but not the line, and faking the line with borders puts a gap at every
 * row boundary.
 */
export function RouteTimeline({ children }: { children: ReactNode }) {
  const adaptive = useAdaptive();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingLeft: 22 }}>
      <div
        style={{
          position: 'absolute',
          left: 5,
          top: 8,
          bottom: 8,
          width: 2,
          background: adaptive.grey200,
          borderRadius: 1,
        }}
      />
      {children}
    </div>
  );
}

export function RouteStop({ name, terminal }: { name: string; terminal?: boolean }) {
  const adaptive = useAdaptive();
  return (
    <div style={{ position: 'relative', padding: '7px 0' }}>
      <span
        style={{
          position: 'absolute',
          left: -22,
          top: '50%',
          transform: 'translate(-1px, -50%)',
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: terminal ? adaptive.grey900 : adaptive.background,
          border: `2.5px solid ${terminal ? adaptive.grey900 : adaptive.grey400}`,
        }}
      />
      <Paragraph
        typography="t6"
        fontWeight={terminal ? 'bold' : 'medium'}
        color={terminal ? adaptive.grey900 : adaptive.grey700}
      >
        {name}
      </Paragraph>
    </div>
  );
}

/** The origin-to-destination pill above a route timeline. */
export function RouteDirection({ from, to }: { from: string; to: string }) {
  const adaptive = useAdaptive();
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '5px 12px',
        background: adaptive.background,
        borderRadius: 8,
        marginBottom: 18,
      }}
    >
      <Paragraph typography="t6" fontWeight="bold">
        {from}
      </Paragraph>
      {/* Inline rather than imported: @phosphor-icons/react is a dependency of
          packages/ui and pnpm does not hoist it, so pages cannot resolve it. */}
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path
          d="M3 7h8m0 0L8 4m3 3L8 10"
          stroke={adaptive.grey900}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <Paragraph typography="t6" fontWeight="bold">
        {to}
      </Paragraph>
    </div>
  );
}
