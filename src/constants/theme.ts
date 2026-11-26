/**
 * Kosh design tokens (FinanceTracker redesign).
 * Legacy keys (text, background, backgroundElement, backgroundSelected, textSecondary)
 * are kept so starter components keep working; they alias the Kosh tokens.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    surface100: '#F6F3EC',
    surface200: '#FFFFFF',
    surface300: '#ECE7DC',
    line: '#D9D2C3',
    lineStrong: '#7D7664',
    ink: '#1B2420',
    inkMuted: '#55605A',
    brand: '#0E5A52',
    onBrand: '#FFFFFF',
    brandTint: '#D5E8E3',
    accent: '#F2B01E',
    onAccent: '#1B2420',
    accentText: '#7A5200',
    positive: '#0A5F7A',
    negative: '#B3361B',
    onNegative: '#FFFFFF',
    track: '#C9D6D1',
    focus: '#0B4F9E',
    scrim: 'rgba(27,36,32,0.45)',
    text: '#1B2420',
    background: '#F6F3EC',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#ECE7DC',
    textSecondary: '#55605A',
  },
  dark: {
    surface100: '#121815',
    surface200: '#1A221E',
    surface300: '#232D28',
    line: '#33403A',
    lineStrong: '#7C8A82',
    ink: '#EDEBE4',
    inkMuted: '#A7B0A9',
    brand: '#5BC0AE',
    onBrand: '#0B1713',
    brandTint: '#1E3A34',
    accent: '#F2B01E',
    onAccent: '#1B2420',
    accentText: '#F2B01E',
    positive: '#5CC0E0',
    negative: '#FF8A66',
    onNegative: '#2A0F07',
    track: '#33403A',
    focus: '#8CC8FF',
    scrim: 'rgba(0,0,0,0.6)',
    text: '#EDEBE4',
    background: '#121815',
    backgroundElement: '#1A221E',
    backgroundSelected: '#232D28',
    textSecondary: '#A7B0A9',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
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

/** Font family names registered in the root layout (Manrope body, Fraunces display). */
export const FontFamily = {
  sans500: 'Manrope_500Medium',
  sans700: 'Manrope_700Bold',
  display: 'Fraunces_600SemiBold',
} as const;

export const Radius = { sm: 8, md: 12, lg: 20, full: 999 } as const;

/** Minimum touch target (px) for every pressable. */
export const TapMin = 48;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/** Kosh 4px-base spacing scale (space-1 … space-10). */
export const Space = { s1: 4, s2: 8, s3: 12, s4: 16, s5: 20, s6: 24, s8: 32, s10: 40 } as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
