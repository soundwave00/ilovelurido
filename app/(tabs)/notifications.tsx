import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LEmptyState } from '@/components/LEmptyState';
import { LSkeleton } from '@/components/LSkeleton';
import { useNotifications, useMarkAllRead, useMarkRead } from '@/hooks/useNotifications';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { formatRelativeTime } from '@/lib/utils/format';
import { ACCENTS } from '@/lib/theme/tokens';
import type { Notification } from '@/types/domain';

const NOTIF_ICONS: Record<Notification['type'], string> = {
  approved: '✅',
  rejected: '❌',
  nearby: '📍',
  reply: '💬',
  badge: '🏆',
  nottambulo: '🌙',
};

export default function NotificationsScreen() {
  const { palette } = useTheme();
  const { profile } = useAuthStore();
  const userId = profile?.id ?? '';

  const { data: notifications = [], isLoading } = useNotifications(userId || undefined);
  const { mutate: markAllRead } = useMarkAllRead(userId);
  const { mutate: markRead } = useMarkRead(userId);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const handlePress = (notif: Notification) => {
    if (!notif.readAt) {
      markRead(notif.id);
    }
    if (notif.luridoId) {
      router.push(`/lurido/${notif.luridoId}`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }} edges={['top']}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <Text style={{ flex: 1, fontSize: 22, fontWeight: '700', color: palette.text }}>Notifiche</Text>
        {unreadCount > 0 && (
          <Pressable onPress={() => markAllRead()} accessibilityLabel="Segna tutte come lette">
            <Text style={{ fontSize: 13, color: palette.textMuted }}>Segna lette ({unreadCount})</Text>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <View style={{ padding: 16, gap: 10 }}>
          {[1, 2, 3].map((i) => <LSkeleton key={i} height={68} borderRadius={12} />)}
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 2 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <LEmptyState title="Tutto tranquillo" subtitle="Nessuna notifica per ora." />
          }
          renderItem={({ item }) => (
            <NotifRow notif={item} onPress={() => handlePress(item)} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function NotifRow({ notif, onPress }: { notif: Notification; onPress: () => void }) {
  const { palette, accent } = useTheme();
  const unread = !notif.readAt;

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={notif.title}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: unread ? palette.surface : 'transparent',
        borderWidth: unread ? 1 : 0,
        borderColor: unread ? palette.border : 'transparent',
        marginBottom: 2,
      }}
    >
      {unread && (
        <View style={{ position: 'absolute', left: 4, top: '50%', width: 6, height: 6, borderRadius: 3, backgroundColor: ACCENTS[accent].base }} />
      )}
      <Text style={{ fontSize: 24, lineHeight: 32 }}>{NOTIF_ICONS[notif.type]}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: unread ? '700' : '500', color: palette.text }} numberOfLines={1}>
          {notif.title}
        </Text>
        {notif.body ? (
          <Text style={{ fontSize: 13, color: palette.textMuted, marginTop: 2 }} numberOfLines={2}>
            {notif.body}
          </Text>
        ) : null}
      </View>
      <Text style={{ fontSize: 12, color: palette.textFaint }}>{formatRelativeTime(notif.createdAt)}</Text>
    </Pressable>
  );
}
