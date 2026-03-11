// app/linkedin-connected.js

import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

export default function LinkedInConnectedScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    WebBrowser.dismissBrowser().catch(() => {});

    const timer = setTimeout(() => {
      try {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)');
        }
      } catch (e) {
        console.warn('Navigation after LinkedIn callback failed:', e);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0A66C2" />
      <Text style={styles.text}>
        {params.success === 'true' ? 'LinkedIn connected!' : 'Returning to app...'}
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