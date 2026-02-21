// src/navigation/AuthNavigator.js

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import ToneSelector from '../components/ToneSelector';
import { APP_INFO, SCREENS } from '../utils/constants';
import { validateDisplayName } from '../utils/validators';

const Stack = createNativeStackNavigator();

/**
 * WelcomeScreen
 * 
 * First screen users see. Introduces the app and its value proposition.
 */
const WelcomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { loginAnonymous } = useAuth();
  const styles = createWelcomeStyles(theme);

  const handleGetStarted = () => {
    navigation.navigate('Onboarding');
  };

  const handleSkip = async () => {
    // Quick anonymous login for users who want to skip onboarding
    await loginAnonymous();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Logo & Branding */}
        <View style={styles.brandingSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🎙</Text>
          </View>
          <Text style={styles.appName}>{APP_INFO.NAME}</Text>
          <Text style={styles.tagline}>{APP_INFO.TAGLINE}</Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresSection}>
          <FeatureItem
            theme={theme}
            emoji="🗣️"
            title="Voice-First"
            description="Speak naturally, AI handles the rest"
          />
          <FeatureItem
            theme={theme}
            emoji="✨"
            title="AI-Refined"
            description="Professional polish, authentic voice"
          />
          <FeatureItem
            theme={theme}
            emoji="📅"
            title="Schedule & Post"
            description="Publish when engagement peaks"
          />
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            onPress={handleGetStarted}
            style={styles.primaryButton}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSkip}
            style={styles.secondaryButton}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

/**
 * Feature Item Component
 */
const FeatureItem = ({ theme, emoji, title, description }) => {
  const styles = createFeatureStyles(theme);
  
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
};

/**
 * OnboardingScreen
 * 
 * Collects minimal user info: display name and preferred tone.
 */
const OnboardingScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { register } = useAuth();
  const styles = createOnboardingStyles(theme);

  const [displayName, setDisplayName] = React.useState('');
  const [preferredTone, setPreferredTone] = React.useState('Professional');
  const [error, setError] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleContinue = async () => {
    // Validate name
    const validation = validateDisplayName(displayName);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await register({
      displayName: displayName.trim(),
      preferredTone,
    });

    setIsLoading(false);

    if (!result.success) {
      setError(result.error || 'Something went wrong. Please try again.');
    }
    // If successful, AuthContext will update and RootNavigator will switch to MainNavigator
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{"Let's set you up"}</Text>
            <Text style={styles.subtitle}>
              Just a few quick details to personalize your experience
            </Text>

            {/* Name Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>What should we call you?</Text>
              <TextInput
                value={displayName}
                onChangeText={(text) => {
                  setDisplayName(text);
                  setError(null);
                }}
                placeholder="Your name"
                placeholderTextColor={theme.textMuted}
                style={styles.textInput}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
              />
              {error && <Text style={styles.errorText}>{error}</Text>}
            </View>

            {/* Tone Selection */}
            <View style={styles.toneSection}>
              <Text style={styles.inputLabel}>Preferred tone for your posts</Text>
              <Text style={styles.toneHint}>
                You can change this anytime for each post
              </Text>
              <View style={styles.toneSelectorContainer}>
                <ToneSelector
                  selectedTone={preferredTone}
                  onSelectTone={setPreferredTone}
                  layout="vertical"
                  showDescriptions
                />
              </View>
            </View>
          </View>

          {/* Continue Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleContinue}
              style={[
                styles.continueButton,
                (!displayName.trim() || isLoading) && styles.continueButtonDisabled,
              ]}
              activeOpacity={0.8}
              disabled={!displayName.trim() || isLoading}
            >
              <Text style={styles.continueButtonText}>
                {isLoading ? 'Setting up...' : 'Continue'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/**
 * AuthNavigator
 * 
 * Stack navigator for authentication flow.
 */
const AuthNavigator = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.bg },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name={SCREENS.WELCOME} component={WelcomeScreen} />
      <Stack.Screen name={SCREENS.ONBOARDING} component={OnboardingScreen} />
    </Stack.Navigator>
  );
};

// ─── STYLES ────────────────────────────────────────────────────────────────

const createWelcomeStyles = (theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.bg,
    },
    container: {
      flex: 1,
      padding: 24,
      justifyContent: 'space-between',
    },

    // Branding
    brandingSection: {
      alignItems: 'center',
      marginTop: 40,
    },
    logoContainer: {
      width: 80,
      height: 80,
      borderRadius: 24,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
    },
    logoEmoji: {
      fontSize: 36,
    },
    appName: {
      fontSize: 32,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 8,
    },
    tagline: {
      fontSize: 16,
      color: theme.textMuted,
      textAlign: 'center',
    },

    // Features
    featuresSection: {
      marginVertical: 40,
      gap: 16,
    },

    // CTA
    ctaSection: {
      gap: 12,
      marginBottom: 20,
    },
    primaryButton: {
      padding: 18,
      borderRadius: 16,
      backgroundColor: theme.primary,
      alignItems: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#fff',
    },
    secondaryButton: {
      padding: 16,
      alignItems: 'center',
    },
    secondaryButtonText: {
      fontSize: 14,
      color: theme.textMuted,
    },
  });

const createFeatureStyles = (theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 16,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: theme.primaryGlow,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    emoji: {
      fontSize: 22,
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 2,
    },
    description: {
      fontSize: 13,
      color: theme.textMuted,
    },
  });

const createOnboardingStyles = (theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.bg,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 20,
    },

    // Header
    header: {
      marginBottom: 20,
    },
    backButton: {
      padding: 4,
      alignSelf: 'flex-start',
    },
    backIcon: {
      fontSize: 24,
      color: theme.textMuted,
    },

    // Content
    content: {
      flex: 1,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 15,
      color: theme.textMuted,
      marginBottom: 32,
      lineHeight: 22,
    },

    // Input Section
    inputSection: {
      marginBottom: 28,
    },
    inputLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 10,
    },
    textInput: {
      padding: 16,
      borderRadius: 14,
      backgroundColor: theme.surface,
      borderWidth: 1.5,
      borderColor: theme.border,
      color: theme.text,
      fontSize: 16,
    },
    errorText: {
      fontSize: 12,
      color: theme.danger,
      marginTop: 8,
    },

    // Tone Section
    toneSection: {
      marginBottom: 24,
    },
    toneHint: {
      fontSize: 12,
      color: theme.textMuted,
      marginBottom: 14,
    },
    toneSelectorContainer: {
      marginTop: 4,
    },

    // Footer
    footer: {
      marginTop: 20,
    },
    continueButton: {
      padding: 18,
      borderRadius: 16,
      backgroundColor: theme.primary,
      alignItems: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    continueButtonDisabled: {
      opacity: 0.5,
      shadowOpacity: 0,
      elevation: 0,
    },
    continueButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#fff',
    },
  });

export default AuthNavigator;