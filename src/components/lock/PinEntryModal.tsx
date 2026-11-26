import { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, KText } from '@/components/kosh/kosh';
import { Space } from '@/constants/theme';
import { PIN_MIN_LENGTH } from '@/domain/lock/policy';
import { useTheme } from '@/hooks/use-theme';

import { PinDots, PinPad } from './PinPad';

/**
 * Collects a PIN (or a PIN + confirmation when `confirm` is set).
 * `onSubmit` returns an error message to show, or null when accepted (the modal then closes).
 */
export function PinEntryModal(props: Props) {
  // The body mounts only while visible, so every opening starts with a clean slate.
  return (
    <Modal visible={props.visible} animationType="slide" onRequestClose={props.onCancel}>
      {props.visible ? <PinEntryBody {...props} /> : null}
    </Modal>
  );
}

type Props = {
  visible: boolean;
  title: string;
  hint?: string;
  confirm?: boolean;
  onSubmit: (pin: string) => Promise<string | null>;
  onCancel: () => void;
};

function PinEntryBody({
  title,
  hint,
  confirm,
  onSubmit,
  onCancel,
}: Props) {
  const theme = useTheme();
  const [first, setFirst] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const stage = confirm && first === null ? 'enter' : confirm ? 'confirm' : 'single';

  const next = async () => {
    if (pin.length < PIN_MIN_LENGTH || busy) return;
    if (stage === 'enter') {
      setFirst(pin);
      setPin('');
      setError(null);
      return;
    }
    if (stage === 'confirm' && pin !== first) {
      setError('PINs do not match. Start again.');
      setFirst(null);
      setPin('');
      return;
    }
    setBusy(true);
    try {
      const message = await onSubmit(pin);
      if (message) {
        setError(message);
        setPin('');
        if (stage === 'confirm') setFirst(null);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.surface100 }]}>
        <View style={styles.top}>
          <KText variant="title" accessibilityRole="header">
            {stage === 'confirm' ? 'Confirm your PIN' : title}
          </KText>
          <KText variant="caption" style={{ textAlign: 'center' }}>
            {stage === 'confirm' ? 'Enter the same PIN again.' : (hint ?? 'Use 4 to 6 digits.')}
          </KText>
          <PinDots length={pin.length} />
          <View style={styles.msg}>
            <KText variant="caption" color="negative" accessibilityLiveRegion="polite">
              {error ?? ' '}
            </KText>
          </View>
        </View>
        <PinPad value={pin} onChange={setPin} disabled={busy} />
        <View style={styles.bottom}>
          <Button block onPress={() => void next()} disabled={pin.length < PIN_MIN_LENGTH || busy}>
            {stage === 'enter' ? 'Next' : 'Continue'}
          </Button>
          <Button variant="ghost" onPress={onCancel}>
            Cancel
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
