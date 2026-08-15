/**
 * Shapes the four ESKARA pages share.
 *
 * It sits under `pages/` rather than `components/` on purpose: `.conventions.json`
 * exempts `apps/webview/src/pages/**` from the English-everywhere rule, and the
 * archive notice below is product copy. Anything here that stops being
 * ESKARA-specific belongs in `components/page.tsx` instead, without its strings.
 */
import { type ReactNode } from 'react';
import { Paragraph, useAdaptive } from '@skkuverse/ui';
import { ARCHIVE_NOTICE, FESTIVAL } from './data/festival';
import type { FestivalImage } from './data/images';

/**
 * Says out loud that these times are last year's, and renders nothing once
 * `FESTIVAL.archived` is flipped. A page that quietly shows a stale schedule is
 * worse than one that shows none.
 */
export function ArchiveNotice() {
  const adaptive = useAdaptive();
  if (!FESTIVAL.archived) return null;
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
        {ARCHIVE_NOTICE}
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
 * `width`/`height` attributes carry the intrinsic size so the browser reserves
 * the box from the aspect ratio before the file decodes. Without them an unloaded
 * `<img>` is zero-height and everything below it jumps when the bytes land —
 * measured at ~593 px on the entry page. `loading="lazy"` makes that worse, not
 * better, because the jump then happens mid-scroll.
 *
 * `maxWidth: 100%` rather than `width: 100%`: these sources run 472 px to 1050 px
 * wide, and forcing every one to fill its container upscales the small ones into
 * blur on any viewport wider than they are. Capping lets each render at natural
 * size until the viewport is narrower — which is the phone, i.e. the normal case.
 */
export function Figure({ image, caption }: { image: FestivalImage; caption?: string }) {
  const adaptive = useAdaptive();
  return (
    <figure style={{ margin: 0 }}>
      <img
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
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
export function PageHeading({ title, lead }: { title: string; lead?: string }) {
  const adaptive = useAdaptive();
  return (
    <div style={{ padding: '24px 20px 4px' }}>
      <Paragraph typography="t7" fontWeight="semibold" color={adaptive.grey500}>
        {`${FESTIVAL.year} ${FESTIVAL.name}`}
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
