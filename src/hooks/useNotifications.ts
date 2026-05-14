import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { fetchNotifications, markAllRead, markRead } from '@/lib/api/notifications';
import type { Notification } from '@/types/domain';

export function useNotifications(userId: string | undefined) {
  const qc = useQueryClient();

  const query = useQuery<Notification[]>({
    queryKey: ['notifications', userId],
    queryFn: () => fetchNotifications(userId!),
    enabled: !!userId,
  });

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`notifs-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, () => {
        void qc.invalidateQueries({ queryKey: ['notifications', userId] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, qc]);

  return query;
}

export function useMarkAllRead(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markAllRead(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', userId] }),
  });
}

export function useMarkRead(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', userId] }),
  });
}
