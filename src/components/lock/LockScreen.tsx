import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, KText } from '@/components/kosh/kosh';
import { Space } from '@/constants/theme';
import { PIN_MIN_LENGTH, remainingLockoutSec } from '@/domain/lock/policy';
import { useTheme } from '@/hooks/use-theme';
import { eraseEverything } from '@/services/data/eraseService';
import { isBiometricAvailable } from '@/services/lock/biometric';
import { useLockStore } from '@/store/lockStore';

import { PinDots, PinPad } from './PinPad';

export function LockScreen() {
  const theme = useTheme();
  const biometricEnabled = useLockStore((s) => s.settings.biometricEnabled);
  const lockedUntil = useLockStore((s) => s.lockedUntil);
  const unlockWithPin = useLockStore((s) => s.unlockWithPin);
  const unlockWithBiometric = useLockStore((s) => s.unlockWithBiometric);

  const [pin, setPin] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [bioReady, setBioReady] = useState(false);

  const waitSec = remainingLockoutSec(lockedUntil, now);

  useEffect(() => {
    if (waitSec <= 0) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [waitSec]);

  const tryBiometric = useCallback(async () => {
    if (await unlockWithBiometric()) return;
    setMessage(null);
  }, [unlockWithBiometric]);

  // Offer biometrics on arrival, with the PIN as the fallback.
  useEffect(() => {
    if (!biometricEnabled) return;
    isBiometricAvailable().then((ok) => {
      setBioReady(ok);
      if (ok) void tryBiometric();
    });
  }, [biometricEnabled, tryBiometric]);

  const submit = async () => {
    if (pin.length < PIN_MIN_LENGTH || busy) return;
    setBusy(true);
    try {
      const result = await unlockWithPin(pin);
      if (!result.ok) {
        setPin('');
        setNow(Date.now());
        if (result.reason === 'locked') setMessage('Too many attempts. Try again shortly.');
        else if (result.reason === 'wrong') {
          setMessage(
            result.remainingAttempts > 0
              ? `Wrong PIN. ${result.remainingAttempts} ${result.remainingAttempts === 1 ? 'try' : 'tries'} left before a short lock.`
              : 'Wrong PIN. Please wait before trying again.',
          );
        } else setMessage('No PIN is set.');
      }
    } finally {
      setBusy(false);
    }
  };

  const confirmErase = () =>
    Alert.alert(
      'Erase all data?',
      'This permanently deletes every transaction, budget and goal on this device and removes the PIN. It cannot be undone. Restore from a backup afterwards if you have one.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Erase everything', style: 'destructive', onPress: () => void eraseEverything() },
      ],
    );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.surface100 }]}>
      <View style={styles.top}>
        <KText variant="displayLg" accessibilityRole="header">
          Kosh is locked
        </KText>
        <KText variant="caption">Enter your PIN to continue.</KText>
        <PinDots length={pin.length} />
        <View style={styles.msg}>
          <KText variant="caption" color={waitSec > 0 || message ? 'negative' : 'inkMuted'} accessibilityLiveRegion="polite">
            {waitSec > 0 ? `Try again in ${waitSec}s` : (message ?? ' ')}
          </KText>
        </View>
      </View>

      <PinPad
        value={pin}
        onChange={setPin}
        disabled={waitSec > 0 || busy}
        extraKey={biometricEnabled && bioReady ? { label: '☝', onPress: () => void tryBiometric() } : undefined}
      />

      <View style={styles.bottom}>
        <Button block onPress={() => void submit()} disabled={pin.length < PIN_MIN_LENGTH || waitSec > 0 || busy}>
          Unlock
        </Button>
        <Button variant="ghost" onPress={confirmErase}>
          Forgot PIN? Erase data and reset
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: Space.s4, justifyContent: 'space-between' },
  top: { alignItems: 'center', gap: Space.s4, paddingTop: Space.s8 },
  msg: { minHeight: 36, justifyContent: 'center', alignItems: 'center' },
  bottom: { gap: Space.s2, paddingBottom: Space.s4 },
});
