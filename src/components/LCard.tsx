import { Pressable, View, type ViewProps } from 'react-native';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { SHADOWS } from '@/lib/theme/tokens';
import { cn } from '@/lib/utils/cn';

type Props = ViewProps & {
  onPress?: () => void;
  /** Padding interno (default screenPadding). */
  padded?: boolean;
  /** Shadow preset (default sm). */
  elevation?: 'none' | 'sm' | 'md' | 'lg';
};

/** Container card con surface background + optional shadow + press feedback. */
export function LCard({
  onPress,
  padded = true,
  elevation = 'sm',
  className,
  style,
  children,
  ...rest
}: Props) {
  const { mode } = useTheme();
  const shadowStyle = elevation === 'none' ? null : SHADOWS[mode][elevation];

  const content = (
    <View
      className={cn(
        'bg-l-surface border border-l-border rounded-l-md',
        padded && 'p-4',
        className,
      )}
      style={[shadowStyle, style]}
      {...rest}
    >
      {children}
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {content}
    </Pressable>
  );
}
