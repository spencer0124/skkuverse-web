/**
 * IconButton — icon-only button with fill/clear/border variants.
 *
 * Converted from skkuverse-app
 * `packages/sds/src/components/icon-button/IconButton.tsx`. The Reanimated
 * press spring becomes a CSS transform transition driven by pointer state.
 */
import React, { forwardRef, useCallback, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { useAdaptive } from '../../core/AdaptiveColorProvider';
import { mergeStyles, type Style } from '../../internal/style';
import { TRANSITION } from '../../internal/keyframes';

export interface IconButtonProps {
  icon: ReactNode;
  /** @default 24 */
  iconSize?: number;
  /** @default 'clear' */
  variant?: 'fill' | 'clear' | 'border';
  color?: string;
  /** @default adaptive.grey100 */
  bgColor?: string;
  disabled?: boolean;
  /** Accessibility label */
  label?: string;
  onPress?: (event: MouseEvent<HTMLButtonElement>) => void;
  style?: Style;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    icon,
    iconSize = 24,
    variant = 'clear',
    color,
    bgColor,
    disabled = false,
    label,
    onPress,
    style,
  },
  ref,
) {
  const adaptive = useAdaptive();
  const [pressed, setPressed] = useState(false);
  const containerSize = iconSize + iconSize * 0.5;
  const borderRadius = containerSize / 2;

  const press = useCallback(() => { if (!disabled) setPressed(true); }, [disabled]);
  const release = useCallback(() => setPressed(false), []);

  const variantStyle: CSSProperties =
    variant === 'fill'
      ? { backgroundColor: bgColor ?? adaptive.grey100 }
      : variant === 'border'
        ? { borderWidth: 1, borderStyle: 'solid', borderColor: bgColor ?? adaptive.grey200, backgroundColor: 'transparent' }
        : {}; // 'clear' — no background

  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={disabled ? undefined : onPress}
      onPointerDown={press}
      onPointerUp={release}
      onPointerLeave={release}
      style={mergeStyles(
        { background: 'none', border: 'none', padding: 0, cursor: disabled ? 'default' : 'pointer' },
        style,
      )}
    >
      <span
        style={mergeStyles(
          { display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' },
          { width: containerSize, height: containerSize, borderRadius, color },
          variantStyle,
          { opacity: disabled ? 0.38 : 1 },
          { transform: `scale(${pressed ? 0.9 : 1})`, transition: `transform ${TRANSITION.rapid}` },
        )}
      >
        {icon}
      </span>
    </button>
  );
});

export default IconButton;
