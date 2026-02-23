// app/(tabs)/settings.js

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/UserContext';
import { useUser } from '../../src/context/UserContext';
import { useAuth } from '../../src/context/AuthContext';
import ToneSelector from '../../src/components/ToneSelector';
import useLinkedInAuth from '../../src/hooks/useLinkedInAuth';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  // toggleTheme is the correct function name from UserContext (not toggleDarkMode)
  const { toggleTheme } = useUser();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [showToneSelector, setShowToneSelector] = useState(false);
  const [defaultTone, setDefaultTone] = useState('Professional');

  const {
    status: linkedInStatus,
    isLoading: linkedInLoading,
    error: linkedInError,
    connect: connectLinkedIn,
    disconnect: disconnectLinkedIn,
    refresh: refreshLinkedIn,
  } = useLinkedInAuth();

  const styles = createStyles(theme, isDarkMode, insets);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out', style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/welcome');
        },
      },
    ]);
  };

  const handleDisconnectLinkedIn = () => {
    Alert.alert(
      'Disconnect LinkedIn',
      "You won't be able to post until you reconnect.",
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disconnect', style: 'destructive', onPress: disconnectLinkedIn },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.screenTitle}>Settings</Text>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Your Name'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'your@email.com'}</Text>
          </View>
        </View>

        {/* LinkedIn Connection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>LINKEDIN</Text>
          <View style={styles.linkedInCard}>
            {/* LinkedIn "in" logo mark */}
            <View style={styles.linkedInLogo}>
              <Text style={styles.linkedInLogoText}>in</Text>
            </View>

            <View style={styles.linkedInInfo}>
              {linkedInStatus.connected ? (
                <>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: theme.accent }]} />
                    <Text style={[styles.statusText, { color: theme.accent }]}>Connected</Text>
                  </View>
                  {linkedInStatus.profile && (
                    <Text style={styles.linkedInName}>
                      {linkedInStatus.profile.firstName} {linkedInStatus.profile.lastName}
                    </Text>
                  )}
                </>
              ) : linkedInStatus.devTokenActive ? (
                <>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: theme.warning }]} />
                    <Text style={[styles.statusText, { color: theme.warning }]}>Dev Token Active</Text>
                  </View>
                  <Text style={styles.linkedInSubtext}>Your account only · testing mode</Text>
                </>
              ) : (
                <>
                  <Text style={styles.linkedInDisconnected}>Not connected</Text>
                  <Text style={styles.linkedInSubtext}>Connect to enable posting</Text>
                </>
              )}
              {linkedInError ? (
                <Text style={styles.linkedInError}>{linkedInError}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              onPress={linkedInStatus.connected ? handleDisconnectLinkedIn : connectLinkedIn}
              style={[
                styles.linkedInBtn,
                linkedInStatus.connected && styles.linkedInBtnDisconnect,
              ]}
              activeOpacity={0.8}
              disabled={linkedInLoading}
            >
              {linkedInLoading ? (
                <ActivityIndicator
                  color={linkedInStatus.connected ? theme.danger : '#fff'}
                  size="small"
                />
              ) : (
                <Text style={[
                  styles.linkedInBtnText,
                  linkedInStatus.connected && { color: theme.danger },
                ]}>
                  {linkedInStatus.connected ? 'Disconnect' : 'Connect'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {!linkedInStatus.connected && !linkedInLoading && (
            <TouchableOpacity onPress={refreshLinkedIn} style={styles.refreshRow} activeOpacity={0.6}>
              <Text style={styles.refreshText}>Refresh status</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>APPEARANCE</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <HalfMoonIcon color={theme.textSecondary} />
                <Text style={styles.rowLabel}>Dark Mode</Text>
              </View>
              {/* Toggle — calls toggleTheme (the correct function name from UserContext) */}
              <TouchableOpacity
                onPress={toggleTheme}
                style={[styles.toggle, isDarkMode && styles.toggleOn]}
                activeOpacity={0.85}
              >
                <View style={[styles.toggleThumb, isDarkMode && styles.toggleThumbOn]} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Defaults */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DEFAULTS</Text>
          <View style={styles.card}>
            <TouchableOpacity
              onPress={() => setShowToneSelector(!showToneSelector)}
              style={styles.row}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <TargetIcon color={theme.textSecondary} />
                <Text style={styles.rowLabel}>Default Tone</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>{defaultTone}</Text>
                <Text style={styles.rowChevron}>›</Text>
              </View>
            </TouchableOpacity>

            {showToneSelector && (
              <View style={styles.toneWrap}>
                <ToneSelector
                  selectedTone={defaultTone}
                  onSelectTone={(tone) => {
                    setDefaultTone(tone);
                    setShowToneSelector(false);
                  }}
                />
              </View>
            )}
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <View style={styles.card}>
            <TouchableOpacity onPress={handleLogout} style={styles.row} activeOpacity={0.7}>
              <View style={styles.rowLeft}>
                <LogoutIcon color={theme.danger} />
                <Text style={[styles.rowLabel, { color: theme.danger }]}>Log Out</Text>
              </View>
              <Text style={styles.rowChevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.version}>Linqoral v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Geometric Icons ──────────────────────────────────────────────────────────

const HalfMoonIcon = ({ color }) => (
  <View style={{ width: 18, height: 18, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{
      width: 14, height: 14, borderRadius: 7,
      borderWidth: 2, borderColor: color,
      borderRightColor: 'transparent',
      transform: [{ rotate: '45deg' }],
    }} />
  </View>
);

const TargetIcon = ({ color }) => (
  <View style={{ width: 18, height: 18, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: color }} />
    <View style={{ position: 'absolute', width: 6, height: 6, borderRadius: 3, borderWidth: 2, borderColor: color }} />
  </View>
);

const LogoutIcon = ({ color }) => (
  <View style={{ width: 18, height: 18, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ width: 10, height: 10, borderTopWidth: 2, borderRightWidth: 2, borderColor: color, transform: [{ rotate: '45deg' }] }} />
    <View style={{ position: 'absolute', width: 10, height: 2, backgroundColor: color, borderRadius: 1, left: 2 }} />
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (theme, isDarkMode, insets) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.bg },
  scroll: { flex: 1 },
  content: { padding: 22, gap: 8 },

  screenTitle: {
    fontSize: 28, fontWeight: '800', color: theme.text,
    letterSpacing: -0.8, marginBottom: 20,
  },

  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 18, borderRadius: 18,
    backgroundColor: theme.surface,
    borderWidth: 1, borderColor: theme.border,
    marginBottom: 8,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: theme.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '700', color: '#fff' },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: theme.accent,
    borderWidth: 2, borderColor: theme.surface,
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 2 },
  profileEmail: { fontSize: 13, color: theme.textMuted },

  section: { gap: 6, marginBottom: 4 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: theme.textMuted,
    letterSpacing: 1.5, paddingHorizontal: 4, marginBottom: 2,
  },

  card: {
    borderRadius: 16, backgroundColor: theme.surface,
    borderWidth: 1, borderColor: theme.border, overflow: 'hidden',
  },

  row: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 16,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowLabel: { fontSize: 14, color: theme.text, fontWeight: '500' },
  rowValue: { fontSize: 13, color: theme.textMuted },
  rowChevron: { fontSize: 20, color: theme.textMuted },
  toneWrap: {
    paddingHorizontal: 12, paddingBottom: 12,
    borderTopWidth: 1, borderTopColor: theme.border,
  },

  // LinkedIn
  linkedInCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, borderRadius: 16,
    backgroundColor: theme.surface,
    borderWidth: 1, borderColor: theme.border,
  },
  linkedInLogo: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#0A66C2',
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  linkedInLogoText: { fontSize: 16, fontWeight: '800', color: '#fff', fontStyle: 'italic' },
  linkedInInfo: { flex: 1, gap: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusText: { fontSize: 13, fontWeight: '600' },
  linkedInName: { fontSize: 12, color: theme.textSecondary },
  linkedInDisconnected: { fontSize: 13, fontWeight: '600', color: theme.text },
  linkedInSubtext: { fontSize: 11, color: theme.textMuted },
  linkedInError: { fontSize: 11, color: theme.danger, marginTop: 2 },
  linkedInBtn: {
    paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: 20, backgroundColor: '#0A66C2',
    minWidth: 80, alignItems: 'center', flexShrink: 0,
  },
  linkedInBtnDisconnect: {
    backgroundColor: 'transparent',
    borderWidth: 1, borderColor: theme.danger,
  },
  linkedInBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  refreshRow: { alignItems: 'center', paddingVertical: 6 },
  refreshText: { fontSize: 12, color: theme.textMuted },

  // Toggle
  toggle: {
    width: 46, height: 27, borderRadius: 14,
    backgroundColor: theme.border,
    justifyContent: 'center', padding: 3,
  },
  toggleOn: { backgroundColor: theme.primary },
  toggleThumb: {
    width: 21, height: 21, borderRadius: 10.5,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2, shadowRadius: 2, elevation: 2,
  },
  toggleThumbOn: { transform: [{ translateX: 19 }] },

  version: {
    fontSize: 12, color: theme.textMuted,
    textAlign: 'center', marginTop: 16,
  },
});