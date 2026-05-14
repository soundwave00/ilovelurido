// Design tokens — single source of truth.
// Ported from `_design/app/tokens.jsx` (`LURIDO_TOKENS`).
// NON inlineare hex nei componenti: importa da qui.

export const DAY = {
  bg: '#faf6f0',
  surface: '#ffffff',
  surfaceAlt: '#f3ede3',
  border: 'rgba(60,40,20,0.08)',
  borderStrong: 'rgba(60,40,20,0.16)',
  text: '#1a1512',
  textMuted: 'rgba(26,21,18,0.6)',
  textFaint: 'rgba(26,21,18,0.4)',
  chip: '#ede4d3',
  success: '#4a7c3a',
  danger: '#b94a3a',
  mapBg: '#f0e8d8',
  mapRoad: '#ffffff',
  mapRoadStroke: 'rgba(60,40,20,0.08)',
  mapGreen: '#d4e0b8',
  mapWater: '#b8d4d8',
} as const;

export const NIGHT = {
  bg: '#120d0a',
  surface: '#1c1613',
  surfaceAlt: '#251d19',
  border: 'rgba(255,220,180,0.08)',
  borderStrong: 'rgba(255,220,180,0.16)',
  text: '#f5ead8',
  textMuted: 'rgba(245,234,216,0.6)',
  textFaint: 'rgba(245,234,216,0.35)',
  chip: '#2a211b',
  success: '#8dbf7a',
  danger: '#e88878',
  mapBg: '#0f0a08',
  mapRoad: '#1e1612',
  mapRoadStroke: 'rgba(255,220,180,0.06)',
  mapGreen: '#1a1e14',
  mapWater: '#0c1418',
} as const;

export type Palette = { readonly [K in keyof typeof DAY]: string };

export const ACCENTS = {
  ambra: { base: '#f59e42', glow: '#ffc278', ink: '#2a1a08' },
  ocra: { base: '#e8a33d', glow: '#f5c06a', ink: '#2a1e08' },
  corallo: { base: '#ff6b35', glow: '#ff9570', ink: '#2a1008' },
  limone: { base: '#fbbf24', glow: '#fde182', ink: '#2a2008' },
  brace: { base: '#d97706', glow: '#f39537', ink: '#2a1608' },
} as const;

export type AccentName = keyof typeof ACCENTS;
export type Accent = (typeof ACCENTS)[AccentName];

export const RADII = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 9999,
} as const;

export const SPACING = {
  screenPadding: 18,
  cardGap: 12,
  cardRadius: 14,
  sheetTopRadius: 20,
} as const;

// Shadow helpers — usa come style.shadow* su iOS / elevation su Android.
export const SHADOWS = {
  day: {
    sm: {
      shadowColor: '#3c2814',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    md: {
      shadowColor: '#3c2814',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 5,
    },
    lg: {
      shadowColor: '#3c2814',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.16,
      shadowRadius: 48,
      elevation: 10,
    },
  },
  night: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.5,
      shadowRadius: 32,
      elevation: 8,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 24 },
      shadowOpacity: 0.6,
      shadowRadius: 60,
      elevation: 14,
    },
  },
} as const;

export const ANIM = {
  micro: 180,
  medium: 260,
  entry: 380,
  // Cubic-bezier del brief: Easing.bezier(0.2, 0.7, 0.3, 1)
  easing: [0.2, 0.7, 0.3, 1] as const,
} as const;
