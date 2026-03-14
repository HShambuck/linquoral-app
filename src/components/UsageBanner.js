// src/components/UsageBanner.js
// Subtle usage bar shown on home screen for free users

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/UserContext';
import { useSubscription } from '../context/SubscriptionContext';

export default function UsageBanner() {
  const router = useRouter();
  const { theme } = useTheme();
  const { isPro, usage } = useSubscription();

  // Don't show for Pro users
  if (isPro) return null;

  const aiUsed = usage?.aiRefinementsUsed || 0;
  const aiLimit = usage?.aiRefinementsLimit || 3;
  const remaining = aiLimit - aiUsed;
  const pct = Math.min((aiUsed / aiLimit) * 100, 100);

  const isAlmostOut = remaining <= 1;
  const isOut = remaining <= 0;

  const barColor = isOut ? theme.danger : isAlmostOut ? theme.warning : theme.primary;

  const styles = createStyles(theme, isAlmostOut, isOut);

  return (
    <TouchableOpacity
      onPress={() => router.push('/upgrade')}
      style={styles.container}
      activeOpacity={0.8}
    >
      <View style={styles.left}>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: barColor }]} />
        </View>
        <Text style={styles.label}>
          {isOut
            ? 'AI refinements used up'
            : `${remaining} AI refinement${remaining === 1 ? '' : 's'} left this month`}
        </Text>
      </View>
      <View style={styles.upgradePill}>
        <Text style={styles.upgradePillText}>Upgrade</Text>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (theme, isAlmostOut, isOut) => StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 14, marginBottom: 16,
    backgroundColor: isOut ? theme.dangerGlow : isAlmostOut ? 'rgba(255,181,71,0.08)' : theme.surface,
    borderWidth: 1,
    borderColor: isOut ? `${theme.danger}30` : isAlmostOut ? `${theme.warning}30` : theme.border,
  },
  left: { flex: 1, gap: 5 },
  progressBg: { height: 3, borderRadius: 2, backgroundColor: theme.surfaceHigh, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  label: { fontSize: 12, color: theme.textSecondary },
  upgradePill: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, backgroundColor: theme.primary,
  },
  upgradePillText: { fontSize: 11, fontWeight: '700', color: '#fff' },
});