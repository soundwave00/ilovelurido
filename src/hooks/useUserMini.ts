import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { mapProfileRow } from '@/lib/utils/rowMappers';
import type { Profile } from '@/types/domain';

export function useUserMini(userId: string | null | undefined) {
  return useQuery<Pick<Profile, 'id' | 'username' | 'displayName' | 'avatarUrl'>>({
    queryKey: ['user', 'mini', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .eq('id', userId!)
        .single();
      if (error) throw error;
      const p = mapProfileRow(data as Record<string, unknown>);
      return { id: p.id, username: p.username, displayName: p.displayName, avatarUrl: p.avatarUrl };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
