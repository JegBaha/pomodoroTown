/**
 * Design Token System
 * Pomodoro Town - Minimal & Modern Design
 */

// =============================================================================
// SPACING SCALE (4px base unit)
// =============================================================================
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

// =============================================================================
// TYPOGRAPHY SCALE
// =============================================================================
export const typography = {
  caption: { size: 12, lineHeight: 16, weight: '400' as const },
  body: { size: 14, lineHeight: 20, weight: '400' as const },
  bodyMedium: { size: 14, lineHeight: 20, weight: '500' as const },
  bodySemiBold: { size: 14, lineHeight: 20, weight: '600' as const },
  subtitle: { size: 16, lineHeight: 22, weight: '600' as const },
  title: { size: 20, lineHeight: 26, weight: '700' as const },
  headline: { size: 24, lineHeight: 30, weight: '700' as const },
  display: { size: 32, lineHeight: 38, weight: '800' as const },
} as const;

// =============================================================================
// BORDER RADIUS SCALE
// =============================================================================
export const radius = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  xxl: 28,
  full: 9999,
} as const;

// =============================================================================
// SHADOW / ELEVATION SYSTEM
// =============================================================================
export const shadows = {
  none: {
    shadowColor: '#000',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
} as const;

// =============================================================================
// COLOR PALETTE - LIGHT THEME
// =============================================================================
const lightColors = {
  // Backgrounds
  background: '#f8fafc',
  backgroundSecondary: '#f1f5f9',
  surface: '#ffffff',
  surfaceSecondary: '#f8fafc',
  surfaceElevated: 'rgba(255,255,255,0.97)',

  // Borders
  border: 'rgba(0,0,0,0.06)',
  borderStrong: 'rgba(0,0,0,0.10)',
  borderFocus: 'rgba(14,165,233,0.4)',

  // Text
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  textInverse: '#ffffff',

  // Accent (Primary brand color)
  accent: '#0ea5e9',
  accentHover: '#0284c7',
  accentSoft: 'rgba(14,165,233,0.10)',
  accentMuted: 'rgba(14,165,233,0.05)',

  // Secondary accent
  secondary: '#8b5cf6',
  secondarySoft: 'rgba(139,92,246,0.10)',

  // Status colors
  success: '#22c55e',
  successSoft: 'rgba(34,197,94,0.10)',
  warning: '#f59e0b',
  warningSoft: 'rgba(245,158,11,0.10)',
  error: '#ef4444',
  errorSoft: 'rgba(239,68,68,0.10)',

  // Resource colors
  gold: '#f59e0b',
  wood: '#a16207',
  stone: '#64748b',
  food: '#22c55e',

  // Building colors (for pixel art)
  buildingTownHall: '#6366f1',
  buildingTownHallLight: '#a5b4fc',
  buildingFarm: '#22c55e',
  buildingFarmLight: '#86efac',
  buildingSawmill: '#a16207',
  buildingSawmillLight: '#fbbf24',
  buildingMine: '#64748b',
  buildingMineLight: '#cbd5e1',
  buildingMarket: '#f59e0b',
  buildingMarketLight: '#fde047',
  buildingDecor: '#10b981',
  buildingDecorLight: '#6ee7b7',

  // Map/Grid colors
  mapTile: '#e2e8f0',
  mapTileAlt: '#f1f5f9',
  mapGrid: 'rgba(0,0,0,0.04)',
  mapShadow: 'rgba(0,0,0,0.08)',

  // Overlay
  overlay: 'rgba(0,0,0,0.4)',
  overlayLight: 'rgba(0,0,0,0.2)',
} as const;

// =============================================================================
// COLOR PALETTE - DARK THEME
// =============================================================================
const darkColors = {
  // Backgrounds
  background: '#0a0f1a',
  backgroundSecondary: '#0f1629',
  surface: '#151d2e',
  surfaceSecondary: '#1a2439',
  surfaceElevated: 'rgba(21,29,46,0.97)',

  // Borders
  border: 'rgba(255,255,255,0.06)',
  borderStrong: 'rgba(255,255,255,0.10)',
  borderFocus: 'rgba(56,189,248,0.4)',

  // Text
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  textInverse: '#0f172a',

  // Accent (Primary brand color)
  accent: '#38bdf8',
  accentHover: '#7dd3fc',
  accentSoft: 'rgba(56,189,248,0.12)',
  accentMuted: 'rgba(56,189,248,0.06)',

  // Secondary accent
  secondary: '#a78bfa',
  secondarySoft: 'rgba(167,139,250,0.12)',

  // Status colors
  success: '#4ade80',
  successSoft: 'rgba(74,222,128,0.12)',
  warning: '#fbbf24',
  warningSoft: 'rgba(251,191,36,0.12)',
  error: '#f87171',
  errorSoft: 'rgba(248,113,113,0.12)',

  // Resource colors
  gold: '#fbbf24',
  wood: '#ca8a04',
  stone: '#94a3b8',
  food: '#4ade80',

  // Building colors (for pixel art)
  buildingTownHall: '#818cf8',
  buildingTownHallLight: '#c7d2fe',
  buildingFarm: '#4ade80',
  buildingFarmLight: '#bbf7d0',
  buildingSawmill: '#ca8a04',
  buildingSawmillLight: '#fde047',
  buildingMine: '#94a3b8',
  buildingMineLight: '#e2e8f0',
  buildingMarket: '#fbbf24',
  buildingMarketLight: '#fef08a',
  buildingDecor: '#34d399',
  buildingDecorLight: '#a7f3d0',

  // Map/Grid colors
  mapTile: '#1a2439',
  mapTileAlt: '#151d2e',
  mapGrid: 'rgba(255,255,255,0.04)',
  mapShadow: 'rgba(0,0,0,0.3)',

  // Overlay
  overlay: 'rgba(0,0,0,0.6)',
  overlayLight: 'rgba(0,0,0,0.4)',
} as const;

// =============================================================================
// PALETTE EXPORT
// =============================================================================
export const palette = {
  light: lightColors,
  dark: darkColors,
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================
// Use a generic color type that works for both light and dark palettes
export type ColorPalette = {
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceSecondary: string;
  surfaceElevated: string;
  border: string;
  borderStrong: string;
  borderFocus: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  accent: string;
  accentHover: string;
  accentSoft: string;
  accentMuted: string;
  secondary: string;
  secondarySoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  error: string;
  errorSoft: string;
  gold: string;
  wood: string;
  stone: string;
  food: string;
  buildingTownHall: string;
  buildingTownHallLight: string;
  buildingFarm: string;
  buildingFarmLight: string;
  buildingSawmill: string;
  buildingSawmillLight: string;
  buildingMine: string;
  buildingMineLight: string;
  buildingMarket: string;
  buildingMarketLight: string;
  buildingDecor: string;
  buildingDecorLight: string;
  mapTile: string;
  mapTileAlt: string;
  mapGrid: string;
  mapShadow: string;
  overlay: string;
  overlayLight: string;
};
export type SpacingScale = typeof spacing;
export type TypographyScale = typeof typography;
export type RadiusScale = typeof radius;
export type ShadowScale = typeof shadows;

// =============================================================================
// BREAKPOINTS
// =============================================================================
export const breakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
} as const;

// =============================================================================
// ANIMATION DURATIONS
// =============================================================================
export const durations = {
  instant: 100,
  fast: 150,
  normal: 250,
  slow: 400,
  slower: 600,
} as const;

// =============================================================================
// Z-INDEX SCALE
// =============================================================================
export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  modal: 300,
  popover: 400,
  tooltip: 500,
  toast: 600,
} as const;
