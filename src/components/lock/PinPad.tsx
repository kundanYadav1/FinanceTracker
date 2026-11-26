import { Pressable, StyleSheet, View } from 'react-native';

import { KText } from '@/components/kosh/kosh';
import { Radius, Space, TapMin } from '@/constants/theme';
import { PIN_MAX_LENGTH } from '@/domain/lock/policy';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  /** Optional extra key shown bottom-left (e.g. biometric). */
  extraKey?: { label: string; onPress: () => void };
};

const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

export function PinDots({ length }: { length: number }) {
  const theme = useTheme();
  return (
    <View style={styles.dots} accessibilityLabel={`${length} digits entered`} accessibilityRole="text">
      {Array.from({ length: PIN_MAX_LENGTH }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            { borderColor: theme.lineStrong, backgroundColor: i < length ? theme.brand : 'transparent' },
          ]}
        />
      ))}
    </View>
  );
}

export function PinPad({ value, onChange, disabled, extraKey }: Props) {
  const theme = useTheme();

  const press = (digit: string) => {
    if (!disabled && value.length < PIN_MAX_LENGTH) onChange(value + digit);
  };

  const key = (label: string, onPress: () => void, a11y: string) => (
    <Pressable
      key={a11y}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.key,
        { backgroundColor: pressed ? theme.brandTint : theme.surface200, borderColor: theme.line, opacity: disabled ? 0.4 : 1 },
      ]}>
      <KText variant="title">{label}</KText>
    </Pressable>
  );

  return (
    <View style={styles.pad}>
      {ROWS.map((row) => (
        <View key={row.join('')} style={styles.row}>
          {row.map((d) => key(d, () => press(d), d))}
        </View>
      ))}
      <View style={styles.row}>
        {extraKey ? key(extraKey.label, extraKey.onPress, extraKey.label) : <View style={styles.key} />}
        {key('0', () => press('0'), '0')}
        {key('⌫', () => onChange(value.slice(0, -1)), 'Delete')}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { gap: Space.s3, alignItems: 'center' },
  row: { flexDirection: 'row', gap: Space.s3 },
  key: {
    width: 76,
    height: Math.max(TapMin, 64),
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: { flexDirection: 'row', gap: Space.s3, justifyContent: 'center' },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
});
