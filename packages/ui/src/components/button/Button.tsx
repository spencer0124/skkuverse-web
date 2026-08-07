/**
 * Button — converted from skkuverse-app
 * `packages/sds/src/components/button/Button.tsx`.
 *
 * Props match the upstream API. The Reanimated press spring, dim overlay and
 * staggered loader pulse become a CSS transform transition, an opacity
 * transition, and a keyframe animation with per-dot delays.
 */
import React, {
  Children,
  forwardRef,
  Fragment,
  useCallback,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { SdsColors } from '@skkuverse/tokens';
import { ThemeProvider } from '../../core/ThemeProvider';
import { useTheme } from '../../core/ThemeProvider';
import { Txt } from '../txt';
import { mergeStyles, type Style } from '../../internal/style';
import { ensureKeyframes, TRANSITION } from '../../internal/keyframes';

// ── Types ──

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style' | 'type' | 'color' | 'onClick'> {
  children: ReactNode;
  onPress?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** @default 'primary' */
  type?: 'primary' | 'danger' | 'light' | 'dark';
  /** @default 'fill' */
  style?: 'fill' | 'weak';
  /** @default 'inline' */
  display?: 'block' | 'full' | 'inline';
  /** @default 'big' */
  size?: 'big' | 'large' | 'medium' | 'tiny';
  /** @default false */
  loading?: boolean;
  /** @default false */
  disabled?: boolean;
  viewStyle?: Style;
  color?: string;
  containerStyle?: Style;
  textStyle?: Style;
  leftAccessory?: ReactNode;
}

type ButtonSize = NonNullable<ButtonProps['size']>;
type ButtonDisplay = NonNullable<ButtonProps['display']>;

// ── Size → Typography mapping (from TDS) ──

const sizeToTypography = {
  tiny: 't7' as const,
  medium: 't6' as const,
  large: 'st9' as const,
  big: 'st9' as const,
};

// ── Type → primary color mapping ──

const typeToColor: Record<string, string> = {
  danger: SdsColors.red500,
  light: '#FFFFFFDE', // whiteOpacity900
  dark: SdsColors.grey700,
};

// ── Container styles per size (from TDS) ──

const containerBase: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  position: 'relative',
  boxSizing: 'border-box',
};

export const containerStylesBySize: Record<ButtonSize, CSSProperties> = {
  tiny: { paddingLeft: 10, paddingRight: 10, paddingTop: 2, paddingBottom: 2, minHeight: 32, minWidth: 52, borderRadius: 8 },
  medium: { paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, minHeight: 38, minWidth: 64, borderRadius: 10 },
  large: { paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2, minHeight: 48, minWidth: 80, borderRadius: 14 },
  big: { paddingLeft: 28, paddingRight: 28, paddingTop: 2, paddingBottom: 2, minHeight: 56, minWidth: 96, borderRadius: 16 },
};

const displayStyles: Record<ButtonDisplay, CSSProperties> = {
  inline: { alignSelf: 'flex-start' },
  block: {},
  full: { width: '100%' },
};

const containerDisplayStyles: Record<ButtonDisplay, CSSProperties> = {
  inline: {},
  block: {},
  full: { borderRadius: 0, width: '100%' },
};

const ABSOLUTE_FILL: CSSProperties = { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 };

// ── Inner Button (uses theme context) ──

