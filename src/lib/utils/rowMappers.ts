import type {
  Badge,
  Dish,
  ExpoPushToken,
  Lurido,
  Notification,
  Photo,
  Profile,
  Report,
  Review,
  ReviewHelpful,
  ReviewReply,
  SavedItem,
  UserBadge,
} from '@/types/domain';

// Supabase PostGIS geography(point) viene deserializzato come stringa WKT o oggetto GeoJSON.
// La RPC nearby_luridi ritorna colonne lat/lng separate come floats da ST_Y/ST_X.
// Per le query .select() dirette usiamo helper che accettano entrambe le forme.
function parseLocation(row: { location?: unknown; lat?: number; lng?: number }) {
  if (typeof row.lat === 'number' && typeof row.lng === 'number') {
    return { latitude: row.lat, longitude: row.lng };
  }
  return { latitude: 0, longitude: 0 };
}

export function mapProfileRow(row: Record<string, unknown>): Profile {
  return {
    id: row['id'] as string,
    username: row['username'] as string,
    displayName: (row['display_name'] as string | null) ?? null,
    avatarUrl: (row['avatar_url'] as string | null) ?? null,
    bio: (row['bio'] as string | null) ?? null,
    role: (row['role'] as Profile['role']) ?? 'user',
    xp: (row['xp'] as number) ?? 0,
    level: (row['level'] as number) ?? 1,
  };
}

export function mapLuridoRow(row: Record<string, unknown>): Lurido {
  return {
    id: row['id'] as string,
    name: row['name'] as string,
    slug: (row['slug'] as string | null) ?? null,
    description: (row['description'] as string | null) ?? null,
    address: (row['address'] as string | null) ?? null,
    neighborhood: (row['neighborhood'] as string | null) ?? null,
    phone: (row['phone'] as string | null) ?? null,
    location: parseLocation(row as { lat?: number; lng?: number }),
    hours: (row['hours'] as Lurido['hours']) ?? null,
    status: row['status'] as Lurido['status'],
    tempClosed: (row['temp_closed'] as boolean) ?? false,
    addedBy: (row['added_by'] as string | null) ?? null,
    approvedBy: (row['approved_by'] as string | null) ?? null,
    approvedAt: (row['approved_at'] as string | null) ?? null,
    createdAt: row['created_at'] as string,
    updatedAt: row['updated_at'] as string,
    avgRating: (row['avg_rating'] as number | undefined) ?? undefined,
    reviewCount: (row['review_count'] as number | undefined) ?? undefined,
  };
}

export function mapPhotoRow(row: Record<string, unknown>): Photo {
  return {
    id: row['id'] as string,
    luridoId: row['lurido_id'] as string,
    userId: (row['user_id'] as string | null) ?? null,
    url: row['url'] as string,
    caption: (row['caption'] as string | null) ?? null,
    sortOrder: (row['sort_order'] as number) ?? 0,
    blurhash: (row['blurhash'] as string | null) ?? null,
    createdAt: row['created_at'] as string,
  };
}

export function mapReviewRow(row: Record<string, unknown>): Review {
  return {
    id: row['id'] as string,
    luridoId: row['lurido_id'] as string,
    userId: row['user_id'] as string,
    stars: row['stars'] as Review['stars'],
    body: (row['body'] as string | null) ?? null,
    photoUrl: (row['photo_url'] as string | null) ?? null,
    createdAt: row['created_at'] as string,
  };
}

export function mapDishRow(row: Record<string, unknown>): Dish {
  return {
    id: row['id'] as string,
    luridoId: row['lurido_id'] as string,
    name: row['name'] as string,
    addedBy: (row['added_by'] as string | null) ?? null,
    votesCount: (row['votes_count'] as number | undefined) ?? undefined,
    viewerVoted: (row['viewer_voted'] as boolean | undefined) ?? undefined,
  };
}

export function mapNotificationRow(row: Record<string, unknown>): Notification {
  return {
    id: row['id'] as string,
    userId: row['user_id'] as string,
    type: row['type'] as Notification['type'],
    title: row['title'] as string,
    body: (row['body'] as string | null) ?? null,
    luridoId: (row['lurido_id'] as string | null) ?? null,
    readAt: (row['read_at'] as string | null) ?? null,
    createdAt: row['created_at'] as string,
  };
}

export function mapBadgeRow(row: Record<string, unknown>): Badge {
  return {
    id: row['id'] as string,
    name: row['name'] as string,
    description: row['description'] as string,
    emoji: row['emoji'] as string,
    rule: (row['rule'] as Record<string, unknown> | null) ?? null,
    sortOrder: (row['sort_order'] as number) ?? 0,
  };
}

export function mapUserBadgeRow(row: Record<string, unknown>): UserBadge {
  return {
    userId: row['user_id'] as string,
    badgeId: row['badge_id'] as string,
    unlockedAt: row['unlocked_at'] as string,
  };
}

export function mapSavedItemRow(row: Record<string, unknown>): SavedItem {
  return {
    userId: row['user_id'] as string,
    luridoId: row['lurido_id'] as string,
    createdAt: row['created_at'] as string,
  };
}

export function mapReviewReplyRow(row: Record<string, unknown>): ReviewReply {
  return {
    id: row['id'] as string,
    reviewId: row['review_id'] as string,
    userId: row['user_id'] as string,
    body: row['body'] as string,
    createdAt: row['created_at'] as string,
  };
}

export function mapReportRow(row: Record<string, unknown>): Report {
  return {
    id: row['id'] as string,
    reporterId: row['reporter_id'] as string,
    targetType: row['target_type'] as Report['targetType'],
    targetId: row['target_id'] as string,
    reason: row['reason'] as string,
    resolved: (row['resolved'] as boolean) ?? false,
    createdAt: row['created_at'] as string,
  };
}

export function mapReviewHelpfulRow(row: Record<string, unknown>): ReviewHelpful {
  return {
    reviewId: row['review_id'] as string,
    userId: row['user_id'] as string,
  };
}

export function mapExpoPushTokenRow(row: Record<string, unknown>): ExpoPushToken {
  return {
    userId: row['user_id'] as string,
    token: row['token'] as string,
    platform: row['platform'] as string,
    updatedAt: row['updated_at'] as string,
  };
}
