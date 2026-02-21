// src/screens/Editor/EditScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/UserContext';
import { useDrafts } from '../../context/DraftContext';
import ToneSelector from '../../components/ToneSelector';
import { SCREENS, LINKEDIN_LIMITS } from '../../utils/constants';
import { getCharacterCountStatus } from '../../utils/validators';
import { getDisplayText } from '../../models/Draft';

/**
 * EditScreen
 * 
 * Post editor for reviewing and editing AI-refined content.
 * Users can modify text, change tone, and proceed to publishing.
 * 
 * Design Principles:
 * - Authenticity Preservation: AI refines, user controls final output
 * - User Control & Trust: Always editable, no auto-publishing
 */
const EditScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme, isDarkMode } = useTheme();
  const {
    currentDraft,
    setCurrentDraft,
    updateDraftText,
    updateDraftTone,
    saveDraft,
    drafts,
  } = useDrafts();

  const { draftId } = route.params || {};

  const [editText, setEditText] = useState('');
  const [selectedTone, setSelectedTone] = useState('Professional');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const styles = createStyles(theme, isDarkMode);

  /**
   * Load draft on mount
   */
  useEffect(() => {
    if (draftId) {
      const draft = drafts.find((d) => d.id === draftId);
      if (draft) {
        setCurrentDraft(draft);
        setEditText(getDisplayText(draft));
        setSelectedTone(draft.tone);
      }
    } else if (currentDraft) {
      setEditText(getDisplayText(currentDraft));
      setSelectedTone(currentDraft.tone);
    }
  }, [draftId]);

  /**
   * Track changes
   */
  useEffect(() => {
    if (currentDraft) {
      const originalText = getDisplayText(currentDraft);
      setHasChanges(
        editText !== originalText || selectedTone !== currentDraft.tone
      );
    }
  }, [editText, selectedTone, currentDraft]);

  /**
   * Handle back navigation
   */
  const handleBack = () => {
    if (hasChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. What would you like to do?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'Save Draft',
            onPress: async () => {
              await handleSaveDraft();
              navigation.goBack();
            },
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  /**
   * Handle text change
   */
  const handleTextChange = (text) => {
    setEditText(text);
  };

  /**
   * Handle tone change
   */
  const handleToneChange = async (tone) => {
    if (!currentDraft) return;

    setSelectedTone(tone);

    // Optionally re-refine with new tone
    Alert.alert(
      'Change Tone',
      'Would you like AI to rewrite your post in this tone?',
      [
        { text: 'Keep My Text', style: 'cancel' },
        {
          text: 'Rewrite',
          onPress: async () => {
            const result = await updateDraftTone(currentDraft.id, tone);
            if (result.success && result.refinedText) {
              setEditText(result.refinedText);
            }
          },
        },
      ]
    );
  };

  /**
   * Save draft
   */
  const handleSaveDraft = async () => {
    if (!currentDraft) return;

    setIsSaving(true);
    const result = await saveDraft(currentDraft.id, {
      userEditedText: editText,
      tone: selectedTone,
    });
    setIsSaving(false);

    if (result.success) {
      setHasChanges(false);
      return true;
    } else {
      Alert.alert('Error', 'Failed to save draft. Please try again.');
      return false;
    }
  };

  /**
   * Navigate to publish options
   */
  const handlePublishOptions = async () => {
    // Save first if there are changes
    if (hasChanges) {
      const saved = await handleSaveDraft();
      if (!saved) return;
    }

    navigation.navigate(SCREENS.PUBLISH_OPTIONS, { draftId: currentDraft.id });
  };

  /**
   * Get character count color
   */
  const charCountStatus = getCharacterCountStatus(editText.length);
  const charCountColor =
    charCountStatus === 'error'
      ? theme.danger
      : charCountStatus === 'warning'
      ? theme.warning
      : theme.textMuted;

  if (!currentDraft && !draftId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No draft selected</Text>
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                onPress={handleBack}
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <Text style={styles.backIcon}>←</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Edit Post</Text>
            </View>
            <View style={styles.toneBadge}>
              <Text style={styles.toneBadgeText}>{selectedTone}</Text>
            </View>
          </View>

          {/* AI Refinement Notice */}
          <View style={styles.aiNotice}>
            <Text style={styles.aiNoticeIcon}>✨</Text>
            <Text style={styles.aiNoticeText}>
              AI has refined your transcript. Your voice and meaning are preserved.
            </Text>
          </View>

          {/* Editor */}
          <View style={styles.editorContainer}>
            <TextInput
              value={editText}
              onChangeText={handleTextChange}
              style={styles.textInput}
              multiline
              placeholder="Your post content..."
              placeholderTextColor={theme.textMuted}
              textAlignVertical="top"
            />
            <View style={styles.charCount}>
              <Text style={[styles.charCountText, { color: charCountColor }]}>
                {editText.length} / {LINKEDIN_LIMITS.MAX_POST_LENGTH}
              </Text>
            </View>
          </View>

          {/* Tone Selector */}
          <View style={styles.toneSection}>
            <ToneSelector
              selectedTone={selectedTone}
              onSelectTone={handleToneChange}
              label="Tone"
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={handleSaveDraft}
              style={styles.saveDraftButton}
              activeOpacity={0.7}
              disabled={isSaving || !hasChanges}
            >
              <Text
                style={[
                  styles.saveDraftText,
                  (!hasChanges || isSaving) && styles.saveDraftTextDisabled,
                ]}
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePublishOptions}
              style={styles.publishButton}
              activeOpacity={0.8}
            >
              <Text style={styles.publishButtonText}>Publish Options →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (theme, isDarkMode) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.bg,
    },
    keyboardView: {
      flex: 1,
    },
    container: {
      flex: 1,
      padding: 20,
    },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      padding: 4,
    },
    backIcon: {
      fontSize: 24,
      color: theme.textMuted,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      marginLeft: 12,
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

    // AI Notice
    aiNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 12,
      backgroundColor: theme.accentGlow,
      borderWidth: 1,
      borderColor: `${theme.accent}30`,
      marginBottom: 16,
    },
    aiNoticeIcon: {
      fontSize: 14,
      marginRight: 10,
    },
    aiNoticeText: {
      flex: 1,
      fontSize: 12,
      color: theme.textSecondary,
    },

    // Editor
    editorContainer: {
      flex: 1,
      marginBottom: 16,
    },
    textInput: {
      flex: 1,
      padding: 16,
      borderRadius: 16,
      backgroundColor: theme.surface,
      borderWidth: 1.5,
      borderColor: theme.border,
      color: theme.text,
      fontSize: 14,
      lineHeight: 22,
      fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    charCount: {
      position: 'absolute',
      bottom: 12,
      right: 14,
    },
    charCountText: {
      fontSize: 11,
    },

    // Tone Section
    toneSection: {
      marginBottom: 16,
    },

    // Actions
    actions: {
      flexDirection: 'row',
      gap: 10,
    },
    saveDraftButton: {
      flex: 1,
      padding: 14,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: theme.border,
      alignItems: 'center',
    },
    saveDraftText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    saveDraftTextDisabled: {
      opacity: 0.5,
    },
    publishButton: {
      flex: 2,
      padding: 14,
      borderRadius: 14,
      backgroundColor: theme.primary,
      alignItems: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    publishButtonText: {
      fontSize: 13,
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

export default EditScreen;