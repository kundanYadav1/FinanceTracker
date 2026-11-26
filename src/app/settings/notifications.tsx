import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, StyleSheet, Switch, View } from 'react-native';

import { Button, Card, KText, Screen, SectionHeading } from '@/components/kosh/kosh';
import { Space } from '@/constants/theme';
import { parseTime } from '@/domain/notifications/planner';
import type { NotificationSettings } from '@/domain/notifications/types';
import { useTheme } from '@/hooks/use-theme';
import { hasPermission, requestPermission } from '@/services/notifications/scheduler';
import { useAppStore } from '@/store/appStore';

type ToggleKey = 'daily' | 'budget' | 'goal' | 'monthly' | 'achievement';

const ROWS: { key: ToggleKey; title: string; hint: string }[] = [
  { key: 'daily', title: 'Daily expense reminder', hint: 'A nudge to log the day’s spending.' },
  { key: 'budget', title: 'Budget warnings', hint: 'When a budget passes 80% or is exceeded.' },
  { key: 'goal', title: 'Goal reminders', hint: 'Weekly, when a goal is behind pace.' },
  { key: 'monthly', title: 'Monthly summary', hint: 'On the 1st of each month.' },
  { key: 'achievement', title: 'Savings achievements', hint: 'At 25%, 50%, 75% and when a goal is reached.' },
];

function formatTime(value: string): string {
  const { hour, minute } = parseTime(value);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function shiftTime(value: string, minutes: number): string {
  const { hour, minute } = parseTime(value);
  const total = (((hour * 60 + minute + minutes) % 1440) + 1440) % 1440;
  return formatTime(`${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`);
}

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const settings = useAppStore((s) => s.notificationSettings);
  const update = useAppStore((s) => s.updateNotificationSettings);
  const [granted, setGranted] = useState<boolean | null>(null);

  useEffect(() => {
    hasPermission().then(setGranted).catch(() => setGranted(false));
  }, []);

  const set = (partial: Partial<NotificationSettings>) => {
    update(partial).catch((e) => console.warn('Could not save notification settings', e));
  };

  return (
    <Screen>
      <KText variant="title" accessibilityRole="header">
        Notifications
      </KText>
      <KText variant="caption">
        Reminders stay on this device. Notification text never shows amounts or names.
      </KText>

      {granted === false ? (
        <Card tint style={{ gap: Space.s3 }}>
          <KText variant="bodyStrong">Notifications are blocked</KText>
          <KText variant="caption">Allow notifications to receive reminders and alerts.</KText>
          <Button
            onPress={async () => {
              const ok = await requestPermission();
              setGranted(ok);
              if (!ok) await Linking.openSettings();
            }}>
            Allow notifications
          </Button>
        </Card>
      ) : null}

      <SectionHeading>Alerts</SectionHeading>
      <Card style={{ gap: Space.s4 }}>
        {ROWS.map((row) => (
          <View key={row.key} style={styles.row}>
            <View style={{ flex: 1, gap: 2 }}>
              <KText variant="bodyStrong">{row.title}</KText>
              <KText variant="caption">{row.hint}</KText>
            </View>
            <Switch
              accessibilityLabel={row.title}
              value={settings[row.key]}
              onValueChange={(value) => set({ [row.key]: value })}
              trackColor={{ true: theme.brand, false: theme.lineStrong }}
            />
          </View>
        ))}
      </Card>

      {settings.daily ? (
        <>
          <SectionHeading>Daily reminder time</SectionHeading>
          <Card style={styles.row}>
            <Button variant="secondary" onPress={() => set({ dailyTime: shiftTime(settings.dailyTime, -30) })}>
              − 30 min
            </Button>
            <KText variant="title" accessibilityLabel={`Reminder time ${formatTime(settings.dailyTime)}`}>
              {formatTime(settings.dailyTime)}
            </KText>
            <Button variant="secondary" onPress={() => set({ dailyTime: shiftTime(settings.dailyTime, 30) })}>
              + 30 min
            </Button>
          </Card>
        </>
      ) : null}

      <Button variant="ghost" onPress={() => router.back()}>
        Done
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Space.s3 },
});
