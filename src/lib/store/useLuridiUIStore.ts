import { create } from 'zustand';

type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type ViewMode = 'map' | 'list';

type LuridiUIState = {
  selectedLuridoId: string | null;
  mapRegion: MapRegion | null;
  viewMode: ViewMode;
  setSelectedLuridoId: (id: string | null) => void;
  setMapRegion: (region: MapRegion) => void;
  setViewMode: (mode: ViewMode) => void;
};

export const useLuridiUIStore = create<LuridiUIState>((set) => ({
  selectedLuridoId: null,
  mapRegion: null,
  viewMode: 'map',
  setSelectedLuridoId: (id) => set({ selectedLuridoId: id }),
  setMapRegion: (region) => set({ mapRegion: region }),
  setViewMode: (mode) => set({ viewMode: mode }),
}));
