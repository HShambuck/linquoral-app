// src/components/ToneSelector.js

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/UserContext';
import { TONES, TONE_DESCRIPTIONS } from '../utils/constants';

/**
 * ToneSelector Component
 * 
 * Allows users to select the tone for their LinkedIn post.
 * Supports both horizontal pill layout and vertical list layout.
 * 
 * @param {Object} props
 * @param {string} props.selectedTone - Currently selected tone
 * @param {function} props.onSelectTone - Callback when tone is selected
 * @param {boolean} props.showDescriptions - Show tone descriptions (default: false)
 * @param {string} props.layout - 'horizontal' | 'vertical' (default: 'horizontal')
 * @param {string} props.label - Optional label above selector
 */
const ToneSelector = ({
  selectedTone = 'Professional',
  onSelectTone,
  showDescriptions = false,
  layout = 'horizontal',
  label = null,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const handleSelect = (tone) => {
    if (onSelectTone) {
      onSelectTone(tone);
    }
  };

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
                onPress={() => handleSelect(tone)}
                style={[
                  styles.verticalItem,
                  isSelected && styles.verticalItemSelected,
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.verticalItemContent}>
                  <View style={styles.verticalItemHeader}>
                    <Text
                      style={[
                        styles.verticalItemText,
                        isSelected && styles.verticalItemTextSelected,
                      ]}
                    >
                      {tone}
                    </Text>
                    {isSelected && (
                      <View style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    )}
                  </View>
                  {showDescriptions && (
                    <Text style={styles.description}>
                      {TONE_DESCRIPTIONS[tone]}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  // Horizontal layout (default)
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
              onPress={() => handleSelect(tone)}
              style={[
                styles.pill,
                isSelected && styles.pillSelected,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
                  isSelected && styles.pillTextSelected,
                ]}
              >
                {tone}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      marginBottom: 8,
    },
    label: {
      fontSize: 11,
      color: theme.textMuted,
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginBottom: 10,
    },
    
    // Horizontal layout styles
    horizontalList: {
      flexDirection: 'row',
      gap: 8,
    },
    pill: {
      paddingVertical: 7,
      paddingHorizontal: 14,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: theme.border,
      backgroundColor: 'transparent',
    },
    pillSelected: {
      borderColor: theme.primary,
      backgroundColor: theme.primaryGlow,
    },
    pillText: {
      fontSize: 12,
      fontWeight: '400',
      color: theme.textMuted,
    },
    pillTextSelected: {
      fontWeight: '600',
      color: theme.primary,
    },
    
    // Vertical layout styles
    verticalList: {
      gap: 10,
    },
    verticalItem: {
      padding: 14,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: theme.border,
      backgroundColor: theme.surface,
    },
    verticalItemSelected: {
      borderColor: theme.primary,
      backgroundColor: theme.primaryGlow,
    },
    verticalItemContent: {
      flex: 1,
    },
    verticalItemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    verticalItemText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.text,
    },
    verticalItemTextSelected: {
      fontWeight: '600',
      color: theme.primary,
    },
    checkmark: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkmarkText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '700',
    },
    description: {
      fontSize: 12,
      color: theme.textMuted,
      marginTop: 4,
    },
  });

export default ToneSelector;