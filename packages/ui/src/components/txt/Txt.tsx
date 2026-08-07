/**
 * Txt — core typography component.
 *
 * Converted from skkuverse-app `packages/sds/src/components/txt/Txt.tsx`.
 * `Text` becomes `span`, and `numberOfLines` becomes a CSS line clamp.
 *
 * Usage:
 *   <Txt typography="t3" fontWeight="bold" color={colors.grey900}>Title</Txt>
 */
import React, { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { useAdaptive } from '../../core/AdaptiveColorProvider';
import { useTypographyTheme } from '../../core/TypographyProvider';
import {
  FONT_FAMILY,
  fontFamilyByWeight,
  fontWeightMap,
  type FontWeightKeys,
  type TypographyKeys,
} from '../../foundation/typography';
import { lineClamp, mergeStyles } from '../../internal/style';

export interface TxtStyleProps {
  /** @default 't5' */
  typography?: TypographyKeys;
  /** @default 'regular' */
  fontWeight?: FontWeightKeys;
  /** @default adaptive.grey900 */
  color?: string;
  numberOfLines?: number;
  textAlign?: CSSProperties['textAlign'];
}

export type TxtProps = TxtStyleProps &
  Omit<HTMLAttributes<HTMLSpanElement>, 'color'> & {
    children: ReactNode;
  };

export function toFontWeightStyle(fontWeightKey: FontWeightKeys): CSSProperties {
  return {
    fontWeight: fontWeightMap[fontWeightKey],
    fontFamily: fontFamilyByWeight[fontWeightKey],
  };
}

const Txt = forwardRef<HTMLSpanElement, TxtProps>(function Txt(
  {
    typography = 't5',
    fontWeight = 'regular',
    color,
    numberOfLines,
    textAlign,
    style,
    children,
    ...restProps
  },
  ref,
) {
  const adaptive = useAdaptive();
  const { typography: typographyTheme } = useTypographyTheme();

  const resolvedColor = color ?? adaptive.grey900;
  const typo = typographyTheme[typography];

  return (
    <span
      ref={ref}
      style={mergeStyles(
        { fontFamily: FONT_FAMILY, display: 'inline-block' },
        // lineHeight is one of the properties React leaves unitless, where a
        // bare 25.5 would mean 25.5x the font size. The token is absolute px.
        { fontSize: typo.fontSize, lineHeight: `${typo.lineHeight}px` },
        { color: resolvedColor, textAlign },
        toFontWeightStyle(fontWeight),
        lineClamp(numberOfLines),
        style,
      )}
      {...restProps}
    >
      {children}
    </span>
  );
});

export default Txt;
export { Txt };
