// app/linkedin-connected.js
//
// This screen handles the deep link redirect after LinkedIn OAuth.
// URL: linquoral://linkedin-connected?success=true&firstName=X&lastName=Y
//   or linquoral://linkedin-connected?success=false&error=MESSAGE
//
// Expo Router matches this file to the "linkedin-connected" path in the
// linquoral:// scheme, so the deep link lands here automatically.

import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

export default function LinkedInConnectedScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Dismiss the in-app browser if still open
    WebBrowser.dismissBrowser().catch(() => {});

    // Small delay so the browser has time to close before navigating
    const timer = setTimeout(() => {
      router.replace('/(tabs)/settings');
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0A66C2" />
      <Text style={styles.text}>
        {params.success === 'true' ? 'Connecting LinkedIn...' : 'Returning to app...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0C10',
    gap: 16,
  },
  text: {
    fontSize: 14,
    color: '#8A9BB5',
  },
});