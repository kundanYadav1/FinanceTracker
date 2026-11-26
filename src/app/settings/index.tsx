import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Button, Card, KText, Screen } from '@/components/kosh/kosh';
import { Space } from '@/constants/theme';
import { useLockStore } from '@/store/lockStore';

const ITEMS: { path: string; title: string; hint: string }[] = [
  { path: '/settings/notifications', title: 'Notifications', hint: 'Reminders and alerts' },
  { path: '/settings/security', title: 'Security', hint: 'App PIN and biometric lock' },
  { path: '/settings/privacy', title: 'Privacy', hint: 'Screen privacy and how your data is stored' },
  { path: '/settings/data', title: 'Data & backup', hint: 'Export, back up, restore or delete your data' },
];

export default function SettingsHome() {
  const router = useRouter();
  const lockEnabled = useLockStore((s) => s.settings.lockEnabled);

  return (
    <Screen>
      <KText variant="title" accessibilityRole="header">
        Settings
      </KText>
      <View style={{ gap: Space.s3 }}>
        {ITEMS.map((item) => (
          <Pressable
            key={item.path}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}. ${item.hint}`}
            onPress={() => router.push(item.path as '/')}>
            <Card style={{ gap: 2 }}>
              <KText variant="bodyStrong">{item.title}</KText>
              <KText variant="caption">
                {item.path.endsWith('security') ? (lockEnabled ? 'App lock is on' : 'App lock is off') : item.hint}
              </KText>
            </Card>
          </Pressable>
        ))}
      </View>
      <Button variant="ghost" onPress={() => router.back()}>
        Done
      </Button>
    </Screen>
  );
}
