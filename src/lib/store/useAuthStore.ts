import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';
import { supabase } from '../supabase';
import { mapProfileRow } from '@/lib/utils/rowMappers';
import type { Profile } from '@/types/domain';

type AuthState = {
  session: Session | null;
  profile: Profile | null;
  /** true finché non abbiamo caricato la session iniziale da AsyncStorage. */
  initializing: boolean;

  hydrate: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
};

async function loadProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, bio, role, xp, level')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return mapProfileRow(data as Record<string, unknown>);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  initializing: true,

  hydrate: async () => {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    const profile = session ? await loadProfile(session.user.id) : null;
    set({ session, profile, initializing: false });

    // Subscribe to future changes (login/logout/token refresh)
    supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!nextSession) {
        set({ session: null, profile: null });
        return;
      }
      // Evita refetch profilo se lo user è lo stesso
      const currentId = get().session?.user.id;
      const nextProfile =
        currentId === nextSession.user.id && get().profile
          ? get().profile
          : await loadProfile(nextSession.user.id);
      set({ session: nextSession, profile: nextProfile });
    });
  },

  signInWithPassword: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  signUpWithPassword: async (email, password, username) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) throw error;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null });
  },
}));

/** True se user è mod o admin (per mostrare la tab "Mod"). */
export const selectIsMod = (s: AuthState): boolean =>
  s.profile?.role === 'moderator' || s.profile?.role === 'admin';
