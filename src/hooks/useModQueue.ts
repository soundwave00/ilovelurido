import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { approve, fetchModStats, fetchPendingQueue, reject } from '@/lib/api/moderation';
import type { Lurido } from '@/types/domain';
import type { ModStats } from '@/lib/api/moderation';

export function useModQueue() {
  const qc = useQueryClient();

  const queue = useQuery<Lurido[]>({
    queryKey: ['mod', 'queue'],
    queryFn: fetchPendingQueue,
  });

  useEffect(() => {
    const channel = supabase
      .channel('mod-queue')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'luridi', filter: "status=eq.pending" }, () => {
        void qc.invalidateQueries({ queryKey: ['mod'] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc]);

  const approveMutation = useMutation({
    mutationFn: (id: string) => approve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mod'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => reject(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mod'] }),
  });

  return { queue, approveMutation, rejectMutation };
}

export function useModStats() {
  return useQuery<ModStats>({
    queryKey: ['mod', 'stats'],
    queryFn: fetchModStats,
  });
}
