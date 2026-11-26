import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { Manrope_500Medium, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { DarkTheme, DefaultTheme, ThemeProvider, useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet, useColorScheme, View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { KText } from '@/components/kosh/kosh';
import { LockScreen } from '@/components/lock/LockScreen';
import { Colors } from '@/constants/theme';
import { registerNotificationTask } from '@/services/notifications/background';
import {
  configureNotificationHandler,
  refreshNotifications,
  requestPermission,
} from '@/services/notifications/scheduler';
import { purgeStaleExports } from '@/services/data/exportService';
import { useAppStore } from '@/store/appStore';
import { useLockStore } from '@/store/lockStore';
import * as Notifications from 'expo-notifications';

SplashScreen.preventAutoHideAsync();
configureNotificationHandler();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const [fontsLoaded, fontError] = useFonts({ Manrope_500Medium, Manrope_700Bold, Fraunces_600SemiBold });
  const load = useAppStore((s) => s.load);
  const isLoaded = useAppStore((s) => s.isLoaded);
  const lockReady = useLockStore((s) => s.ready);
  const locked = useLockStore((s) => s.locked);
  const privacyCover = useLockStore((s) => s.settings.privacyCover);
  const [covered, setCovered] = useState(false);

  useEffect(() => {
    load().catch((e) => console.error('Failed to load local data', e));
    useLockStore.getState().init().catch((e) => console.error('Failed to load security settings', e));
    purgeStaleExports();
  }, [load]);

  // Start the session with amounts masked when the user asked for it (once, after both stores are ready).
  const appliedHide = useRef(false);
  useEffect(() => {
    if (!isLoaded || !lockReady || appliedHide.current) return;
    appliedHide.current = true;
    if (useLockStore.getState().settings.hideAmountsOnLaunch) useAppStore.setState({ hideAmounts: true });
  }, [isLoaded, lockReady]);

  // Re-lock after the configured time in the background, and cover the screen in the app switcher.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      const lock = useLockStore.getState();
      if (state === 'background') lock.onBackground();
      if (state === 'active') lock.onForeground();
      setCovered(state !== 'active');
    });
    return () => sub.remove();
  }, []);

  const router = useRouter();
  const setupDone = useRef(false);

  // Once data is loaded: ask for permission on first launch, then schedule and check notifications.
  useEffect(() => {
    if (!isLoaded || !lockReady || locked || setupDone.current) return;
    setupDone.current = true;
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
  }, [isLoaded, lockReady, locked]);

  // Tapping a notification opens the relevant screen (after unlock, if the app is locked).
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const target = response.notification.request.content.data?.target;
      if (typeof target !== 'string' || !target.startsWith('/')) return;
      const lock = useLockStore.getState();
      if (lock.locked) lock.setPendingTarget(target);
      else router.push(target as '/');
    });
    return () => sub.remove();
  }, [router]);

  const pendingTarget = useLockStore((s) => s.pendingTarget);
  useEffect(() => {
    if (locked || !pendingTarget) return;
    useLockStore.getState().setPendingTarget(null);
    router.push(pendingTarget as '/');
  }, [locked, pendingTarget, router]);

  if (!(fontsLoaded || fontError) || !isLoaded || !lockReady) return null;

  const base = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const theme = {
    ...base,
    colors: { ...base.colors, background: palette.surface100, card: palette.surface200, text: palette.ink, primary: palette.brand, border: palette.line },
  };

  return (
    <ThemeProvider value={theme}>
      <AnimatedSplashOverlay />
      {locked ? <LockScreen /> : <AppTabs />}
      {covered && privacyCover ? (
        <View
          pointerEvents="none"
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          style={[StyleSheet.absoluteFill, styles.cover, { backgroundColor: palette.surface100 }]}>
          <KText variant="displayLg">Kosh</KText>
        </View>
      ) : null}
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  cover: { alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
});
