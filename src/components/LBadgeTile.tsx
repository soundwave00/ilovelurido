import { Text, View } from 'react-native';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { RADII } from '@/lib/theme/tokens';
import type { Badge } from '@/types/domain';

type Props = {
  badge: Badge;
  unlocked: boolean;
};

export function LBadgeTile({ badge, unlocked }: Props) {
  const { palette } = useTheme();

  return (
    <View
      style={{
        padding: 12,
        borderRadius: RADII.md,
        backgroundColor: palette.surface,
        alignItems: 'center',
        gap: 6,
        opacity: unlocked ? 1 : 0.35,
        borderWidth: 1,
        borderColor: palette.border,
      }}
    >
      <Text style={{ fontSize: 28 }}>{badge.emoji}</Text>
      <Text
        style={{
          fontSize: 11,
          fontWeight: '600',
          color: palette.text,
          textAlign: 'center',
        }}
        numberOfLines={2}
      >
        {badge.name}
      </Text>
      <Text
        style={{
          fontSize: 10,
          color: palette.textFaint,
          textAlign: 'center',
        }}
        numberOfLines={2}
      >
        {badge.description}
      </Text>
    </View>
  );
}
