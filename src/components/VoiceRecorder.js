// src/components/VoiceRecorder.js

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import { useTheme } from '../context/UserContext';
import { formatDuration, validateRecordingDuration } from '../utils/validators';
import { RECORDING_CONFIG } from '../utils/constants';

/**
 * Recording phases
 */
const PHASES = {
  IDLE: 'idle',
  RECORDING: 'recording',
  PROCESSING: 'processing',
  DONE: 'done',
  ERROR: 'error',
};

/**
 * VoiceRecorder Component
 * 
 * Voice-first recording interface for capturing user speech.
 * Handles audio recording, visualization, and state management.
 * 
 * @param {Object} props
 * @param {function} props.onRecordingComplete - Callback with audio URI when done
 * @param {function} props.onProcessingStart - Callback when processing begins
 * @param {function} props.onError - Callback for errors
 * @param {string} props.processingMessage - Custom processing message
 */
const VoiceRecorder = ({
  onRecordingComplete,
  onProcessingStart,
  onError,
  processingMessage = 'Refining your post...',
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [phase, setPhase] = useState(PHASES.IDLE);
  const [duration, setDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);

  const recordingRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveformValues = useRef(
    Array.from({ length: 24 }, () => new Animated.Value(4))
  ).current;

  /**
   * Setup audio on mount
   */
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      } catch (error) {
        console.warn('Audio setup error:', error);
      }
    };

    setupAudio();

    return () => {
      stopRecording();
    };
  }, []);

  /**
   * Pulse animation for recording state
   */
  useEffect(() => {
    if (phase === PHASES.RECORDING) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      // Animate waveform
      const animateWaveform = () => {
        waveformValues.forEach((anim, index) => {
          Animated.timing(anim, {
            toValue: Math.random() * 32 + 4,
            duration: 150,
            useNativeDriver: false,
          }).start();
        });
      };
      const waveformInterval = setInterval(animateWaveform, 150);

      return () => {
        pulse.stop();
        clearInterval(waveformInterval);
      };
    }
  }, [phase]);

  /**
   * Start recording
   */
  const startRecording = async () => {
    try {
      setErrorMessage(null);

      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Microphone permission is required');
      }

      // Configure recording
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: RECORDING_CONFIG.SAMPLE_RATE,
          numberOfChannels: RECORDING_CONFIG.CHANNELS,
          bitRate: RECORDING_CONFIG.BIT_RATE,
        },
        ios: {
          extension: '.m4a',
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: RECORDING_CONFIG.SAMPLE_RATE,
          numberOfChannels: RECORDING_CONFIG.CHANNELS,
          bitRate: RECORDING_CONFIG.BIT_RATE,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: RECORDING_CONFIG.BIT_RATE,
        },
      });

      await recording.startAsync();
      recordingRef.current = recording;
      setPhase(PHASES.RECORDING);
      setDuration(0);

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setDuration((prev) => {
          const newDuration = prev + 1000;
          // Auto-stop at max duration
          if (newDuration >= RECORDING_CONFIG.MAX_DURATION_MS) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);
    } catch (error) {
      console.error('Start recording error:', error);
      setErrorMessage(error.message || 'Failed to start recording');
      setPhase(PHASES.ERROR);
      if (onError) onError(error);
    }
  };

  /**
   * Stop recording
   */
  const stopRecording = async () => {
    try {
      // Clear timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      if (!recordingRef.current) return;

      // Validate duration
      const validation = validateRecordingDuration(duration);
      if (!validation.isValid) {
        setErrorMessage(validation.error);
        setPhase(PHASES.ERROR);
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
        return;
      }

      // Stop recording
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      // Move to processing phase
      setPhase(PHASES.PROCESSING);
      if (onProcessingStart) onProcessingStart();

      // Simulate AI processing delay, then callback
      // In real app, this would be handled by parent component
      setTimeout(() => {
        setPhase(PHASES.DONE);
        if (onRecordingComplete) {
          onRecordingComplete({
            uri,
            durationMs: duration,
          });
        }
      }, 100);
    } catch (error) {
      console.error('Stop recording error:', error);
      setErrorMessage(error.message || 'Failed to stop recording');
      setPhase(PHASES.ERROR);
      if (onError) onError(error);
    }
  };

  /**
   * Cancel recording
   */
  const cancelRecording = async () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }

    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch (e) {
        // Ignore errors on cancel
      }
      recordingRef.current = null;
    }

    setPhase(PHASES.IDLE);
    setDuration(0);
    setErrorMessage(null);
  };

  /**
   * Handle main button press
   */
  const handlePress = () => {
    switch (phase) {
      case PHASES.IDLE:
      case PHASES.ERROR:
        startRecording();
        break;
      case PHASES.RECORDING:
        stopRecording();
        break;
      case PHASES.DONE:
        // Reset for new recording
        setPhase(PHASES.IDLE);
        setDuration(0);
        break;
      default:
        break;
    }
  };

  /**
   * Reset to idle state
   */
  const reset = useCallback(() => {
    cancelRecording();
  }, []);

  /**
   * Set to done state (called by parent after processing)
   */
  const setDone = useCallback(() => {
    setPhase(PHASES.DONE);
  }, []);

  /**
   * Set to processing state (called by parent)
   */
  const setProcessing = useCallback(() => {
    setPhase(PHASES.PROCESSING);
  }, []);

  // Expose methods via ref if needed
  React.useImperativeHandle(
    React.forwardRef((props, ref) => ref),
    () => ({
      reset,
      setDone,
      setProcessing,
    })
  );

  /**
   * Render idle state
   */
  const renderIdle = () => (
    <>
      <Text style={styles.instructionText}>
        Tap and speak your thoughts naturally.{'\n'}
        AI will handle the formatting.
      </Text>

      <TouchableOpacity
        onPress={handlePress}
        style={styles.recordButton}
        activeOpacity={0.8}
      >
        <Text style={styles.recordButtonIcon}>🎙</Text>
      </TouchableOpacity>

      <Text style={styles.hintText}>Tap to start recording</Text>
    </>
  );

  /**
   * Render recording state
   */
  const renderRecording = () => (
    <>
      {/* Pulse rings */}
      <View style={styles.pulseContainer}>
        {[1.6, 1.35, 1.15].map((scale, i) => (
          <Animated.View
            key={i}
            style={[
              styles.pulseRing,
              {
                opacity: 0.08 - i * 0.025,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
        ))}

        <TouchableOpacity
          onPress={handlePress}
          style={styles.stopButton}
          activeOpacity={0.8}
        >
          <Text style={styles.stopButtonIcon}>⏹</Text>
        </TouchableOpacity>
      </View>

      {/* Waveform */}
      <View style={styles.waveform}>
        {waveformValues.map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.waveformBar,
              {
                height: anim,
                backgroundColor: theme.primary,
              },
            ]}
          />
        ))}
      </View>

      {/* Recording indicator */}
      <View style={styles.recordingIndicator}>
        <View style={styles.recordingDot} />
        <Text style={styles.recordingText}>Recording...</Text>
        <Text style={styles.durationText}>{formatDuration(duration)}</Text>
      </View>

      {/* Cancel button */}
      <TouchableOpacity onPress={cancelRecording} style={styles.cancelButton}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </>
  );

  /**
   * Render processing state
   */
  const renderProcessing = () => (
    <View style={styles.processingContainer}>
      <Text style={styles.processingIcon}>✨</Text>
      <Text style={styles.processingTitle}>{processingMessage}</Text>
      <Text style={styles.processingSubtitle}>
        AI is preserving your authentic voice
      </Text>

      <View style={styles.loadingDots}>
        {[0, 1, 2].map((i) => (
          <Animated.View
            key={i}
            style={[
              styles.loadingDot,
              {
                opacity: 0.4,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );

  /**
   * Render done state
   */
  const renderDone = () => (
    <View style={styles.doneContainer}>
      <View style={styles.doneIconContainer}>
        <Text style={styles.doneIcon}>✓</Text>
      </View>
      <Text style={styles.doneTitle}>Post ready!</Text>
      <Text style={styles.doneSubtitle}>Review and edit before publishing</Text>
    </View>
  );

  /**
   * Render error state
   */
  const renderError = () => (
    <View style={styles.errorContainer}>
      <View style={styles.errorIconContainer}>
        <Text style={styles.errorIcon}>!</Text>
      </View>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorMessage}>{errorMessage}</Text>
      <TouchableOpacity onPress={handlePress} style={styles.retryButton}>
        <Text style={styles.retryText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {phase === PHASES.IDLE && renderIdle()}
      {phase === PHASES.RECORDING && renderRecording()}
      {phase === PHASES.PROCESSING && renderProcessing()}
      {phase === PHASES.DONE && renderDone()}
      {phase === PHASES.ERROR && renderError()}
    </View>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },

    // Idle state
    instructionText: {
      fontSize: 14,
      color: theme.textMuted,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 40,
    },
    recordButton: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
    },
    recordButtonIcon: {
      fontSize: 36,
    },
    hintText: {
      fontSize: 13,
      color: theme.textMuted,
      marginTop: 20,
    },

    // Recording state
    pulseContainer: {
      width: 160,
      height: 160,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 28,
    },
    pulseRing: {
      position: 'absolute',
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.primary,
    },
    stopButton: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.danger,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.danger,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 8,
    },
    stopButtonIcon: {
      fontSize: 28,
      color: '#fff',
    },
    waveform: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      marginBottom: 16,
      height: 40,
    },
    waveformBar: {
      width: 3,
      borderRadius: 2,
      opacity: 0.7,
    },
    recordingIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    recordingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.danger,
    },
    recordingText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.danger,
    },
    durationText: {
      fontSize: 13,
      color: theme.textMuted,
      marginLeft: 8,
    },
    cancelButton: {
      marginTop: 24,
      padding: 10,
    },
    cancelText: {
      fontSize: 13,
      color: theme.textMuted,
    },

    // Processing state
    processingContainer: {
      alignItems: 'center',
    },
    processingIcon: {
      fontSize: 48,
      marginBottom: 20,
    },
    processingTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    processingSubtitle: {
      fontSize: 13,
      color: theme.textMuted,
      marginBottom: 24,
    },
    loadingDots: {
      flexDirection: 'row',
      gap: 6,
    },
    loadingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.primary,
    },

    // Done state
    doneContainer: {
      alignItems: 'center',
    },
    doneIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.accentGlow,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    doneIcon: {
      fontSize: 28,
      color: theme.accent,
    },
    doneTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.accent,
      marginBottom: 8,
    },
    doneSubtitle: {
      fontSize: 13,
      color: theme.textMuted,
    },

    // Error state
    errorContainer: {
      alignItems: 'center',
    },
    errorIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: `${theme.danger}20`,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    errorIcon: {
      fontSize: 28,
      color: theme.danger,
      fontWeight: '700',
    },
    errorTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.danger,
      marginBottom: 8,
    },
    errorMessage: {
      fontSize: 13,
      color: theme.textMuted,
      textAlign: 'center',
      marginBottom: 24,
    },
    retryButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      backgroundColor: theme.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    retryText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
    },
  });

export default VoiceRecorder;