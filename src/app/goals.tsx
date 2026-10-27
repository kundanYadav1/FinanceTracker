import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatMoney } from '@/utils/money';
import { computeGoalProgress } from '@/db/goals';
import type { SavingsGoal } from '@/db/goals';
import { useAppStore } from '@/store/appStore';

export default function GoalsScreen() {
  const theme = useTheme();
  const { goals, reloadGoals, addGoal, removeGoal, getGoalProgress } = useAppStore();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().slice(0, 10));
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [showForm, setShowForm] = useState(false);

  const inputStyle = {
    backgroundColor: theme.background,
    color: theme.text,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: theme.backgroundElement,
    minHeight: 44,
  } as const;

  const handleSave = async () => {
    await addGoal({
      name,
      targetAmount: { currency: 'INR', cents: Math.round(parseFloat(targetAmount || '0') * 100) },
      currentAmount: { currency: 'INR', cents: Math.round(parseFloat(currentAmount || '0') * 100) },
      targetDate,
      priority,
    });
    await reloadGoals();
    setShowForm(false);
    setName('');
    setTargetAmount('');
    setCurrentAmount('0');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>Savings Goals</ThemedText>

        {showForm && (
          <ThemedView type="backgroundElement" style={styles.formCard}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>Create a Goal</ThemedText>
            <TextInput style={inputStyle} value={name} onChangeText={setName} placeholder="Goal name (e.g. Emergency Fund)" />
            <View style={styles.row}>
              <TextInput style={inputStyle} value={targetAmount} onChangeText={setTargetAmount} placeholder="Target amount" keyboardType="numeric" />
              <TextInput style={inputStyle} value={currentAmount} onChangeText={setCurrentAmount} placeholder="Current saved" keyboardType="numeric" />
            </View>
            <TextInput style={inputStyle} value={targetDate} onChangeText={setTargetDate} placeholder="Target date (YYYY-MM-DD)" />
            <View style={styles.row}>
              <Button label="Low" onPress={() => setPriority('low')} type="default" />
              <Button label="Medium" onPress={() => setPriority('medium')} type="default" />
              <Button label="High" onPress={() => setPriority('high')} type="default" />
            </View>
            <Button label="Create Goal" onPress={handleSave} type="default" />
            <Button label="Cancel" onPress={() => setShowForm(false)} type="default" />
          </ThemedView>
        )}

        <Button label="Add Goal" onPress={() => setShowForm(true)} type="default" />

        <ThemedText type="smallBold" style={styles.listTitle}>
          {goals.length} goal{goals.length === 1 ? '' : 's'}
        </ThemedText>

        {goals.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
            No savings goals yet. Create your first goal.
          </ThemedText>
        ) : (
          <View style={styles.list}>
            {goals.map((goal) => {
              const progress = getGoalProgress(goal);
              return (
                <GoalRow key={goal.id} goal={goal} progress={progress} onDelete={() => removeGoal(goal.id)} />
              );
            })}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

function GoalRow({ goal, progress, onDelete }: { goal: SavingsGoal; progress: ReturnType<typeof computeGoalProgress>; onDelete: () => void }) {
  const theme = useTheme();
  return (
      <ThemedView type="backgroundElement" style={styles.goalRow}>
      <ThemedView style={styles.rowContent}>
        <ThemedText type="default">{goal.name}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">{goal.targetDate} · {goal.priority}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.rowActions}>
        <ThemedText type="default" style={{ fontWeight: '600' }}>
          {formatMoney(goal.currentAmount)} / {formatMoney(goal.targetAmount)}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary, fontWeight: '600' }}>
          {progress.progressPercent}%
        </ThemedText>
        <PressableDelete onPress={onDelete} />
      </ThemedView>
    </ThemedView>
  );
}

function PressableDelete({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ paddingHorizontal: Spacing.three, paddingVertical: Spacing.two }}>
      <ThemedText type="small" style={{ color: '#e57373', fontWeight: '600' }}>Delete</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six },
  title: { fontSize: 32, fontWeight: 600, lineHeight: 44 },
  formCard: { marginBottom: Spacing.four, padding: Spacing.four, borderRadius: Spacing.three },
  sectionTitle: { fontSize: 14, fontWeight: 700, marginBottom: Spacing.three },
  row: { flexDirection: 'row', gap: Spacing.three, marginBottom: Spacing.three, flexWrap: 'wrap' },
  listTitle: { fontSize: 14, fontWeight: 700, marginBottom: Spacing.three },
  empty: { paddingVertical: Spacing.four, textAlign: 'center' },
  list: { gap: Spacing.two },
  goalRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    borderLeftWidth: 4,
    marginBottom: Spacing.two,
  },
  rowContent: { flex: 1, gap: Spacing.half },
  rowActions: { gap: Spacing.two, alignItems: 'center' },
});
