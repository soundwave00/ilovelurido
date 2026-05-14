import { useQuery } from '@tanstack/react-query';
import { searchLuridi } from '@/lib/api/luridi';
import type { Lurido } from '@/types/domain';

export function useSearch(q: string) {
  return useQuery<Lurido[]>({
    queryKey: ['search', q],
    queryFn: () => searchLuridi(q),
    enabled: q.trim().length >= 2,
    staleTime: 15_000,
  });
}
