import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { MapMarker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import ClusteredMapView from 'react-native-map-clustering';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { Search, X } from 'lucide-react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { LPin } from '@/components/LPin';
import { LChip } from '@/components/LChip';
import { LSheet } from '@/components/LSheet';
import { LPhoto } from '@/components/LPhoto';
import { LStars } from '@/components/LStars';
import { LStatusBadge } from '@/components/LStatusBadge';
import { LAvatar } from '@/components/LAvatar';
import { LSkeleton } from '@/components/LSkeleton';
import { useNearbyLuridi } from '@/hooks/useNearbyLuridi';
import { useSearch } from '@/hooks/useSearch';
import { useLocation } from '@/hooks/useLocation';
import { useFiltersStore } from '@/lib/store/useFiltersStore';
import { useLuridiUIStore } from '@/lib/store/useLuridiUIStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { SHADOWS } from '@/lib/theme/tokens';
import {
  CLUSTER_MIN_POINTS,
  CLUSTER_RADIUS,
  DEFAULT_NEARBY_RADIUS_M,
  MILANO_REGION,
} from '@/lib/constants/maps';
import { formatDistance, isOpenNow, formatCloseTime } from '@/lib/utils/format';
import type { Lurido } from '@/types/domain';

const SCREEN_H = Dimensions.get('window').height;

const GOOGLE_MAP_STYLE_NIGHT = [
  { elementType: 'geometry', stylers: [{ color: '#0f0a08' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#f5ead8' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e1612' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0c1418' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1a1e14' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'simplified' }] },
];

const GOOGLE_MAP_STYLE_DAY = [
  { elementType: 'geometry', stylers: [{ color: '#f0e8d8' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#1a1512' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#b8d4d8' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#d4e0b8' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

function UserBlip({ lat, lng }: { lat: number; lng: number }) {
  const { palette, accent } = useTheme();
  const { ACCENTS } = require('@/lib/theme/tokens');
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(withTiming(1.8, { duration: 1000 }), withTiming(1, { duration: 1000 })),
      -1,
      false,
    );
  }, [pulseScale]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 1 - (pulseScale.value - 1) / 0.8,
  }));

  return (
    <MapMarker
      coordinate={{ latitude: lat, longitude: lng }}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={false}
    >
      <View style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View
          style={[
            ringStyle,
            {
              position: 'absolute',
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: '#3b82f6',
              opacity: 0.25,
            },
          ]}
        />
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: '#3b82f6',
            borderWidth: 2,
            borderColor: '#fff',
          }}
        />
      </View>
    </MapMarker>
  );
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const sheetBottomOffset = tabBarHeight + Math.max(insets.bottom, 12);
  const { palette, mode } = useTheme();
  const { profile } = useAuthStore();
  const { selectedLuridoId, setSelectedLuridoId, setMapRegion } = useLuridiUIStore();
  const { openNow, minStars, veggie, isNew, setOpenNow, setMinStars, setVeggie, setIsNew } =
    useFiltersStore();

  const [region, setRegion] = useState<Region>(MILANO_REGION);
  const mapRef = useRef<MapView>(null);

  const [searchActive, setSearchActive] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);

  const { location, status, request } = useLocation();

  // Chiedi location al primo render
  useEffect(() => {
    if (status === 'idle') {
      void request();
    }
  }, [status, request]);

  // Centra su location quando disponibile
  useEffect(() => {
    if (location) {
      const newRegion: Region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 600);
    }
  }, [location]);

  const { data: luridi = [] } = useNearbyLuridi(
    region.latitude,
    region.longitude,
    DEFAULT_NEARBY_RADIUS_M,
  );

  const { data: searchResults, isLoading: searchLoading } = useSearch(debouncedQuery);
  const isSearching = searchActive && debouncedQuery.trim().length >= 2;

  const baseList = isSearching ? (searchResults ?? []) : luridi;
  const filteredLuridi = baseList.filter((l) => {
    if (openNow && !isOpenNow(l.hours)) return false;
    if (minStars === 4 && (l.avgRating ?? 0) < 4) return false;
    return true;
  });

  const selectedLurido = filteredLuridi.find((l) => l.id === selectedLuridoId);

  const handleRegionChange = useCallback(
    (r: Region) => {
      setRegion(r);
      setMapRegion(r);
    },
    [setMapRegion],
  );

  const handleCenter = useCallback(() => {
    if (location) {
      const r: Region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      mapRef.current?.animateToRegion(r, 400);
    } else {
      void request();
    }
  }, [location, request]);

  const dismissSearch = useCallback(() => {
    setSearchActive(false);
    setQuery('');
    setDebouncedQuery('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const onChangeQueryText = useCallback((text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(text), 300);
  }, []);

  useEffect(() => {
    if (searchActive) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [searchActive]);

  const shadows = mode === 'day' ? SHADOWS.day : SHADOWS.night;

  return (
    <View style={{ flex: 1 }}>
      {/* Mappa */}
      <ClusteredMapView
        mapRef={(ref: unknown) => {
          (mapRef as React.MutableRefObject<MapView | null>).current = ref as MapView | null;
        }}
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        customMapStyle={mode === 'day' ? GOOGLE_MAP_STYLE_DAY : GOOGLE_MAP_STYLE_NIGHT}
        initialRegion={MILANO_REGION}
        onMapReady={() => {
          if (!location) mapRef.current?.animateToRegion(MILANO_REGION, 0);
        }}
        onRegionChangeComplete={handleRegionChange}
        clusterColor={palette.text}
        radius={CLUSTER_RADIUS}
        minPoints={CLUSTER_MIN_POINTS}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {location && <UserBlip lat={location.coords.latitude} lng={location.coords.longitude} />}
        {filteredLuridi.map((l) => (
          <MapMarker
            key={l.id}
            coordinate={{ latitude: l.location.latitude, longitude: l.location.longitude }}
            anchor={{ x: 0.5, y: 1 }}
            tracksViewChanges={false}
            onPress={() => setSelectedLuridoId(l.id)}
          >
            <LPin
              variant="pill"
              status={l.tempClosed ? 'closed' : isOpenNow(l.hours) ? 'open' : 'closed'}
              selected={l.id === selectedLuridoId}
            />
          </MapMarker>
        ))}
      </ClusteredMapView>

      {/* Top bar glass */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 8,
        }}
      >
        <BlurView
          intensity={80}
          tint={mode === 'day' ? 'light' : 'dark'}
          style={{
            borderRadius: 14,
            overflow: 'hidden',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 8,
            gap: 8,
            ...shadows.sm,
          }}
        >
          <Search size={16} color={searchActive ? palette.textMuted : palette.textFaint} />
          {searchActive ? (
            <>
              <TextInput
                ref={inputRef}
                value={query}
                onChangeText={onChangeQueryText}
                placeholder="Cerca Peppino, Navigli, cima di rapa…"
                placeholderTextColor={palette.textFaint}
                style={{ flex: 1, fontSize: 14, color: palette.text }}
                returnKeyType="search"
              />
              {query.length > 0 && (
                <Pressable
                  onPress={() => { setQuery(''); setDebouncedQuery(''); }}
                  accessibilityLabel="Cancella testo"
                  hitSlop={8}
                >
                  <X size={16} color={palette.textMuted} />
                </Pressable>
              )}
              <Pressable onPress={dismissSearch} accessibilityLabel="Annulla ricerca" hitSlop={8}>
                <Text style={{ fontSize: 14, color: palette.text, fontWeight: '600' }}>Annulla</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                onPress={() => setSearchActive(true)}
                accessibilityLabel="Cerca luridi"
                style={{ flex: 1 }}
              >
                <Text style={{ fontSize: 14, color: palette.textFaint }}>
                  Cerca Peppino, Navigli, cima di rapa…
                </Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/(tabs)/profile')}
                accessibilityLabel="Profilo utente"
              >
                <LAvatar uri={profile?.avatarUrl} username={profile?.username} size={32} />
              </Pressable>
            </>
          )}
        </BlurView>
      </View>

      {/* Filter strip / Search dropdown */}
      {searchActive ? (
        <View
          style={{
            position: 'absolute',
            top: insets.top + 64,
            left: 16,
            right: 16,
            maxHeight: SCREEN_H * 0.5,
            borderRadius: 14,
            overflow: 'hidden',
            ...shadows.md,
          }}
        >
          <BlurView intensity={80} tint={mode === 'day' ? 'light' : 'dark'}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 10, gap: 6 }}
            >
              {isSearching && searchLoading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <LSkeleton key={i} height={72} borderRadius={12} />
                  ))}
                </>)
              : isSearching && filteredLuridi.length === 0 ? (
                <View style={{ paddingVertical: 12, alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: palette.textMuted }}>
                    Nessun match per "{debouncedQuery}"
                  </Text>
                </View>
              ) : !isSearching ? (
                <View style={{ paddingVertical: 8, alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, color: palette.textFaint }}>
                    Digita per cercare luridi vicino a te
                  </Text>
                </View>
              ) : (
                filteredLuridi.map((l) => (
                  <SuggestionRow
                    key={l.id}
                    lurido={l}
                    userLocation={location?.coords ?? null}
                    onPress={() => {

                      mapRef.current?.animateToRegion(
                        {
                          latitude: l.location.latitude,
                          longitude: l.location.longitude,
                          latitudeDelta: 0.01,
                          longitudeDelta: 0.01,
                        },
                        400,
                      );
                      setSelectedLuridoId(l.id);
                      dismissSearch();
                    }}
                  />
                ))
              )}
            </ScrollView>
          </BlurView>
        </View>
      ) : (
        <View
          style={{
            position: 'absolute',
            top: insets.top + 64,
            left: 0,
            right: 0,
            paddingHorizontal: 16,
          }}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <LChip label="Aperto ora" active={openNow} onPress={() => setOpenNow(!openNow)} />
              <LChip
                label="4+ ⭐"
                active={minStars === 4}
                onPress={() => setMinStars(minStars === 4 ? 0 : 4)}
              />
              <LChip label="Veggie" active={veggie} onPress={() => setVeggie(!veggie)} />
              <LChip label="Nuovi" active={isNew} onPress={() => setIsNew(!isNew)} />
            </View>
          </ScrollView>
        </View>
      )}

      {/* Bottone centrami */}
      <Pressable
        onPress={handleCenter}
        accessibilityLabel="Centrami sulla mia posizione"
        style={{
          position: 'absolute',
          right: 16,
          bottom: 100,
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: palette.surface,
          alignItems: 'center',
          justifyContent: 'center',
          ...shadows.md,
        }}
      >
        <Text style={{ fontSize: 20 }}>📍</Text>
      </Pressable>

      {/* Preview card bottom sheet */}
      <LSheet
        visible={!!selectedLurido}
        onClose={() => setSelectedLuridoId(null)}
        height={280}
        bottomOffset={sheetBottomOffset}
      >
        {selectedLurido && (
          <PreviewCard lurido={selectedLurido} userLocation={location?.coords ?? null} />
        )}
      </LSheet>
    </View>
  );
}

