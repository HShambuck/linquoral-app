// app/(tabs)/record.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/UserContext';
import { useDrafts } from '../../src/context/DraftContext';
import VoiceRecorder from '../../src/components/VoiceRecorder';
import ToneSelector from '../../src/components/ToneSelector';

export default function RecordScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const { processVoiceRecording, currentDraft } = useDrafts();
  const insets = useSafeAreaInsets();

  const [selectedTone, setSelectedTone] = useState('Professional');
  const [phase, setPhase] = useState('idle');

  const styles = createStyles(theme, isDarkMode, insets);

  const handleBack = () => {
    if (phase === 'recording') {
      Alert.alert('Cancel Recording?', 'Your recording will be lost.', [
        { text: 'Continue Recording', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  };

  const handleRecordingComplete = async ({ uri }) => {
    setPhase('processing');
    const result = await processVoiceRecording(uri, selectedTone);
    if (result.success) {
      setPhase('done');
    } else {
      Alert.alert('Processing Failed', result.error || 'Please try again.', [
        { text: 'OK', onPress: () => setPhase('idle') },
      ]);
    }
  };

  const handleReviewPost = () => {
    const id = currentDraft?.id || currentDraft?._id;
    if (id) router.push(`/editor/${id}`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
            <View style={styles.backBtnInner}>
              <Text style={styles.backBtnText}>‹</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.title}>Voice Post</Text>
          <View style={styles.tonePill}>
            <Text style={styles.tonePillText}>{selectedTone}</Text>
          </View>
        </View>

        {/* Tone Selector */}
        {(phase === 'idle' || phase === 'recording') && (
          <View style={styles.toneSection}>
            <ToneSelector selectedTone={selectedTone} onSelectTone={setSelectedTone} />
          </View>
        )}

        {/* Recorder */}
        <View style={styles.recorderWrap}>
          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            onProcessingStart={() => setPhase('processing')}
            onError={(err) => {
              Alert.alert('Recording Error', err.message || 'An error occurred.');
              setPhase('idle');
            }}
            processingMessage="Refining your post..."
          />
        </View>

        {/* Done Actions */}
        {phase === 'done' && (
          <View style={[styles.actions, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity onPress={handleReviewPost} style={styles.reviewBtn} activeOpacity={0.85}>
              <Text style={styles.reviewBtnText}>Review Post</Text>
              <Text style={styles.reviewBtnArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPhase('idle')} style={styles.againBtn} activeOpacity={0.7}>
              <Text style={styles.againBtnText}>Record Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme, isDarkMode, insets) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.bg },
  container: { flex: 1, paddingHorizontal: 22 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 20,
  },
  backBtn: { marginRight: 14 },
  backBtnInner: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: theme.surface,
    borderWidth: 1, borderColor: theme.border,
    justifyContent: 'center', alignItems: 'center',
  },
  backBtnText: { fontSize: 22, color: theme.textSecondary, marginTop: -2 },
  title: {
    flex: 1,
    fontSize: 18, fontWeight: '700',
    color: theme.text, letterSpacing: -0.3,
  },
  tonePill: {
    paddingVertical: 5, paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: theme.primaryGlow,
    borderWidth: 1, borderColor: `${theme.primary}30`,
  },
  tonePillText: { fontSize: 11, fontWeight: '600', color: theme.primary, letterSpacing: 0.2 },

  toneSection: { marginBottom: 20 },
  recorderWrap: { flex: 1 },

  actions: {
    gap: 10,
    paddingTop: 16,
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 17,
    borderRadius: 16,
    backgroundColor: theme.primary,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: isDarkMode ? 0.4 : 0.2,
    shadowRadius: 16,
    elevation: 8,
    gap: 6,
  },
  reviewBtnText: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: -0.2 },
  reviewBtnArrow: { fontSize: 20, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  againBtn: { padding: 14, alignItems: 'center' },
  againBtnText: { fontSize: 14, color: theme.textMuted },
});