import { Pressable, Text, type TextStyle, type ViewStyle } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ButtonProps = {
  label: string;
  onPress: () => void;
  type?: 'default' | 'expense' | 'income';
};

export function Button({ label, onPress, type = 'default' }: ButtonProps) {
  const theme = useTheme();

  const base: ViewStyle = {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
    minWidth: 110,
  };

  const textBase: TextStyle = {
    fontSize: 13,
    fontWeight: 600,
  };

  let backgroundColor: string;
  let color: string;

  if (type === 'expense') {
    backgroundColor = '#ffeaea';
    color = '#e57373';
  } else if (type === 'income') {
    backgroundColor = '#e8f5e9';
    color = '#4db6ac';
  } else {
    backgroundColor = theme.backgroundElement;
    color = theme.text;
  }

  return (
    <Pressable style={[base, { backgroundColor }]} onPress={onPress} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
      <Text style={[textBase, { color }]}>{label}</Text>
    </Pressable>
  );
}
