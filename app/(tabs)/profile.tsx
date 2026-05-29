import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import * as ImagePicker from 'expo-image-picker';
import { Settings, Edit2 } from 'lucide-react-native';
import { LAvatar } from '@/components/LAvatar';
import { LButton } from '@/components/LButton';
import { LSheet } from '@/components/LSheet';
import { LBadgeTile } from '@/components/LBadgeTile';
import { LEmptyState } from '@/components/LEmptyState';
import { LSkeleton } from '@/components/LSkeleton';
import { useUserStats } from '@/hooks/useUserStats';
import { useBadges, useUserBadges } from '@/hooks/useBadges';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { ACCENTS } from '@/lib/theme/tokens';
import { uploadImage } from '@/lib/utils/imageUpload';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const { palette, accent, mode, toggleMode, setAccent } = useTheme();
  const { profile, signOut, patchProfile } = useAuthStore();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const sheetBottomOffset = tabBarHeight + Math.max(insets.bottom, 12);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const userId = profile?.id;
  const { data: stats, isLoading: statsLoading } = useUserStats(userId);
  const { data: allBadges = [], isLoading: badgesLoading } = useBadges();
  const { data: userBadges = [] } = useUserBadges(userId);

  const unlockedIds = new Set(userBadges.map((b) => b.badgeId));

  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const nextLevelXp = level * 100;
  const xpProgress = Math.min(xp % 100, 100);

  const pickAndUploadAvatar = async () => {
    console.log('[avatar] start');
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log('[avatar] permission status:', status);
    if (status !== 'granted') {
      Alert.alert('Permesso negato', 'Consenti accesso alla libreria foto nelle impostazioni.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
      allowsEditing: true,
      aspect: [1, 1],
    });
    console.log('[avatar] picker result canceled:', result.canceled, 'assets:', result.assets?.length);
    if (result.canceled || !userId) return;
    const asset = result.assets[0];
    console.log('[avatar] asset uri:', asset?.uri);
    if (!asset) return;

    setUploadingAvatar(true);
    try {
      console.log('[avatar] uploading...');
      const url = await uploadImage(asset.uri, 'avatars', `${userId}/avatar.jpg`);
      console.log('[avatar] uploaded url:', url);
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('id', userId);
      console.log('[avatar] db update error:', error);
      if (error) throw error;
      patchProfile({ avatarUrl: url });
      console.log('[avatar] done');
    } catch (e) {
      console.error('[avatar] error:', e);
      Alert.alert('Errore', String(e instanceof Error ? e.message : e));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const STAT_ITEMS = [
    { label: 'Recensioni', value: stats?.reviewCount },
    { label: 'Luridi', value: stats?.luridoCount },
    { label: 'Salvati', value: stats?.savedCount },
    { label: 'Upvote', value: stats?.upvotesReceived },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 8,
          }}
        >
          <Text style={{ flex: 1, fontSize: 20, fontWeight: '700', color: palette.text }}>
            Profilo
          </Text>
          <Pressable
            onPress={() => setSettingsOpen(true)}
            accessibilityLabel="Impostazioni"
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: palette.surfaceAlt,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Settings size={20} color={palette.text} />
          </Pressable>
        </View>

        {/* Avatar + info */}
        <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 20, gap: 10 }}>
          <View style={{ position: 'relative' }}>
            {uploadingAvatar ? (
              <View
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 44,
                  backgroundColor: palette.surfaceAlt,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ActivityIndicator color={palette.text} />
              </View>
            ) : (
              <LAvatar uri={profile?.avatarUrl} username={profile?.username} size={88} />
            )}
            <Pressable
              onPress={pickAndUploadAvatar}
              accessibilityLabel="Cambia foto profilo"
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: palette.text,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: palette.bg,
              }}
            >
              <Edit2 size={12} color={palette.bg} />
            </Pressable>
          </View>
          <View style={{ alignItems: 'center', gap: 2 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: palette.text }}>
              {profile?.displayName ?? profile?.username ?? 'Anonimo'}
            </Text>
            {profile?.username && (
              <Text style={{ fontSize: 13, color: palette.textMuted }}>@{profile.username}</Text>
            )}
            {profile?.bio && (
              <Text
                style={{
                  fontSize: 13,
                  color: palette.textMuted,
                  textAlign: 'center',
                  paddingHorizontal: 32,
                  marginTop: 4,
                }}
              >
                {profile.bio}
              </Text>
            )}
          </View>
        </View>

        {/* Level card */}
        <View
          style={{
            marginHorizontal: 16,
            backgroundColor: palette.surface,
            borderRadius: 14,
            padding: 16,
            gap: 10,
            borderWidth: 1,
            borderColor: palette.border,
          }}
        >
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: palette.text }}>
              Livello {level}
            </Text>
            <Text style={{ fontSize: 13, color: palette.textMuted }}>{xp} XP</Text>
          </View>
          <View style={{ height: 6, backgroundColor: palette.surfaceAlt, borderRadius: 3 }}>
            <View
              style={{
                height: 6,
                borderRadius: 3,
                backgroundColor: ACCENTS[accent].base,
                width: `${(xpProgress / 100) * 100}%`,
              }}
            />
          </View>
          <Text style={{ fontSize: 12, color: palette.textFaint }}>
            {nextLevelXp - xpProgress} XP al prossimo livello
          </Text>
        </View>

        {/* Stats grid */}
        <View style={{ flexDirection: 'row', marginHorizontal: 16, marginTop: 12, gap: 8 }}>
          {STAT_ITEMS.map((item) => (
            <View
              key={item.label}
              style={{
                flex: 1,
                backgroundColor: palette.surface,
                borderRadius: 12,
                padding: 12,
                alignItems: 'center',
                gap: 4,
                borderWidth: 1,
                borderColor: palette.border,
              }}
            >
              {statsLoading ? (
                <LSkeleton height={24} borderRadius={4} style={{ width: 36 }} />
              ) : (
                <Text style={{ fontSize: 20, fontWeight: '700', color: palette.text }}>
                  {item.value ?? 0}
                </Text>
              )}
              <Text style={{ fontSize: 11, color: palette.textMuted }}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Badge grid */}
        <View style={{ paddingHorizontal: 16, marginTop: 24, gap: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: palette.text }}>Badge</Text>
          {badgesLoading ? (
            <LSkeleton height={80} borderRadius={12} />
          ) : allBadges.length === 0 ? (
            <LEmptyState title="Nessun badge disponibile" subtitle="" />
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {allBadges.map((badge) => (
                <View key={badge.id} style={{ width: '31%' }}>
                  <LBadgeTile badge={badge} unlocked={unlockedIds.has(badge.id)} />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Settings sheet */}
      <LSheet
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        height={280}
        bottomOffset={sheetBottomOffset}
      >
        <View style={{ paddingHorizontal: 16, gap: 4 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: palette.text, marginBottom: 8 }}>
            Impostazioni
          </Text>

          <Pressable
            onPress={() => {
              toggleMode();
              setSettingsOpen(false);
            }}
            style={{
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: palette.border,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ fontSize: 15, color: palette.text }}>Tema</Text>
            <Text style={{ fontSize: 15, color: palette.textMuted }}>
              {mode === 'day' ? '☀️ Giorno' : '🌙 Notte'}
            </Text>
          </Pressable>

          <View
            style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: palette.border }}
          >
            <Text style={{ fontSize: 15, color: palette.text, marginBottom: 10 }}>
              Colore accent
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {(Object.keys(ACCENTS) as (keyof typeof ACCENTS)[]).map((key) => (
                <Pressable
                  key={key}
                  onPress={() => {
                    setAccent(key);
                  }}
                  accessibilityLabel={`Accent ${key}`}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: ACCENTS[key].base,
                    borderWidth: accent === key ? 3 : 0,
                    borderColor: palette.text,
                  }}
                />
              ))}
            </View>
          </View>

          <Pressable
            onPress={() => {
              setSettingsOpen(false);
              void signOut();
            }}
            style={{ paddingVertical: 14, marginTop: 10 }}
          >
            <Text style={{ fontSize: 15, color: palette.danger }}>Esci dall'account</Text>
          </Pressable>
        </View>
      </LSheet>
    </SafeAreaView>
  );
}
