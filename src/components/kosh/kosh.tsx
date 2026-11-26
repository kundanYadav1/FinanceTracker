import type { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from './icons';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { MaxContentWidth, FontFamily, Radius, Space, TapMin, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { budgetState } from '@/domain/overview';
import { formatRupees, MASKED_AMOUNT, type Money } from '@/utils/money';

/* ---------- Text ---------- */

export type TextVariant =
  | 'displayXl'
  | 'displayLg'
  | 'title'
  | 'heading'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'overline';

const VARIANTS: Record<TextVariant, TextStyle> = {
  displayXl: { fontFamily: FontFamily.display, fontSize: 44, lineHeight: 48 },
  displayLg: { fontFamily: FontFamily.display, fontSize: 32, lineHeight: 36 },
  title: { fontFamily: FontFamily.sans700, fontSize: 22, lineHeight: 28 },
  heading: { fontFamily: FontFamily.sans700, fontSize: 17, lineHeight: 24 },
  body: { fontFamily: FontFamily.sans500, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: FontFamily.sans700, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: FontFamily.sans500, fontSize: 13, lineHeight: 18 },
  overline: {
    fontFamily: FontFamily.sans700,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.72,
    textTransform: 'uppercase',
  },
};

export type KTextProps = TextProps & { variant?: TextVariant; color?: ThemeColor };

export function KText({ variant = 'body', color, style, ...rest }: KTextProps) {
  const theme = useTheme();
  const defaultColor: ThemeColor = variant === 'caption' || variant === 'overline' ? 'inkMuted' : 'ink';
  return (
    <Text
      style={[{ color: theme[color ?? defaultColor] }, VARIANTS[variant], style]}
      {...rest}
    />
  );
}

/* ---------- Layout ---------- */

export function Card({
  children,
  style,
  tint,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  tint?: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: tint ? theme.brandTint : theme.surface200,
          borderColor: tint ? 'transparent' : theme.line,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

/* ---------- Button ---------- */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  children,
  onPress,
  variant = 'primary',
  block,
  disabled,
  style,
}: {
  children: string;
  onPress: () => void;
  variant?: ButtonVariant;
  block?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  const palette: Record<ButtonVariant, { bg: string; fg: ThemeColor; border: string }> = {
    primary: { bg: theme.brand, fg: 'onBrand', border: 'transparent' },
    secondary: { bg: theme.surface200, fg: 'ink', border: theme.lineStrong },
    ghost: { bg: 'transparent', fg: 'brand', border: 'transparent' },
    danger: { bg: theme.negative, fg: 'onNegative', border: 'transparent' },
  };
  const p = palette[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: p.bg, borderColor: p.border, opacity: disabled ? 0.45 : pressed ? 0.85 : 1 },
        block ? styles.block : null,
        style,
      ]}>
      <KText variant="bodyStrong" color={p.fg}>
        {children}
      </KText>
    </Pressable>
  );
}

/** 48px square icon-only button. */
export function IconButton({
  label,
  onPress,
  children,
  bare,
}: {
  label: string;
  onPress: () => void;
  children: ReactNode;
  bare?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[
        styles.iconButton,
        bare
          ? null
          : { borderWidth: 2, borderColor: theme.lineStrong, backgroundColor: theme.surface200 },
      ]}>
      {children}
    </Pressable>
  );
}

/* ---------- Amount ---------- */

export type AmountTone = 'in' | 'out' | 'neutral';
export type AmountSize = 'md' | 'lg' | 'xl';

/** Money is integer minor units; a sign is always printed for in/out so colour is never the only cue. */
export function Amount({
  money,
  tone = 'neutral',
  size = 'md',
  masked,
  style,
}: {
  money: Money;
  tone?: AmountTone;
  size?: AmountSize;
  masked?: boolean;
  style?: StyleProp<TextStyle>;
}) {
  const theme = useTheme();
  const sign = tone === 'in' ? '+' : tone === 'out' ? '−' : undefined;
  const color = tone === 'in' ? theme.positive : tone === 'out' ? theme.negative : theme.ink;
  const base: TextStyle =
    size === 'xl'
      ? VARIANTS.displayXl
      : size === 'lg'
        ? { fontFamily: FontFamily.sans700, fontSize: 22, lineHeight: 28 }
        : VARIANTS.bodyStrong;
  const text = masked ? `${sign ?? ''}${MASKED_AMOUNT}` : formatRupees(money, sign);
  return (
    <Text
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.6}
      style={[base, { color, fontVariant: ['tabular-nums'] }, style]}
      accessibilityLabel={masked ? 'Amount hidden' : undefined}>
      {text}
    </Text>
  );
}

/* ---------- ProgressBar ---------- */

export type ProgressState = 'ok' | 'warn' | 'over';

