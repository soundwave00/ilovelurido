import { supabase } from '@/lib/supabase';
import { mapLuridoRow } from '@/lib/utils/rowMappers';
import type { Lurido } from '@/types/domain';

export interface ModStats {
  pendingCount: number;
  totalApproved: number;
  approvedToday: number;
}

export async function fetchModStats(): Promise<ModStats> {
  const [pendingRes, approvedRes, todayRes] = await Promise.all([
    supabase.from('luridi').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('luridi').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase
      .from('luridi')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')
      .gte('approved_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
  ]);

  return {
    pendingCount: pendingRes.count ?? 0,
    totalApproved: approvedRes.count ?? 0,
    approvedToday: todayRes.count ?? 0,
  };
}

export async function fetchPendingQueue(): Promise<Lurido[]> {
  const { data, error } = await supabase
    .from('luridi')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: Record<string, unknown>) => mapLuridoRow(r));
}

export async function approve(luridoId: string): Promise<void> {
  const { error } = await supabase.rpc('moderate_lurido', {
    p_id: luridoId,
    p_action: 'approve',
    p_reason: null,
  });
  if (error) throw error;
}

export async function reject(luridoId: string, reason: string): Promise<void> {
  const { error } = await supabase.rpc('moderate_lurido', {
    p_id: luridoId,
    p_action: 'reject',
    p_reason: reason,
  });
  if (error) throw error;
}
