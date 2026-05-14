import { Text, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { RADII } from '@/lib/theme/tokens';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  required?: boolean;
};

export function LFormField({ label, error, required, style, ...inputProps }: Props) {
  const { palette } = useTheme();

  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Text style={{ fontSize: 13, fontWeight: '500', color: palette.textMuted }}>
          {label}
          {required ? <Text style={{ color: palette.danger }}> *</Text> : null}
        </Text>
      ) : null}
      <TextInput
        {...inputProps}
        style={[
          {
            backgroundColor: palette.surfaceAlt,
            borderRadius: RADII.sm,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 15,
            color: palette.text,
            borderWidth: 1,
            borderColor: error ? palette.danger : palette.border,
          },
          style,
        ]}
        placeholderTextColor={palette.textFaint}
      />
      {error ? (
        <Text style={{ fontSize: 12, color: palette.danger }}>{error}</Text>
      ) : null}
    </View>
  );
}