const ButtonInner = forwardRef<HTMLButtonElement, ButtonProps>(function ButtonInner(
  {
    children,
    onPress,
    size = 'big',
    style: buttonStyle = 'fill',
    display = 'inline',
    disabled = false,
    loading = false,
    viewStyle,
    color: colorOverride,
    containerStyle,
    textStyle,
    leftAccessory,
    onPointerDown,
    onPointerUp,
    // Consumed by the public Button below, which maps it to a theme override.
    // Destructured here so it cannot reach the DOM, where `type` means
    // button/submit/reset.
    type: _variant,
    ...restProps
  },
  ref,
) {
  ensureKeyframes();
  const { token } = useTheme();
  const isInteractive = !(disabled || loading);
  const [pressed, setPressed] = useState(false);

  const colors = useMemo(() => {
    if (buttonStyle === 'weak') {
      return {
        bg: token.button.backgroundWeakColor,
        text: token.button.textWeakColor,
        dim: token.button.dimWeakColor,
        loader: token.button.loaderWeakColor,
      };
    }
    return {
      bg: token.button.backgroundFillColor,
      text: token.button.textFillColor,
      dim: token.button.dimFillColor,
      loader: token.button.loaderFillColor,
    };
  }, [buttonStyle, token.button]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      onPointerDown?.(e);
      if (isInteractive) setPressed(true);
    },
    [onPointerDown, isInteractive],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      onPointerUp?.(e);
      setPressed(false);
    },
    [onPointerUp],
  );

  // Upstream only scales the inline display, so the same condition applies here.
  const scale = display === 'inline' && pressed ? 0.96 : 1;
  const dimOpacity = pressed ? (buttonStyle === 'fill' ? 0.26 : 0.13) : 0;

  const renderedChildren = Children.map(children, (child, idx) =>
    typeof child === 'string' || typeof child === 'number' ? (
      <Txt
        typography={sizeToTypography[size]}
        color={colorOverride ?? colors.text}
        style={textStyle || undefined}
        fontWeight="semiBold"
      >
        {child}
      </Txt>
    ) : (
      <Fragment key={idx}>{child}</Fragment>
    ),
  );

  return (
    <button
      ref={ref}
      type="button"
      aria-disabled={disabled}
      disabled={disabled}
      onClick={isInteractive ? onPress : undefined}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={mergeStyles(
        { background: 'none', border: 'none', padding: 0, cursor: isInteractive ? 'pointer' : 'default' },
        displayStyles[display],
        viewStyle,
      )}
      {...restProps}
    >
      <span
        style={mergeStyles(
          containerBase,
          containerStylesBySize[size],
          containerDisplayStyles[display],
          {
            opacity: disabled ? (buttonStyle === 'fill' ? 0.26 : 1) : 1,
            transform: `scale(${scale})`,
            transition: `transform ${TRANSITION.rapid}`,
          },
          containerStyle,
        )}
      >
        {/* Background */}
        <span style={mergeStyles(ABSOLUTE_FILL, { backgroundColor: colors.bg })} />

        {/* Content */}
        <span
          style={mergeStyles(
            { display: 'flex', flexDirection: 'row', alignItems: 'center', position: 'relative' },
            { opacity: disabled && buttonStyle !== 'fill' ? 0.38 : 1 },
          )}
        >
          {leftAccessory}
          {renderedChildren}
        </span>

        {/* Loading dots */}
        {loading && (
          <span
            style={mergeStyles(ABSOLUTE_FILL, {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: colors.bg,
            })}
          >
            <span style={{ display: 'flex', flexDirection: 'row', gap: 7 }}>
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  style={{
                    width: 8,
                    height: 8,
                    backgroundColor: colors.loader,
                    borderRadius: 99,
                    animation: `sds-dot-pulse 800ms ${delay}ms ease-in-out infinite`,
                  }}
                />
              ))}
            </span>
          </span>
        )}

        {/* Dim overlay */}
        <span
          style={mergeStyles(ABSOLUTE_FILL, {
            backgroundColor: colors.dim,
            opacity: dimOpacity,
            transition: `opacity ${TRANSITION.quick}`,
            pointerEvents: 'none',
          })}
        />
      </span>
    </button>
  );
});

// ── Public Button (wraps with ThemeProvider for type variants) ──

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ type, ...props }, ref) {
    const tokenOverride = useMemo(() => {
      if (type === undefined || type === 'primary') return {};
      return { color: { primary: typeToColor[type] } };
    }, [type]);

    if (type === undefined || type === 'primary') {
      return <ButtonInner {...props} ref={ref} />;
    }

    return (
      <ThemeProvider token={tokenOverride}>
        <ButtonInner {...props} ref={ref} />
      </ThemeProvider>
    );
  },
);

export default Button;
