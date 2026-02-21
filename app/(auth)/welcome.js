// app/(auth)/welcome.js

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/UserContext';
import { useAuth } from '../../src/context/AuthContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { loginAnonymous } = useAuth();
  const styles = createStyles(theme);

  const handleGetStarted = () => {
    router.push('/(auth)/onboarding');
  };

  const handleSkip = async () => {
    // For now, just navigate to tabs without API call
    // This allows testing the UI without backend
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Logo & Branding */}
          <View style={styles.brandingSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>🎙</Text>
            </View>
            <Text style={styles.appName}>Linquoral</Text>
            <Text style={styles.tagline}>Your voice, professionally presented</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const FeatureItem = ({ theme, emoji, title, description }) => (
  <View style={[featureStyles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
    <View style={[featureStyles.iconContainer, { backgroundColor: theme.primaryGlow }]}>
      <Text style={featureStyles.emoji}>{emoji}</Text>
    </View>
    <View style={featureStyles.content}>
      <Text style={[featureStyles.title, { color: theme.text }]}>{title}</Text>
      <Text style={[featureStyles.description, { color: theme.textMuted }]}>{description}</Text>
    </View>
  </View>
);

const featureStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
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
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
  },
});

const createStyles = (theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.bg,
    },
    scrollContent: {
      flexGrow: 1,
    },
    container: {
      flex: 1,
      padding: 24,
      paddingBottom: 40, // Extra padding at bottom
      justifyContent: 'space-between',
      minHeight: '100%',
    },
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
    featuresSection: {
      marginVertical: 40,
      gap: 16,
    },
    ctaSection: {
      gap: 16, // Increased gap
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
      backgroundColor: theme.surface, // Added background
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    secondaryButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textMuted,
    },
  });