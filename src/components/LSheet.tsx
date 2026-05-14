import { useEffect } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { ANIM, RADII, SHADOWS } from '@/lib/theme/tokens';

const SCREEN_H = Dimensions.get('window').height;
const OPEN_CONFIG = { duration: 280, easing: Easing.bezier(0.2, 0.7, 0.3, 1) };
const CLOSE_CONFIG = { duration: 220, easing: Easing.bezier(0.4, 0, 1, 1) };

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Sheet content height in pixels (default: 320) */
  height?: number;
  /** Lift sheet above floating elements (e.g. tab bar). Sheet anchors at bottom: bottomOffset */
  bottomOffset?: number;
};

export function LSheet({ visible, onClose, children, height = 320, bottomOffset = 0 }: Props) {
  const { palette, mode } = useTheme();
  const insets = useSafeAreaInsets();
  // Extra space at bottom: whichever is larger — home indicator or tab-bar offset
  const extraBottom = Math.max(bottomOffset, insets.bottom);
  const hiddenY = height + extraBottom;
  const translateY = useSharedValue(hiddenY);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, OPEN_CONFIG);
      backdropOpacity.value = withTiming(1, { duration: ANIM.micro });
    } else {
      translateY.value = withTiming(hiddenY, CLOSE_CONFIG);
      backdropOpacity.value = withTiming(0, { duration: ANIM.micro });
    }
  }, [visible, hiddenY, translateY, backdropOpacity]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > height * 0.35) {
        translateY.value = withTiming(hiddenY, CLOSE_CONFIG);
        runOnJS(onClose)();
      } else {
        translateY.value = withTiming(0, OPEN_CONFIG);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!visible && translateY.value >= hiddenY) return null;

  const shadows = mode === 'day' ? SHADOWS.day.lg : SHADOWS.night.lg;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View
        style={[StyleSheet.absoluteFillObject, backdropStyle, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
      >
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            sheetStyle,
            {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: height + extraBottom,
              backgroundColor: palette.surface,
              borderTopLeftRadius: RADII.xl,
              borderTopRightRadius: RADII.xl,
              paddingBottom: extraBottom,
              ...shadows,
            },
          ]}
        >
          {/* Drag handle */}
          <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: palette.border,
              }}
            />
          </View>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
