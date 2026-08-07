/**
 * TextButton — text-only button with arrow/underline/clear variants.
 *
 * Converted from skkuverse-app
 * `packages/sds/src/components/text-button/TextButton.tsx`.
 */
import React, { type MouseEvent, type ReactNode } from 'react';
import { useAdaptive } from '../../core/AdaptiveColorProvider';
import { Txt } from '../txt';
import type { TypographyKeys } from '../../foundation/typography';
import { mergeStyles, type Style } from '../../internal/style';

export interface TextButtonProps {
  children: ReactNode;
  /** Required — sets the text size */
  typography: TypographyKeys;
  /** @default 'clear' */
  variant?: 'arrow' | 'underline' | 'clear';
  /** @default 'regular' */
  fontWeight?: 'regular' | 'medium' | 'semiBold' | 'bold';
  /** @default adaptive.grey900 */
  color?: string;
  disabled?: boolean;
  onPress?: (event: MouseEvent<HTMLButtonElement>) => void;
  style?: Style;
}

export function TextButton({
  children,
  typography,
  variant = 'clear',
  fontWeight = 'regular',
  color,
  disabled = false,
  onPress,
  style,
}: TextButtonProps) {
  const adaptive = useAdaptive();
  const resolvedColor = color ?? adaptive.grey900;

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onPress}
      disabled={disabled}
      style={mergeStyles(
        {
          alignSelf: 'flex-start',
          // A button element brings its own chrome, which the React Native
          // original never had.
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: disabled ? 'default' : 'pointer',
          font: 'inherit',
        },
        style,
      )}
    >
      <Txt
        typography={typography}
        fontWeight={fontWeight}
        color={resolvedColor}
        style={mergeStyles(
          { opacity: disabled ? 0.38 : 1 },
          variant === 'underline' && { textDecorationLine: 'underline' },
        )}
      >
        {children}
        {variant === 'arrow' ? ' ›' : ''}
      </Txt>
    </button>
  );
}

export default TextButton;
