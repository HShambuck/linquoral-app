// app/(tabs)/record.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/UserContext';
import { useDrafts } from '../../src/context/DraftContext';
import VoiceRecorder from '../../src/components/VoiceRecorder';
import ToneSelector from '../../src/components/ToneSelector';

export default function RecordScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { processVoiceRecording, isProcessing, currentDraft } = useDrafts();

  const [selectedTone, setSelectedTone] = useState('Professional');
  const [phase, setPhase] = useState('idle');

  const styles = createStyles(theme);

  const handleBack = () => {
    if (phase === 'recording') {
      Alert.alert(
        'Cancel Recording?',
        'Your recording will be lost.',
        [
          { text: 'Continue Recording', style: 'cancel' },
          {
            text: 'Cancel',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleRecordingComplete = async ({ uri, durationMs }) => {
    setPhase('processing');

    const result = await processVoiceRecording(uri, selectedTone);

    if (result.success) {
      setPhase('done');
    } else {
      Alert.alert(
        'Processing Failed',
        result.error || 'Failed to process your recording. Please try again.',
        [{ text: 'OK', onPress: () => setPhase('idle') }]
      );
    }
  };

  const handleProcessingStart = () => {
    setPhase('processing');
  };

  const handleError = (error) => {
    Alert.alert(
      'Recording Error',
      error.message || 'An error occurred while recording.',
      [{ text: 'OK' }]
    );
    setPhase('idle');
  };

  const handleReviewPost = () => {
    if (currentDraft) {
      router.push(`/editor/${currentDraft.id}`);
    }
  };

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
          <Text style={styles.title}>Voice Post</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Tone Selector */}
        {(phase === 'idle' || phase === 'recording') && (
          <View style={styles.toneSection}>
            <ToneSelector
              selectedTone={selectedTone}
              onSelectTone={setSelectedTone}
              label="Tone"
            />
          </View>
        )}

        {/* Voice Recorder */}
        <View style={styles.recorderContainer}>
          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            onProcessingStart={handleProcessingStart}
            onError={handleError}
            processingMessage="Refining your post..."
          />
        </View>

        {/* Review Button */}
        {phase === 'done' && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              onPress={handleReviewPost}
              style={styles.reviewButton}
              activeOpacity={0.8}
            >
              <Text style={styles.reviewButtonText}>Review Post →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setPhase('idle')}
              style={styles.recordAgainButton}
              activeOpacity={0.7}
            >
              <Text style={styles.recordAgainText}>Record Again</Text>
            </TouchableOpacity>
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
    toneSection: {
      marginBottom: 24,
    },
    recorderContainer: {
      flex: 1,
    },
    actionContainer: {
      paddingTop: 20,
      gap: 12,
    },
    reviewButton: {
      padding: 16,
      borderRadius: 16,
      backgroundColor: theme.primary,
      alignItems: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    reviewButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#fff',
    },
    recordAgainButton: {
      padding: 14,
      alignItems: 'center',
    },
    recordAgainText: {
      fontSize: 14,
      color: theme.textMuted,
    },
  });