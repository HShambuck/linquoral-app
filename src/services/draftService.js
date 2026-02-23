// src/services/draftService.js
//
// This is the complete fixed file.
// Key fix: getRecentDraft() and all createDraft() calls now safely handle
// mediaAttachments with `|| []` so they never throw when the field is missing.

import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import { createDraft, generateTitleFromContent } from '../models/Draft';

/**
 * Safe mapper — converts a raw API draft object to a frontend Draft model.
 * Centralising this prevents the "Cannot read property 'mediaAttachments' of undefined"
 * error that occurs when the API returns a shape we don't expect.
 */
const mapDraft = (draft) => {
  if (!draft) return null;
  return createDraft({
    id: draft._id || draft.id,
    userId: draft.userId,
    rawTranscript: draft.rawTranscript,
    aiRefinedText: draft.aiRefinedText,
    userEditedText: draft.userEditedText,
    title: draft.title,
    tone: draft.tone,
    status: draft.status,
    scheduledAt: draft.scheduledAt ? new Date(draft.scheduledAt) : null,
    publishedAt: draft.publishedAt ? new Date(draft.publishedAt) : null,
    audioUri: draft.audioUri,
    audioDurationMs: draft.audioDurationMs,
    mediaAttachments: draft.mediaAttachments || [],   // safe fallback
  });
};

const draftService = {
  /**
   * Fetch all drafts
   */
  getDrafts: async ({ status = null, limit = 50, offset = 0 } = {}) => {
    const params = { limit, offset };
    if (status) params.status = status;

    const response = await api.get('/drafts', { params });
    const drafts = (response.drafts || []).map(mapDraft).filter(Boolean);

    await draftService.cacheDrafts(drafts);
    return drafts;
  },

  /**
   * Get a single draft by ID
   */
  getDraft: async (draftId) => {
    const response = await api.get(`/drafts/${draftId}`);
    return mapDraft(response.draft);
  },

  /**
   * Create a new draft
   */
  createDraft: async ({
    rawTranscript,
    aiRefinedText,
    tone = 'Professional',
    audioUri = null,
    audioDurationMs = 0,
    mediaAttachments = [],
  }) => {
    const title = generateTitleFromContent(aiRefinedText || rawTranscript);

    const response = await api.post('/drafts', {
      rawTranscript,
      aiRefinedText,
      userEditedText: aiRefinedText,
      title,
      tone,
      status: 'draft',
      audioUri,
      audioDurationMs,
      mediaAttachments,
    });

    return mapDraft(response.draft);
  },

  /**
   * Update an existing draft
   */
  updateDraft: async (draftId, updates) => {
    const response = await api.patch(`/drafts/${draftId}`, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return mapDraft(response.draft);
  },

  /**
   * Delete a draft
   */
  deleteDraft: async (draftId) => {
    await api.delete(`/drafts/${draftId}`);
  },

  /**
   * Schedule a draft
   */
  scheduleDraft: async (draftId, scheduledAt) => {
    const response = await api.post(`/drafts/${draftId}/schedule`, {
      scheduledAt: scheduledAt.toISOString(),
    });
    return mapDraft(response.draft);
  },

  /**
   * Unschedule a draft
   */
  unscheduleDraft: async (draftId) => {
    const response = await api.post(`/drafts/${draftId}/unschedule`);
    return mapDraft(response.draft);
  },

  /**
   * Cache drafts locally
   */
  cacheDrafts: async (drafts) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DRAFTS_CACHE, JSON.stringify(drafts));
    } catch (error) {
      console.warn('Error caching drafts:', error);
    }
  },

  /**
   * Get cached drafts (offline fallback)
   */
  getCachedDrafts: async () => {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.DRAFTS_CACHE);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  },

  /**
   * Get draft statistics
   */
  getStats: async () => {
    const response = await api.get('/drafts/stats');
    return {
      totalDrafts: response.stats?.totalDrafts || 0,
      scheduledPosts: response.stats?.scheduledPosts || 0,
      publishedPosts: response.stats?.publishedPosts || 0,
    };
  },

  /**
   * Get the most recent draft.
   * Uses mapDraft() so missing fields like mediaAttachments never throw.
   */
  getRecentDraft: async () => {
    try {
      const response = await api.get('/drafts', {
        params: { limit: 1, status: 'draft' },
      });

      const drafts = response.drafts || [];
      if (drafts.length === 0) return null;

      return mapDraft(drafts[0]);
    } catch (error) {
      console.warn('Error fetching recent draft:', error);
      return null;
    }
  },
};

export default draftService;