import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { Manrope_500Medium, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { DarkTheme, DefaultTheme, ThemeProvider, useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { Colors } from '@/constants/theme';
import { registerNotificationTask } from '@/services/notifications/background';
import {
  configureNotificationHandler,
  refreshNotifications,
  requestPermission,
} from '@/services/notifications/scheduler';
import { useAppStore } from '@/store/appStore';
import * as Notifications from 'expo-notifications';

SplashScreen.preventAutoHideAsync();
configureNotificationHandler();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const [fontsLoaded, fontError] = useFonts({ Manrope_500Medium, Manrope_700Bold, Fraunces_600SemiBold });
  const load = useAppStore((s) => s.load);
  const isLoaded = useAppStore((s) => s.isLoaded);

  useEffect(() => {
    load().catch((e) => console.error('Failed to load local data', e));
  }, [load]);

  const router = useRouter();

  // Once data is loaded: ask for permission on first launch, then schedule and check notifications.
  useEffect(() => {
    if (!isLoaded) return;
    (async () => {
      const { notificationSettings, updateNotificationSettings } = useAppStore.getState();
      if (!notificationSettings.permissionAsked) {
        await requestPermission();
        await updateNotificationSettings({ permissionAsked: true });
      } else {
        await refreshNotifications();
      }
      await registerNotificationTask();
    })().catch((e) => console.warn('Notification setup failed', e));
  }, [isLoaded]);

  // Tapping a notification opens the relevant screen.
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const target = response.notification.request.content.data?.target;
      if (typeof target === 'string' && target.startsWith('/')) router.push(target as '/');
    });
    return () => sub.remove();
  }, [router]);

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
