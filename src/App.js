// src/App.js

import React, { useEffect } from 'react';
import { StatusBar, LogBox, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { DraftProvider } from './context/DraftContext';

// Navigation
import RootNavigator from './navigation/RootNavigator';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

// Ignore specific warnings (optional, for development)
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

/**
 * App Component
 * 
 * Main entry point for Linquoral.
 * Sets up providers, navigation, and global configurations.
 * 
 * Architecture:
 * - GestureHandlerRootView: Required for gesture-based interactions
 * - SafeAreaProvider: Handles safe area insets
 * - AuthProvider: Authentication state management
 * - UserProvider: User preferences and theme
 * - DraftProvider: Draft/content state management
 * - RootNavigator: Navigation container and routing
 */
const App = () => {
  /**
   * Hide splash screen when app is ready
   */
  useEffect(() => {
    const hideSplash = async () => {
      // Add slight delay for smoother transition
      await new Promise(resolve => setTimeout(resolve, 500));
      await SplashScreen.hideAsync();
    };

    hideSplash();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <UserProvider>
            <DraftProvider>
              <AppContent />
            </DraftProvider>
          </UserProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

/**
 * AppContent Component
 * 
 * Separated to access UserContext for StatusBar styling
 */
const AppContent = () => {
  // Note: useTheme is available here because we're inside UserProvider
  // For now, we'll use a simple approach
  
  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <RootNavigator />
    </>
  );
};

export default App;