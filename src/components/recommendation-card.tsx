import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Card, KText } from '@/components/kosh/kosh';
import { Space } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { maskAmounts, type Recommendation } from '@/domain/recommendations';
import { formatRupees } from '@/utils/money';

const TAGS: Record<Recommendation['ruleId'], string> = {
  'BUD-OVER': 'Budget',
  'BUD-WARN': 'Budget',
  'ANOM-DISC': 'Spending',
  'ANOM-INFO': 'Spending',
  GAP: 'Goals',
  'GAP-INFO': 'Goals',
};

/** One recommendation: facts first, then any suggestion, with a "Why am I seeing this?" explanation. */
export function RecommendationCard({ rec, masked }: { rec: Recommendation; masked?: boolean }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const show = (text: string) => (masked ? maskAmounts(text) : text);
  const accent = rec.priority === 'high' ? theme.negative : rec.priority === 'medium' ? theme.accentText : theme.inkMuted;

  return (
    <Card style={{ gap: Space.s3 }}>
      <KText variant="overline" style={{ color: accent }}>
        {`${TAGS[rec.ruleId]} · ${rec.kind === 'suggestion' ? 'Suggestion' : 'Insight'}`}
      </KText>
      <KText variant="heading">{rec.title}</KText>
      <KText variant="body" color="inkMuted">
        {show(rec.reason)}
      </KText>
      {rec.suggestedAction ? <KText variant="body">{show(rec.suggestedAction)}</KText> : null}
      {rec.note ? (
        <KText variant="caption" color="inkMuted">
          {show(rec.note)}
        </KText>
      ) : null}
      {rec.potentialSavings ? (
        <KText variant="bodyStrong" color="positive">
          {show(`Up to ${formatRupees({ currency: 'INR', cents: rec.potentialSavings.upToCents })} this month (estimate)`)}
        </KText>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(!open)}
        style={{ minHeight: 44, justifyContent: 'center' }}>
        <KText variant="bodyStrong" color="brand">
          {open ? 'Hide details' : 'Why am I seeing this?'}
        </KText>
      </Pressable>
      {open ? (
        <View style={{ gap: Space.s2 }}>
          <KText variant="caption">{`Rule: ${rec.explanation.ruleName}`}</KText>
          <KText variant="caption">{show(rec.explanation.condition)}</KText>
          {rec.supportingMetrics.map((m) => (
            <View key={m.label} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: Space.s3 }}>
              <KText variant="caption" style={{ flexShrink: 1 }}>
                {m.label}
              </KText>
              <KText variant="caption" color="ink" style={{ flexShrink: 1, textAlign: 'right' }}>
                {show(m.display)}
              </KText>
            </View>
          ))}
        </View>
      ) : null}
    </Card>
  );
}
