import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "../../src/context/UserContext";
import { useDrafts } from "../../src/context/DraftContext";
import ToneSelector from "../../src/components/ToneSelector";
import VoiceRecorder from "../../src/components/VoiceRecorder";
import aiService from "../../src/services/aiService";
import { LINKEDIN_LIMITS } from "../../src/utils/constants";
import { getCharacterCountStatus } from "../../src/utils/validators";
import { getDisplayText } from "../../src/models/Draft";

export default function EditorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme, isDarkMode } = useTheme();
  const { currentDraft, setCurrentDraft, saveDraft, updateDraftTone, drafts } =
    useDrafts();

  const [editText, setEditText] = useState("");
  const [selectedTone, setSelectedTone] = useState("Professional");
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingTone, setIsChangingTone] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showVoiceEdit, setShowVoiceEdit] = useState(false);
  const [isApplyingVoiceEdit, setIsApplyingVoiceEdit] = useState(false);

  const styles = createStyles(theme, isDarkMode);

  useEffect(() => {
    if (id) {
      const draft = drafts.find((d) => d.id === id);
      if (draft) {
        setCurrentDraft(draft);
        setEditText(getDisplayText(draft));
        setSelectedTone(draft.tone);
      }
    } else if (currentDraft) {
      setEditText(getDisplayText(currentDraft));
      setSelectedTone(currentDraft.tone);
    }
  }, [id]);

  useEffect(() => {
    if (currentDraft) {
      const originalText = getDisplayText(currentDraft);
      setHasChanges(
        editText !== originalText || selectedTone !== currentDraft.tone,
      );
    }
  }, [editText, selectedTone, currentDraft]);

  const handleToneChange = async (newTone) => {
    setSelectedTone(newTone);
    if (!currentDraft) return;
    setIsChangingTone(true);
    const result = await updateDraftTone(currentDraft.id, newTone);
    if (result.success) {
      setEditText(result.refinedText);
    } else {
      Alert.alert("Error", "Failed to change tone. Please try again.");
    }
    setIsChangingTone(false);
  };

  const handleBack = () => {
    if (hasChanges) {
      Alert.alert("Unsaved Changes", "What would you like to do?", [
        { text: "Cancel", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: () => router.back() },
        {
          text: "Save Draft",
          onPress: async () => {
            await handleSaveDraft();
            router.back();
          },
        },
      ]);
    } else {
      router.back();
    }
  };

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
      Alert.alert("Error", "Failed to save draft.");
      return false;
    }
  };

  const handlePublishOptions = async () => {
    if (hasChanges) {
      const saved = await handleSaveDraft();
      if (!saved) return;
    }
    router.push(`/publish/options?draftId=${currentDraft.id}`);
  };

  // Called when voice edit recording completes
  const handleVoiceEditComplete = useCallback(
    async ({ uri }) => {
      setIsApplyingVoiceEdit(true);
      try {
        // Step 1: transcribe the edit instructions
        const { transcript } = await aiService.transcribeAudio(uri);
        // Step 2: apply the instructions to current post text
        const { refinedText } = await aiService.applyVoiceEdit(
          editText,
          transcript,
          selectedTone,
        );
        setEditText(refinedText);
        setHasChanges(true);
        setShowVoiceEdit(false);
      } catch (error) {
        Alert.alert("Error", "Failed to apply voice edit. Please try again.");
      }
      setIsApplyingVoiceEdit(false);
    },
    [editText, selectedTone],
  );

  const charCountStatus = getCharacterCountStatus(editText.length);
  const charCountColor =
    charCountStatus === "error"
      ? theme.danger
      : charCountStatus === "warning"
        ? theme.warning
        : theme.textMuted;

  if (!currentDraft && !id) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No draft selected</Text>
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
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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
            <View style={styles.headerRight}>
              {/* Voice Edit Button */}
              <TouchableOpacity
                onPress={() => setShowVoiceEdit(true)}
                style={styles.voiceEditButton}
                activeOpacity={0.7}
              >
                <Text style={styles.voiceEditIcon}>🎙</Text>
                <Text style={styles.voiceEditLabel}>Edit</Text>
              </TouchableOpacity>
              <View style={styles.toneBadge}>
                <Text style={styles.toneBadgeText}>{selectedTone}</Text>
              </View>
            </View>
          </View>

          {/* AI Notice */}
          <View style={styles.aiNotice}>
            <Text style={styles.aiNoticeIcon}>✨</Text>
            <Text style={styles.aiNoticeText}>
              AI has refined your transcript. Your voice and meaning are
              preserved.
            </Text>
          </View>

          {/* Editor */}
          <View style={styles.editorContainer}>
            <TextInput
              value={editText}
              onChangeText={setEditText}
              style={styles.textInput}
              multiline
              placeholder="Your post content..."
              placeholderTextColor={theme.textMuted}
              textAlignVertical="top"
              editable={!isChangingTone}
            />
            {/* Tone loading overlay */}
            {isChangingTone && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator color={theme.primary} size="small" />
                <Text style={styles.loadingText}>Changing tone...</Text>
              </View>
            )}
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

          {/* Actions */}
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
                {isSaving ? "Saving..." : "Save Draft"}
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

      {/* Voice Edit Modal */}
      <Modal
        visible={showVoiceEdit}
        animationType="slide"
        transparent
        onRequestClose={() => setShowVoiceEdit(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Voice Edit</Text>
              <TouchableOpacity
                onPress={() => setShowVoiceEdit(false)}
                style={styles.modalClose}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Speak your edit instructions. For example: "make it shorter" or
              "add a call to action at the end"
            </Text>

            {isApplyingVoiceEdit ? (
              <View style={styles.applyingContainer}>
                <ActivityIndicator color={theme.primary} size="large" />
                <Text style={styles.applyingText}>Applying your edits...</Text>
              </View>
            ) : (
              <VoiceRecorder
                onRecordingComplete={handleVoiceEditComplete}
                processingMessage="Processing your instructions..."
                onError={(error) => {
                  Alert.alert("Error", error.message);
                  setShowVoiceEdit(false);
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme, isDarkMode) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.bg },
    keyboardView: { flex: 1 },
    container: { flex: 1, padding: 20 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    headerLeft: { flexDirection: "row", alignItems: "center" },
    headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
    backButton: { padding: 4 },
    backIcon: { fontSize: 24, color: theme.textMuted },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.text,
      marginLeft: 12,
    },
    voiceEditButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 20,
      backgroundColor: theme.accentGlow,
      borderWidth: 1,
      borderColor: `${theme.accent}40`,
    },
    voiceEditIcon: { fontSize: 14 },
    voiceEditLabel: { fontSize: 12, fontWeight: "600", color: theme.accent },
    toneBadge: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 20,
      backgroundColor: theme.primaryGlow,
      borderWidth: 1,
      borderColor: `${theme.primary}40`,
    },
    toneBadgeText: { fontSize: 11, fontWeight: "600", color: theme.primary },
    aiNotice: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderRadius: 12,
      backgroundColor: theme.accentGlow,
      borderWidth: 1,
      borderColor: `${theme.accent}30`,
      marginBottom: 16,
    },
    aiNoticeIcon: { fontSize: 14, marginRight: 10 },
    aiNoticeText: { flex: 1, fontSize: 12, color: theme.textSecondary },
    editorContainer: { flex: 1, marginBottom: 16 },
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
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: `${theme.surface}CC`,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
    },
    loadingText: { fontSize: 13, color: theme.textMuted },
    charCount: { position: "absolute", bottom: 12, right: 14 },
    charCountText: { fontSize: 11 },
    toneSection: { marginBottom: 16 },
    actions: { flexDirection: "row", gap: 10 },
    saveDraftButton: {
      flex: 1,
      padding: 14,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: theme.border,
      alignItems: "center",
    },
    saveDraftText: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.textSecondary,
    },
    saveDraftTextDisabled: { opacity: 0.5 },
    publishButton: {
      flex: 2,
      padding: 14,
      borderRadius: 14,
      backgroundColor: theme.primary,
      alignItems: "center",
    },
    publishButtonText: { fontSize: 13, fontWeight: "700", color: "#fff" },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    emptyText: { fontSize: 16, color: theme.textMuted, marginBottom: 20 },
    emptyButton: {
      padding: 14,
      borderRadius: 12,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    emptyButtonText: { fontSize: 14, fontWeight: "600", color: theme.text },
    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: theme.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      minHeight: 400,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    modalTitle: { fontSize: 18, fontWeight: "700", color: theme.text },
    modalClose: { padding: 4 },
    modalCloseText: { fontSize: 18, color: theme.textMuted },
    modalSubtitle: {
      fontSize: 13,
      color: theme.textMuted,
      lineHeight: 20,
      marginBottom: 24,
    },
    applyingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 16,
      minHeight: 200,
    },
    applyingText: { fontSize: 14, color: theme.textMuted },
  });
