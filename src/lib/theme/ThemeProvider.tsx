import AsyncStorage from '@react-native-async-storage/async-storage';
import { vars } from 'nativewind';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { ACCENTS, DAY, NIGHT, type AccentName, type Palette } from './tokens';

const STORAGE_MODE_KEY = 'l.theme.mode';
const STORAGE_ACCENT_KEY = 'l.theme.accent';

export type ThemeMode = 'day' | 'night';

type ThemeContextValue = {
  mode: ThemeMode;
  accent: AccentName;
  palette: Palette;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setAccent: (name: AccentName) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
  children: ReactNode;
  /** Default mode. Day/night toggle is manual (brief: "non basarti su Appearance"). */
  defaultMode?: ThemeMode;
  defaultAccent?: AccentName;
};

/**
 * Applies the selected day/night palette + accent as CSS variables so
 * NativeWind's `var(--l-*)` classes pick them up at runtime.
 */
export function ThemeProvider({
  children,
  defaultMode = 'night',
  defaultAccent = 'ambra',
}: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(defaultMode);
  const [accent, setAccentState] = useState<AccentName>(defaultAccent);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void Promise.all([
      AsyncStorage.getItem(STORAGE_MODE_KEY),
      AsyncStorage.getItem(STORAGE_ACCENT_KEY),
    ]).then(([savedMode, savedAccent]) => {
      if (savedMode === 'day' || savedMode === 'night') setModeState(savedMode);
      if (savedAccent && savedAccent in ACCENTS) setAccentState(savedAccent as AccentName);
      setLoaded(true);
    });
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    void AsyncStorage.setItem(STORAGE_MODE_KEY, m);
    setModeState(m);
  }, []);

  const setAccent = useCallback((name: AccentName) => {
    void AsyncStorage.setItem(STORAGE_ACCENT_KEY, name);
    setAccentState(name);
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === 'day' ? 'night' : 'day');
  }, [mode, setMode]);

  const palette = mode === 'day' ? DAY : NIGHT;
  const accentTokens = ACCENTS[accent];

  const cssVars = useMemo(
    () =>
      vars({
        '--l-bg': palette.bg,
        '--l-surface': palette.surface,
        '--l-surface-alt': palette.surfaceAlt,
        '--l-border': palette.border,
        '--l-border-strong': palette.borderStrong,
        '--l-text': palette.text,
        '--l-text-muted': palette.textMuted,
        '--l-text-faint': palette.textFaint,
        '--l-chip': palette.chip,
        '--l-success': palette.success,
        '--l-danger': palette.danger,
        '--l-accent': accentTokens.base,
        '--l-accent-glow': accentTokens.glow,
        '--l-accent-ink': accentTokens.ink,
      }),
    [palette, accentTokens],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, accent, palette, setMode, toggleMode, setAccent }),
    [mode, accent, palette, toggleMode],
  );

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={value}>
      <View style={cssVars} className="flex-1 bg-l-bg">
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme() must be used inside <ThemeProvider>');
  }
  return ctx;
}
