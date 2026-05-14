import { Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { ACCENTS } from '@/lib/theme/tokens';

type Props = {
  uri?: string | null;
  username?: string | null;
  size?: number;
};

export function LAvatar({ uri, username, size = 40 }: Props) {
  const { palette, accent } = useTheme();
  const initial = username ? username[0]?.toUpperCase() ?? '?' : '?';
  const accentColor = ACCENTS[accent].base;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="cover"
        transition={180}
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: accentColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          color: ACCENTS[accent].ink,
          fontSize: size * 0.42,
          fontWeight: '700',
        }}
      >
        {initial}
      </Text>
    </View>
  );
}
