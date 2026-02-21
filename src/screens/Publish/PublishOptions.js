// src/screens/Publish/PublishOptions.js

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
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import { useDrafts } from '../../context/DraftContext';
import publishService from '../../services/publishService';
import { SCREENS } from '../../utils/constants';
import { getDisplayText, generateTitleFromContent } from '../../models/Draft';

/**
 * PublishOptions Screen
 * 
 * Allows users to choose how to publish their post:
 * - Post Now: Publish immediately to LinkedIn
 * - Schedule: Pick a future date/time
 * - Copy Text: Manual paste into LinkedIn
 * 
 * Design Principle: No silent auto-posting. User chooses when and how to publish.
 */
const PublishOptions = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme, isDarkMode } = useTheme();
  const { user } = useAuth();
  const { currentDraft, drafts } = useDrafts();

  const { draftId } = route.params || {};
  const draft = currentDraft || drafts.find((d) => d.id === draftId);

  const [selectedMode, setSelectedMode] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const styles = createStyles(theme, isDarkMode);

  /**
   * Handle back navigation
   */
  const handleBack = () => {
    navigation.goBack();
  };

  /**
   * Handle Post Now
   */
  const handlePostNow = async () => {
    if (!draft) return;

    Alert.alert(
      'Publish Now?',
      'Your post will be published immediately to LinkedIn.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Publish',
          onPress: async () => {
            setIsPublishing(true);
            try {
              const result = await publishService.publishNow(draft.id);
              if (result.success) {
                Alert.alert(
                  'Published!',
                  'Your post is now live on LinkedIn.',
                  [
                    {
                      text: 'OK',
                      onPress: () => navigation.navigate(SCREENS.HOME),
                    },
                  ]
                );
              }
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to publish.');
            } finally {
              setIsPublishing(false);
            }
          },
        },
      ]
    );
  };

  /**
   * Handle Schedule
   */
  const handleSchedule = () => {
    if (!draft) return;
    navigation.navigate(SCREENS.SCHEDULE, { draftId: draft.id });
  };

  /**
   * Handle Copy Text
   */
  const handleCopyText = async () => {
    if (!draft) return;

    const text = getDisplayText(draft);
    const success = await publishService.copyToClipboard(text);

    if (success) {
      Alert.alert(
        'Copied!',
        'Your post has been copied to clipboard. Open LinkedIn to paste it.',
        [
          { text: 'OK' },
          {
            text: 'Open LinkedIn',
            onPress: () => publishService.openLinkedIn(),
          },
        ]
      );
    } else {
      Alert.alert('Error', 'Failed to copy text.');
    }
  };

  /**
   * Handle confirm button
   */
  const handleConfirm = () => {
    if (selectedMode === 'now') {
      handlePostNow();
    } else if (selectedMode === 'schedule') {
      handleSchedule();
    }
  };

  if (!draft) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Draft not found</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.emptyButton}
          >
            <Text style={styles.emptyButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const displayText = getDisplayText(draft);
  const previewText = displayText.length > 120
    ? displayText.substring(0, 120) + '...'
    : displayText;

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
          <Text style={styles.title}>Publish Options</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Post Preview Card */}
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <View style={styles.previewAvatar}>
              <Text style={styles.previewAvatarText}>
                {user?.initials || 'U'}
              </Text>
            </View>
            <View style={styles.previewInfo}>
              <Text style={styles.previewName}>
                {user?.displayName || 'User'}
              </Text>
              <Text style={styles.previewMeta}>
                Final Year Student · LinkedIn
              </Text>
            </View>
          </View>
          <Text style={styles.previewText}>{previewText}</Text>
        </View>

        {/* Publish Options */}
        <View style={styles.optionsContainer}>
          {/* Post Now */}
          <TouchableOpacity
            onPress={() => setSelectedMode('now')}
            style={[
              styles.optionCard,
              selectedMode === 'now' && styles.optionCardSelectedPrimary,
            ]}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.optionIcon,
                selectedMode === 'now' && styles.optionIconSelectedPrimary,
              ]}
            >
              <Text style={styles.optionEmoji}>🚀</Text>
            </View>
            <View style={styles.optionContent}>
              <Text
                style={[
                  styles.optionTitle,
                  selectedMode === 'now' && styles.optionTitleSelectedPrimary,
                ]}
              >
                Post Now
              </Text>
              <Text style={styles.optionDescription}>
                Publish immediately to LinkedIn
              </Text>
            </View>
          </TouchableOpacity>

          {/* Schedule */}
          <TouchableOpacity
            onPress={() => setSelectedMode('schedule')}
            style={[
              styles.optionCard,
              selectedMode === 'schedule' && styles.optionCardSelectedAccent,
            ]}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.optionIcon,
                selectedMode === 'schedule' && styles.optionIconSelectedAccent,
              ]}
            >
              <Text style={styles.optionEmoji}>📅</Text>
            </View>
            <View style={styles.optionContent}>
              <Text
                style={[
                  styles.optionTitle,
                  selectedMode === 'schedule' && styles.optionTitleSelectedAccent,
                ]}
              >
                Schedule
              </Text>
              <Text style={styles.optionDescription}>
                Pick the best time for engagement
              </Text>
            </View>
          </TouchableOpacity>

          {/* Copy Text */}
          <TouchableOpacity
            onPress={handleCopyText}
            style={styles.optionCard}
            activeOpacity={0.8}
          >
            <View style={styles.optionIconNeutral}>
              <Text style={styles.optionEmoji}>📋</Text>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Copy Text</Text>
              <Text style={styles.optionDescription}>
                Paste manually into LinkedIn
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Confirm Button */}
        {selectedMode && (
          <TouchableOpacity
            onPress={handleConfirm}
            style={[
              styles.confirmButton,
              selectedMode === 'now'
                ? styles.confirmButtonPrimary
                : styles.confirmButtonAccent,
            ]}
            activeOpacity={0.8}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmButtonText}>
                {selectedMode === 'now' ? 'Confirm & Publish' : 'Choose Date & Time'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme, isDarkMode) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.bg,
    },
    container: {
      flex: 1,
      padding: 20,
    },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 28,
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

    // Preview Card
    previewCard: {
      padding: 16,
      borderRadius: 16,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 24,
    },
    previewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    previewAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    previewAvatarText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '700',
    },
    previewInfo: {
      flex: 1,
    },
    previewName: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.text,
    },
    previewMeta: {
      fontSize: 11,
      color: theme.textMuted,
    },
    previewText: {
      fontSize: 12,
      color: theme.textSecondary,
      lineHeight: 18,
    },

    // Options
    optionsContainer: {
      gap: 12,
    },
    optionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      borderRadius: 18,
      backgroundColor: theme.surface,
      borderWidth: 2,
      borderColor: theme.border,
    },
    optionCardSelectedPrimary: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    optionCardSelectedAccent: {
      backgroundColor: theme.accentGlow,
      borderColor: theme.accent,
    },
    optionIcon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: theme.primaryGlow,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    optionIconSelectedPrimary: {
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    optionIconSelectedAccent: {
      backgroundColor: 'rgba(56,232,196,0.2)',
    },
    optionIconNeutral: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: isDarkMode ? '#1E2736' : '#EFF3FA',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    optionEmoji: {
      fontSize: 22,
    },
    optionContent: {
      flex: 1,
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 2,
    },
    optionTitleSelectedPrimary: {
      color: '#fff',
    },
    optionTitleSelectedAccent: {
      color: theme.accent,
    },
    optionDescription: {
      fontSize: 12,
      color: theme.textMuted,
    },

    // Spacer
    spacer: {
      flex: 1,
    },

    // Confirm Button
    confirmButton: {
      padding: 16,
      borderRadius: 16,
      alignItems: 'center',
      marginTop: 16,
    },
    confirmButtonPrimary: {
      backgroundColor: theme.primary,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    confirmButtonAccent: {
      backgroundColor: theme.accent,
      shadowColor: theme.accent,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    confirmButtonText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#fff',
    },

    // Empty State
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

export default PublishOptions;