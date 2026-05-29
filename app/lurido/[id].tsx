import { useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Bookmark, Share2, Flag, Plus } from 'lucide-react-native';
import { ACCENTS } from '@/lib/theme/tokens';
import { LPhoto } from '@/components/LPhoto';
import { LStars } from '@/components/LStars';
import { LStatusBadge } from '@/components/LStatusBadge';
import { LAvatar } from '@/components/LAvatar';
import { LSheet } from '@/components/LSheet';
import { LButton } from '@/components/LButton';
import { LDishRow } from '@/components/LDishRow';
import { LEmptyState } from '@/components/LEmptyState';
import { LSkeleton, LSkeletonCard } from '@/components/LSkeleton';
import { useLurido, useLuridoPhotos } from '@/hooks/useLurido';
import { useReviews, useCreateReview } from '@/hooks/useReviews';
import { useDishes, useVoteDish, useAddDish } from '@/hooks/useDishes';
import { useSaved, useToggleSaved } from '@/hooks/useSaved';
import { useUserMini } from '@/hooks/useUserMini';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { isOpenNow, formatCloseTime, formatHoursLine, formatRelativeTime } from '@/lib/utils/format';
import type { Dish, Lurido, Review } from '@/types/domain';

const REPORT_REASONS = [
  { emoji: '🚫', label: 'Non esiste / chiuso' },
  { emoji: '📍', label: 'Indirizzo errato' },
  { emoji: '🤔', label: 'Info false o spam' },
  { emoji: '⚠️', label: 'Contenuto inappropriato' },
];

const reviewSchema = z.object({
  stars: z.number().int().min(1, 'Seleziona almeno 1 stella').max(5),
  body: z.string().min(5, 'Minimo 5 caratteri').max(2000),
  photoUri: z.string().url().optional(),
});
type ReviewForm = z.infer<typeof reviewSchema>;

type Tab = 'panoramica' | 'piatti' | 'recensioni';