export function ProgressBar({
  label,
  value,
  kind = 'budget',
  status,
  state,
  detail,
}: {
  label: string;
  /** Percent used; may exceed 100. */
  value: number;
  kind?: 'budget' | 'goal';
  status?: string;
  state?: ProgressState;
  detail?: string;
}) {
  const theme = useTheme();
  const v = Math.max(0, value);
  const s: ProgressState = state ?? (kind === 'goal' ? 'ok' : budgetState(v));
  const word =
    status ??
    (kind === 'goal'
      ? 'On track'
      : s === 'over'
        ? 'Over budget'
        : s === 'warn'
          ? 'Approaching limit'
          : 'Within budget');
  const fill = s === 'over' ? theme.negative : s === 'warn' ? theme.accentText : theme.brand;
  const statusColor = s === 'over' ? theme.negative : s === 'warn' ? theme.accentText : theme.positive;
  const pct = Math.round(v);
  return (
    <View style={{ gap: Space.s2 }}>
      <View style={styles.progressHead}>
        <KText variant="bodyStrong" style={{ flexShrink: 1 }}>
          {label}
        </KText>
        <KText variant="bodyStrong" style={{ fontVariant: ['tabular-nums'] }}>
          {pct}%
        </KText>
      </View>
      <View
        accessibilityRole="progressbar"
        accessibilityLabel={label}
        accessibilityValue={{ min: 0, max: 100, now: Math.min(100, pct) }}
        style={[styles.track, { backgroundColor: theme.track }]}>
        <View style={{ width: `${Math.min(100, v)}%`, height: '100%', backgroundColor: fill, borderRadius: Radius.full }} />
      </View>
      <KText variant="caption" style={{ fontFamily: FontFamily.sans700, color: statusColor }}>
        {word}
        {detail ? ` · ${detail}` : ''}
      </KText>
    </View>
  );
}

/* ---------- StatTile ---------- */

export function StatTile({
  label,
  money,
  tone,
  caption,
  masked,
}: {
  label: string;
  money: Money;
  tone?: AmountTone;
  caption?: string;
  masked?: boolean;
}) {
  return (
    <Card style={{ gap: Space.s1, minWidth: 0 }}>
      <KText variant="overline">{label}</KText>
      <Amount money={money} tone={tone} size="lg" masked={masked} />
      {caption ? <KText variant="caption">{caption}</KText> : null}
    </Card>
  );
}

/* ---------- TransactionRow ---------- */

export function TransactionRow({
  category,
  note,
  type,
  money,
  meta,
  masked,
  onPress,
  onDelete,
}: {
  category: string;
  note?: string;
  type: 'income' | 'expense';
  money: Money;
  /** Date and payment method, joined with a middle dot. */
  meta?: string;
  masked?: boolean;
  onPress?: () => void;
  onDelete?: () => void;
}) {
  const theme = useTheme();
  const caption = [category, meta].filter(Boolean).join(' · ');
  return (
    <View style={[styles.row, { backgroundColor: theme.surface200 }]}>
      <Pressable
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={`${note || category}, ${type === 'income' ? 'income' : 'expense'}`}
        onPress={onPress}
        style={styles.rowMain}>
        <View style={[styles.mono, { backgroundColor: theme.brandTint }]}>
          <KText variant="bodyStrong" color="brand">
            {(category || '?').charAt(0).toUpperCase()}
          </KText>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <KText variant="bodyStrong" numberOfLines={1}>
            {note || category}
          </KText>
          <KText variant="caption" numberOfLines={1}>
            {caption}
          </KText>
        </View>
        <Amount money={money} tone={type === 'income' ? 'in' : 'out'} masked={masked} />
      </Pressable>
      {onDelete ? (
        <IconButton label={`Delete ${note || category}`} onPress={onDelete} bare>
          <DeleteGlyph />
        </IconButton>
      ) : null}
    </View>
  );
}

function DeleteGlyph() {
  const theme = useTheme();
  return <Icon name="trash" color={theme.inkMuted} size={20} />;
}

/* ---------- InsightCard ---------- */

export function InsightCard({
  tag,
  title,
  body,
  saving,
  action,
  onAction,
}: {
  tag: string;
  title: string;
  body: string;
  saving?: Money;
  action?: string;
  onAction?: () => void;
}) {
  const theme = useTheme();
  return (
    <Card style={{ gap: Space.s3 }}>
      <View style={[styles.insightTag, { backgroundColor: theme.accent }]}>
        <KText variant="overline" color="onAccent">
          {tag}
        </KText>
      </View>
      <KText variant="heading">{title}</KText>
      <KText variant="body" color="inkMuted">
        {body}
      </KText>
      {saving ? (
        <KText variant="bodyStrong" color="positive">
          {`Potential saving ${formatRupees(saving)}/month`}
        </KText>
      ) : null}
      {action && onAction ? (
        <Button variant="secondary" onPress={onAction}>
          {action}
        </Button>
      ) : null}
    </Card>
  );
}

