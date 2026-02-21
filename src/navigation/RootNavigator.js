// src/navigation/RootNavigator.js

import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/UserContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { APP_INFO } from '../utils/constants';

/**
 * Loading Screen
 * 
 * Shown while restoring session
 */
const LoadingScreen = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.loadingContainer, { backgroundColor: theme.bg }]}>
      <View style={[styles.logoContainer, { backgroundColor: theme.primary }]}>
        <Text style={styles.logoEmoji}>🎙</Text>
      </View>
      <Text style={[styles.appName, { color: theme.text }]}>
        {APP_INFO.NAME}
      </Text>
      <ActivityIndicator
        size="small"
        color={theme.primary}
        style={styles.loader}
      />
    </View>
  );
};

/**
 * RootNavigator
 * 
 * Handles navigation based on authentication state.
 * - Shows loading screen while checking auth
 * - Shows AuthNavigator for unauthenticated users
 * - Shows MainNavigator for authenticated users
 */
const RootNavigator = () => {
  const { isLoading, isAuthenticated } = useAuth();
  const { theme, isDarkMode } = useTheme();

  // Navigation theme
  const navigationTheme = {
    dark: isDarkMode,
    colors: {
      primary: theme.primary,
      background: theme.bg,
      card: theme.surface,
      text: theme.text,
      border: theme.border,
      notification: theme.danger,
    },
  };

  // Show loading screen while checking auth
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

// ─── STYLES ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoEmoji: {
    fontSize: 36,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  loader: {
    marginTop: 8,
  },
});

export default RootNavigator;