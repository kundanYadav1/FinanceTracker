import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { Manrope_500Medium, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { Colors } from '@/constants/theme';
import { useAppStore } from '@/store/appStore';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const [fontsLoaded, fontError] = useFonts({ Manrope_500Medium, Manrope_700Bold, Fraunces_600SemiBold });
  const load = useAppStore((s) => s.load);
  const isLoaded = useAppStore((s) => s.isLoaded);

  useEffect(() => {
    load().catch((e) => console.error('Failed to load local data', e));
  }, [load]);

  if (!(fontsLoaded || fontError) || !isLoaded) return null;

  const base = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const theme = {
    ...base,
    colors: { ...base.colors, background: palette.surface100, card: palette.surface200, text: palette.ink, primary: palette.brand, border: palette.line },
  };

  return (
    <ThemeProvider value={theme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
