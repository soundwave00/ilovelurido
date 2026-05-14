import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { ACCENTS, RADII } from '@/lib/theme/tokens';
import type { Dish } from '@/types/domain';

type Props = {
  dish: Dish;
  onVote: (dish: Dish) => void;
  disabled?: boolean;
};

export function LDishRow({ dish, onVote, disabled }: Props) {
  const { palette, accent } = useTheme();
  const voted = dish.viewerVoted ?? false;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 2,
        borderBottomWidth: 1,
        borderBottomColor: palette.border,
      }}
    >
      <Text
        style={{ flex: 1, fontSize: 15, color: palette.text, fontWeight: '500' }}
        numberOfLines={1}
      >
        {dish.name}
      </Text>
      <Pressable
        onPress={() => onVote(dish)}
        disabled={disabled}
        accessibilityLabel={voted ? 'Rimuovi voto' : 'Vota piatto'}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: RADII.pill,
          backgroundColor: voted ? ACCENTS[accent].base : palette.chip,
        }}
      >
        <Text style={{ fontSize: 13 }}>👍</Text>
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: voted ? ACCENTS[accent].ink : palette.textMuted,
          }}
        >
          {dish.votesCount ?? 0}
        </Text>
      </Pressable>
    </View>
  );
}
