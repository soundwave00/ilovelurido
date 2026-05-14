import { Text, View } from 'react-native';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { ACCENTS } from '@/lib/theme/tokens';
import { cn } from '@/lib/utils/cn';

type LuridoOpenStatus = 'open' | 'closed' | 'pending' | 'reported';

type Props = {
  status: LuridoOpenStatus;
  /** Orario apertura/chiusura mostrato come suffisso (es. "aperto fino alle 04:30"). */
  until?: string;
};

const LABELS: Record<LuridoOpenStatus, string> = {
  open: 'aperto',
  closed: 'chiuso',
  pending: 'in verifica',
  reported: 'segnalato',
};

export function LStatusBadge({ status, until }: Props) {
  const { palette } = useTheme();
  const dotColor = (() => {
    switch (status) {
      case 'open':
        return palette.success;
      case 'closed':
        return palette.textFaint;
      case 'pending':
        return ACCENTS.brace.base;
      case 'reported':
        return palette.danger;
    }
  })();

  return (
    <View className="flex-row items-center gap-[6px] px-2 py-1 rounded-full bg-l-surface-alt">
      <View
        className="w-[7px] h-[7px] rounded-full"
        style={{ backgroundColor: dotColor }}
      />
      <Text
        className={cn(
          'font-body-medium text-[12px] text-l-text',
          status === 'closed' && 'text-l-text-muted',
        )}
      >
        {LABELS[status]}
        {status === 'open' && until ? ` fino alle ${until}` : null}
      </Text>
    </View>
  );
}