export default function LuridoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { palette, accent } = useTheme();
  const { profile } = useAuthStore();

  const [activeTab, setActiveTab] = useState<Tab>('panoramica');
  const [photoIndex, setPhotoIndex] = useState(0);
  const [reviewSheetOpen, setReviewSheetOpen] = useState(false);
  const [reportSheetOpen, setReportSheetOpen] = useState(false);
  const [addDishOpen, setAddDishOpen] = useState(false);
  const [newDishName, setNewDishName] = useState('');

  const { data: lurido, isLoading: luridoLoading } = useLurido(id ?? '');
  const { data: photos = [] } = useLuridoPhotos(id ?? '');
  const { data: savedSet } = useSaved(profile?.id);
  const { mutate: toggleSaved } = useToggleSaved(id ?? '', profile?.id ?? '');
  const { data: reviews = [] } = useReviews(id ?? '');
  const { data: dishes = [] } = useDishes(id ?? '', profile?.id);
  const { mutate: voteDish } = useVoteDish(id ?? '', profile?.id ?? '');
  const { mutate: addDishMutate, isPending: addingDish } = useAddDish(id ?? '', profile?.id ?? '');
  const { mutate: createReview, isPending: submittingReview } = useCreateReview(id ?? '', profile?.id ?? '');

  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { stars: 0, body: '', photoUri: undefined },
  });
  const watchedStars = watch('stars');
  const watchedBody = watch('body');
  const canSubmitReview = watchedStars >= 1 && watchedBody.length >= 5;

  const isSaved = savedSet?.some((s) => s.luridoId === (id ?? '')) ?? false;
  const open = lurido ? isOpenNow(lurido.hours) : false;
  const closeTime = lurido ? formatCloseTime(lurido.hours) : null;
  const SCREEN_W = Dimensions.get('window').width;
  const stockPhoto = lurido?.googlePlaceId === 'NOT_FOUND'
    ? `https://picsum.photos/seed/${lurido.slug ?? lurido.id}/800/600`
    : undefined;
  const displayPhotos: string[] = photos.length > 0
    ? photos.map((p) => p.url)
    : stockPhoto ? [stockPhoto] : [];

  const onPhotoScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    setPhotoIndex(idx);
  };

  const onSubmitReview = (data: ReviewForm) => {
    createReview(
      { luridoId: id ?? '', stars: data.stars as 1 | 2 | 3 | 4 | 5, body: data.body, photoUrl: data.photoUri },
      {
        onSuccess: () => {
          reset();
          setReviewSheetOpen(false);
        },
        onError: () => Alert.alert('Errore', 'Impossibile pubblicare la recensione.'),
      },
    );
  };

  const pickReviewPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      setValue('photoUri', result.assets[0].uri);
    }
  };

  const handleShare = async () => {
    if (!lurido) return;
    await Share.share({ message: `${lurido.name} — iLoveLurido`, title: lurido.name });
  };

  const handleAddDish = () => {
    if (!newDishName.trim()) return;
    addDishMutate(newDishName.trim(), {
      onSuccess: () => { setNewDishName(''); setAddDishOpen(false); },
      onError: () => Alert.alert('Errore', 'Impossibile aggiungere il piatto.'),
    });
  };

  if (luridoLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }} edges={['top']}>
        <LSkeletonCard />
      </SafeAreaView>
    );
  }

  if (!lurido) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }} edges={['top']}>
        <LEmptyState title="Lurido non trovato" subtitle="Potrebbe essere stato rimosso." />
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>

        {/* Hero photo gallery */}
        <View style={{ height: 260, position: 'relative' }}>
          {displayPhotos.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onPhotoScroll}
              scrollEventThrottle={16}
              style={{ width: SCREEN_W, height: 260 }}
            >
              {displayPhotos.map((uri, i) => (
                <LPhoto key={i} uri={uri} style={{ width: SCREEN_W, height: 260 }} borderRadius={0} />
              ))}
            </ScrollView>
          ) : (
            <LPhoto uri={undefined} style={{ width: '100%', height: 260 }} borderRadius={0} />
          )}
          <SafeAreaView
            style={{ position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 8 }}
            edges={['top']}
          >
            <Pressable
              onPress={() => router.back()}
              accessibilityLabel="Indietro"
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' }}
            >
              <ArrowLeft size={20} color="#fff" strokeWidth={1.8} />
            </Pressable>
            <Pressable
              onPress={() => toggleSaved(isSaved)}
              accessibilityLabel={isSaved ? 'Rimuovi dai salvati' : 'Salva'}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' }}
            >
              <Bookmark size={20} color="#fff" fill={isSaved ? '#fff' : 'transparent'} strokeWidth={1.8} />
            </Pressable>
          </SafeAreaView>
          {displayPhotos.length > 1 && (
            <View style={{ position: 'absolute', bottom: 10, right: 12, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 }}>
              <Text style={{ color: '#fff', fontSize: 12 }}>{photoIndex + 1}/{displayPhotos.length}</Text>
            </View>
          )}
          {displayPhotos.length > 1 && (
            <View style={{ position: 'absolute', bottom: 10, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 5 }} pointerEvents="none">
              {displayPhotos.map((_, i) => (
                <View key={i} style={{ width: i === photoIndex ? 16 : 6, height: 6, borderRadius: 3, backgroundColor: i === photoIndex ? '#fff' : 'rgba(255,255,255,0.5)' }} />
              ))}
            </View>
          )}
        </View>

        {/* Info block */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: 8 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: palette.text }}>{lurido.name}</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <LStatusBadge status={open ? 'open' : 'closed'} until={open && closeTime ? closeTime : undefined} />
            {lurido.neighborhood && (
              <Text style={{ fontSize: 13, color: palette.textMuted }}>{lurido.neighborhood}</Text>
            )}
          </View>

          {lurido.reviewCount ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <LStars value={lurido.avgRating ?? 0} size={16} />
              <Text style={{ fontSize: 13, color: palette.textMuted }}>
                {lurido.avgRating?.toFixed(1)} ({lurido.reviewCount} rec.)
              </Text>
            </View>
          ) : null}

          {/* Banner non verificato */}
          {lurido.googlePlaceId === 'NOT_FOUND' && (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#fef3c7', borderRadius: 10, padding: 10, marginTop: 4 }}>
              <Text style={{ fontSize: 16 }}>⚠️</Text>
              <Text style={{ flex: 1, fontSize: 13, color: '#92400e', lineHeight: 18 }}>
                Questo lurido non è su Google Maps — le informazioni potrebbero non essere aggiornate.
              </Text>
            </View>
          )}

          {/* Action row */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
            <Pressable
              onPress={() => setReviewSheetOpen(true)}
              style={{ flex: 1, backgroundColor: palette.text, borderRadius: 10, paddingVertical: 11, alignItems: 'center' }}
            >
              <Text style={{ color: palette.bg, fontWeight: '600', fontSize: 14 }}>Recensisci</Text>
            </Pressable>
            <Pressable
              onPress={handleShare}
              accessibilityLabel="Condividi"
              style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: palette.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}
            >
              <Share2 size={18} color={palette.text} />
            </Pressable>
            <Pressable
              onPress={() => setReportSheetOpen(true)}
              accessibilityLabel="Segnala"
              style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: palette.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}
            >
              <Flag size={18} color={palette.textMuted} />
            </Pressable>
          </View>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', marginHorizontal: 16, marginTop: 20, borderBottomWidth: 1, borderBottomColor: palette.border }}>
          {(['panoramica', 'piatti', 'recensioni'] as Tab[]).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{ flex: 1, paddingBottom: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: activeTab === tab ? ACCENTS[accent].base : 'transparent', marginBottom: -1 }}
            >
              <Text style={{ fontSize: 14, fontWeight: activeTab === tab ? '600' : '400', color: activeTab === tab ? palette.text : palette.textMuted, textTransform: 'capitalize' }}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Tab content */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {activeTab === 'panoramica' && lurido && <OverviewTab lurido={lurido} />}
          {activeTab === 'piatti' && (
            <DishesTab
              dishes={dishes ?? []}
              onVote={(dishId, currentlyVoted) => voteDish({ dishId, currentlyVoted })}
              onAddDish={() => setAddDishOpen(true)}
            />
          )}
          {activeTab === 'recensioni' && <ReviewsTab reviews={reviews} />}
        </View>
      </ScrollView>

      {/* Review sheet */}
      <LSheet visible={reviewSheetOpen} onClose={() => setReviewSheetOpen(false)} height={480}>
        <View style={{ flex: 1, paddingHorizontal: 16, gap: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: palette.text }}>Scrivi recensione</Text>

          <Controller
            control={control}
            name="stars"
            render={({ field: { value, onChange } }) => (
              <View style={{ alignItems: 'center' }}>
                <LStars value={value} size={36} onChange={onChange} />
                {errors.stars && <Text style={{ fontSize: 12, color: palette.danger, marginTop: 4 }}>{errors.stars.message}</Text>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="body"
            render={({ field: { value, onChange, onBlur } }) => (
              <View style={{ gap: 4 }}>
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Racconta com'era…"
                  placeholderTextColor={palette.textFaint}
                  multiline
                  numberOfLines={4}
                  style={{ backgroundColor: palette.surfaceAlt, borderRadius: 10, padding: 12, fontSize: 15, color: palette.text, minHeight: 100, textAlignVertical: 'top' }}
                />
                {errors.body && <Text style={{ fontSize: 12, color: palette.danger }}>{errors.body.message}</Text>}
              </View>
            )}
          />

          <Pressable
            onPress={pickReviewPhoto}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
          >
            <Plus size={16} color={palette.textMuted} />
            <Text style={{ fontSize: 14, color: palette.textMuted }}>Aggiungi foto</Text>
          </Pressable>

          <LButton
            label="Pubblica"
            disabled={!canSubmitReview || submittingReview}
            loading={submittingReview}
            onPress={handleSubmit(onSubmitReview)}
          />
        </View>
      </LSheet>

      {/* Report sheet */}
      <LSheet visible={reportSheetOpen} onClose={() => setReportSheetOpen(false)} height={300}>
        <View style={{ paddingHorizontal: 16, gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: palette.text }}>Segnala</Text>
          {REPORT_REASONS.map((r) => (
            <Pressable
              key={r.label}
              onPress={() => { setReportSheetOpen(false); Alert.alert('Segnalazione inviata', 'Grazie, i moderatori esamineranno il contenuto.'); }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: palette.border }}
            >
              <Text style={{ fontSize: 22 }}>{r.emoji}</Text>
              <Text style={{ fontSize: 15, color: palette.text }}>{r.label}</Text>
            </Pressable>
          ))}
        </View>
      </LSheet>

      {/* Add dish modal */}
      <Modal visible={addDishOpen} transparent animationType="fade">
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' }} onPress={() => setAddDishOpen(false)}>
          <Pressable style={{ width: 300, backgroundColor: palette.surface, borderRadius: 16, padding: 20, gap: 16 }} onPress={() => {}}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: palette.text }}>Aggiungi piatto</Text>
            <TextInput
              value={newDishName}
              onChangeText={setNewDishName}
              placeholder="Nome del piatto"
              placeholderTextColor={palette.textFaint}
              style={{ backgroundColor: palette.surfaceAlt, borderRadius: 8, padding: 10, fontSize: 15, color: palette.text }}
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable onPress={() => setAddDishOpen(false)} style={{ flex: 1, paddingVertical: 11, alignItems: 'center', borderRadius: 8, backgroundColor: palette.surfaceAlt }}>
                <Text style={{ color: palette.textMuted, fontWeight: '600' }}>Annulla</Text>
              </Pressable>
              <Pressable onPress={handleAddDish} disabled={!newDishName.trim() || addingDish} style={{ flex: 1, paddingVertical: 11, alignItems: 'center', borderRadius: 8, backgroundColor: palette.text }}>
                {addingDish ? <ActivityIndicator size="small" color={palette.bg} /> : <Text style={{ color: palette.bg, fontWeight: '600' }}>Aggiungi</Text>}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function OverviewTab({ lurido }: { lurido: Lurido }) {
  const { palette } = useTheme();
  const { data: author } = useUserMini(lurido.addedBy ?? undefined);

  return (
    <View style={{ gap: 16 }}>
      {lurido.description ? (
        <Text style={{ fontSize: 15, color: palette.text, lineHeight: 22 }}>{lurido.description}</Text>
      ) : null}

      <View style={{ gap: 10 }}>
        {lurido.address && (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Text style={{ fontSize: 13, color: palette.textMuted, width: 80 }}>Indirizzo</Text>
            <Text style={{ flex: 1, fontSize: 14, color: palette.text }}>{lurido.address}</Text>
          </View>
        )}
        {lurido.hours && (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Text style={{ fontSize: 13, color: palette.textMuted, width: 80 }}>Orari</Text>
            <Text style={{ flex: 1, fontSize: 14, color: palette.text }}>{formatHoursLine(lurido.hours)}</Text>
          </View>
        )}
        {lurido.phone && (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Text style={{ fontSize: 13, color: palette.textMuted, width: 80 }}>Telefono</Text>
            <Text style={{ flex: 1, fontSize: 14, color: palette.text }}>{lurido.phone}</Text>
          </View>
        )}
        {author && (
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: palette.textMuted, width: 80 }}>Aggiunto da</Text>
            <LAvatar uri={author.avatarUrl} username={author.username} size={24} />
            <Text style={{ fontSize: 14, color: palette.text }}>@{author.username}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function DishesTab({
  dishes,
  onVote,
  onAddDish,
}: {
  dishes: Dish[];
  onVote: (dishId: string, currentlyVoted: boolean) => void;
  onAddDish: () => void;
}) {
  const { palette } = useTheme();

  return (
    <View style={{ gap: 4 }}>
      {dishes.map((dish) => (
        <LDishRow
          key={dish.id}
          dish={dish}
          onVote={() => onVote(dish.id, dish.viewerVoted ?? false)}
        />
      ))}
      <Pressable
        onPress={onAddDish}
        accessibilityLabel="Aggiungi piatto"
        style={{ borderWidth: 1.5, borderColor: palette.border, borderStyle: 'dashed', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 8 }}
      >
        <Text style={{ fontSize: 14, color: palette.textMuted }}>+ Aggiungi piatto</Text>
      </Pressable>
    </View>
  );
}

function ReviewsTab({ reviews }: { reviews: Review[] }) {
  const { palette } = useTheme();

  if (!reviews.length) {
    return <LEmptyState title="Nessuna recensione" subtitle="Sii il primo a condividere la tua esperienza." />;
  }

  return (
    <View style={{ gap: 16 }}>
      {reviews.map((r) => (
        <ReviewCard key={r.id} review={r} />
      ))}
    </View>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const { palette } = useTheme();
  const { data: author } = useUserMini(review.userId);

  return (
    <View style={{ gap: 8, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: palette.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <LAvatar uri={author?.avatarUrl} username={author?.username} size={36} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: palette.text }}>@{author?.username ?? '…'}</Text>
          <Text style={{ fontSize: 12, color: palette.textMuted }}>{formatRelativeTime(review.createdAt)}</Text>
        </View>
        <LStars value={review.stars} size={13} />
      </View>
      {review.body ? <Text style={{ fontSize: 14, color: palette.text, lineHeight: 20 }}>{review.body}</Text> : null}
      {review.photoUrl ? <LPhoto uri={review.photoUrl} style={{ width: '100%', height: 160 }} borderRadius={8} /> : null}
    </View>
  );
}
