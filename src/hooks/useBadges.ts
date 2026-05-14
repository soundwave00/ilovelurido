import { useQuery } from '@tanstack/react-query';
import { fetchBadges, fetchUserBadges } from '@/lib/api/badges';
import type { Badge, UserBadge } from '@/types/domain';

export function useBadges() {
  return useQuery<Badge[]>({
    queryKey: ['badges'],
    queryFn: fetchBadges,
    staleTime: 5 * 60 * 1000, // badge catalog cambia raramente
  });
}

export function useUserBadges(userId: string | undefined) {
  return useQuery<UserBadge[]>({
    queryKey: ['user', userId, 'badges'],
    queryFn: () => fetchUserBadges(userId!),
    enabled: !!userId,
  });
}
