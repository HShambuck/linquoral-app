// app/upgrade.js

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useTheme } from "../src/context/UserContext";
import { useSubscription } from "../src/context/SubscriptionContext";

const FREE_FEATURES = [
  { label: "3 AI refinements / month" },
  { label: "2 min recording limit" },
  { label: "3 voice edits / month" },
  { label: "Publish to LinkedIn" },
];

const PRO_FEATURES = [
  { label: "Unlimited AI refinements", highlight: true },
  { label: "Unlimited recording length", highlight: true },
  { label: "Unlimited voice edits", highlight: true },
  { label: "Post scheduling", highlight: true },
  { label: "Post performance score", highlight: true },
  { label: "Best time to post", highlight: true },
  { label: "Draft version history", highlight: false },
  { label: "Analytics (coming soon)", highlight: false },
  { label: "Post templates (coming soon)", highlight: false },
];

export default function UpgradeScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { initializePayment, verifyPayment, fetchStatus } = useSubscription();
  const [currency, setCurrency] = useState("GHS");
  const [isLoading, setIsLoading] = useState(false);
  const styles = createStyles(theme, isDarkMode, insets);

  const price = currency === "GHS" ? "GHS 19.99" : "$1.99";
  const paymentMethods =
    currency === "GHS"
      ? "MTN Mobile Money · Vodafone Cash · AirtelTigo · Card · Bank"
      : "Credit / Debit Card";

  // Listen for deep link callback
  React.useEffect(() => {
    const handleUrl = async ({ url }) => {
      if (!url?.includes("subscription-callback")) return;
      const parsed = Linking.parse(url);
      const reference = parsed.queryParams?.reference;
      if (!reference) {
        setIsLoading(false);
        return;
      }
      try {
        const result = await verifyPayment(reference);
        if (result.success) {
          await fetchStatus();
          setIsLoading(false);
          Alert.alert(
            "🎉 Welcome to Pro!",
            "Your account has been upgraded. Enjoy unlimited access.",
            [
              {
                text: "Let's go!",
                onPress: () => router.replace("/(tabs)/settings"),
              },
            ],
          );
        } else {
          setIsLoading(false);
          Alert.alert(
            "Payment incomplete",
            "Complete payment to activate Pro.",
          );
        }
      } catch (e) {
        setIsLoading(false);
        Alert.alert("Error", e.message || "Verification failed.");
      }
    };
    const sub = Linking.addEventListener("url", handleUrl);
    return () => sub.remove();
  }, []);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const { authorizationUrl } = await initializePayment(currency);
      await WebBrowser.openBrowserAsync(authorizationUrl, {
        showTitle: false,
        enableBarCollapsing: true,
      });
      setTimeout(() => setIsLoading(false), 2000);
    } catch (e) {
      setIsLoading(false);
      Alert.alert("Error", e.message || "Could not start payment.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <View style={styles.backBtnInner}>
            <Text style={styles.backBtnText}>‹</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upgrade to Pro</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroWrap}>
          <View style={styles.heroIconWrap}>
            <Text style={styles.heroIcon}>⚡</Text>
          </View>
          <Text style={styles.heroTitle}>Unlock your full potential</Text>
          <Text style={styles.heroSub}>
            Post consistently, grow faster, and never hit a limit again.
          </Text>
        </View>

        {/* Comparison */}
        <View style={styles.comparisonWrap}>
          {/* Free column */}
          <View style={[styles.compCard, styles.compCardFree]}>
            <Text style={styles.compTitle}>Free</Text>
            <Text style={styles.compPrice}>GHS 0</Text>
            {FREE_FEATURES.map((f, i) => (
              <View key={i} style={styles.compRow}>
                <View style={styles.compCheckFree}>
                  <View style={styles.compCheckLineFree} />
                </View>
                <Text style={styles.compFeatureFree}>{f.label}</Text>
              </View>
            ))}
          </View>

          {/* Pro column */}
          <View style={[styles.compCard, styles.compCardPro]}>
            <View style={styles.popularTag}>
              <Text style={styles.popularTagText}>Most popular</Text>
            </View>
            <Text style={styles.compTitlePro}>Pro</Text>
            <Text style={styles.compPricePro}>
              {price}
              <Text style={styles.compPricePerPro}>/mo</Text>
            </Text>
            {PRO_FEATURES.map((f, i) => (
              <View key={i} style={styles.compRow}>
                <View
                  style={[
                    styles.compCheck,
                    f.highlight && styles.compCheckHighlight,
                  ]}
                >
                  <View style={styles.compCheckLine1} />
                  <View style={styles.compCheckLine2} />
                </View>
                <Text
                  style={[styles.compFeature, !f.highlight && { opacity: 0.6 }]}
                >
                  {f.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Currency toggle */}
        <View style={styles.currencySection}>
          <Text style={styles.currencyLabel}>Pay in</Text>
          <View style={styles.currencyRow}>
            {["GHS", "USD"].map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setCurrency(c)}
                style={[
                  styles.currencyBtn,
                  currency === c && styles.currencyBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.currencyBtnText,
                    currency === c && styles.currencyBtnTextActive,
                  ]}
                >
                  {c === "GHS" ? "🇬🇭 Ghana Cedi" : "🌍 US Dollar"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.paymentMethodsText}>{paymentMethods}</Text>
        </View>

        {/* Social proof */}
        <View style={styles.proofWrap}>
          <View style={styles.proofRow}>
            <View style={styles.proofDot} />
            <Text style={styles.proofText}>
              Cancel anytime — no long-term commitment
            </Text>
          </View>
          <View style={styles.proofRow}>
            <View style={styles.proofDot} />
            <Text style={styles.proofText}>Secure payment via Paystack</Text>
          </View>
          <View style={styles.proofRow}>
            <View style={styles.proofDot} />
            <Text style={styles.proofText}>
              Instant activation after payment
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky bottom CTA */}
      <View style={[styles.bottomCta, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          onPress={handleUpgrade}
          style={styles.ctaBtn}
          activeOpacity={0.88}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.ctaBtnText}>Upgrade to Pro</Text>
              <Text style={styles.ctaBtnPrice}>{price}/month</Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.ctaNote}>Billed monthly · Cancel anytime</Text>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme, isDarkMode, insets) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.bg },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 22,
      paddingTop: 8,
      paddingBottom: 12,
    },
    backBtn: {},
    backBtnInner: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      justifyContent: "center",
      alignItems: "center",
    },
    backBtnText: { fontSize: 22, color: theme.textSecondary, marginTop: -2 },
    headerTitle: { fontSize: 17, fontWeight: "700", color: theme.text },

    scroll: { flex: 1 },
    content: { paddingHorizontal: 22, gap: 20 },

    heroWrap: { alignItems: "center", paddingTop: 8, paddingBottom: 4 },
    heroIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 22,
      backgroundColor: theme.primaryGlow,
      borderWidth: 1,
      borderColor: `${theme.primary}30`,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    heroIcon: { fontSize: 32 },
    heroTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: theme.text,
      textAlign: "center",
      letterSpacing: -0.5,
      marginBottom: 8,
    },
    heroSub: {
      fontSize: 14,
      color: theme.textMuted,
      textAlign: "center",
      lineHeight: 21,
      paddingHorizontal: 20,
    },

    comparisonWrap: { flexDirection: "row", gap: 10 },
    compCard: {
      flex: 1,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      gap: 10,
    },
    compCardFree: { backgroundColor: theme.surface, borderColor: theme.border },
    compCardPro: {
      backgroundColor: theme.primaryGlow,
      borderColor: theme.primary,
      borderWidth: 2,
      position: "relative",
    },

    popularTag: {
      position: "absolute",
      top: -1,
      right: 12,
      backgroundColor: theme.primary,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 0,
      borderBottomLeftRadius: 6,
      borderBottomRightRadius: 6,
    },
    popularTagText: {
      fontSize: 9,
      fontWeight: "700",
      color: "#fff",
      letterSpacing: 0.5,
    },

    compTitle: { fontSize: 14, fontWeight: "700", color: theme.textMuted },
    compTitlePro: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.primary,
      marginTop: 8,
    },
    compPrice: { fontSize: 20, fontWeight: "800", color: theme.textMuted },
    compPricePro: { fontSize: 20, fontWeight: "800", color: theme.text },
    compPricePerPro: {
      fontSize: 12,
      fontWeight: "400",
      color: theme.textMuted,
    },

    compRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    compCheckFree: {
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: theme.border,
      justifyContent: "center",
      alignItems: "center",
      flexShrink: 0,
    },
    compCheckLineFree: {
      width: 6,
      height: 1.5,
      backgroundColor: theme.textMuted,
      borderRadius: 1,
    },
    compCheck: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: `${theme.primary}20`,
      borderWidth: 1.5,
      borderColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
      flexShrink: 0,
    },
    compCheckHighlight: { backgroundColor: theme.primary },
    compCheckLine1: {
      position: "absolute",
      width: 4,
      height: 1.5,
      backgroundColor: "#fff",
      borderRadius: 1,
      transform: [{ rotate: "45deg" }, { translateX: -2 }, { translateY: 1 }],
    },
    compCheckLine2: {
      position: "absolute",
      width: 7,
      height: 1.5,
      backgroundColor: "#fff",
      borderRadius: 1,
      transform: [{ rotate: "-50deg" }, { translateX: 1 }],
    },
    compFeatureFree: {
      fontSize: 11,
      color: theme.textMuted,
      flex: 1,
      lineHeight: 16,
    },
    compFeature: { fontSize: 11, color: theme.text, flex: 1, lineHeight: 16 },

    currencySection: { gap: 10 },
    currencyLabel: { fontSize: 12, fontWeight: "600", color: theme.textMuted },
    currencyRow: { flexDirection: "row", gap: 8 },
    currencyBtn: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.border,
      alignItems: "center",
      backgroundColor: theme.surface,
    },
    currencyBtnActive: {
      borderColor: theme.primary,
      backgroundColor: theme.primaryGlow,
    },
    currencyBtnText: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.textMuted,
    },
    currencyBtnTextActive: { color: theme.primary },
    paymentMethodsText: {
      fontSize: 11,
      color: theme.textMuted,
      textAlign: "center",
      lineHeight: 17,
    },

    proofWrap: { gap: 8, paddingBottom: 8 },
    proofRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    proofDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: theme.accent,
      flexShrink: 0,
    },
    proofText: { fontSize: 13, color: theme.textSecondary },

    bottomCta: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 22,
      paddingTop: 16,
      backgroundColor: theme.bg,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    ctaBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      padding: 16,
      borderRadius: 16,
      backgroundColor: theme.primary,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDarkMode ? 0.4 : 0.2,
      shadowRadius: 16,
      elevation: 8,
      minHeight: 54,
    },
    ctaBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
    ctaBtnPrice: { fontSize: 13, color: "rgba(255,255,255,0.7)" },
    ctaNote: {
      fontSize: 11,
      color: theme.textMuted,
      textAlign: "center",
      marginTop: 8,
    },
  });
