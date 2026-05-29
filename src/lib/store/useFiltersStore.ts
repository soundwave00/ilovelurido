import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type SortOption = 'rating' | 'recent' | 'nearby';

export type FoodCategory = 'burger' | 'panino' | 'pizza' | 'salamella' | 'wurstel' | 'veggie' | 'birra' | 'fritto';

export const FOOD_CATEGORY_KEYWORDS: Record<FoodCategory, string[]> = {
  burger:    ['hamburger', 'burger', 'cheeseburger', 'mcfalson', 'smash'],
  panino:    ['panino', 'panini', 'sandwich', 'paninoteca', 'tramezzino'],
  pizza:     ['pizza', 'trancio', 'focaccia', 'pizzeria', 'panzerotto'],
  salamella: ['salamella', 'salame', 'salamellaz', 'salsiccia'],
  wurstel:   ['wurstel', 'hot dog', 'hotdog', 'würstel'],
  veggie:    ['veggi', 'vegan', 'vegano', 'vegetarian', 'veggie'],
  birra:     ['birra', 'beer', 'cocktail', 'bibite'],
  fritto:    ['fritto', 'fritta', 'panzerotto', 'frittella'],
};

type FiltersState = {
  openNow: boolean;
  minStars: 0 | 4;
  veggie: boolean;
  nearby: boolean;
  isNew: boolean;
  sort: SortOption;
  searchQuery: string;
  foodCategories: FoodCategory[];
  setOpenNow: (v: boolean) => void;
  setMinStars: (v: 0 | 4) => void;
  setVeggie: (v: boolean) => void;
  setNearby: (v: boolean) => void;
  setIsNew: (v: boolean) => void;
  setSort: (v: SortOption) => void;
  setSearchQuery: (q: string) => void;
  toggleFoodCategory: (c: FoodCategory) => void;
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
      foodCategories: [],
      setOpenNow: (v) => set({ openNow: v }),
      setMinStars: (v) => set({ minStars: v }),
      setVeggie: (v) => set({ veggie: v }),
      setNearby: (v) => set({ nearby: v }),
      setIsNew: (v) => set({ isNew: v }),
      setSort: (v) => set({ sort: v }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      toggleFoodCategory: (c) =>
        set((s) => ({
          foodCategories: s.foodCategories.includes(c)
            ? s.foodCategories.filter((x) => x !== c)
            : [...s.foodCategories, c],
        })),
      reset: () =>
        set({ openNow: false, minStars: 0, veggie: false, nearby: false, isNew: false, sort: 'nearby', foodCategories: [] }),
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
        foodCategories: s.foodCategories,
      }),
    },
  ),
);
