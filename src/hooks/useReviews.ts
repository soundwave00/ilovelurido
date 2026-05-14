import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createReview, fetchReviews } from '@/lib/api/reviews';
import type { CreateReviewInput } from '@/lib/api/reviews';
import type { Review } from '@/types/domain';

export function useReviews(luridoId: string) {
  return useQuery<Review[]>({
    queryKey: ['reviews', luridoId],
    queryFn: () => fetchReviews(luridoId),
    enabled: !!luridoId,
  });
}

export function useCreateReview(luridoId: string, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReviewInput) => createReview(input, userId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['reviews', luridoId] });
      void qc.invalidateQueries({ queryKey: ['lurido', luridoId] });
    },
  });
}
