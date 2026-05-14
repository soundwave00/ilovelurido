import { BlurView } from 'expo-blur';
import { Bell, Map, Plus, Shield, User, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View, Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { ACCENTS } from '@/lib/theme/tokens';

const ICONS: Record<string, LucideIcon> = {
  index: Map,
  add: Plus,
  notifications: Bell,
  profile: User,
  mod: Shield,
};

const LABELS: Record<string, string> = {
  index: 'Mappa',
  add: '',
  notifications: 'Notifiche',
  profile: 'Profilo',
  mod: 'Mod',
};

export function LFloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { palette, accent, mode } = useTheme();
  const insets = useSafeAreaInsets();
  const accentColors = ACCENTS[accent];

  const blurTint = mode === 'night' ? 'dark' : 'light';
  const overlayBg =
    mode === 'night' ? 'rgba(28,22,19,0.82)' : 'rgba(255,255,255,0.86)';

  return (
    <View
      style={[
        styles.container,
        {
          bottom: Math.max(insets.bottom, 12),
          borderColor: palette.border,
          shadowColor: '#000',
        },
      ]}
      pointerEvents="box-none"
    >
      <BlurView
        intensity={Platform.OS === 'ios' ? 40 : 60}
        tint={blurTint}
        style={[StyleSheet.absoluteFill, styles.blur]}
      />
      <View style={[styles.bar, { backgroundColor: overlayBg }]}>
        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          if (!descriptor) return null;
          const { options } = descriptor;
          if ((options as { href?: unknown }).href === null) return null;

          const isFocused = state.index === index;
          const Icon = ICONS[route.name] ?? Map;
          const label = LABELS[route.name] ?? route.name;
          const isFab = route.name === 'add';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name as never);
            }
          };

          if (isFab) {
            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel="Aggiungi un lurido"
                style={styles.fabWrap}
              >
                <View
                  style={[
                    styles.fab,
                    {
                      backgroundColor: accentColors.base,
                      shadowColor: accentColors.base,
                    },
                  ]}
                >
                  <Plus size={24} color={accentColors.ink} strokeWidth={2.4} />
                </View>
              </Pressable>
            );
          }

          const tint = isFocused ? accentColors.ink : palette.textMuted;
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={isFocused ? { selected: true } : undefined}
              style={[
                styles.tab,
                isFocused && { backgroundColor: accentColors.base },
              ]}
            >
              <Icon size={20} color={tint} strokeWidth={isFocused ? 2.2 : 1.8} />
              <Text
                style={[
                  styles.label,
                  { color: tint, fontWeight: isFocused ? '700' : '600' },
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  blur: {
    borderRadius: 28,
  },
  bar: {
    flexDirection: 'row',
    paddingHorizontal: 6,
    paddingVertical: 6,
    gap: 2,
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    fontSize: 10,
  },
  fabWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
