/**
 * Presentational pieces the ESKARA pages share.
 *
 * Prop-driven and string-free, like `page.tsx` beside it. Nothing here imports
 * from `pages/`, which is what keeps the dependency pointing one way: pages know
 * about components, components never know about a page's content.
 *
 * That is also why there is no Korean in this file. `.conventions.json` exempts
 * `apps/webview/src/pages/**` from the English-everywhere rule, and the exemption
 * decides where *copy* may live — not where a component may live. A component
 * belongs in `components/`; its words arrive as props.
 */
import { type ReactNode } from 'react';
import { Paragraph, useAdaptive } from '@skkuverse/ui';

/**
 * Says out loud that the content below is a past year's, and renders nothing
 * when `notice` is null. A page quietly showing a stale schedule is worse than
 * one showing none, and the null case is what removes every banner in a single
 * data edit once the current year's content lands.
 */
export function ArchiveNotice({ notice }: { notice: string | null }) {
  const adaptive = useAdaptive();
  if (!notice) return null;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        margin: '0 20px',
        marginTop: 16,
        padding: '12px 14px',
        background: adaptive.grey100,
        borderRadius: 12,
      }}
    >
      <span aria-hidden>🗂️</span>
      <Paragraph typography="t7" color={adaptive.grey600}>
        {notice}
      </Paragraph>
    </div>
  );
}

/**
 * An image with an optional caption.
 *
 * Two things here are load-bearing, and both were found by looking rather than
 * reasoning.
 *
 * `width`/`height` carry the intrinsic size so the browser reserves the box from
 * the aspect ratio before the file decodes. Without them an unloaded `<img>` is
 * zero-height and everything below it jumps when the bytes land — measured at
 * ~593 px on the entry page. `loading="lazy"` makes that worse, not better,
 * because the jump then happens mid-scroll.
 *
 * `maxWidth: 100%` rather than `width: 100%`: these sources run 472 px to
 * 1050 px wide, and forcing every one to fill its container upscales the small
 * ones into blur on any viewport wider than they are. Capping lets each render at
 * natural size until the viewport is narrower — which is the phone, i.e. the
 * normal case.
 */
export function Figure({
  src,
  alt,
  width,
  height,
  caption,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}) {
  const adaptive = useAdaptive();
  return (
    <figure style={{ margin: 0 }}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        style={{ maxWidth: '100%', height: 'auto', display: 'block', borderRadius: 12 }}
      />
      {caption && (
        <figcaption style={{ marginTop: 8 }}>
          <Paragraph typography="t7" color={adaptive.grey500}>
            {caption}
          </Paragraph>
        </figcaption>
      )}
    </figure>
  );
}

/** A label on the left, its value on the right — the pages' densest unit. */
export function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  const adaptive = useAdaptive();
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 16,
        padding: '9px 0',
      }}
    >
      <Paragraph typography="t6" color={adaptive.grey500}>
        {label}
      </Paragraph>
      <div style={{ textAlign: 'right' }}>
        <Paragraph typography="t6" fontWeight="medium">
          {children}
        </Paragraph>
      </div>
    </div>
  );
}

/** The page's own title block, since the native header only carries a string. */
export function PageHeading({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  const adaptive = useAdaptive();
  return (
    <div style={{ padding: '24px 20px 4px' }}>
      <Paragraph typography="t7" fontWeight="semibold" color={adaptive.grey500}>
        {eyebrow}
      </Paragraph>
      <div style={{ marginTop: 6 }}>
        <Paragraph typography="t3" fontWeight="bold">
          {title}
        </Paragraph>
      </div>
      {lead && (
        <div style={{ marginTop: 10 }}>
          <Paragraph typography="t6" color={adaptive.grey600}>
            {lead}
          </Paragraph>
        </div>
      )}
    </div>
  );
}
