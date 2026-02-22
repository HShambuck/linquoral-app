// src/components/DraftCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/UserContext';
import { getDisplayText } from '../models/Draft';
import { formatRelativeTime, formatScheduledTime, truncateText } from '../utils/validators';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: null },
  scheduled: { label: 'Scheduled', color: 'accent' },
  published: { label: 'Published', color: 'success' },
  failed: { label: 'Failed', color: 'danger' },
};

const DraftCard = ({ draft, onPress, onLongPress, showPreview = true }) => {
  const { theme, isDarkMode } = useTheme();
  const styles = createStyles(theme, isDarkMode);

  const displayText = getDisplayText(draft);
  const preview = truncateText(displayText, 110);
  const status = STATUS_CONFIG[draft.status] || STATUS_CONFIG.draft;
  const statusColor = status.color ? theme[status.color] : theme.primary;

  const getTimingText = () => {
    if (draft.status === 'scheduled' && draft.scheduledAt) {
      return formatScheduledTime(new Date(draft.scheduledAt));
    }
    if (draft.status === 'published' && draft.publishedAt) {
      return formatRelativeTime(new Date(draft.publishedAt));
    }
    return formatRelativeTime(new Date(draft.updatedAt));
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.card}
      activeOpacity={0.72}
      delayLongPress={500}
    >
      {/* Status stripe */}
      <View style={[styles.stripe, { backgroundColor: statusColor }]} />

      <View style={styles.body}>
        {/* Top row */}
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>
            {draft.title || 'Untitled Draft'}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18`, borderColor: `${statusColor}30` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{status.label}</Text>
          </View>
        </View>

        {/* Preview */}
        {showPreview && preview ? (
          <Text style={styles.preview} numberOfLines={2}>{preview}</Text>
        ) : null}

        {/* Bottom row */}
        <View style={styles.bottomRow}>
          <View style={styles.tonePill}>
            <Text style={styles.toneText}>{draft.tone}</Text>
          </View>
          <Text style={styles.timing}>{getTimingText()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const DraftCardCompact = ({ draft, onPress }) => {
  const { theme, isDarkMode } = useTheme();
  const styles = createStyles(theme, isDarkMode);
  const displayText = getDisplayText(draft);

  return (
    <TouchableOpacity onPress={onPress} style={styles.compactCard} activeOpacity={0.7}>
      <View style={styles.compactContent}>
        <Text style={styles.compactTitle} numberOfLines={1}>{draft.title || 'Untitled Draft'}</Text>
        <Text style={styles.compactPreview} numberOfLines={1}>{truncateText(displayText, 60)}</Text>
      </View>
      <Text style={styles.compactArrow}>›</Text>
    </TouchableOpacity>
  );
};

const createStyles = (theme, isDarkMode) => StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  stripe: {
    width: 3,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  body: {
    flex: 1,
    padding: 14,
    paddingLeft: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    flex: 1,
    paddingRight: 10,
    letterSpacing: -0.2,
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  preview: {
    fontSize: 12,
    color: theme.textMuted,
    lineHeight: 18,
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tonePill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: isDarkMode ? theme.surfaceHigh : theme.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.border,
  },
  toneText: { fontSize: 10, color: theme.textSecondary, fontWeight: '500' },
  timing: { fontSize: 11, color: theme.textMuted },

  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: theme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  compactContent: { flex: 1 },
  compactTitle: { fontSize: 13, fontWeight: '600', color: theme.text, marginBottom: 2 },
  compactPreview: { fontSize: 11, color: theme.textMuted },
  compactArrow: { fontSize: 20, color: theme.textMuted, marginLeft: 8 },
});

export default DraftCard;