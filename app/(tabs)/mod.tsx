import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LPhoto } from '@/components/LPhoto';
import { LAvatar } from '@/components/LAvatar';
import { LSheet } from '@/components/LSheet';
import { LEmptyState } from '@/components/LEmptyState';
import { LSkeleton } from '@/components/LSkeleton';
import { useModQueue, useModStats } from '@/hooks/useModQueue';
import { useUserMini } from '@/hooks/useUserMini';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { formatRelativeTime } from '@/lib/utils/format';
import type { Lurido } from '@/types/domain';

export default function ModScreen() {
  const { palette } = useTheme();
  const { profile } = useAuthStore();

  // Gating runtime — se non è mod/admin manda alla home
  useEffect(() => {
    const role = profile?.role;
    if (role && role !== 'moderator' && role !== 'admin') {
      router.replace('/(tabs)');
    }
  }, [profile?.role]);

  const { queue, approveMutation, rejectMutation } = useModQueue();
  const { data: stats } = useModStats();

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = (id: string) => {
    Alert.alert('Conferma', 'Approvare questo lurido?', [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Approva',
        onPress: () => approveMutation.mutate(id, {
          onError: () => Alert.alert('Errore', 'Impossibile approvare.'),
        }),
      },
    ]);
  };

  const handleConfirmReject = () => {
    if (!rejectingId || rejectReason.trim().length < 4) return;
    rejectMutation.mutate(
      { id: rejectingId, reason: rejectReason.trim() },
      {
        onSuccess: () => { setRejectingId(null); setRejectReason(''); },
        onError: () => Alert.alert('Errore', 'Impossibile rifiutare.'),
      },
    );
  };

  const items = queue.data ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }} edges={['top']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: palette.text }}>Moderazione</Text>
      </View>

      {/* Stats row */}
      {stats && (
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 8 }}>
          {[
            { label: 'In attesa', value: stats.pendingCount },
            { label: 'Approvati', value: stats.totalApproved },
            { label: 'Oggi', value: stats.approvedToday },
          ].map((s) => (
            <View key={s.label} style={{ flex: 1, backgroundColor: palette.surface, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: palette.border }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: palette.text }}>{s.value}</Text>
              <Text style={{ fontSize: 11, color: palette.textMuted }}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Queue */}
      {queue.isLoading ? (
        <View style={{ padding: 16, gap: 12 }}>
          {[1, 2].map((i) => <LSkeleton key={i} height={200} borderRadius={14} />)}
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <LEmptyState title="Coda vuota" subtitle="Gran lavoro. Prenditi un caffè." />
          }
          renderItem={({ item }) => (
            <ModCard
              lurido={item}
              onApprove={() => handleApprove(item.id)}
              onReject={() => { setRejectingId(item.id); setRejectReason(''); }}
            />
          )}
        />
      )}

      {/* Reject sheet */}
      <LSheet visible={!!rejectingId} onClose={() => setRejectingId(null)} height={300}>
        <View style={{ paddingHorizontal: 16, gap: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: palette.text }}>Motivo rifiuto</Text>
          <TextInput
            value={rejectReason}
            onChangeText={setRejectReason}
            placeholder="Spiega brevemente il motivo (min. 4 caratteri)"
            placeholderTextColor={palette.textFaint}
            multiline
            numberOfLines={4}
            style={{ backgroundColor: palette.surfaceAlt, borderRadius: 10, padding: 12, fontSize: 15, color: palette.text, minHeight: 100, textAlignVertical: 'top' }}
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable
              onPress={() => setRejectingId(null)}
              style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10, backgroundColor: palette.surfaceAlt }}
            >
              <Text style={{ color: palette.textMuted, fontWeight: '600' }}>Annulla</Text>
            </Pressable>
            <Pressable
              onPress={handleConfirmReject}
              disabled={rejectReason.trim().length < 4 || rejectMutation.isPending}
              style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10, backgroundColor: palette.danger, opacity: rejectReason.trim().length < 4 ? 0.5 : 1 }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>
                {rejectMutation.isPending ? '…' : 'Rifiuta'}
              </Text>
            </Pressable>
          </View>
        </View>
      </LSheet>
    </SafeAreaView>
  );
}

function ModCard({
  lurido,
  onApprove,
  onReject,
}: {
  lurido: Lurido;
  onApprove: () => void;
  onReject: () => void;
}) {
  const { palette } = useTheme();
  const { data: author } = useUserMini(lurido.addedBy ?? undefined);

  return (
    <View style={{ backgroundColor: palette.surface, borderRadius: 14, borderWidth: 1, borderColor: palette.border, overflow: 'hidden' }}>
      {/* Photo strip */}
      <LPhoto uri={undefined} style={{ width: '100%', height: 140 }} borderRadius={0} />

      <View style={{ padding: 12, gap: 8 }}>
        <Text style={{ fontSize: 17, fontWeight: '700', color: palette.text }}>{lurido.name}</Text>

        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {lurido.neighborhood && (
            <Text style={{ fontSize: 13, color: palette.textMuted }}>{lurido.neighborhood}</Text>
          )}
          {lurido.address && (
            <Text style={{ fontSize: 13, color: palette.textMuted }}>· {lurido.address}</Text>
          )}
          <Text style={{ fontSize: 13, color: palette.textMuted }}>· {formatRelativeTime(lurido.createdAt)}</Text>
        </View>

        {lurido.description ? (
          <Text style={{ fontSize: 13, color: palette.text, lineHeight: 18 }} numberOfLines={3}>
            {lurido.description}
          </Text>
        ) : null}

        {author && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <LAvatar uri={author.avatarUrl} username={author.username} size={24} />
            <Text style={{ fontSize: 13, color: palette.textMuted }}>@{author.username}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
          <Pressable
            onPress={onReject}
            accessibilityLabel="Rifiuta"
            style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, backgroundColor: palette.surfaceAlt }}
          >
            <Text style={{ color: palette.danger, fontWeight: '600', fontSize: 14 }}>Rifiuta</Text>
          </Pressable>
          <Pressable
            onPress={onApprove}
            accessibilityLabel="Approva"
            style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, backgroundColor: palette.text }}
          >
            <Text style={{ color: palette.bg, fontWeight: '600', fontSize: 14 }}>Approva</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
