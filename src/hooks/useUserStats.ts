import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { UserStats } from '@/types/domain';

async function fetchUserStats(userId: string): Promise<UserStats> {
  const [reviewsRes, luridoRes, savedRes, votesRes] = await Promise.all([
    supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('luridi').select('id', { count: 'exact', head: true }).eq('added_by', userId).eq('status', 'approved'),
    supabase.from('saved_luridi').select('lurido_id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase
      .from('dish_votes')
      .select('id', { count: 'exact', head: true })
      .in(
        'dish_id',
        (
          await supabase.from('dishes').select('id').eq('added_by', userId)
        ).data?.map((d: { id: string }) => d.id) ?? [],
      ),
  ]);

  return {
    reviewCount: reviewsRes.count ?? 0,
    luridoCount: luridoRes.count ?? 0,
    savedCount: savedRes.count ?? 0,
    upvotesReceived: votesRes.count ?? 0,
  };
}

export function useUserStats(userId: string | undefined) {
  return useQuery<UserStats>({
    queryKey: ['user', userId, 'stats'],
    queryFn: () => fetchUserStats(userId!),
    enabled: !!userId,
  });
}
