// app/(tabs)/settings.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme, useUser } from '../../src/context/UserContext';
import { useAuth } from '../../src/context/AuthContext';
import ToneSelector from '../../src/components/ToneSelector';
import { APP_INFO } from '../../src/utils/constants';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const { toggleTheme, preferredTone, setPreferredTone, notificationsEnabled, toggleNotifications } = useUser();
  const { user, logout } = useAuth();

  const [showToneSelector, setShowToneSelector] = useState(false);

  const styles = createStyles(theme, isDarkMode);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/welcome');
          },
        },
      ]
    );
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
    showArrow = true,
    danger = false,
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={styles.settingItem}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress && !rightElement}
    >
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, danger && styles.settingTitleDanger]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      {rightElement || (showArrow && onPress && (
        <Text style={styles.settingArrow}>→</Text>
      ))}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>

        {/* Profile Section */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {user?.initials || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.displayName || 'User'}
            </Text>
            <Text style={styles.profileMeta}>
              {APP_INFO.NAME} User
            </Text>
          </View>
        </View>

        {/* Appearance */}
        <SectionHeader title="Appearance" />
        <View style={styles.settingsGroup}>
          <SettingItem
            icon="🌓"
            title="Dark Mode"
            subtitle={isDarkMode ? 'On' : 'Off'}
            showArrow={false}
            rightElement={
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#fff"
              />
            }
          />
        </View>

        {/* Preferences */}
        <SectionHeader title="Preferences" />
        <View style={styles.settingsGroup}>
          <SettingItem
            icon="🎯"
            title="Default Tone"
            subtitle={preferredTone}
            onPress={() => setShowToneSelector(!showToneSelector)}
          />
          {showToneSelector && (
            <View style={styles.toneSelectorContainer}>
              <ToneSelector
                selectedTone={preferredTone}
                onSelectTone={(tone) => {
                  setPreferredTone(tone);
                  setShowToneSelector(false);
                }}
                layout="vertical"
                showDescriptions
              />
            </View>
          )}
        </View>

        {/* Account */}
        <SectionHeader title="Account" />
        <View style={styles.settingsGroup}>
          <SettingItem
            icon="🚪"
            title="Log Out"
            onPress={handleLogout}
            showArrow={false}
            danger
          />
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>{APP_INFO.NAME}</Text>
          <Text style={styles.appVersion}>Version {APP_INFO.VERSION}</Text>
          <Text style={styles.appTagline}>{APP_INFO.TAGLINE}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme, isDarkMode) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.bg,
    },
    container: {
      flex: 1,
    },
    content: {
      padding: 20,
      paddingBottom: 40,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 24,
    },
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 16,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 24,
    },
    profileAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    profileAvatarText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '700',
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    profileMeta: {
      fontSize: 13,
      color: theme.textMuted,
      marginTop: 2,
    },
    sectionHeader: {
      fontSize: 11,
      color: theme.textMuted,
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginBottom: 10,
      marginTop: 8,
    },
    settingsGroup: {
      borderRadius: 14,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 16,
      overflow: 'hidden',
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 14,
      paddingHorizontal: 16,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingIcon: {
      fontSize: 18,
      marginRight: 12,
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.text,
    },
    settingTitleDanger: {
      color: theme.danger,
    },
    settingSubtitle: {
      fontSize: 12,
      color: theme.textMuted,
      marginTop: 2,
    },
    settingArrow: {
      fontSize: 16,
      color: theme.textMuted,
    },
    toneSelectorContainer: {
      padding: 14,
      paddingTop: 0,
    },
    appInfo: {
      alignItems: 'center',
      marginTop: 24,
      paddingTop: 16,
    },
    appName: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
    },
    appVersion: {
      fontSize: 12,
      color: theme.textMuted,
      marginTop: 4,
    },
    appTagline: {
      fontSize: 12,
      color: theme.textMuted,
      fontStyle: 'italic',
      marginTop: 8,
    },
  });