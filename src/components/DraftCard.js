// src/components/DraftCard.js

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../context/UserContext';
import { getDisplayText } from '../models/Draft';
import { formatRelativeTime, formatScheduledTime, truncateText } from '../utils/validators';

/**
 * DraftCard Component
 * 
 * Displays a draft preview in the drafts list.
 * Shows title, preview text, tone, status, and timing info.
 * 
 * @param {Object} props
 * @param {Object} props.draft - Draft object
 * @param {function} props.onPress - Callback when card is pressed
 * @param {function} props.onLongPress - Callback for long press (optional, for delete menu)
 * @param {boolean} props.showPreview - Show content preview (default: true)
 */
const DraftCard = ({
  draft,
  onPress,
  onLongPress,
  showPreview = true,
}) => {
  const { theme, isDarkMode } = useTheme();
  const styles = createStyles(theme, isDarkMode);

  const displayText = getDisplayText(draft);
  const preview = truncateText(displayText, 100);

  const isScheduled = draft.status === 'scheduled';
  const isPublished = draft.status === 'published';

  /**
   * Get status badge style and text
   */
  const getStatusBadge = () => {
    if (isScheduled) {
      return {
        text: 'scheduled',
        style: styles.badgeScheduled,
        textStyle: styles.badgeTextScheduled,
      };
    }
    if (isPublished) {
      return {
        text: 'published',
        style: styles.badgePublished,
        textStyle: styles.badgeTextPublished,
      };
    }
    return {
      text: 'draft',
      style: styles.badgeDraft,
      textStyle: styles.badgeTextDraft,
    };
  };

  const statusBadge = getStatusBadge();

  /**
   * Get timing display
   */
  const getTimingText = () => {
    if (isScheduled && draft.scheduledAt) {
      return `📅 ${formatScheduledTime(new Date(draft.scheduledAt))}`;
    }
    if (isPublished && draft.publishedAt) {
      return `✓ ${formatRelativeTime(new Date(draft.publishedAt))}`;
    }
    return `✎ ${formatRelativeTime(new Date(draft.updatedAt))}`;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.container}
      activeOpacity={0.7}
      delayLongPress={500}
    >
      {/* Header: Title + Status Badge */}
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {draft.title || 'Untitled Draft'}
        </Text>
        <View style={[styles.badge, statusBadge.style]}>
          <Text style={[styles.badgeText, statusBadge.textStyle]}>
            {statusBadge.text}
          </Text>
        </View>
      </View>

      {/* Preview Text */}
      {showPreview && (
        <Text style={styles.preview} numberOfLines={2}>
          {preview}
        </Text>
      )}

      {/* Footer: Tone + Timing */}
      <View style={styles.footer}>
        <View style={styles.toneBadge}>
          <Text style={styles.toneText}>{draft.tone}</Text>
        </View>
        <Text style={styles.timing}>{getTimingText()}</Text>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Compact variant for smaller lists
 */
export const DraftCardCompact = ({
  draft,
  onPress,
}) => {
  const { theme } = useTheme();
  const styles = createCompactStyles(theme);

  const displayText = getDisplayText(draft);
  const preview = truncateText(displayText, 60);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {draft.title || 'Untitled Draft'}
        </Text>
        <Text style={styles.preview} numberOfLines={1}>
          {preview}
        </Text>
      </View>
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  );
};

const createStyles = (theme, isDarkMode) =>
  StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: theme.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },

    // Header
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    title: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      flex: 1,
      paddingRight: 8,
    },

    // Status badges
    badge: {
      paddingVertical: 3,
      paddingHorizontal: 9,
      borderRadius: 20,
      borderWidth: 1,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'lowercase',
    },
    badgeDraft: {
      backgroundColor: theme.primaryGlow,
      borderColor: `${theme.primary}30`,
    },
    badgeTextDraft: {
      color: theme.primary,
    },
    badgeScheduled: {
      backgroundColor: theme.accentGlow,
      borderColor: `${theme.accent}30`,
    },
    badgeTextScheduled: {
      color: theme.accent,
    },
    badgePublished: {
      backgroundColor: `${theme.success}15`,
      borderColor: `${theme.success}30`,
    },
    badgeTextPublished: {
      color: theme.success,
    },

    // Preview
    preview: {
      fontSize: 12,
      color: theme.textMuted,
      lineHeight: 18,
      marginBottom: 10,
    },

    // Footer
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    toneBadge: {
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: 8,
      backgroundColor: isDarkMode ? '#1E2736' : '#EFF3FA',
    },
    toneText: {
      fontSize: 11,
      color: theme.textMuted,
    },
    timing: {
      fontSize: 11,
      color: theme.textMuted,
    },
  });

const createCompactStyles = (theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      backgroundColor: theme.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 2,
    },
    preview: {
      fontSize: 11,
      color: theme.textMuted,
    },
    arrow: {
      fontSize: 16,
      color: theme.textMuted,
      marginLeft: 8,
    },
  });

export default DraftCard;