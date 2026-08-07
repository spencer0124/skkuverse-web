/**
 * BottomCTA — bottom-fixed call-to-action container.
 *
 * Converted from skkuverse-app
 * `packages/sds/src/components/bottom-cta/BottomCTA.tsx`.
 *
 * Upstream reads the inset through `useSafeAreaInsets()` and takes
 * `Math.max(insets.bottom, 16)`. The browser exposes the same value as the
 * `env(safe-area-inset-bottom)` CSS variable, and `max()` does the clamp
 * without a render pass — so no hook, and it stays correct if the inset
 * changes on rotation.
 *
 * Needs `viewport-fit=cover` on the viewport meta tag, or `env()` resolves to
 * zero. The web view's index.html already sets it.
 *
 * Usage:
 *   <BottomCTA>
 *     <Button display="block">Continue</Button>
 *   </BottomCTA>
 */
import React, { type ReactNode } from 'react';
import { SdsColors } from '@skkuverse/tokens';
import { mergeStyles, toBoxShadow, type Style } from '../../internal/style';

export interface BottomCTAProps {
  children: ReactNode;
  style?: Style;
}

export default function BottomCTA({ children, style }: BottomCTAProps) {
  return (
    <div
      style={mergeStyles(
        {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          boxSizing: 'border-box',
          backgroundColor: SdsColors.background,
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: 12,
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
          boxShadow: toBoxShadow('#000000', 0, -2, 6, 0.06),
        },
        style,
      )}
    >
      {children}
    </div>
  );
}

export { BottomCTA };
