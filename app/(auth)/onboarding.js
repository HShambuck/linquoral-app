// app/(auth)/onboarding.js

import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ToneSelector from "../../src/components/ToneSelector";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/context/UserContext";
import { validateDisplayName } from "../../src/utils/validators";

export default function OnboardingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { register } = useAuth();
  const styles = createStyles(theme);

  const [displayName, setDisplayName] = useState("");
  const [preferredTone, setPreferredTone] = useState("Professional");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    const validation = validateDisplayName(displayName);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await register({
        displayName: displayName.trim(),
        preferredTone,
      });

      if (result.success) {
        router.replace("/(tabs)");
      } else {
        // Show error but offer to continue in demo mode
        Alert.alert(
          "Connection Error",
          "Unable to connect to server. Would you like to continue in demo mode?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Continue Demo",
              onPress: () => router.replace("/(tabs)"),
            },
          ],
        );
      }
    } catch (err) {
      // Network error - offer demo mode
      Alert.alert(
        "Connection Error",
        "Unable to connect to server. Would you like to continue in demo mode?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Continue Demo",
            onPress: () => router.replace("/(tabs)"),
          },
        ],
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleSkipDemo = () => {
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>

            {/* Skip/Demo button in header */}
            <TouchableOpacity
              onPress={handleSkipDemo}
              style={styles.skipButton}
              activeOpacity={0.7}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{"Let's set you up"}</Text>
            <Text style={styles.subtitle}>
              Just a few quick details to personalize your experience
            </Text>

            {/* Name Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>What should we call you?</Text>
              <TextInput
                value={displayName}
                onChangeText={(text) => {
                  setDisplayName(text);
                  setError(null);
                }}
                placeholder="Your name"
                placeholderTextColor={theme.textMuted}
                style={styles.textInput}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
              />
              {error && <Text style={styles.errorText}>{error}</Text>}
            </View>

            {/* Tone Selection */}
            <View style={styles.toneSection}>
              <Text style={styles.inputLabel}>
                Preferred tone for your posts
              </Text>
              <Text style={styles.toneHint}>
                You can change this anytime for each post
              </Text>
              <View style={styles.toneSelectorContainer}>
                <ToneSelector
                  selectedTone={preferredTone}
                  onSelectTone={setPreferredTone}
                  layout="vertical"
                  showDescriptions
                />
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleContinue}
              style={[
                styles.continueButton,
                (!displayName.trim() || isLoading) &&
                  styles.continueButtonDisabled,
              ]}
              activeOpacity={0.8}
              disabled={!displayName.trim() || isLoading}
            >
              <Text style={styles.continueButtonText}>
                {isLoading ? "Setting up..." : "Continue"}
              </Text>
            </TouchableOpacity>

            {/* Demo mode hint */}
            <Text style={styles.demoHint}>No account required for demo</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.bg,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 20,
      paddingBottom: 40,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    backButton: {
      padding: 8,
    },
    backIcon: {
      fontSize: 24,
      color: theme.textMuted,
    },
    skipButton: {
      padding: 8,
      paddingHorizontal: 16,
      backgroundColor: theme.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
    },
    skipText: {
      fontSize: 14,
      color: theme.textMuted,
      fontWeight: "500",
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 15,
      color: theme.textMuted,
      marginBottom: 32,
      lineHeight: 22,
    },
    inputSection: {
      marginBottom: 28,
    },
    inputLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 10,
    },
    textInput: {
      padding: 16,
      borderRadius: 14,
      backgroundColor: theme.surface,
      borderWidth: 1.5,
      borderColor: theme.border,
      color: theme.text,
      fontSize: 16,
    },
    errorText: {
      fontSize: 12,
      color: theme.danger,
      marginTop: 8,
    },
    toneSection: {
      marginBottom: 24,
    },
    toneHint: {
      fontSize: 12,
      color: theme.textMuted,
      marginBottom: 14,
    },
    toneSelectorContainer: {
      marginTop: 4,
    },
    footer: {
      marginTop: 20,
      paddingBottom: 20,
    },
    continueButton: {
      padding: 18,
      borderRadius: 16,
      backgroundColor: theme.primary,
      alignItems: "center",
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    continueButtonDisabled: {
      opacity: 0.5,
      shadowOpacity: 0,
      elevation: 0,
    },
    continueButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#fff",
    },
    demoHint: {
      fontSize: 12,
      color: theme.textMuted,
      textAlign: "center",
      marginTop: 16,
    },
  });
