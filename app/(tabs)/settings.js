// app/(tabs)/settings.js
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme, useUser } from '../../src/context/UserContext';
import { useAuth } from '../../src/context/AuthContext';
import ToneSelector from '../../src/components/ToneSelector';
import { APP_INFO } from '../../src/utils/constants';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const { toggleTheme, preferredTone, setPreferredTone } = useUser();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [showToneSelector, setShowToneSelector] = useState(false);
  const styles = createStyles(theme, isDarkMode, insets);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out', style: 'destructive',
        onPress: async () => { await logout(); router.replace('/(auth)/welcome'); },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitials}>{user?.initials || 'U'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.displayName || 'User'}</Text>
            <Text style={styles.profileMeta}>{APP_INFO.NAME} · v{APP_INFO.VERSION}</Text>
          </View>
          <View style={styles.profileDot} />
        </View>

        {/* Appearance */}
        <Text style={styles.sectionLabel}>Appearance</Text>
        <View style={styles.group}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: isDarkMode ? '#1C2640' : '#EEF1FA' }]}>
                <View style={styles.halfMoonOuter}>
                  <View style={styles.halfMoonInner} />
                </View>
              </View>
              <View>
                <Text style={styles.rowTitle}>Dark Mode</Text>
                <Text style={styles.rowSub}>{isDarkMode ? 'On' : 'Off'}</Text>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
              ios_backgroundColor={theme.border}
            />
          </View>
        </View>

        {/* Preferences */}
        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.group}>
          <TouchableOpacity
            onPress={() => setShowToneSelector(!showToneSelector)}
            style={styles.row}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: theme.accentGlow }]}>
                <View style={styles.targetOuter}>
                  <View style={styles.targetInner} />
                </View>
              </View>
              <View>
                <Text style={styles.rowTitle}>Default Tone</Text>
                <Text style={styles.rowSub}>{preferredTone}</Text>
              </View>
            </View>
            <Text style={[styles.chevron, showToneSelector && styles.chevronUp]}>›</Text>
          </TouchableOpacity>
          {showToneSelector && (
            <View style={styles.toneExpand}>
              <ToneSelector
                selectedTone={preferredTone}
                onSelectTone={(tone) => { setPreferredTone(tone); setShowToneSelector(false); }}
                layout="vertical"
                showDescriptions
              />
            </View>
          )}
        </View>

        {/* Account */}
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.group}>
          <TouchableOpacity onPress={handleLogout} style={styles.row} activeOpacity={0.7}>
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: theme.dangerGlow }]}>
                <View style={styles.logoutIcon} />
              </View>
              <Text style={[styles.rowTitle, { color: theme.danger }]}>Log Out</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerApp}>{APP_INFO.NAME}</Text>
          <Text style={styles.footerTagline}>{APP_INFO.TAGLINE}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme, isDarkMode, insets) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 22, paddingTop: 8 },

  title: { fontSize: 26, fontWeight: '700', color: theme.text, letterSpacing: -0.5, marginBottom: 24, marginTop: 4 },

  profileCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: 18, borderRadius: 18,
    backgroundColor: theme.surface,
    borderWidth: 1, borderColor: theme.border,
    marginBottom: 28,
  },
  profileAvatar: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: theme.primary,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 14,
  },
  profileInitials: { color: '#fff', fontWeight: '700', fontSize: 17, letterSpacing: 0.5 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '600', color: theme.text, letterSpacing: -0.2 },
  profileMeta: { fontSize: 12, color: theme.textMuted, marginTop: 3 },
  profileDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.accent, shadowColor: theme.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 4 },

  sectionLabel: { fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: theme.textMuted, fontWeight: '600', marginBottom: 10, marginLeft: 2 },

  group: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1, borderColor: theme.border,
    marginBottom: 24,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 16,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  rowIcon: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },

  // Dark mode icon
  halfMoonOuter: { width: 16, height: 16, borderRadius: 8, backgroundColor: isDarkMode ? theme.textSecondary : theme.textMuted, overflow: 'hidden' },
  halfMoonInner: { position: 'absolute', right: -4, top: -1, width: 14, height: 14, borderRadius: 7, backgroundColor: isDarkMode ? '#1C2640' : '#EEF1FA' },

  // Target icon
  targetOuter: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: theme.accent, justifyContent: 'center', alignItems: 'center' },
  targetInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.accent },

  // Logout icon
  logoutIcon: { width: 16, height: 14, borderTopRightRadius: 4, borderBottomRightRadius: 4, borderWidth: 2, borderLeftWidth: 0, borderColor: theme.danger },

  rowTitle: { fontSize: 14, fontWeight: '500', color: theme.text },
  rowSub: { fontSize: 12, color: theme.textMuted, marginTop: 2 },
  chevron: { fontSize: 22, color: theme.textMuted, transform: [{ rotate: '0deg' }] },
  chevronUp: { transform: [{ rotate: '90deg' }] },

  toneExpand: { padding: 16, paddingTop: 4, borderTopWidth: 1, borderTopColor: theme.border },

  footer: { alignItems: 'center', paddingTop: 8 },
  footerApp: { fontSize: 14, fontWeight: '700', color: theme.textMuted, letterSpacing: 1 },
  footerTagline: { fontSize: 11, color: theme.textMuted, marginTop: 4, fontStyle: 'italic' },
});