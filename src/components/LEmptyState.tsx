import { Text, View } from 'react-native';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { LButton } from './LButton';

type Props = {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onCta?: () => void;
};

export function LEmptyState({ title, subtitle, ctaLabel, onCta }: Props) {
  const { palette } = useTheme();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 }}>
      <Text style={{ fontSize: 16, fontWeight: '600', color: palette.text, textAlign: 'center' }}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={{ fontSize: 14, color: palette.textMuted, textAlign: 'center', lineHeight: 20 }}>
          {subtitle}
        </Text>
      ) : null}
      {ctaLabel && onCta ? (
        <LButton variant="primary" size="md" label={ctaLabel} onPress={onCta} />
      ) : null}
    </View>
  );
}