function PreviewCard({
  lurido,
  userLocation,
}: {
  lurido: Lurido;
  userLocation: { latitude: number; longitude: number } | null;
}) {
  const { palette } = useTheme();
  const { setSelectedLuridoId } = useLuridiUIStore();
  const open = isOpenNow(lurido.hours);
  const closeTime = formatCloseTime(lurido.hours);

  const distM = userLocation
    ? Math.round(
        Math.sqrt(
          Math.pow((lurido.location.latitude - userLocation.latitude) * 111320, 2) +
            Math.pow((lurido.location.longitude - userLocation.longitude) * 111320, 2),
        ),
      )
    : null;

  return (
    <View style={{ flex: 1, paddingHorizontal: 16, gap: 12 }}>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
        <LPhoto uri={undefined} style={{ width: 80, height: 80 }} borderRadius={10} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: palette.text }} numberOfLines={1}>
            {lurido.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <LStatusBadge
              status={open ? 'open' : 'closed'}
              until={open && closeTime ? closeTime : undefined}
            />
            {lurido.neighborhood && (
              <Text style={{ fontSize: 12, color: palette.textMuted }}>{lurido.neighborhood}</Text>
            )}
            {distM !== null && (
              <Text style={{ fontSize: 12, color: palette.textMuted }}>
                {formatDistance(distM)}
              </Text>
            )}
          </View>
          {lurido.reviewCount ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <LStars value={lurido.avgRating ?? 0} size={14} />
              <Text style={{ fontSize: 12, color: palette.textMuted }}>
                {lurido.avgRating?.toFixed(1)} ({lurido.reviewCount})
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <Pressable
        onPress={() => {
          setSelectedLuridoId(null);
          router.push(`/lurido/${lurido.id}`);
        }}
        accessibilityLabel={`Vedi profilo di ${lurido.name}`}
        style={{
          backgroundColor: palette.text,
          borderRadius: 10,
          paddingVertical: 12,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: palette.bg, fontWeight: '600', fontSize: 15 }}>Vedi →</Text>
      </Pressable>
    </View>
  );
}