/* ---------- Chips, segmented control, field ---------- */

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.brandTint : theme.surface200,
          borderColor: selected ? theme.brand : theme.lineStrong,
        },
      ]}>
      <KText variant="bodyStrong" color={selected ? 'brand' : 'ink'}>
        {label}
      </KText>
    </Pressable>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.seg, { backgroundColor: theme.surface300 }]} accessibilityRole="tablist">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(o.value)}
            style={[styles.segItem, selected && { backgroundColor: theme.surface200 }]}>
            <KText variant="bodyStrong" color={selected ? 'brand' : 'ink'}>
              {o.label}
            </KText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SectionHeading({ children }: { children: string }) {
  return (
    <KText variant="heading" accessibilityRole="header">
      {children}
    </KText>
  );
}

export function EmptyState({ message, action, onAction }: { message: string; action?: string; onAction?: () => void }) {
  return (
    <View style={{ gap: Space.s4, paddingVertical: Space.s6, alignItems: 'stretch' }}>
      <KText variant="body" color="inkMuted" style={{ textAlign: 'center' }}>
        {message}
      </KText>
      {action && onAction ? (
        <Button onPress={onAction} block>
          {action}
        </Button>
      ) : null}
    </View>
  );
}

/** Modal bottom sheet with a handle and a titled header. */
export function BottomSheet({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const theme = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: theme.scrim }}>
        <Pressable accessibilityLabel="Close" style={{ flex: 1 }} onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <SafeAreaView
            edges={['bottom']}
            style={{
              maxHeight: '92%',
              backgroundColor: theme.surface200,
              borderTopLeftRadius: Radius.lg,
              borderTopRightRadius: Radius.lg,
            }}>
            <ScrollView
              contentContainerStyle={{ gap: Space.s5, padding: Space.s4, paddingTop: Space.s3 }}
              keyboardShouldPersistTaps="handled">
              <View
                style={{ width: 40, height: 4, borderRadius: Radius.full, alignSelf: 'center', backgroundColor: theme.lineStrong }}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <KText variant="title" accessibilityRole="header">
                  {title}
                </KText>
                <IconButton label="Close" onPress={onClose} bare>
                  <Icon name="close" color={theme.ink} />
                </IconButton>
              </View>
              {children}
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

/** Labelled single-line text input in the Kosh style. */
export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'decimal-pad';
}) {
  const theme = useTheme();
  return (
    <View style={{ gap: Space.s1 }}>
      <KText variant="overline">{label}</KText>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.inkMuted}
        keyboardType={keyboardType}
        style={{
          minHeight: TapMin,
          borderWidth: 2,
          borderRadius: Radius.sm,
          paddingHorizontal: Space.s3,
          fontFamily: FontFamily.sans500,
          fontSize: 15,
          borderColor: theme.lineStrong,
          backgroundColor: theme.surface200,
          color: theme.ink,
        }}
      />
    </View>
  );
}

/** Screen shell: paper background, safe area, scrolling column with 16px side margins and 24px gaps. */
export function Screen({ children, bottomInset = 0 }: { children: ReactNode; bottomInset?: number }) {
  const theme = useTheme();
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.surface100 }}>
      <ScrollView
        contentContainerStyle={{ padding: Space.s4, paddingBottom: Space.s8 + bottomInset }}
        keyboardShouldPersistTaps="handled">
        <View style={{ width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', gap: Space.s6 }}>
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.lg, padding: Space.s4, borderWidth: 1 },
  button: {
    minHeight: TapMin,
    minWidth: TapMin,
    paddingHorizontal: Space.s5,
    borderRadius: Radius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  block: { alignSelf: 'stretch' },
  iconButton: {
    width: TapMin,
    height: TapMin,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: Space.s3 },
  track: { height: 12, borderRadius: Radius.full, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TapMin,
    borderRadius: Radius.md,
    paddingRight: Space.s1,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.s3,
    paddingVertical: Space.s3,
    paddingLeft: Space.s4,
    paddingRight: Space.s2,
    minWidth: 0,
  },
  mono: { width: 40, height: 40, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  insightTag: { alignSelf: 'flex-start', paddingVertical: Space.s1, paddingHorizontal: Space.s2, borderRadius: Radius.sm },
  chip: {
    minHeight: TapMin,
    paddingHorizontal: Space.s4,
    borderRadius: Radius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seg: { flexDirection: 'row', gap: Space.s1, padding: Space.s1, borderRadius: Radius.md },
  segItem: {
    flex: 1,
    minHeight: 44,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
