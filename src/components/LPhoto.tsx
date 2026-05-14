import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { Image, ImageStyle } from 'expo-image';
import { useTheme } from '@/lib/theme/ThemeProvider';

type Props = {
  uri?: string | null;
  blurhash?: string | null;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
};

export function LPhoto({ uri, blurhash, style, borderRadius = 0 }: Props) {
  const { palette } = useTheme();
  const flatStyle = StyleSheet.flatten(style);

  if (!uri) {
    return (
      <View
        style={[{ backgroundColor: palette.surfaceAlt, borderRadius }, style]}
      />
    );
  }

  const imageStyle: ImageStyle = {
    borderRadius,
    ...(flatStyle as ImageStyle),
  };

  return (
    <Image
      source={{ uri }}
      placeholder={blurhash ?? undefined}
      contentFit="cover"
      transition={180}
      style={imageStyle}
    />
  );
}
