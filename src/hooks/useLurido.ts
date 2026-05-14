import { useQuery } from '@tanstack/react-query';
import { fetchLurido } from '@/lib/api/luridi';
import { fetchPhotos } from '@/lib/api/photos';
import type { Lurido, Photo } from '@/types/domain';

export function useLurido(id: string) {
  return useQuery<Lurido>({
    queryKey: ['lurido', id],
    queryFn: () => fetchLurido(id),
    enabled: !!id,
  });
}

export function useLuridoPhotos(luridoId: string) {
  return useQuery<Photo[]>({
    queryKey: ['lurido', luridoId, 'photos'],
    queryFn: () => fetchPhotos(luridoId),
    enabled: !!luridoId,
  });
}
