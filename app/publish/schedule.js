// app/publish/schedule.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../src/context/UserContext';
import { useDrafts } from '../../src/context/DraftContext';
import SchedulePicker from '../../src/components/SchedulePicker';

export default function ScheduleScreen() {
  const router = useRouter();
  const { draftId } = useLocalSearchParams();
  const { theme } = useTheme();
  const { scheduleDraft, currentDraft, drafts } = useDrafts();

  const draft = currentDraft || drafts.find((d) => d.id === draftId);

  const [selectedDate, setSelectedDate] = useState(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [error, setError] = useState(null);

  const styles = createStyles(theme);

  const handleBack = () => {
    router.back();
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setError(null);
  };

  const handleConfirmSchedule = async (date) => {
    if (!draft) return;

    const scheduleDate = date || selectedDate;
    if (!scheduleDate) {
      setError('Please select a date and time');
      return;
    }

    setIsScheduling(true);
    setError(null);

    try {
      const result = await scheduleDraft(draft.id, scheduleDate);

      if (result.success) {
        Alert.alert(
          'Scheduled!',
          `Your post will be published on ${scheduleDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}`,
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      } else {
        setError(result.error || 'Failed to schedule post');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsScheduling(false);
    }
  };

  if (!draft) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Draft not found</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.emptyButton}
          >
            <Text style={styles.emptyButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Schedule Post</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Draft Info */}
        <View style={styles.draftInfo}>
          <Text style={styles.draftTitle} numberOfLines={1}>
            {draft.title || 'Untitled Draft'}
          </Text>
          <View style={styles.toneBadge}>
            <Text style={styles.toneBadgeText}>{draft.tone}</Text>
          </View>
        </View>

        {/* Schedule Picker */}
        <View style={styles.pickerContainer}>
          <SchedulePicker
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            onConfirm={handleConfirmSchedule}
            error={error}
          />
        </View>

        {/* Loading */}
        {isScheduling && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={theme.accent} />
              <Text style={styles.loadingText}>Scheduling your post...</Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.bg,
    },
    container: {
      flex: 1,
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    backButton: {
      padding: 4,
    },
    backIcon: {
      fontSize: 24,
      color: theme.textMuted,
    },
    title: {
      flex: 1,
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      marginLeft: 12,
    },
    headerSpacer: {
      width: 28,
    },
    draftInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 14,
      borderRadius: 12,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 24,
    },
    draftTitle: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginRight: 12,
    },
    toneBadge: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 20,
      backgroundColor: theme.primaryGlow,
      borderWidth: 1,
      borderColor: `${theme.primary}40`,
    },
    toneBadgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.primary,
    },
    pickerContainer: {
      flex: 1,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingCard: {
      padding: 32,
      borderRadius: 20,
      backgroundColor: theme.surface,
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 14,
      color: theme.text,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    emptyText: {
      fontSize: 16,
      color: theme.textMuted,
      marginBottom: 20,
    },
    emptyButton: {
      padding: 14,
      borderRadius: 12,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    emptyButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
    },
  });