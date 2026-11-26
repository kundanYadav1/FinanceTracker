import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Switch, View } from 'react-native';

import { Button, Card, KText, Screen, SectionHeading, Segmented } from '@/components/kosh/kosh';
import { PinEntryModal } from '@/components/lock/PinEntryModal';
import { Space } from '@/constants/theme';
import { isWeakPin, remainingLockoutSec } from '@/domain/lock/policy';
import { LOCK_TIMEOUT_OPTIONS } from '@/domain/security/types';
import { useTheme } from '@/hooks/use-theme';
import { authenticateBiometric, isBiometricAvailable } from '@/services/lock/biometric';
import { changePin, removePin, setPin, verifyPin, type VerifyResult } from '@/services/lock/pinService';
import { useLockStore } from '@/store/lockStore';

type Flow = null | 'enable' | 'disable' | 'change-current' | 'change-new';

function failureMessage(result: VerifyResult): string | null {
  if (result.ok) return null;
  if (result.reason === 'locked') return `Too many attempts. Try again in ${remainingLockoutSec(result.lockedUntil, Date.now())}s.`;
  if (result.reason === 'wrong') return 'Wrong PIN.';
  return 'No PIN is set.';
}

export default function SecurityScreen() {
  const router = useRouter();
  const theme = useTheme();
  const settings = useLockStore((s) => s.settings);
  const update = useLockStore((s) => s.updateSettings);
  const [flow, setFlow] = useState<Flow>(null);
  const [bioAvailable, setBioAvailable] = useState(false);
  const currentPin = useRef('');

  useEffect(() => {
    isBiometricAvailable().then(setBioAvailable);
  }, []);

  const save = (partial: Parameters<typeof update>[0]) =>
    update(partial).catch(() => Alert.alert('Not saved', 'Your setting could not be saved. Please try again.'));

  const toggleBiometric = async (on: boolean) => {
    if (!on) return save({ biometricEnabled: false });
    if (await authenticateBiometric('Confirm to turn on biometric unlock')) await save({ biometricEnabled: true });
  };

  return (
    <Screen>
      <KText variant="title" accessibilityRole="header">
        Security
      </KText>
      <KText variant="caption">
        The PIN keeps other people out of the app. It does not encrypt your data on the device.
      </KText>

      <Card style={{ gap: Space.s4 }}>
        <View style={styles.row}>
          <View style={{ flex: 1, gap: 2 }}>
            <KText variant="bodyStrong">App lock</KText>
            <KText variant="caption">Ask for a PIN when Kosh opens.</KText>
          </View>
          <Switch
            accessibilityLabel="App lock"
            value={settings.lockEnabled}
            onValueChange={(on) => setFlow(on ? 'enable' : 'disable')}
            trackColor={{ true: theme.brand, false: theme.lineStrong }}
          />
        </View>

        {settings.lockEnabled ? (
          <>
            <View style={styles.row}>
              <View style={{ flex: 1, gap: 2 }}>
                <KText variant="bodyStrong">Biometric unlock</KText>
                <KText variant="caption">
                  {bioAvailable ? 'Use fingerprint or face. Your PIN always works too.' : 'Not available: set up biometrics in your phone’s settings.'}
                </KText>
              </View>
              <Switch
                accessibilityLabel="Biometric unlock"
                disabled={!bioAvailable}
                value={settings.biometricEnabled}
                onValueChange={(on) => void toggleBiometric(on)}
                trackColor={{ true: theme.brand, false: theme.lineStrong }}
              />
            </View>
            <Button variant="secondary" onPress={() => setFlow('change-current')}>
              Change PIN
            </Button>
          </>
        ) : null}
      </Card>

      {settings.lockEnabled ? (
        <>
          <SectionHeading>Lock when I leave the app</SectionHeading>
          <Segmented
            options={LOCK_TIMEOUT_OPTIONS.map((o) => ({ value: String(o.value), label: o.label.replace('After ', '') }))}
            value={String(settings.lockTimeoutSec)}
            onChange={(v) => void save({ lockTimeoutSec: Number(v) as 0 | 60 | 300 })}
          />
          <KText variant="caption">There is no way to recover a forgotten PIN. Keep a backup in Data &amp; backup.</KText>
        </>
      ) : null}

      <Button variant="ghost" onPress={() => router.back()}>
        Done
      </Button>

      <PinEntryModal
        visible={flow === 'enable'}
        title="Create a PIN"
        hint="Use 4 to 6 digits. If you forget it, the only way back in is erasing the app's data, so back up first."
        confirm
        onCancel={() => setFlow(null)}
        onSubmit={async (pin) => {
          if (isWeakPin(pin)) return 'Too easy to guess. Avoid repeats and runs like 1234.';
          await setPin(pin);
          await update({ lockEnabled: true });
          setFlow(null);
          return null;
        }}
      />

      <PinEntryModal
        visible={flow === 'disable'}
        title="Enter your PIN"
        hint="Confirm your PIN to turn app lock off."
        onCancel={() => setFlow(null)}
        onSubmit={async (pin) => {
          const result = await removePin(pin);
          if (!result.ok) return failureMessage(result);
          await update({ lockEnabled: false, biometricEnabled: false });
          setFlow(null);
          return null;
        }}
      />

      <PinEntryModal
        visible={flow === 'change-current'}
        title="Enter current PIN"
        onCancel={() => setFlow(null)}
        onSubmit={async (pin) => {
          const result = await verifyPin(pin);
          if (!result.ok) return failureMessage(result);
          currentPin.current = pin;
          setFlow('change-new');
          return null;
        }}
      />

      <PinEntryModal
        visible={flow === 'change-new'}
        title="Choose a new PIN"
        confirm
        onCancel={() => {
          currentPin.current = '';
          setFlow(null);
        }}
        onSubmit={async (pin) => {
          if (isWeakPin(pin)) return 'Too easy to guess. Avoid repeats and runs like 1234.';
          const result = await changePin(currentPin.current, pin);
          if (!result.ok) return failureMessage(result);
          currentPin.current = '';
          setFlow(null);
          Alert.alert('PIN changed', 'Use your new PIN next time you unlock.');
          return null;
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Space.s3 },
});
