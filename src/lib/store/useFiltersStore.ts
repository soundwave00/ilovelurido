import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type SortOption = 'rating' | 'recent' | 'nearby';

type FiltersState = {
  openNow: boolean;
  minStars: 0 | 4;
  veggie: boolean;
  nearby: boolean;
  isNew: boolean;
  sort: SortOption;
  searchQuery: string;
  setOpenNow: (v: boolean) => void;
  setMinStars: (v: 0 | 4) => void;
  setVeggie: (v: boolean) => void;
  setNearby: (v: boolean) => void;
  setIsNew: (v: boolean) => void;
  setSort: (v: SortOption) => void;
  setSearchQuery: (q: string) => void;
  reset: () => void;
};

export const useFiltersStore = create<FiltersState>()(
  persist(
    (set) => ({
      openNow: false,
      minStars: 0,
      veggie: false,
      nearby: false,
      isNew: false,
      sort: 'nearby',
      searchQuery: '',
      setOpenNow: (v) => set({ openNow: v }),
      setMinStars: (v) => set({ minStars: v }),
      setVeggie: (v) => set({ veggie: v }),
      setNearby: (v) => set({ nearby: v }),
      setIsNew: (v) => set({ isNew: v }),
      setSort: (v) => set({ sort: v }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      reset: () =>
        set({ openNow: false, minStars: 0, veggie: false, nearby: false, isNew: false, sort: 'nearby' }),
    }),
    {
      name: 'l.filters',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        openNow: s.openNow,
        minStars: s.minStars,
        veggie: s.veggie,
        nearby: s.nearby,
        isNew: s.isNew,
        sort: s.sort,
      }),
    },
  ),
);
