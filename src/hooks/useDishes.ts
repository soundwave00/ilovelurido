import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addDish, fetchDishes, unvoteDish, voteDish } from '@/lib/api/dishes';
import type { Dish } from '@/types/domain';

export function useDishes(luridoId: string, viewerUserId?: string) {
  return useQuery<Dish[]>({
    queryKey: ['dishes', luridoId, viewerUserId],
    queryFn: () => fetchDishes(luridoId, viewerUserId),
    enabled: !!luridoId,
  });
}

export function useVoteDish(luridoId: string, userId: string) {
  const qc = useQueryClient();
  const queryKey = ['dishes', luridoId, userId];

  return useMutation({
    mutationFn: ({ dishId, currentlyVoted }: { dishId: string; currentlyVoted: boolean }) =>
      currentlyVoted ? unvoteDish(dishId, userId) : voteDish(dishId, userId),

    onMutate: async ({ dishId, currentlyVoted }) => {
      await qc.cancelQueries({ queryKey });
      const previous = qc.getQueryData<Dish[]>(queryKey);
      qc.setQueryData<Dish[]>(queryKey, (old) =>
        (old ?? []).map((d) =>
          d.id === dishId
            ? {
                ...d,
                viewerVoted: !currentlyVoted,
                votesCount: (d.votesCount ?? 0) + (currentlyVoted ? -1 : 1),
              }
            : d,
        ),
      );
      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(queryKey, ctx.previous);
      }
    },

    onSettled: () => {
      void qc.invalidateQueries({ queryKey });
    },
  });
}

export function useAddDish(luridoId: string, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => addDish(luridoId, name, userId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['dishes', luridoId] });
    },
  });
}
