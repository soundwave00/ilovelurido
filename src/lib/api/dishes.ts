import { supabase } from '@/lib/supabase';
import { mapDishRow } from '@/lib/utils/rowMappers';
import type { Dish } from '@/types/domain';

export async function fetchDishes(luridoId: string, viewerUserId?: string): Promise<Dish[]> {
  const { data, error } = await supabase
    .from('dishes')
    .select('*, dish_votes(count)')
    .eq('lurido_id', luridoId)
    .order('created_at', { ascending: true });
  if (error) throw error;

  const dishes = (data ?? []).map((row: Record<string, unknown>) => {
    const voteRows = row['dish_votes'] as Array<{ count: number }> | undefined;
    return {
      ...mapDishRow(row),
      votesCount: voteRows?.[0]?.count ?? 0,
    };
  });

  if (!viewerUserId) return dishes;

  // Recupera i voti del viewer per questo lurido
  const dishIds = dishes.map((d) => d.id);
  if (dishIds.length === 0) return dishes;

  const { data: myVotes } = await supabase
    .from('dish_votes')
    .select('dish_id')
    .in('dish_id', dishIds)
    .eq('user_id', viewerUserId);

  const votedSet = new Set((myVotes ?? []).map((v: { dish_id: string }) => v.dish_id));
  return dishes.map((d) => ({ ...d, viewerVoted: votedSet.has(d.id) }));
}

export async function addDish(luridoId: string, name: string, userId: string): Promise<Dish> {
  const { data, error } = await supabase
    .from('dishes')
    .insert({ lurido_id: luridoId, name, added_by: userId })
    .select()
    .single();
  if (error) throw error;
  return mapDishRow(data as Record<string, unknown>);
}

export async function voteDish(dishId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('dish_votes')
    .insert({ dish_id: dishId, user_id: userId });
  if (error) throw error;
}

export async function unvoteDish(dishId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('dish_votes')
    .delete()
    .eq('dish_id', dishId)
    .eq('user_id', userId);
  if (error) throw error;
}
