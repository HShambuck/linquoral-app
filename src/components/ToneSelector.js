// src/components/ToneSelector.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../context/UserContext';
import { TONES, TONE_DESCRIPTIONS } from '../utils/constants';

const ToneSelector = ({
  selectedTone = 'Professional',
  onSelectTone,
  showDescriptions = false,
  layout = 'horizontal',
  label = null,
}) => {
  const { theme, isDarkMode } = useTheme();
  const styles = createStyles(theme, isDarkMode);

  if (layout === 'vertical') {
    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View style={styles.verticalList}>
          {TONES.map((tone) => {
            const isSelected = selectedTone === tone;
            return (
              <TouchableOpacity
                key={tone}
                onPress={() => onSelectTone?.(tone)}
                style={[styles.verticalItem, isSelected && styles.verticalItemSelected]}
                activeOpacity={0.72}
              >
                <View style={styles.verticalItemRow}>
                  <View style={[styles.verticalRadio, isSelected && styles.verticalRadioSelected]}>
                    {isSelected && <View style={styles.verticalRadioDot} />}
                  </View>
                  <View style={styles.verticalItemText}>
                    <Text style={[styles.verticalItemLabel, isSelected && styles.verticalItemLabelSelected]}>
                      {tone}
                    </Text>
                    {showDescriptions && (
                      <Text style={styles.verticalItemDesc}>{TONE_DESCRIPTIONS[tone]}</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      >
        {TONES.map((tone) => {
          const isSelected = selectedTone === tone;
          return (
            <TouchableOpacity
              key={tone}
              onPress={() => onSelectTone?.(tone)}
              style={[styles.chip, isSelected && styles.chipSelected]}
              activeOpacity={0.72}
            >
              {isSelected && <View style={styles.chipDot} />}
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {tone}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme, isDarkMode) => StyleSheet.create({
  container: { marginBottom: 4 },
  label: {
    fontSize: 10, letterSpacing: 1.5,
    textTransform: 'uppercase', color: theme.textMuted,
    marginBottom: 10, fontWeight: '600',
  },

  // Horizontal
  horizontalList: { flexDirection: 'row', gap: 8, paddingRight: 4 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: theme.surface,
    borderWidth: 1.5, borderColor: theme.border,
  },
  chipSelected: {
    borderColor: theme.primary,
    backgroundColor: theme.primaryGlow,
  },
  chipDot: {
    width: 5, height: 5, borderRadius: 2.5,
    backgroundColor: theme.primary,
  },
  chipText: { fontSize: 13, fontWeight: '500', color: theme.textMuted },
  chipTextSelected: { fontWeight: '600', color: theme.primary },

  // Vertical
  verticalList: { gap: 8 },
  verticalItem: {
    padding: 14, borderRadius: 14,
    backgroundColor: theme.surface,
    borderWidth: 1.5, borderColor: theme.border,
  },
  verticalItemSelected: {
    borderColor: theme.primary,
    backgroundColor: theme.primaryGlow,
  },
  verticalItemRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  verticalRadio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: theme.border,
    justifyContent: 'center', alignItems: 'center',
  },
  verticalRadioSelected: { borderColor: theme.primary },
  verticalRadioDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: theme.primary,
  },
  verticalItemText: { flex: 1 },
  verticalItemLabel: { fontSize: 14, fontWeight: '500', color: theme.text },
  verticalItemLabelSelected: { fontWeight: '700', color: theme.primary },
  verticalItemDesc: { fontSize: 12, color: theme.textMuted, marginTop: 3, lineHeight: 17 },
});

export default ToneSelector;