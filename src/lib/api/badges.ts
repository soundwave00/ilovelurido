import { supabase } from '@/lib/supabase';
import { mapBadgeRow, mapUserBadgeRow } from '@/lib/utils/rowMappers';
import type { Badge, UserBadge } from '@/types/domain';

export async function fetchBadges(): Promise<Badge[]> {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: Record<string, unknown>) => mapBadgeRow(r));
}

export async function fetchUserBadges(userId: string): Promise<UserBadge[]> {
  const { data, error } = await supabase
    .from('user_badges')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((r: Record<string, unknown>) => mapUserBadgeRow(r));
}
