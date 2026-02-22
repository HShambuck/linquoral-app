// src/services/draftService.js

import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import { createDraft, getDisplayText, generateTitleFromContent } from '../models/Draft';

/**
 * Draft management service
 * Handles CRUD operations for voice post drafts
 */
const draftService = {
  /**
   * Fetch all drafts for current user
   * @param {Object} options
   * @param {string} options.status - Filter by status ('draft', 'scheduled', 'published')
   * @param {number} options.limit - Max number of drafts
   * @param {number} options.offset - Pagination offset
   * @returns {Promise<Array>} List of drafts
   */
  getDrafts: async ({ status = null, limit = 50, offset = 0 } = {}) => {
    const params = { limit, offset };
    if (status) {
      params.status = status;
    }

    const response = await api.get('/drafts', { params });

    const drafts = response.drafts.map((draft) =>
      createDraft({
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
        mediaAttachments: draft.mediaAttachments || [],
      })
    );

    // Cache drafts locally
    await draftService.cacheDrafts(drafts);

    return drafts;
  },

  /**
   * Get a single draft by ID
   * @param {string} draftId
   * @returns {Promise<Object>} Draft object
   */
  getDraft: async (draftId) => {
    const response = await api.get(`/drafts/${draftId}`);

    return createDraft({
      id: response.draft._id || response.draft.id,
      userId: response.draft.userId,
      rawTranscript: response.draft.rawTranscript,
      aiRefinedText: response.draft.aiRefinedText,
      userEditedText: response.draft.userEditedText,
      title: response.draft.title,
      tone: response.draft.tone,
      status: response.draft.status,
      scheduledAt: response.draft.scheduledAt ? new Date(response.draft.scheduledAt) : null,
      publishedAt: response.draft.publishedAt ? new Date(response.draft.publishedAt) : null,
      audioUri: response.draft.audioUri,
      audioDurationMs: response.draft.audioDurationMs,
      mediaAttachments: response.draft.mediaAttachments || [],
    });
  },

  /**
   * Create a new draft from voice transcript
   * @param {Object} params
   * @param {string} params.rawTranscript - Original transcription
   * @param {string} params.aiRefinedText - AI-refined content
   * @param {string} params.tone - Selected tone
   * @param {string} params.audioUri - Path to audio file (optional)
   * @param {number} params.audioDurationMs - Audio duration (optional)
   * @returns {Promise<Object>} Created draft
   */
  createDraft: async ({
    rawTranscript,
    aiRefinedText,
    tone = 'Professional',
    audioUri = null,
    audioDurationMs = 0,
    mediaAttachments = []
  }) => {
    // Generate title from content
    const title = generateTitleFromContent(aiRefinedText || rawTranscript);

    const response = await api.post('/drafts', {
      rawTranscript,
      aiRefinedText,
      userEditedText: aiRefinedText, // Initially same as AI text
      title,
      tone,
      status: 'draft',
      audioUri,
      audioDurationMs,
      mediaAttachments
    });

    return createDraft({
      id: response.draft._id || response.draft.id,
      userId: response.draft.userId,
      rawTranscript: response.draft.rawTranscript,
      aiRefinedText: response.draft.aiRefinedText,
      userEditedText: response.draft.userEditedText,
      title: response.draft.title,
      tone: response.draft.tone,
      status: response.draft.status,
      scheduledAt: null,
      publishedAt: null,
      audioUri: response.draft.audioUri,
      audioDurationMs: response.draft.audioDurationMs,
      mediaAttachments: response.draft.mediaAttachments || [],
    });
  },

  /**
   * Update an existing draft
   * @param {string} draftId
   * @param {Object} updates
   * @returns {Promise<Object>} Updated draft
   */
  updateDraft: async (draftId, updates) => {
    const response = await api.patch(`/drafts/${draftId}`, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return createDraft({
      id: response.draft._id || response.draft.id,
      userId: response.draft.userId,
      rawTranscript: response.draft.rawTranscript,
      aiRefinedText: response.draft.aiRefinedText,
      userEditedText: response.draft.userEditedText,
      title: response.draft.title,
      tone: response.draft.tone,
      status: response.draft.status,
      scheduledAt: response.draft.scheduledAt ? new Date(response.draft.scheduledAt) : null,
      publishedAt: response.draft.publishedAt ? new Date(response.draft.publishedAt) : null,
      audioUri: response.draft.audioUri,
      audioDurationMs: response.draft.audioDurationMs,
      mediaAttachments: response.draft.mediaAttachments || [],
    });
  },

  /**
   * Delete a draft
   * @param {string} draftId
   * @returns {Promise<void>}
   */
  deleteDraft: async (draftId) => {
    await api.delete(`/drafts/${draftId}`);
  },

  /**
   * Schedule a draft for future posting
   * @param {string} draftId
   * @param {Date} scheduledAt
   * @returns {Promise<Object>} Updated draft
   */
  scheduleDraft: async (draftId, scheduledAt) => {
    const response = await api.post(`/drafts/${draftId}/schedule`, {
      scheduledAt: scheduledAt.toISOString(),
    });

    return createDraft({
      id: response.draft._id || response.draft.id,
      userId: response.draft.userId,
      rawTranscript: response.draft.rawTranscript,
      aiRefinedText: response.draft.aiRefinedText,
      userEditedText: response.draft.userEditedText,
      title: response.draft.title,
      tone: response.draft.tone,
      status: 'scheduled',
      scheduledAt: new Date(response.draft.scheduledAt),
      publishedAt: null,
      audioUri: response.draft.audioUri,
      audioDurationMs: response.draft.audioDurationMs,
    });
  },

  /**
   * Cancel a scheduled draft (revert to draft status)
   * @param {string} draftId
   * @returns {Promise<Object>} Updated draft
   */
  unscheduleDraft: async (draftId) => {
    const response = await api.post(`/drafts/${draftId}/unschedule`);

    return createDraft({
      id: response.draft._id || response.draft.id,
      userId: response.draft.userId,
      rawTranscript: response.draft.rawTranscript,
      aiRefinedText: response.draft.aiRefinedText,
      userEditedText: response.draft.userEditedText,
      title: response.draft.title,
      tone: response.draft.tone,
      status: 'draft',
      scheduledAt: null,
      publishedAt: null,
      audioUri: response.draft.audioUri,
      audioDurationMs: response.draft.audioDurationMs,
    });
  },

  /**
   * Cache drafts locally for offline access
   * @param {Array} drafts
   */
  cacheDrafts: async (drafts) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.DRAFTS_CACHE,
        JSON.stringify(drafts)
      );
    } catch (error) {
      console.warn('Error caching drafts:', error);
    }
  },

  /**
   * Get cached drafts (for offline access)
   * @returns {Promise<Array>}
   */
  getCachedDrafts: async () => {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.DRAFTS_CACHE);
      if (cached) {
        return JSON.parse(cached);
      }
      return [];
    } catch (error) {
      console.warn('Error reading cached drafts:', error);
      return [];
    }
  },

  /**
   * Get draft statistics for current user
   * @returns {Promise<Object>} { totalDrafts, scheduledPosts, publishedPosts }
   */
  getStats: async () => {
    const response = await api.get('/drafts/stats');
    return {
      totalDrafts: response.stats.totalDrafts || 0,
      scheduledPosts: response.stats.scheduledPosts || 0,
      publishedPosts: response.stats.publishedPosts || 0,
    };
  },

  /**
   * Get the most recent draft (for "Continue last draft" feature)
   * @returns {Promise<Object|null>}
   */
  getRecentDraft: async () => {
    try {
      const response = await api.get('/drafts', {
        params: { limit: 1, status: 'draft' },
      });

      if (response.drafts && response.drafts.length > 0) {
        const draft = response.drafts[0];
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
          mediaAttachments: response.draft.mediaAttachments || [],
        });
      }
      return null;
    } catch (error) {
      console.warn('Error fetching recent draft:', error);
      return null;
    }
  },
};

export default draftService;