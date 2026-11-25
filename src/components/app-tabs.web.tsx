import { Tabs, TabList, TabTrigger, TabSlot, TabTriggerSlotProps, TabListProps } from 'expo-router/ui';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KText } from '@/components/kosh/kosh';
import { Radius, Space, TapMin } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Web tab layout: content fills the screen, the tab bar sits below it in normal flow (never over content). */
export default function AppTabs() {
  return (
    <Tabs style={{ flex: 1 }}>
      <TabSlot style={{ flex: 1 }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="index" href="/" asChild>
            <TabButton>Home</TabButton>
          </TabTrigger>
          <TabTrigger name="transactions" href="/transactions" asChild>
            <TabButton>Expenses</TabButton>
          </TabTrigger>
          <TabTrigger name="budgets" href="/budgets" asChild>
            <TabButton>Budgets</TabButton>
          </TabTrigger>
          <TabTrigger name="goals" href="/goals" asChild>
            <TabButton>Goals</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  const theme = useTheme();
  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityState={{ selected: !!isFocused }}
      style={styles.tab}>
      <View style={[styles.pill, isFocused && { backgroundColor: theme.brandTint }]}>
        <KText variant="bodyStrong" color={isFocused ? 'brand' : 'inkMuted'} numberOfLines={1}>
          {children}
        </KText>
      </View>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      {...props}
      style={[
        styles.bar,
        { backgroundColor: theme.surface200, borderTopColor: theme.line, paddingBottom: Math.max(insets.bottom, Space.s2) },
      ]}>
      {props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: Space.s2,
    paddingHorizontal: Space.s2,
    gap: Space.s1,
  },
  tab: { flex: 1, minWidth: 0, minHeight: TapMin, justifyContent: 'center' },
  pill: {
    minHeight: TapMin,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Space.s1,
  },
});
