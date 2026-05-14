import { Pressable, Text, type PressableProps } from 'react-native';
import { cn } from '@/lib/utils/cn';

type Props = Omit<PressableProps, 'children'> & {
  label: string;
  /** Indica stato attivo (background accent, testo ink). */
  active?: boolean;
  /** Se true, stile monospace (es. tag `#latenight`). */
  mono?: boolean;
};

/** Chip pill usato nelle filter strip e come tag. */
export function LChip({ label, active, mono, disabled, style, ...rest }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!active, disabled: !!disabled }}
      disabled={disabled}
      style={style}
      className={cn(
        'h-9 px-3 flex-row items-center justify-center rounded-full border',
        active ? 'bg-l-accent border-l-accent' : 'bg-l-chip border-l-border',
        disabled && 'opacity-50',
      )}
      {...rest}
    >
      <Text
        className={cn(
          mono ? 'font-mono text-[13px]' : 'font-body-medium text-[13px]',
          active ? 'text-l-accent-ink' : 'text-l-text',
        )}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}
