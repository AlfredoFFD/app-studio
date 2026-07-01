/**
 * Design tokens for the App Studio factory template.
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  PER-APP RESKIN POINT                                            │
 * │  To reskin for a new app, change `Brand` + `Gradients` below,    │
 * │  and optionally `Fonts`. Everything else (Spacing, Radii, Type   │
 * │  scale, Glow) stays constant so the system reads consistent.     │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * App #001: AI Dance — direction "Afterglow / Midnight Stage".
 * The gradient is ATMOSPHERE (a stage light), never a surface fill; surfaces
 * are flat warm-dark; bold display type is the hero; the photo stage is spotlit.
 * Dark-first (app.json forces `userInterfaceStyle: dark`).
 */

import '@/global.css';

import { Platform } from 'react-native';

// --- PER-APP BRAND (reskin here) -------------------------------------------
const Brand = {
  tint: '#FF477E', // coral-magenta primary
  tintPressed: '#E63A6C',
  iris: '#8B6BFF', // violet depth
  spark: '#46E5FF', // cyan highlight
  accentSoft: 'rgba(255,71,126,0.14)', // translucent tint (selected chips)
} as const;

export const Gradients = {
  /** Hero atmosphere (diagonal stage light). NOT a button fill. */
  stageLight: ['#FF477E', '#8B6BFF', '#0B0710'] as const,
  /** Radial spotlight behind the subject. */
  spotlight: ['rgba(255,92,138,0.42)', 'transparent'] as const,
  /** Bottom scrim over the stage. */
  scrim: ['transparent', 'rgba(8,5,12,0.85)'] as const,
  /** Background wash (kept as `brand`/`wash`/`washDark` for back-compat). */
  brand: ['#FF477E', '#8B6BFF'] as const,
  wash: ['#160C20', '#0B0710'] as const,
  washDark: ['#160C20', '#0B0710'] as const,
};
// ---------------------------------------------------------------------------

// Afterglow palette — used for both schemes (dark-first, no real light theme).
const afterglow = {
  text: '#FBF7FF', // warm near-white, never pure #FFF
  textSecondary: '#A79FB5',
  textTertiary: '#6E6683',
  background: '#0B0710', // warm plum-black
  backgroundElement: '#171320',
  backgroundSelected: 'rgba(255,71,126,0.14)',
  card: '#171320',
  border: 'rgba(255,255,255,0.07)',
  borderStrong: '#2E2440',
  tint: Brand.tint,
  tintPressed: Brand.tintPressed,
  iris: Brand.iris,
  spark: Brand.spark,
  accentSoft: Brand.accentSoft,
  onTint: '#FFFFFF',
  onSpark: '#0B0710',
  success: '#35D07F',
  error: '#FF5470',
  warning: '#FFC24D',
} as const;

export const Colors = {
  light: afterglow,
  dark: afterglow,
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Accent glow + card depth (iOS shadow + Android elevation). */
export const Glow = {
  accent: {
    shadowColor: '#FF477E',
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
} as const;

// Fonts loaded in app/_layout.tsx via @expo-google-fonts/*. Values are the
// exact loaded family names. `mono` kept for legacy template components.
export const Fonts = {
  display: 'Unbounded_700Bold', // hero / h1 — bold expressive display
  displaySemi: 'Unbounded_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
  utility: 'SpaceGrotesk_700Bold', // eyebrow / kicker / numerals
  mono: (Platform.select({ ios: 'ui-monospace', default: 'monospace' }) as string) ?? 'monospace',
} as const;

/** Type scale — apply these instead of inline fontSize/fontWeight. */
export const Type = {
  display: { fontFamily: Fonts.display, fontSize: 38, lineHeight: 44, letterSpacing: -1 },
  h1: { fontFamily: Fonts.display, fontSize: 29, lineHeight: 34, letterSpacing: -0.5 },
  h2: { fontFamily: Fonts.bodyBold, fontSize: 22, lineHeight: 28, letterSpacing: -0.3 },
  title: { fontFamily: Fonts.bodyBold, fontSize: 17, lineHeight: 22, letterSpacing: -0.2 },
  body: { fontFamily: Fonts.body, fontSize: 16, lineHeight: 24 },
  bodyMedium: { fontFamily: Fonts.bodyMedium, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: Fonts.bodyMedium, fontSize: 13, lineHeight: 18 },
  kicker: { fontFamily: Fonts.utility, fontSize: 12, lineHeight: 16, letterSpacing: 1.5 },
  button: { fontFamily: Fonts.bodyBold, fontSize: 17, letterSpacing: 0.2 },
  price: { fontFamily: Fonts.display, fontSize: 26, lineHeight: 30, letterSpacing: -0.4 },
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radii = {
  sm: 10,
  chip: 14,
  button: 20,
  md: 16,
  lg: 22,
  stage: 28,
  xl: 32,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
