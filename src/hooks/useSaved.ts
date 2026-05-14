import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchSaved, saveLurido, unsaveLurido } from '@/lib/api/saved';
import type { SavedItem } from '@/types/domain';

export function useSaved(userId: string | undefined) {
  return useQuery<SavedItem[]>({
    queryKey: ['saved', userId],
    queryFn: () => fetchSaved(userId!),
    enabled: !!userId,
  });
}

export function useToggleSaved(luridoId: string, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (isSaved: boolean) =>
      isSaved ? unsaveLurido(luridoId, userId) : saveLurido(luridoId, userId),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['saved', userId] });
    },
  });
}
