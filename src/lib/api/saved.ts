import { supabase } from '@/lib/supabase';
import { mapSavedItemRow } from '@/lib/utils/rowMappers';
import type { SavedItem } from '@/types/domain';

export async function fetchSaved(userId: string): Promise<SavedItem[]> {
  const { data, error } = await supabase
    .from('saved_luridi')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r: Record<string, unknown>) => mapSavedItemRow(r));
}

export async function saveLurido(luridoId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('saved_luridi')
    .insert({ lurido_id: luridoId, user_id: userId });
  if (error) throw error;
}

export async function unsaveLurido(luridoId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('saved_luridi')
    .delete()
    .eq('lurido_id', luridoId)
    .eq('user_id', userId);
  if (error) throw error;
}
