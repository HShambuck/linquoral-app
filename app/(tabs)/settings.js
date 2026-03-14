// app/(tabs)/settings.js

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme, useUser } from "../../src/context/UserContext";
import { useAuth } from "../../src/context/AuthContext";
import { useSubscription } from "../../src/context/SubscriptionContext";
import ToneSelector from "../../src/components/ToneSelector";
import { useLinkedInAuth } from "../../src/hooks/useLinkedInAuth";

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const { toggleTheme } = useUser();
  const { user, logout } = useAuth();
  const { subscription, usage, isPro } = useSubscription();
  const insets = useSafeAreaInsets();
  const [showToneSelector, setShowToneSelector] = useState(false);
  const [defaultTone, setDefaultTone] = useState(
    user?.preferredTone || "Professional",
  );

  const {
    connectLinkedIn,
    disconnect: disconnectLinkedIn,
    isConnecting: linkedInLoading,
    error: linkedInError,
  } = useLinkedInAuth();

  const styles = createStyles(theme, isDarkMode, insets);

  const isLinkedInConnected = user?.linkedIn?.connected || false;
  const linkedInProfile = isLinkedInConnected ? user.linkedIn : null;
  const profilePicture = linkedInProfile?.picture || null;
  const displayName = user?.displayName || "Your Name";
  const profileInitial = displayName.charAt(0).toUpperCase();
  const profileSubtitle =
    isLinkedInConnected && linkedInProfile
      ? `${linkedInProfile.firstName} ${linkedInProfile.lastName} · LinkedIn`
      : "Not connected to LinkedIn";

  // Usage percentages for free users
  const aiUsed = usage?.aiRefinementsUsed || 0;
  const aiLimit = usage?.aiRefinementsLimit || 3;
  const aiPct = Math.min((aiUsed / aiLimit) * 100, 100);

  const voiceEditUsed = usage?.voiceEditsUsed || 0;
  const voiceEditLimit = usage?.voiceEditsLimit || 3;
  const voiceEditPct = Math.min((voiceEditUsed / voiceEditLimit) * 100, 100);

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/welcome");
        },
      },
    ]);
  };

  const handleDisconnectLinkedIn = () => {
    Alert.alert(
      "Disconnect LinkedIn",
      "You won't be able to post until you reconnect.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: disconnectLinkedIn,
        },
      ],
    );
  };

  const getUsageColor = (pct) => {
    if (pct >= 100) return theme.danger;
    if (pct >= 66) return theme.warning;
    return theme.accent;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Settings</Text>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            {profilePicture ? (
              <Image
                source={{ uri: profilePicture }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{profileInitial}</Text>
              </View>
            )}
            <View
              style={[
                styles.onlineDot,
                {
                  backgroundColor: isLinkedInConnected
                    ? theme.accent
                    : theme.border,
                },
              ]}
            />
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.profileNameRow}>
              <Text style={styles.profileName}>{displayName}</Text>
              <View style={[styles.planBadge, isPro && styles.planBadgePro]}>
                <Text
                  style={[
                    styles.planBadgeText,
                    isPro && styles.planBadgeTextPro,
                  ]}
                >
                  {isPro ? "⚡ Pro" : "Free"}
                </Text>
              </View>
            </View>
            <Text style={styles.profileEmail}>{profileSubtitle}</Text>
          </View>
        </View>

        {/* ─── Subscription Section ─────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SUBSCRIPTION</Text>

          {isPro ? (
            /* Pro card */
            <View style={[styles.subCard, styles.subCardPro]}>
              <View style={styles.subCardHeader}>
                <View style={styles.subIconWrap}>
                  <Text style={styles.subIcon}>⚡</Text>
                </View>
                <View style={styles.subInfo}>
                  <Text style={styles.subTitle}>Linqoral Pro</Text>
                  <Text style={styles.subSubtitle}>
                    {subscription?.expiresAt
                      ? `Renews ${new Date(subscription.expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
                      : "Active subscription"}
                  </Text>
                </View>
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>Active</Text>
                </View>
              </View>
              <View style={styles.proPerks}>
                {[
                  "Unlimited AI refinements",
                  "Unlimited recording",
                  "Post scheduling",
                ].map((perk, i) => (
                  <View key={i} style={styles.perkRow}>
                    <View style={styles.perkDot} />
                    <Text style={styles.perkText}>{perk}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            /* Free card with usage + upgrade CTA */
            <View style={styles.subCard}>
              {/* Usage bars */}
              <View style={styles.usageSection}>
                <Text style={styles.usageTitle}>{`This month's usage`}</Text>
                <View style={styles.usageRow}>
                  <Text style={styles.usageLabel}>AI refinements</Text>
                  <Text
                    style={[styles.usageCount, { color: getUsageColor(aiPct) }]}
                  >
                    {aiUsed} / {aiLimit}
                  </Text>
                </View>
                <View style={styles.progressBg}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${aiPct}%`,
                        backgroundColor: getUsageColor(aiPct),
                      },
                    ]}
                  />
                </View>

                <View style={[styles.usageRow, { marginTop: 10 }]}>
                  <Text style={styles.usageLabel}>Voice edits</Text>
                  <Text
                    style={[
                      styles.usageCount,
                      { color: getUsageColor(voiceEditPct) },
                    ]}
                  >
                    {voiceEditUsed} / {voiceEditLimit}
                  </Text>
                </View>
                <View style={styles.progressBg}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${voiceEditPct}%`,
                        backgroundColor: getUsageColor(voiceEditPct),
                      },
                    ]}
                  />
                </View>

                <Text style={styles.usageResets}>
                  Resets{" "}
                  {usage?.resetsAt
                    ? new Date(usage.resetsAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })
                    : "next month"}
                </Text>
              </View>

              <View style={styles.subDivider} />

              {/* Locked features teaser */}
              <View style={styles.lockedFeatures}>
                {[
                  { label: "Unlimited AI refinements", icon: "∞" },
                  { label: "Post scheduling", icon: "📅" },
                  { label: "Post performance score", icon: "📊" },
                ].map((f, i) => (
                  <View key={i} style={styles.lockedRow}>
                    <View style={styles.lockIconWrap}>
                      <View style={styles.lockIcon} />
                    </View>
                    <Text style={styles.lockedText}>{f.label}</Text>
                  </View>
                ))}
              </View>

              {/* Upgrade button */}
              <TouchableOpacity
                onPress={() => router.push("/upgrade")}
                style={styles.upgradeBtn}
                activeOpacity={0.88}
              >
                <Text style={styles.upgradeBtnText}>
                  Upgrade to Pro · GHS 19.99/mo
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* LinkedIn */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>LINKEDIN</Text>
          <View style={styles.linkedInCard}>
            <View style={styles.linkedInLogo}>
              <Text style={styles.linkedInLogoText}>in</Text>
            </View>
            <View style={styles.linkedInInfo}>
              {isLinkedInConnected ? (
                <>
                  <View style={styles.statusRow}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: theme.accent },
                      ]}
                    />
                    <Text style={[styles.statusText, { color: theme.accent }]}>
                      Connected
                    </Text>
                  </View>
                  {linkedInProfile && (
                    <Text style={styles.linkedInName}>
                      {linkedInProfile.firstName} {linkedInProfile.lastName}
                    </Text>
                  )}
                </>
              ) : (
                <>
                  <Text style={styles.linkedInDisconnected}>Not connected</Text>
                  <Text style={styles.linkedInSubtext}>
                    Connect to enable posting
                  </Text>
                </>
              )}
              {linkedInError ? (
                <Text style={styles.linkedInError}>{linkedInError}</Text>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={
                isLinkedInConnected ? handleDisconnectLinkedIn : connectLinkedIn
              }
              style={[
                styles.linkedInBtn,
                isLinkedInConnected && styles.linkedInBtnDisconnect,
              ]}
              activeOpacity={0.8}
              disabled={linkedInLoading}
            >
              {linkedInLoading ? (
                <ActivityIndicator
                  color={isLinkedInConnected ? theme.danger : "#fff"}
                  size="small"
                />
              ) : (
                <Text
                  style={[
                    styles.linkedInBtnText,
                    isLinkedInConnected && { color: theme.danger },
                  ]}
                >
                  {isLinkedInConnected ? "Disconnect" : "Connect"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
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
              <TouchableOpacity
                onPress={toggleTheme}
                style={[styles.toggle, isDarkMode && styles.toggleOn]}
                activeOpacity={0.85}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    isDarkMode && styles.toggleThumbOn,
                  ]}
                />
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
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.row}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <LogoutIcon color={theme.danger} />
                <Text style={[styles.rowLabel, { color: theme.danger }]}>
                  Log Out
                </Text>
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

// ─── Icons ────────────────────────────────────────────────────────────────────

const HalfMoonIcon = ({ color }) => (
  <View
    style={{
      width: 18,
      height: 18,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <View
      style={{
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: color,
        borderRightColor: "transparent",
        transform: [{ rotate: "45deg" }],
      }}
    />
  </View>
);

const TargetIcon = ({ color }) => (
  <View
    style={{
      width: 18,
      height: 18,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <View
      style={{
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: color,
      }}
    />
    <View
      style={{
        position: "absolute",
        width: 6,
        height: 6,
        borderRadius: 3,
        borderWidth: 2,
        borderColor: color,
      }}
    />
  </View>
);

const LogoutIcon = ({ color }) => (
  <View
    style={{
      width: 18,
      height: 18,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <View
      style={{
        width: 10,
        height: 10,
        borderTopWidth: 2,
        borderRightWidth: 2,
        borderColor: color,
        transform: [{ rotate: "45deg" }],
      }}
    />
    <View
      style={{
        position: "absolute",
        width: 10,
        height: 2,
        backgroundColor: color,
        borderRadius: 1,
        left: 2,
      }}
    />
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (theme, isDarkMode, insets) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.bg },
    scroll: { flex: 1 },
    content: { padding: 22, gap: 8 },

    screenTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: theme.text,
      letterSpacing: -0.8,
      marginBottom: 20,
    },

    profileCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      padding: 18,
      borderRadius: 18,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 8,
    },
    avatarWrap: { position: "relative" },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarImage: { width: 52, height: 52, borderRadius: 16 },
    avatarText: { fontSize: 22, fontWeight: "700", color: "#fff" },
    onlineDot: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 12,
      height: 12,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: theme.surface,
    },
    profileInfo: { flex: 1 },
    profileNameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 2,
    },
    profileName: { fontSize: 16, fontWeight: "700", color: theme.text },
    planBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 20,
      backgroundColor: theme.surfaceHigh,
      borderWidth: 1,
      borderColor: theme.border,
    },
    planBadgePro: {
      backgroundColor: theme.primaryGlow,
      borderColor: `${theme.primary}40`,
    },
    planBadgeText: { fontSize: 10, fontWeight: "700", color: theme.textMuted },
    planBadgeTextPro: { color: theme.primary },
    profileEmail: { fontSize: 13, color: theme.textMuted },

    section: { gap: 6, marginBottom: 4 },
    sectionLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: theme.textMuted,
      letterSpacing: 1.5,
      paddingHorizontal: 4,
      marginBottom: 2,
    },

    // ── Subscription card ──
    subCard: {
      borderRadius: 18,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: "hidden",
    },
    subCardPro: { borderColor: `${theme.primary}50` },

    subCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 16,
    },
    subIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.primaryGlow,
      borderWidth: 1,
      borderColor: `${theme.primary}30`,
      justifyContent: "center",
      alignItems: "center",
    },
    subIcon: { fontSize: 18 },
    subInfo: { flex: 1 },
    subTitle: { fontSize: 15, fontWeight: "700", color: theme.text },
    subSubtitle: { fontSize: 12, color: theme.textMuted, marginTop: 1 },
    proBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      backgroundColor: theme.primaryGlow,
      borderWidth: 1,
      borderColor: `${theme.primary}30`,
    },
    proBadgeText: { fontSize: 11, fontWeight: "700", color: theme.primary },

    proPerks: { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
    perkRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    perkDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: theme.accent,
    },
    perkText: { fontSize: 13, color: theme.textSecondary },

    // Usage bars
    usageSection: { padding: 16 },
    usageTitle: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.textMuted,
      marginBottom: 10,
      letterSpacing: 0.2,
    },
    usageRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 6,
    },
    usageLabel: { fontSize: 13, color: theme.text, fontWeight: "500" },
    usageCount: { fontSize: 12, fontWeight: "700" },
    progressBg: {
      height: 5,
      borderRadius: 3,
      backgroundColor: theme.surfaceHigh,
      overflow: "hidden",
    },
    progressFill: { height: "100%", borderRadius: 3 },
    usageResets: { fontSize: 11, color: theme.textMuted, marginTop: 10 },

    subDivider: {
      height: 1,
      backgroundColor: theme.border,
      marginHorizontal: 16,
    },

    // Locked features
    lockedFeatures: { padding: 16, gap: 10 },
    lockedRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    lockIconWrap: {
      width: 20,
      height: 20,
      borderRadius: 6,
      backgroundColor: theme.surfaceHigh,
      borderWidth: 1,
      borderColor: theme.border,
      justifyContent: "center",
      alignItems: "center",
    },
    lockIcon: {
      width: 7,
      height: 7,
      borderRadius: 1.5,
      borderWidth: 1.5,
      borderColor: theme.textMuted,
    },
    lockedText: { fontSize: 13, color: theme.textMuted },

    upgradeBtn: {
      margin: 16,
      marginTop: 4,
      padding: 14,
      borderRadius: 14,
      backgroundColor: theme.primary,
      alignItems: "center",
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDarkMode ? 0.4 : 0.2,
      shadowRadius: 12,
      elevation: 6,
    },
    upgradeBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },

    card: {
      borderRadius: 16,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: "hidden",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    rowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    rowRight: { flexDirection: "row", alignItems: "center", gap: 6 },
    rowLabel: { fontSize: 14, color: theme.text, fontWeight: "500" },
    rowValue: { fontSize: 13, color: theme.textMuted },
    rowChevron: { fontSize: 20, color: theme.textMuted },
    toneWrap: {
      paddingHorizontal: 12,
      paddingBottom: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },

    linkedInCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 16,
      borderRadius: 16,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    linkedInLogo: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: "#0A66C2",
      justifyContent: "center",
      alignItems: "center",
      flexShrink: 0,
    },
    linkedInLogoText: {
      fontSize: 16,
      fontWeight: "800",
      color: "#fff",
      fontStyle: "italic",
    },
    linkedInInfo: { flex: 1, gap: 2 },
    statusRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    statusDot: { width: 7, height: 7, borderRadius: 3.5 },
    statusText: { fontSize: 13, fontWeight: "600" },
    linkedInName: { fontSize: 12, color: theme.textSecondary },
    linkedInDisconnected: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.text,
    },
    linkedInSubtext: { fontSize: 11, color: theme.textMuted },
    linkedInError: { fontSize: 11, color: theme.danger, marginTop: 2 },
    linkedInBtn: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 20,
      backgroundColor: "#0A66C2",
      minWidth: 80,
      alignItems: "center",
      flexShrink: 0,
    },
    linkedInBtnDisconnect: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: theme.danger,
    },
    linkedInBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },

    toggle: {
      width: 46,
      height: 27,
      borderRadius: 14,
      backgroundColor: theme.border,
      justifyContent: "center",
      padding: 3,
    },
    toggleOn: { backgroundColor: theme.primary },
    toggleThumb: {
      width: 21,
      height: 21,
      borderRadius: 10.5,
      backgroundColor: "#fff",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    toggleThumbOn: { transform: [{ translateX: 19 }] },

    version: {
      fontSize: 12,
      color: theme.textMuted,
      textAlign: "center",
      marginTop: 16,
    },
  });
