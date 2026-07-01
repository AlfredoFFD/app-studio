/**
 * Design tokens for the App Studio factory template.
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  PER-APP RESKIN POINT                                            │
 * │  To reskin for a new app, change `Brand` + `Gradients` below.    │
 * │  Everything else (Spacing, Radii, type) stays constant across   │
 * │  the whole factory so the design system reads consistent.       │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * Current app #001: AI Photo-Dance — neon magenta → violet.
 */

import '@/global.css';

import { Platform } from 'react-native';

// --- PER-APP BRAND (reskin here) -------------------------------------------
const Brand = {
  tint: '#C026D3', // primary accent (light) — fuchsia
  tintDark: '#E879F9', // primary accent (dark)
  accentSoft: '#FBE9FF', // soft tint chip bg (light)
  accentSoftDark: '#2A1633', // soft tint chip bg (dark)
} as const;

export const Gradients = {
  /** Primary CTA / hero gradient — reskin per app. */
  brand: ['#FF2D9B', '#7C3AED'] as const,
  /** Subtle background wash. */
  wash: ['#FFF0FA', '#F1EBFF'] as const,
  washDark: ['#140C1E', '#0E0B18'] as const,
};
// ---------------------------------------------------------------------------

export const Colors = {
  light: {
    text: '#15101F',
    textSecondary: '#6B6480',
    background: '#FFFFFF',
    backgroundElement: '#F5F3FB',
    backgroundSelected: '#ECE7F8',
    card: '#FFFFFF',
    border: '#EBE6F4',
    tint: Brand.tint,
    accentSoft: Brand.accentSoft,
    onTint: '#FFFFFF',
    success: '#16A34A',
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#A79FB5',
    background: '#0E0B16',
    backgroundElement: '#181222',
    backgroundSelected: '#221A30',
    card: '#191322',
    border: '#2C2440',
    tint: Brand.tintDark,
    accentSoft: Brand.accentSoftDark,
    onTint: '#FFFFFF',
    success: '#22C55E',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

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
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
