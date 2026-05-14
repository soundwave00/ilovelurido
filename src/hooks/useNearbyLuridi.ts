import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { fetchNearbyLuridi } from '@/lib/api/luridi';
import { DEFAULT_NEARBY_RADIUS_M } from '@/lib/constants/maps';
import type { Lurido } from '@/types/domain';

export function useNearbyLuridi(
  lat: number | null,
  lng: number | null,
  radiusM = DEFAULT_NEARBY_RADIUS_M,
) {
  const qc = useQueryClient();
  const enabled = lat !== null && lng !== null;

  const query = useQuery<Lurido[]>({
    queryKey: ['luridi', 'nearby', lat, lng, radiusM],
    queryFn: () => fetchNearbyLuridi(lat!, lng!, radiusM),
    enabled,
  });

  useEffect(() => {
    if (!enabled) return;
    const channelName = `luridi-realtime-${lat?.toFixed(3)}-${lng?.toFixed(3)}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'luridi' }, () => {
        void qc.invalidateQueries({ queryKey: ['luridi'] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, lat, lng, qc]);

  return query;
}
