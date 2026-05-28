// Domain types — shape che usiamo nell'app, indipendente dallo schema DB grezzo.
// Quando `src/types/db.ts` sarà rigenerato da Supabase, mappa row → domain in
// src/features/**/api.ts.

export type UserRole = 'user' | 'moderator' | 'admin';
export type LuridoStatus = 'pending' | 'approved' | 'rejected';
export type NotifType = 'approved' | 'rejected' | 'nearby' | 'reply' | 'badge' | 'nottambulo';
export type ReportTarget = 'lurido' | 'review' | 'photo';

export interface Profile {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  role: UserRole;
  xp: number;
  level: number;
}

export interface Coord {
  latitude: number;
  longitude: number;
}

export interface Lurido {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  address: string | null;
  neighborhood: string | null;
  phone: string | null;
  location: Coord;
  hours: Partial<Record<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun', [string, string]>> | null;
  status: LuridoStatus;
  tempClosed: boolean;
  addedBy: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Aggregati da `luridi_with_stats`
  avgRating?: number;
  reviewCount?: number;
  // Prima foto del lurido (da subquery in RPC nearby/search)
  coverPhotoUrl?: string | null;
  // Place ID Google Maps (null = non ancora cercato, 'NOT_FOUND' = confermato non su Maps)
  googlePlaceId?: string | null;
}

export interface Photo {
  id: string;
  luridoId: string;
  userId: string | null;
  url: string;
  caption: string | null;
  sortOrder: number;
  blurhash: string | null;
  createdAt: string;
}

export interface Review {
  id: string;
  luridoId: string;
  userId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  body: string | null;
  photoUrl: string | null;
  createdAt: string;
}

export interface Dish {
  id: string;
  luridoId: string;
  name: string;
  addedBy: string | null;
  votesCount?: number;
  viewerVoted?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotifType;
  title: string;
  body: string | null;
  luridoId: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  rule: Record<string, unknown> | null;
  sortOrder: number;
}

export interface UserBadge {
  userId: string;
  badgeId: string;
  unlockedAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: ReportTarget;
  targetId: string;
  reason: string;
  resolved: boolean;
  createdAt: string;
}

export interface SavedItem {
  userId: string;
  luridoId: string;
  createdAt: string;
}

export interface ReviewReply {
  id: string;
  reviewId: string;
  userId: string;
  body: string;
  createdAt: string;
}

export interface ReviewHelpful {
  reviewId: string;
  userId: string;
}

export interface ExpoPushToken {
  userId: string;
  token: string;
  platform: string;
  updatedAt: string;
}

export interface UserStats {
  reviewCount: number;
  luridoCount: number;
  savedCount: number;
  upvotesReceived: number;
}
