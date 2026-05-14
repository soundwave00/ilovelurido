import { Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { ACCENTS } from '@/lib/theme/tokens';
import { cn } from '@/lib/utils/cn';

export type LPinVariant = 'pill' | 'glow' | 'baracchino' | 'minimal';
export type LPinStatus = 'open' | 'closed' | 'pending';

type Props = {
  variant?: LPinVariant;
  status?: LPinStatus;
  /** Se true, scala 1.25 (al tap sul marker). */
  selected?: boolean;
};

/**
 * Pin per marker mappa. 4 varianti dal brief (default `pill`).
 * NB: renderizzato DENTRO `<Marker>` di react-native-maps, non su Map direct.
 */
export function LPin({ variant = 'pill', status = 'open', selected }: Props) {
  const { accent, palette } = useTheme();
  const base = status === 'open' ? ACCENTS[accent].base : palette.textMuted;
  const glow = ACCENTS[accent].glow;
  const ink = ACCENTS[accent].ink;

  const scaleClass = selected ? 'scale-125' : 'scale-100';

  if (variant === 'glow') {
    return (
      <View className={cn('items-center justify-center', scaleClass)}>
        <View
          className="absolute w-14 h-14 rounded-full opacity-50"
          style={{ backgroundColor: glow }}
        />
        <View
          className="w-8 h-8 rounded-full items-center justify-center"
          style={{ backgroundColor: base }}
        >
          <Text>🥪</Text>
        </View>
      </View>
    );
  }

  if (variant === 'minimal') {
    return (
      <View className={cn('items-center justify-center', scaleClass)}>
        <View
          className="w-3 h-3 rounded-full border-2"
          style={{ backgroundColor: base, borderColor: palette.surface, shadowColor: glow, shadowOpacity: 0.8, shadowRadius: 6 }}
        />
      </View>
    );
  }

  if (variant === 'baracchino') {
    return (
      <View className={cn('items-center', scaleClass)}>
        <Svg width={36} height={44} viewBox="0 0 40 48">
          {/* corpo casetta */}
          <Path
            d="M20 4 L36 16 L36 40 L4 40 L4 16 Z"
            fill={base}
            stroke={ink}
            strokeWidth={1.5}
          />
          {/* linea cornicione */}
          <Path d="M4 16 L36 16" stroke={ink} strokeWidth={1} opacity={0.4} />
          {/* palo */}
          <Path d="M20 40 L20 48" stroke={base} strokeWidth={3} />
        </Svg>
      </View>
    );
  }

  // Default: pill/teardrop
  return (
    <View className={cn('items-center', scaleClass)}>
      <View
        className="px-[10px] h-8 rounded-full flex-row items-center"
        style={{ backgroundColor: base }}
      >
        <View
          className="w-2 h-2 rounded-full mr-[6px]"
          style={{ backgroundColor: ink }}
        />
        <Text style={{ color: ink, fontSize: 12, fontWeight: '600' }}>lurido</Text>
      </View>
      <View
        className="w-2 h-2 rotate-45 -mt-[4px]"
        style={{ backgroundColor: base }}
      />
    </View>
  );
}
