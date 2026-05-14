import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { ACCENTS, RADII } from '@/lib/theme/tokens';

type Option<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  options: [Option<T>, Option<T>];
  value: T;
  onChange: (v: T) => void;
};

export function LSegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  const { palette, accent } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: palette.chip,
        borderRadius: RADII.sm,
        padding: 2,
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="button"
            accessibilityLabel={opt.label}
            style={{
              flex: 1,
              paddingVertical: 6,
              alignItems: 'center',
              borderRadius: RADII.sm - 2,
              backgroundColor: active ? ACCENTS[accent].base : 'transparent',
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: active ? '600' : '400',
                color: active ? ACCENTS[accent].ink : palette.textMuted,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