function SuggestionRow({
  lurido,
  userLocation,
  onPress,
}: {
  lurido: Lurido;
  userLocation: { latitude: number; longitude: number } | null;
  onPress: () => void;
}) {
  const { palette, mode } = useTheme();
  const shadows = mode === 'day' ? SHADOWS.day : SHADOWS.night;
  const open = isOpenNow(lurido.hours);
  const distM = userLocation
    ? Math.round(
        Math.sqrt(
          Math.pow((lurido.location.latitude - userLocation.latitude) * 111320, 2) +
            Math.pow((lurido.location.longitude - userLocation.longitude) * 111320, 2),
        ),
      )
    : null;

  const initials = lurido.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase();

  return (
    <Pressable onPress={onPress} accessibilityLabel={`Vai a ${lurido.name}`}>
      {({ pressed }) => (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            padding: 12,
            backgroundColor: pressed ? palette.surfaceAlt : palette.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: palette.border,
            ...shadows.sm,
          }}
        >
          {/* Avatar iniziali */}
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 10,
              backgroundColor: palette.surfaceAlt,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '700', color: palette.textMuted }}>
              {initials}
            </Text>
          </View>

          {/* Info */}
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontSize: 15, fontWeight: '600', color: palette.text, marginBottom: 4 }}
              numberOfLines={1}
            >
              {lurido.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <LStatusBadge status={open ? 'open' : 'closed'} />
              {lurido.neighborhood ? (
                <Text style={{ fontSize: 12, color: palette.textMuted }}>
                  {lurido.neighborhood}
                </Text>
              ) : null}
              {distM !== null ? (
                <Text style={{ fontSize: 12, color: palette.textFaint }}>
                  {formatDistance(distM)}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Arrow */}
          <Text style={{ fontSize: 18, color: palette.textFaint }}>›</Text>
        </View>
      )}
    </Pressable>
  );
}
