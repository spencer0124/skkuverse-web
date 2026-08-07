/**
 * Badge — small label component.
 *
 * Converted from skkuverse-app `packages/sds/src/components/badge/Badge.tsx`.
 *
 * Usage:
 *   <Badge size="small" color={colors.blue500} backgroundColor={colors.blue50}>New</Badge>
 */
import React from 'react';
import { useAdaptive } from '../../core/AdaptiveColorProvider';
import { Txt } from '../txt';
import type { FontWeightKeys, TypographyKeys } from '../../foundation/typography';
import { mergeStyles, type Style } from '../../internal/style';

export interface BadgeProps {
  children: string;
  /** @default 'small' */
  size?: 'large' | 'medium' | 'small' | 'tiny';
  color?: string;
  backgroundColor?: string;
  fontWeight?: FontWeightKeys;
  numberOfLines?: number;
  style?: Style;
}

type BadgeSize = NonNullable<BadgeProps['size']>;

const sizeVariant: Record<BadgeSize, TypographyKeys> = {
  tiny: 't7',
  small: 't7',
  medium: 't6',
  large: 't5',
};

const sizePadding: Record<BadgeSize, { paddingLeft: number; paddingRight: number; paddingTop: number; paddingBottom: number }> = {
  tiny: { paddingLeft: 4, paddingRight: 4, paddingTop: 1, paddingBottom: 1 },
  small: { paddingLeft: 6, paddingRight: 6, paddingTop: 2, paddingBottom: 2 },
  medium: { paddingLeft: 8, paddingRight: 8, paddingTop: 3, paddingBottom: 3 },
  large: { paddingLeft: 10, paddingRight: 10, paddingTop: 4, paddingBottom: 4 },
};

const sizeBorderRadius: Record<BadgeSize, number> = {
  tiny: 4,
  small: 6,
  medium: 8,
  large: 10,
};

export default function Badge({
  children,
  size = 'small',
  color,
  backgroundColor,
  fontWeight: fontWeightProp,
  numberOfLines,
  style,
}: BadgeProps) {
  const adaptive = useAdaptive();
  const resolvedFontWeight = fontWeightProp ?? (size === 'tiny' ? 'semiBold' : 'bold');

  return (
    <div
      style={mergeStyles(
        { alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
        sizePadding[size],
        {
          borderRadius: sizeBorderRadius[size],
          backgroundColor: backgroundColor ?? adaptive.grey100,
        },
        style,
      )}
    >
      <Txt
        typography={sizeVariant[size]}
        fontWeight={resolvedFontWeight}
        color={color ?? adaptive.grey600}
        numberOfLines={numberOfLines}
      >
        {children}
      </Txt>
    </div>
  );
}

export { Badge };
