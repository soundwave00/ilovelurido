import { Star } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { ACCENTS } from '@/lib/theme/tokens';

type Props = {
  value: number; // 0..5 (può essere frazionario in modalità readOnly)
  size?: number;
  /** Se fornito: modalità interattiva, chiamata con il nuovo valore intero 1..5. */
  onChange?: (value: number) => void;
  readOnly?: boolean;
};

/**
 * Rating a 5 stelle. Read-only accetta frazioni; interattivo lavora in interi.
 * (Brief: il modal review abilita "Pubblica" solo se stars > 0.)
 */
export function LStars({ value, size = 18, onChange, readOnly }: Props) {
  const { accent, palette } = useTheme();
  const fillColor = ACCENTS[accent].base;
  const emptyColor = palette.textFaint;

  const stars = [1, 2, 3, 4, 5];
  const interactive = !readOnly && !!onChange;

  return (
    <View className="flex-row items-center gap-[2px]">
      {stars.map((n) => {
        const filled = value >= n - 0.25;
        const content = (
          <Star
            size={size}
            color={filled ? fillColor : emptyColor}
            fill={filled ? fillColor : 'transparent'}
            strokeWidth={1.8}
          />
        );
        if (!interactive) return <View key={n}>{content}</View>;
        return (
          <Pressable
            key={n}
            accessibilityRole="button"
            accessibilityLabel={`${n} stelle`}
            onPress={() => onChange?.(n)}
            hitSlop={6}
            className="p-[2px]"
          >
            {content}
          </Pressable>
        );
      })}
    </View>
  );
}
