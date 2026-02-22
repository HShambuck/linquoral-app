// app/(auth)/onboarding.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/UserContext';
import { useAuth } from '../../src/context/AuthContext';
import ToneSelector from '../../src/components/ToneSelector';
import { validateDisplayName } from '../../src/utils/validators';

export default function OnboardingScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const { register } = useAuth();
  const insets = useSafeAreaInsets();

  const [displayName, setDisplayName] = useState('');
  const [preferredTone, setPreferredTone] = useState('Professional');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);

  const styles = createStyles(theme, isDarkMode, insets);

  const handleContinue = async () => {
    const validation = validateDisplayName(displayName);
    if (!validation.isValid) { setError(validation.error); return; }
    setIsLoading(true);
    setError(null);
    try {
      const result = await register({ displayName: displayName.trim(), preferredTone });
      if (result.success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Connection Error', 'Unable to connect. Continue in demo mode?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Demo Mode', onPress: () => router.replace('/(tabs)') },
        ]);
      }
    } catch {
      Alert.alert('Connection Error', 'Unable to connect. Continue in demo mode?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Demo Mode', onPress: () => router.replace('/(tabs)') },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const canContinue = displayName.trim().length >= 2 && !isLoading;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
              <View style={styles.backBtnInner}>
                <Text style={styles.backBtnText}>‹</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.skipBtn} activeOpacity={0.7}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Set up your{'\n'}profile</Text>
            <Text style={styles.subtitle}>Personalise your experience in seconds</Text>
          </View>

          {/* Name */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>What should we call you?</Text>
            <View style={[styles.inputWrap, nameFocused && styles.inputWrapFocused, error && styles.inputWrapError]}>
              <TextInput
                value={displayName}
                onChangeText={(t) => { setDisplayName(t); setError(null); }}
                placeholder="Your name"
                placeholderTextColor={theme.textMuted}
                style={styles.input}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
              />
              {displayName.length >= 2 && (
                <View style={styles.inputCheck}>
                  <View style={styles.inputCheckLine1} />
                  <View style={styles.inputCheckLine2} />
                </View>
              )}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>

          {/* Tone */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Preferred post tone</Text>
            <Text style={styles.fieldHint}>You can change this anytime</Text>
            <ToneSelector
              selectedTone={preferredTone}
              onSelectTone={setPreferredTone}
              layout="vertical"
              showDescriptions
            />
          </View>

          {/* Button */}
          <TouchableOpacity
            onPress={handleContinue}
            style={[styles.continueBtn, !canContinue && styles.continueBtnDisabled]}
            activeOpacity={0.85}
            disabled={!canContinue}
          >
            <Text style={styles.continueBtnText}>
              {isLoading ? 'Setting up...' : 'Continue'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.hint}>No account required · Demo available</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme, isDarkMode, insets) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.bg },
  content: { paddingHorizontal: 24, paddingTop: 8 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 32,
  },
  backBtn: {},
  backBtnInner: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: theme.surface,
    borderWidth: 1, borderColor: theme.border,
    justifyContent: 'center', alignItems: 'center',
  },
  backBtnText: { fontSize: 22, color: theme.textSecondary, marginTop: -2 },
  skipBtn: {
    paddingVertical: 7, paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: theme.surface,
    borderWidth: 1, borderColor: theme.border,
  },
  skipText: { fontSize: 13, color: theme.textMuted, fontWeight: '500' },

  titleSection: { marginBottom: 36 },
  title: { fontSize: 30, fontWeight: '700', color: theme.text, letterSpacing: -0.8, lineHeight: 38, marginBottom: 8 },
  subtitle: { fontSize: 15, color: theme.textMuted, lineHeight: 22 },

  fieldSection: { marginBottom: 28 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: theme.text, marginBottom: 10 },
  fieldHint: { fontSize: 12, color: theme.textMuted, marginBottom: 12, marginTop: -4 },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14,
    backgroundColor: theme.surface,
    borderWidth: 1.5, borderColor: theme.border,
    paddingHorizontal: 16,
  },
  inputWrapFocused: { borderColor: theme.primary },
  inputWrapError: { borderColor: theme.danger },
  input: {
    flex: 1, paddingVertical: 15,
    color: theme.text, fontSize: 16,
  },
  inputCheck: {
    width: 20, height: 20, justifyContent: 'center', alignItems: 'center',
  },
  inputCheckLine1: { position: 'absolute', width: 7, height: 2.5, backgroundColor: theme.accent, borderRadius: 1.5, transform: [{ rotate: '45deg' }, { translateX: -3 }, { translateY: 2 }] },
  inputCheckLine2: { position: 'absolute', width: 12, height: 2.5, backgroundColor: theme.accent, borderRadius: 1.5, transform: [{ rotate: '-50deg' }, { translateX: 2 }] },
  errorText: { fontSize: 12, color: theme.danger, marginTop: 8 },

  continueBtn: {
    padding: 18, borderRadius: 16,
    backgroundColor: theme.primary,
    alignItems: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: isDarkMode ? 0.4 : 0.2,
    shadowRadius: 16, elevation: 8,
    marginBottom: 16,
  },
  continueBtnDisabled: { opacity: 0.45, shadowOpacity: 0, elevation: 0 },
  continueBtnText: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: -0.2 },

  hint: { fontSize: 12, color: theme.textMuted, textAlign: 'center' },
});