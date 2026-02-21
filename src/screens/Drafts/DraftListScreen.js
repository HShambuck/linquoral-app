// src/screens/Drafts/DraftListScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/UserContext';
import { useDrafts } from '../../context/DraftContext';
import DraftCard from '../../components/DraftCard';
import { SCREENS } from '../../utils/constants';

/**
 * Filter options
 */
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Drafts' },
  { key: 'scheduled', label: 'Scheduled' },
];

/**
 * DraftListScreen
 * 
 * Displays all user drafts with filtering capability.
 * Users can view, edit, or delete their drafts.
 */
const DraftListScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const {
    drafts,
    filteredDrafts,
    filter,
    setFilter,
    fetchDrafts,
    deleteDraft,
    setCurrentDraft,
    isLoading,
  } = useDrafts();

  const [refreshing, setRefreshing] = useState(false);

  const styles = createStyles(theme);

  /**
   * Fetch drafts on mount
   */
  useEffect(() => {
    fetchDrafts();
  }, []);

  /**
   * Handle pull-to-refresh
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDrafts();
    setRefreshing(false);
  }, [fetchDrafts]);

  /**
   * Handle draft press - navigate to editor
   */
  const handleDraftPress = (draft) => {
    setCurrentDraft(draft);
    navigation.navigate(SCREENS.EDITOR, { draftId: draft.id });
  };

  /**
   * Handle draft long press - show delete option
   */
  const handleDraftLongPress = (draft) => {
    Alert.alert(
      'Draft Options',
      `"${draft.title || 'Untitled Draft'}"`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => confirmDelete(draft),
        },
      ]
    );
  };

  /**
   * Confirm delete action
   */
  const confirmDelete = (draft) => {
    Alert.alert(
      'Delete Draft?',
      'This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteDraft(draft.id);
            if (!result.success) {
              Alert.alert('Error', 'Failed to delete draft.');
            }
          },
        },
      ]
    );
  };

  /**
   * Handle filter change
   */
  const handleFilterChange = (filterKey) => {
    setFilter(filterKey);
  };

  /**
   * Render draft item
   */
  const renderDraftItem = ({ item }) => (
    <DraftCard
      draft={item}
      onPress={() => handleDraftPress(item)}
      onLongPress={() => handleDraftLongPress(item)}
    />
  );

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📝</Text>
      <Text style={styles.emptyTitle}>No drafts yet</Text>
      <Text style={styles.emptySubtitle}>
        {filter === 'all'
          ? 'Start by recording your first voice post'
          : filter === 'draft'
          ? 'No drafts in progress'
          : 'No scheduled posts'}
      </Text>
      {filter === 'all' && (
        <TouchableOpacity
          onPress={() => navigation.navigate(SCREENS.RECORD)}
          style={styles.emptyButton}
          activeOpacity={0.8}
        >
          <Text style={styles.emptyButtonText}>Create Voice Post</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  /**
   * Get counts for filter badges
   */
  const getCounts = () => {
    const draftCount = drafts.filter((d) => d.status === 'draft').length;
    const scheduledCount = drafts.filter((d) => d.status === 'scheduled').length;
    return {
      all: drafts.length,
      draft: draftCount,
      scheduled: scheduledCount,
    };
  };

  const counts = getCounts();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <Text style={styles.title}>Your Drafts</Text>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => handleFilterChange(f.key)}
              style={[
                styles.filterTab,
                filter === f.key && styles.filterTabActive,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filter === f.key && styles.filterTabTextActive,
                ]}
              >
                {f.label}
                {counts[f.key] > 0 && (
                  <Text style={styles.filterCount}> ({counts[f.key]})</Text>
                )}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Draft List */}
        <FlatList
          data={filteredDrafts}
          renderItem={renderDraftItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            filteredDrafts.length === 0 && styles.listContentEmpty,
          ]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.bg,
    },
    container: {
      flex: 1,
      padding: 20,
      paddingBottom: 0,
    },

    // Header
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 20,
    },

    // Filter Tabs
    filterContainer: {
      flexDirection: 'row',
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 4,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 20,
    },
    filterTab: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 9,
      alignItems: 'center',
    },
    filterTabActive: {
      backgroundColor: theme.primary,
    },
    filterTabText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.textMuted,
    },
    filterTabTextActive: {
      color: '#fff',
    },
    filterCount: {
      fontWeight: '400',
    },

    // List
    listContent: {
      paddingBottom: 20,
    },
    listContentEmpty: {
      flex: 1,
    },
    separator: {
      height: 12,
    },

    // Empty State
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.textMuted,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 24,
    },
    emptyButton: {
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 14,
      backgroundColor: theme.primary,
    },
    emptyButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#fff',
    },
  });

export default DraftListScreen;