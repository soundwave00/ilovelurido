import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';
import { cn } from '@/lib/utils/cn';

export type LButtonVariant = 'primary' | 'ghost' | 'subtle' | 'danger';
export type LButtonSize = 'md' | 'lg';

type Props = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: LButtonVariant;
  size?: LButtonSize;
  loading?: boolean;
  /** Optional icon rendered to the left of the label. */
  leftIcon?: React.ReactNode;
};

const VARIANT_STYLES: Record<LButtonVariant, { wrap: string; text: string }> = {
  primary: {
    wrap: 'bg-l-accent',
    text: 'text-l-accent-ink',
  },
  ghost: {
    wrap: 'bg-transparent border border-l-border-strong',
    text: 'text-l-text',
  },
  subtle: {
    wrap: 'bg-l-surface-alt',
    text: 'text-l-text',
  },
  danger: {
    wrap: 'bg-l-danger',
    text: 'text-white',
  },
};

const SIZE_STYLES: Record<LButtonSize, { wrap: string; text: string }> = {
  md: { wrap: 'h-11 px-4 rounded-l-md', text: 'text-[15px]' },
  lg: { wrap: 'h-14 px-5 rounded-l-lg', text: 'text-[17px]' },
};

export function LButton({
  label,
  variant = 'primary',
  size = 'lg',
  loading,
  leftIcon,
  disabled,
  style,
  accessibilityLabel,
  ...rest
}: Props) {
  const v = VARIANT_STYLES[variant];
  const s = SIZE_STYLES[size];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      style={style}
      className={cn(
        'flex-row items-center justify-center gap-2',
        v.wrap,
        s.wrap,
        isDisabled && 'opacity-50',
        // Press feedback handled via `style` callable below if needed.
      )}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <>
          {leftIcon}
          <Text
            className={cn('font-body-semibold', v.text, s.text)}
            numberOfLines={1}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
