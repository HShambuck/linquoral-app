// app/linkedin-connected.js
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function LinkedInConnectedScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {params.success === 'true' ? '✓ LinkedIn Connected!' : 'Connection failed'}
      </Text>
      <Text style={styles.subtitle}>
        {params.success === 'true' 
          ? `Welcome, ${params.firstName || ''}!` 
          : params.error || 'Something went wrong'}
      </Text>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.replace('/(tabs)')}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0C10', gap: 20, padding: 32 },
  title: { fontSize: 22, fontWeight: '700', color: '#F0F4FF', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#8A9BB5', textAlign: 'center' },
  button: { backgroundColor: '#0A66C2', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 25, marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});