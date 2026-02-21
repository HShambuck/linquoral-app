// app/(tabs)/index.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/UserContext';
import { useAuth } from '../../src/context/AuthContext';
import { useDrafts } from '../../src/context/DraftContext';
import { TIPS, getGreeting } from '../../src/utils/constants';
import { formatRelativeTime } from '../../src/utils/validators';

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { stats, recentDraft, fetchDrafts, isLoading } = useDrafts();

  const [refreshing, setRefreshing] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);

  const styles = createStyles(theme);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % TIPS.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDrafts();
    setRefreshing(false);
  };

  const handleNewPost = () => {
    router.push('/(tabs)/record');
  };

  const handleContinueDraft = () => {
    if (recentDraft) {
      router.push(`/editor/${recentDraft.id}`);
    }
  };

  const handleViewDrafts = () => {
    router.push('/(tabs)/drafts');
  };

  const greeting = getGreeting();
  const tip = TIPS[currentTip];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.headline}>
              {"What's on\nyour mind?"}
            </Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.initials || 'U'}
            </Text>
          </View>
        </View>

        {/* Primary CTA */}
        <TouchableOpacity
          onPress={handleNewPost}
          style={styles.primaryCta}
          activeOpacity={0.9}
        >
          <View style={styles.primaryCtaIcon}>
            <Text style={styles.primaryCtaEmoji}>🎙</Text>
          </View>
          <View style={styles.primaryCtaContent}>
            <Text style={styles.primaryCtaTitle}>New Voice Post</Text>
            <Text style={styles.primaryCtaSubtitle}>
              Speak your thoughts, AI does the rest
            </Text>
          </View>
          <Text style={styles.primaryCtaArrow}>→</Text>
        </TouchableOpacity>

        {/* Continue Draft */}
        {recentDraft && (
          <TouchableOpacity
            onPress={handleContinueDraft}
            style={styles.continueDraft}
            activeOpacity={0.7}
          >
            <View style={styles.continueDraftIcon}>
              <Text style={styles.continueDraftEmoji}>✎</Text>
            </View>
            <View style={styles.continueDraftContent}>
              <Text style={styles.continueDraftTitle}>Continue last draft</Text>
              <Text style={styles.continueDraftSubtitle} numberOfLines={1}>
                {recentDraft.title} · {formatRelativeTime(new Date(recentDraft.updatedAt))}
              </Text>
            </View>
            <Text style={styles.continueDraftArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            onPress={handleViewDrafts}
            style={styles.statCard}
            activeOpacity={0.7}
          >
            <Text style={styles.statIcon}>◫</Text>
            <Text style={styles.statValue}>{stats.totalDrafts}</Text>
            <Text style={styles.statLabel}>Drafts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleViewDrafts}
            style={styles.statCard}
            activeOpacity={0.7}
          >
            <Text style={styles.statIcon}>◷</Text>
            <Text style={styles.statValue}>{stats.scheduledPosts}</Text>
            <Text style={styles.statLabel}>Scheduled</Text>
          </TouchableOpacity>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>✓</Text>
            <Text style={styles.statValue}>{stats.publishedPosts}</Text>
            <Text style={styles.statLabel}>Published</Text>
          </View>
        </View>

        {/* Tips Banner */}
        <View style={styles.tipBanner}>
          <Text style={styles.tipIcon}>{tip.icon}</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>{tip.title}</Text>
            <Text style={styles.tipText}>{tip.text}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme) =>
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
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 28,
    },
    headerText: {
      flex: 1,
    },
    greeting: {
      fontSize: 13,
      color: theme.textMuted,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    headline: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text,
      lineHeight: 30,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 15,
    },
    primaryCta: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      paddingRight: 24,
      borderRadius: 20,
      backgroundColor: theme.primary,
      marginBottom: 16,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    primaryCtaIcon: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    primaryCtaEmoji: {
      fontSize: 24,
    },
    primaryCtaContent: {
      flex: 1,
    },
    primaryCtaTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: '#fff',
      marginBottom: 3,
    },
    primaryCtaSubtitle: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.7)',
    },
    primaryCtaArrow: {
      fontSize: 20,
      color: 'rgba(255,255,255,0.8)',
    },
    continueDraft: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      paddingRight: 18,
      borderRadius: 16,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 24,
    },
    continueDraftIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.accentGlow,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    continueDraftEmoji: {
      fontSize: 18,
    },
    continueDraftContent: {
      flex: 1,
    },
    continueDraftTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
    },
    continueDraftSubtitle: {
      fontSize: 12,
      color: theme.textMuted,
      marginTop: 2,
    },
    continueDraftArrow: {
      fontSize: 16,
      color: theme.textMuted,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    statCard: {
      flex: 1,
      padding: 14,
      paddingVertical: 16,
      borderRadius: 14,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
    },
    statIcon: {
      fontSize: 16,
      marginBottom: 4,
      color: theme.textMuted,
    },
    statValue: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
    },
    statLabel: {
      fontSize: 11,
      color: theme.textMuted,
      marginTop: 2,
    },
    tipBanner: {
      flexDirection: 'row',
      padding: 14,
      paddingRight: 16,
      borderRadius: 14,
      backgroundColor: theme.accentGlow,
      borderWidth: 1,
      borderColor: `${theme.accent}30`,
    },
    tipIcon: {
      fontSize: 18,
      marginRight: 12,
      marginTop: 2,
    },
    tipContent: {
      flex: 1,
    },
    tipTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.accent,
      marginBottom: 3,
    },
    tipText: {
      fontSize: 12,
      color: theme.textSecondary,
      lineHeight: 18,
    },
  });