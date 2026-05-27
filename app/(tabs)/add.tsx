import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { MapMarker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, MapPin, Navigation, Plus, Search, X } from 'lucide-react-native';
import { LFormField } from '@/components/LFormField';
import { LButton } from '@/components/LButton';
import { LPin } from '@/components/LPin';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createLurido } from '@/lib/api/luridi';
import { createPhoto } from '@/lib/api/photos';
import { uploadImage } from '@/lib/utils/imageUpload';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useLocation } from '@/hooks/useLocation';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { ACCENTS } from '@/lib/theme/tokens';
import { MILANO_REGION } from '@/lib/constants/maps';

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const DAY_LABELS: Record<string, string> = {
  mon: 'Lunedì',
  tue: 'Martedì',
  wed: 'Mercoledì',
  thu: 'Giovedì',
  fri: 'Venerdì',
  sat: 'Sabato',
  sun: 'Domenica',
};

const addSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  name: z.string().min(3, 'Minimo 3 caratteri').max(80, 'Massimo 80 caratteri'),
  neighborhood: z.string().min(2, 'Inserisci il quartiere'),
  description: z.string().max(1000).optional(),
  address: z.string().optional(),
  hours: z.record(z.tuple([z.string(), z.string()])).optional(),
  photoUris: z.array(z.string()).max(6),
});
type AddForm = z.infer<typeof addSchema>;

type Step = 0 | 1 | 2 | 3;

const STEP_LABELS = ['Posizione', 'Info', 'Orari', 'Foto'];

export default function AddScreen() {
  const { palette, accent } = useTheme();
  const { profile } = useAuthStore();
  const { location } = useLocation(true);
  const qc = useQueryClient();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  // Tab bar: altezza 48 + positioned `bottom: max(insets.bottom, 12)` dallo schermo
  const footerPaddingBottom = tabBarHeight + Math.max(insets.bottom, 12) + 12;

  const [step, setStep] = useState<Step>(0);

  const initialRegion: Region = location
    ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : MILANO_REGION;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<AddForm>({
    resolver: zodResolver(addSchema),
    defaultValues: {
      lat: initialRegion.latitude,
      lng: initialRegion.longitude,
      name: '',
      neighborhood: '',
      description: '',
      address: '',
      hours: undefined,
      photoUris: [],
    },
  });

  const { mutate: submit, isPending } = useMutation({
    mutationFn: async (data: AddForm) => {
      if (!profile?.id) throw new Error('Not logged in');
      const luridoId = await createLurido(
        {
          name: data.name,
          neighborhood: data.neighborhood,
          description: data.description || undefined,
          address: data.address || undefined,
          lat: data.lat,
          lng: data.lng,
          hours: data.hours as AddForm['hours'],
        },
        profile.id,
      );

      for (let i = 0; i < data.photoUris.length; i++) {
        const uri = data.photoUris[i];
        if (!uri) continue;
        try {
          const url = await uploadImage(uri, 'lurido-photos', `${luridoId}/${i}.jpg`);
          await createPhoto(luridoId, url, profile.id, { sortOrder: i });
        } catch {
          // skip failed photo uploads
        }
      }
      return luridoId;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['mod', 'queue'] });
      Alert.alert(
        'Proposta inviata!',
        'Il tuo lurido è in revisione. Ti avviseremo quando sarà approvato.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }],
      );
    },
    onError: () => Alert.alert('Errore', 'Impossibile inviare la proposta. Riprova.'),
  });

  const watchedName = watch('name');
  const watchedNeighborhood = watch('neighborhood');
  const canContinue = step !== 1 || (watchedName.length >= 3 && watchedNeighborhood.length >= 2);

  const goNext = async () => {
    if (step === 0) {
      const { lat, lng, address, neighborhood } = getValues();
      if (!address && !neighborhood) {
        try {
          const [geo] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
          if (geo) {
            const street = [geo.street, geo.streetNumber].filter(Boolean).join(' ');
            if (street) setValue('address', street);
            const hood = geo.district ?? geo.subregion ?? geo.city ?? '';
            if (hood) setValue('neighborhood', hood);
          }
        } catch {
          // ignore — user can fill manually
        }
      }
    }
    if (step < 3) setStep((s) => (s + 1) as Step);
  };
  const goBack = () => {
    if (step > 0) setStep((s) => (s - 1) as Step);
    else router.back();
  };

  const onFinalSubmit = handleSubmit((data) => submit(data));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }} edges={['top']}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 12,
        }}
      >
        <Pressable
          onPress={goBack}
          accessibilityLabel="Indietro"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: palette.surfaceAlt,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeft size={22} color={palette.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: palette.text }}>
            Aggiungi un lurido
          </Text>
          <Text style={{ fontSize: 12, color: palette.textMuted }}>
            Step {step + 1} di 4 — {STEP_LABELS[step]}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View
        style={{
          height: 3,
          backgroundColor: palette.surfaceAlt,
          marginHorizontal: 16,
          borderRadius: 2,
        }}
      >
        <View
          style={{
            height: 3,
            borderRadius: 2,
            backgroundColor: palette.text,
            width: `${((step + 1) / 4) * 100}%`,
          }}
        />
      </View>

      {/* Step content */}
      <View style={{ flex: 1 }}>
        {step === 0 && <StepPosition control={control} watch={watch} setValue={setValue} location={location} />}
        {step === 1 && <StepInfo control={control} errors={errors} />}
        {step === 2 && <StepHours control={control} watch={watch} setValue={setValue} />}
        {step === 3 && <StepPhotos watch={watch} setValue={setValue} />}
      </View>

      {/* Footer */}
      <View style={{ paddingHorizontal: 16, paddingBottom: footerPaddingBottom, paddingTop: 8 }}>
        <LButton
          label={step < 3 ? 'Continua' : 'Proponi alla community'}
          onPress={step < 3 ? () => { void goNext(); } : onFinalSubmit}
          loading={isPending}
          disabled={isPending || !canContinue}
          leftIcon={step < 3 ? <ChevronRight size={18} color={ACCENTS[accent].ink} /> : undefined}
        />
      </View>
    </SafeAreaView>
  );
}

