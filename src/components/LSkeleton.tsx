import { StyleProp, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { RADII } from '@/lib/theme/tokens';

type Props = {
  width?: number | string;
  height?: number;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
};

export function LSkeleton({ width = '100%', height = 16, style, borderRadius = RADII.xs }: Props) {
  const { palette } = useTheme();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 700 }),
      -1,
      true,
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        animStyle,
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: palette.chip,
        },
        style,
      ]}
    />
  );
}

export function LSkeletonCard() {
  return (
    <View style={{ padding: 16, gap: 8 }}>
      <LSkeleton height={96} borderRadius={12} />
      <LSkeleton width="60%" height={18} />
      <LSkeleton width="40%" height={14} />
    </View>
  );
}
