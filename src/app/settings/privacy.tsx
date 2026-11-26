import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Switch, View } from 'react-native';

import { Button, Card, KText, Screen, SectionHeading } from '@/components/kosh/kosh';
import { Space } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLockStore } from '@/store/lockStore';

export default function PrivacyScreen() {
  const router = useRouter();
  const theme = useTheme();
  const settings = useLockStore((s) => s.settings);
  const update = useLockStore((s) => s.updateSettings);

  const save = (partial: Parameters<typeof update>[0]) =>
    update(partial).catch(() => Alert.alert('Not saved', 'Your setting could not be saved. Please try again.'));

  return (
    <Screen>
      <KText variant="title" accessibilityRole="header">
        Privacy
      </KText>

      <Card style={{ gap: Space.s4 }}>
        <View style={styles.row}>
          <View style={{ flex: 1, gap: 2 }}>
            <KText variant="bodyStrong">Hide app in task switcher</KText>
            <KText variant="caption">Shows a blank cover instead of your balances when you switch apps.</KText>
          </View>
          <Switch
            accessibilityLabel="Hide app in task switcher"
            value={settings.privacyCover}
            onValueChange={(v) => void save({ privacyCover: v })}
            trackColor={{ true: theme.brand, false: theme.lineStrong }}
          />
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1, gap: 2 }}>
            <KText variant="bodyStrong">Hide amounts on open</KText>
            <KText variant="caption">Start each session with amounts masked. Tap the eye on Home to reveal.</KText>
          </View>
          <Switch
            accessibilityLabel="Hide amounts on open"
            value={settings.hideAmountsOnLaunch}
            onValueChange={(v) => void save({ hideAmountsOnLaunch: v })}
            trackColor={{ true: theme.brand, false: theme.lineStrong }}
          />
        </View>
      </Card>

      <SectionHeading>How your data is handled</SectionHeading>
      <Card style={{ gap: Space.s3 }}>
        <KText variant="body">• Everything stays on this device. Kosh has no account, no server and no analytics.</KText>
        <KText variant="body">
          • Data is stored in the app’s private storage. It is not encrypted by Kosh itself; your phone’s own
          encryption protects it while the phone is locked.
        </KText>
        <KText variant="body">• Kosh does not back itself up. Uninstalling the app deletes your data.</KText>
        <KText variant="body">
          • To protect against loss, export a backup from Data &amp; backup. Backup and CSV files are not encrypted, so
          share them only somewhere you trust.
        </KText>
        <KText variant="body">• Notifications never show amounts or names.</KText>
      </Card>

      <Button variant="ghost" onPress={() => router.back()}>
        Done
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Space.s3 },
});
