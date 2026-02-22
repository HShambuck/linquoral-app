// app/(auth)/welcome.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/UserContext';

const FEATURES = [
  { title: 'Voice-First', desc: 'Speak naturally, AI handles the rest' },
  { title: 'AI-Refined', desc: 'Professional polish, your authentic voice' },
  { title: 'Schedule & Post', desc: 'Publish when engagement peaks' },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, isDarkMode, insets);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
        {/* Brand */}
        <View style={styles.brandSection}>
          <View style={styles.logoWrap}>
            <View style={styles.logoInner}>
              <View style={styles.logoMicBody} />
              <View style={styles.logoMicNeck} />
              <View style={styles.logoMicBase} />
            </View>
          </View>
          <Text style={styles.appName}>Linquoral</Text>
          <Text style={styles.tagline}>Your voice, professionally presented</Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIndex}>
                <Text style={styles.featureIndexText}>{i + 1}</Text>
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/onboarding')}
            style={styles.primaryBtn}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)')}
            style={styles.secondaryBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryBtnText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme, isDarkMode, insets) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.bg },
  container: {
    flex: 1, paddingHorizontal: 28,
    paddingTop: 24,
    justifyContent: 'space-between',
  },

  brandSection: { alignItems: 'center', paddingTop: 24 },
  logoWrap: {
    width: 80, height: 80, borderRadius: 26,
    backgroundColor: theme.primary,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: isDarkMode ? 0.5 : 0.3,
    shadowRadius: 24, elevation: 12,
  },
  logoInner: { alignItems: 'center' },
  logoMicBody: {
    width: 18, height: 26, borderRadius: 9,
    borderWidth: 3, borderColor: '#fff',
  },
  logoMicNeck: {
    marginTop: 5, width: 24, height: 12,
    borderTopLeftRadius: 12, borderTopRightRadius: 12,
    borderWidth: 3, borderBottomWidth: 0, borderColor: '#fff',
  },
  logoMicBase: { marginTop: 2, width: 3, height: 7, backgroundColor: '#fff', borderRadius: 1.5 },

  appName: { fontSize: 34, fontWeight: '800', color: theme.text, letterSpacing: -1, marginBottom: 8 },
  tagline: { fontSize: 15, color: theme.textMuted, textAlign: 'center', lineHeight: 22 },

  features: { gap: 16, paddingVertical: 8 },
  featureRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: theme.surface,
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: theme.border,
    gap: 14,
  },
  featureIndex: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: theme.primaryGlow,
    borderWidth: 1, borderColor: `${theme.primary}30`,
    justifyContent: 'center', alignItems: 'center',
    marginTop: 1,
  },
  featureIndexText: { fontSize: 12, fontWeight: '700', color: theme.primary },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: '600', color: theme.text, marginBottom: 3, letterSpacing: -0.2 },
  featureDesc: { fontSize: 13, color: theme.textMuted, lineHeight: 18 },

  ctaSection: { gap: 12 },
  primaryBtn: {
    padding: 18, borderRadius: 16,
    backgroundColor: theme.primary,
    alignItems: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: isDarkMode ? 0.4 : 0.2,
    shadowRadius: 16, elevation: 8,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: -0.2 },
  secondaryBtn: {
    padding: 16, borderRadius: 16,
    backgroundColor: theme.surface,
    borderWidth: 1, borderColor: theme.border,
    alignItems: 'center',
  },
  secondaryBtnText: { fontSize: 14, fontWeight: '500', color: theme.textMuted },
});