function StepPosition({
  control,
  watch,
  setValue,
  location,
}: {
  control: ReturnType<typeof useForm<AddForm>>['control'];
  watch: ReturnType<typeof useForm<AddForm>>['watch'];
  setValue: ReturnType<typeof useForm<AddForm>>['setValue'];
  location: Location.LocationObject | null;
}) {
  const { palette } = useTheme();
  const lat = watch('lat');
  const lng = watch('lng');
  const mapRef = useRef<MapView>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const centeredRef = useRef(false);

  useEffect(() => {
    if (location && !centeredRef.current) {
      centeredRef.current = true;
      const { latitude, longitude } = location.coords;
      setValue('lat', latitude);
      setValue('lng', longitude);
      mapRef.current?.animateToRegion(
        { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
        600,
      );
    }
  }, [location, setValue]);

  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return;
    Keyboard.dismiss();
    setSearching(true);
    try {
      const results = await Location.geocodeAsync(q);
      const first = results[0];
      if (first) {
        setValue('lat', first.latitude);
        setValue('lng', first.longitude);
        mapRef.current?.animateToRegion(
          { latitude: first.latitude, longitude: first.longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 },
          600,
        );
      } else {
        Alert.alert('Nessun risultato', 'Indirizzo non trovato. Prova con un termine più specifico.');
      }
    } catch {
      Alert.alert('Errore', 'Ricerca non disponibile. Riprova.');
    } finally {
      setSearching(false);
    }
  };

  const goToMyLocation = () => {
    if (!location) return;
    const { latitude, longitude } = location.coords;
    setValue('lat', latitude);
    setValue('lng', longitude);
    mapRef.current?.animateToRegion(
      { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      600,
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Search bar overlay */}
      <View
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          right: 12,
          zIndex: 10,
          flexDirection: 'row',
          gap: 8,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: palette.surface,
            borderRadius: 12,
            paddingHorizontal: 12,
            gap: 8,
            height: 44,
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 4,
          }}
        >
          <Search size={16} color={palette.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Cerca via, indirizzo…"
            placeholderTextColor={palette.textFaint}
            style={{ flex: 1, fontSize: 14, color: palette.text }}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {searching ? (
            <ActivityIndicator size="small" color={palette.textMuted} />
          ) : searchQuery.length > 0 ? (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <X size={16} color={palette.textMuted} />
            </Pressable>
          ) : null}
        </View>
        {location && (
          <Pressable
            onPress={goToMyLocation}
            accessibilityLabel="Vai alla mia posizione"
            style={{
              backgroundColor: palette.surface,
              borderRadius: 12,
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 4,
            }}
          >
            <Navigation size={18} color={palette.text} />
          </Pressable>
        )}
      </View>

      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        initialRegion={{ latitude: lat, longitude: lng, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
        onPress={(e) => {
          setValue('lat', e.nativeEvent.coordinate.latitude);
          setValue('lng', e.nativeEvent.coordinate.longitude);
        }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        <MapMarker
          coordinate={{ latitude: lat, longitude: lng }}
          anchor={{ x: 0.5, y: 1 }}
          draggable
          onDragEnd={(e) => {
            setValue('lat', e.nativeEvent.coordinate.latitude);
            setValue('lng', e.nativeEvent.coordinate.longitude);
          }}
        >
          <LPin variant="pill" status="open" />
        </MapMarker>
      </MapView>

      <View
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          backgroundColor: palette.surface,
          borderRadius: 12,
          padding: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <MapPin size={16} color={palette.textMuted} />
        <Text style={{ flex: 1, fontSize: 13, color: palette.textMuted }}>
          Tocca la mappa o trascina il pin per posizionare il lurido
        </Text>
      </View>
    </View>
  );
}

function StepInfo({
  control,
  errors,
}: {
  control: ReturnType<typeof useForm<AddForm>>['control'];
  errors: ReturnType<typeof useForm<AddForm>>['formState']['errors'];
}) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, gap: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <Controller
        control={control}
        name="name"
        render={({ field: { value, onChange, onBlur } }) => (
          <LFormField
            label="Nome"
            required
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Es. Peppino il Baracchino"
            error={errors.name?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="neighborhood"
        render={({ field: { value, onChange, onBlur } }) => (
          <LFormField
            label="Quartiere / Zona"
            required
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Es. Navigli, Isola, Porta Romana…"
            error={errors.neighborhood?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="address"
        render={({ field: { value, onChange, onBlur } }) => (
          <LFormField
            label="Indirizzo (opzionale)"
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Via Roma 12"
          />
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field: { value, onChange, onBlur } }) => (
          <LFormField
            label="Descrizione (opzionale)"
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Cosa rende speciale questo posto?"
            multiline
            numberOfLines={4}
            style={{ minHeight: 100, textAlignVertical: 'top' }}
          />
        )}
      />
    </ScrollView>
  );
}

function StepHours({
  control,
  watch,
  setValue,
}: {
  control: ReturnType<typeof useForm<AddForm>>['control'];
  watch: ReturnType<typeof useForm<AddForm>>['watch'];
  setValue: ReturnType<typeof useForm<AddForm>>['setValue'];
}) {
  const { palette } = useTheme();
  const hours = watch('hours') ?? {};

  const toggleDay = (day: string) => {
    const current = { ...hours };
    if (current[day]) {
      const updated = { ...current };
      delete updated[day];
      setValue('hours', Object.keys(updated).length ? updated : undefined);
    } else {
      setValue('hours', { ...current, [day]: ['10:00', '22:00'] });
    }
  };

  const setSlot = (day: string, idx: 0 | 1, val: string) => {
    const current = { ...hours };
    const slot = current[day] ? [...(current[day] as [string, string])] : ['10:00', '22:00'];
    slot[idx] = val;
    setValue('hours', { ...current, [day]: slot as [string, string] });
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, gap: 2 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={{ fontSize: 13, color: palette.textMuted, marginBottom: 12 }}>
        Seleziona i giorni di apertura e gli orari. Puoi aggiornare in seguito.
      </Text>
      {DAY_KEYS.map((day) => {
        const active = !!hours[day];
        const slot = hours[day] as [string, string] | undefined;
        return (
          <View
            key={day}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: palette.border,
              gap: 12,
            }}
          >
            <Pressable
              onPress={() => toggleDay(day)}
              style={{ width: 100 }}
              accessibilityLabel={`Attiva ${DAY_LABELS[day]}`}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: active ? '600' : '400',
                  color: active ? palette.text : palette.textMuted,
                }}
              >
                {DAY_LABELS[day]}
              </Text>
            </Pressable>
            {active && slot ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <TextInput
                  value={slot[0]}
                  onChangeText={(v) => setSlot(day, 0, v)}
                  placeholder="10:00"
                  placeholderTextColor={palette.textFaint}
                  style={{
                    flex: 1,
                    backgroundColor: palette.surfaceAlt,
                    borderRadius: 8,
                    padding: 8,
                    fontSize: 14,
                    color: palette.text,
                    textAlign: 'center',
                  }}
                />
                <Text style={{ color: palette.textMuted }}>–</Text>
                <TextInput
                  value={slot[1]}
                  onChangeText={(v) => setSlot(day, 1, v)}
                  placeholder="22:00"
                  placeholderTextColor={palette.textFaint}
                  style={{
                    flex: 1,
                    backgroundColor: palette.surfaceAlt,
                    borderRadius: 8,
                    padding: 8,
                    fontSize: 14,
                    color: palette.text,
                    textAlign: 'center',
                  }}
                />
              </View>
            ) : (
              <Text style={{ fontSize: 13, color: palette.textFaint }}>Chiuso</Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

function StepPhotos({
  watch,
  setValue,
}: {
  watch: ReturnType<typeof useForm<AddForm>>['watch'];
  setValue: ReturnType<typeof useForm<AddForm>>['setValue'];
}) {
  const { palette } = useTheme();
  const photoUris = watch('photoUris');

  const pickPhotos = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.9,
      selectionLimit: 6 - photoUris.length,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setValue('photoUris', [...photoUris, ...uris].slice(0, 6));
    }
  };

  const removePhoto = (idx: number) => {
    setValue(
      'photoUris',
      photoUris.filter((_, i) => i !== idx),
    );
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 13, color: palette.textMuted, marginBottom: 12 }}>
        Aggiungi fino a 6 foto. La prima sarà la copertina.
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {photoUris.map((uri, idx) => (
          <View key={uri} style={{ position: 'relative' }}>
            <Image source={{ uri }} style={{ width: 100, height: 100, borderRadius: 10 }} />
            <Pressable
              onPress={() => removePhoto(idx)}
              accessibilityLabel="Rimuovi foto"
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: 'rgba(0,0,0,0.6)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={12} color="#fff" />
            </Pressable>
          </View>
        ))}
        {photoUris.length < 6 && (
          <Pressable
            onPress={pickPhotos}
            accessibilityLabel="Aggiungi foto"
            style={{
              width: 100,
              height: 100,
              borderRadius: 10,
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: palette.border,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <Plus size={22} color={palette.textMuted} />
            <Text style={{ fontSize: 12, color: palette.textMuted }}>Aggiungi</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}
