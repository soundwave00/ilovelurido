import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type SavedState = {
  savedIds: Set<string>;
  setSavedIds: (ids: string[]) => void;
  toggle: (luridoId: string) => void;
  isSaved: (luridoId: string) => boolean;
};

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      savedIds: new Set<string>(),
      setSavedIds: (ids) => set({ savedIds: new Set(ids) }),
      toggle: (id) =>
        set((s) => {
          const next = new Set(s.savedIds);
          if (next.has(id)) {
            next.delete(id);
          } else {
            next.add(id);
          }
          return { savedIds: next };
        }),
      isSaved: (id) => get().savedIds.has(id),
    }),
    {
      name: 'l.saved',
      storage: createJSONStorage(() => AsyncStorage),
      // Set non è JSON-serializzabile: serializza come array
      partialize: (s) => ({ savedIds: [...s.savedIds] }),
      merge: (persisted, current) => ({
        ...current,
        savedIds: new Set((persisted as { savedIds: string[] }).savedIds ?? []),
      }),
    },
  ),
);
