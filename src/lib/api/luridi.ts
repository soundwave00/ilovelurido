import { supabase } from '@/lib/supabase';
import { mapLuridoRow } from '@/lib/utils/rowMappers';
import type { Lurido, LuridoStatus } from '@/types/domain';

export async function fetchNearbyLuridi(
  lat: number,
  lng: number,
  radiusM = 2000,
): Promise<Lurido[]> {
  const { data, error } = await supabase.rpc('nearby_luridi', {
    lat,
    lng,
    radius_m: radiusM,
  });
  if (error) throw error;
  return (data ?? []).map((row: Record<string, unknown>) => mapLuridoRow(row));
}

export async function fetchLurido(id: string): Promise<Lurido> {
  const { data, error } = await supabase
    .from('luridi_with_stats')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return mapLuridoRow(data as Record<string, unknown>);
}

export async function searchLuridi(q: string, limitN = 30): Promise<Lurido[]> {
  const { data, error } = await supabase.rpc('search_luridi', { q, limit_n: limitN });
  if (error) throw error;
  return (data ?? []).map((row: Record<string, unknown>) => mapLuridoRow(row));
}

export interface CreateLuridoInput {
  name: string;
  neighborhood: string;
  description?: string;
  address?: string;
  lat: number;
  lng: number;
  hours?: Lurido['hours'];
}

export async function createLurido(
  input: CreateLuridoInput,
  userId: string,
): Promise<string> {
  const { data, error } = await supabase
    .from('luridi')
    .insert({
      name: input.name,
      neighborhood: input.neighborhood,
      description: input.description ?? null,
      address: input.address ?? null,
      location: `POINT(${input.lng} ${input.lat})`,
      hours: input.hours ?? null,
      status: 'pending' as LuridoStatus,
      added_by: userId,
    })
    .select('id')
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
}

export async function fetchPendingLuridi(): Promise<Lurido[]> {
  const { data, error } = await supabase
    .from('luridi')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row: Record<string, unknown>) => mapLuridoRow(row));
}

export async function moderateLurido(
  id: string,
  action: 'approve' | 'reject',
  reason?: string,
): Promise<void> {
  const { error } = await supabase.rpc('moderate_lurido', {
    p_id: id,
    p_action: action,
    p_reason: reason ?? null,
  });
  if (error) throw error;
}
