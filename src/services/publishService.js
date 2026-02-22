// src/services/publishService.js

import api from './api';

/**
 * Publish service
 * Handles media upload and publish actions on the frontend
 */
const publishService = {
  /**
   * Upload a media file (image or video) to the backend.
   * The backend registers the asset with LinkedIn and returns the assetUrn.
   *
   * @param {string} uri       - Local file URI from expo-image-picker
   * @param {'image'|'video'} type
   * @param {string} mimeType  - e.g. 'image/jpeg', 'video/mp4'
   * @returns {Promise<{ assetUrn, mediaType, fileName, fileSize, localPath }>}
   */
  uploadMedia: async (uri, type, mimeType) => {
    const formData = new FormData();

    formData.append('media', {
      uri,
      type: mimeType,
      name: type === 'video' ? `video_${Date.now()}.mp4` : `image_${Date.now()}.jpg`,
    });

    const response = await api.post('/publish/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000, // 2 min for large video files
    });

    return {
      assetUrn: response.assetUrn,
      mediaType: response.mediaType,
      fileName: response.fileName,
      fileSize: response.fileSize,
      localPath: response.localPath,
    };
  },

  /**
   * Publish a draft immediately
   * @param {string} draftId
   * @returns {Promise<{ linkedInPostId, linkedInPostUrl, publishedAt }>}
   */
  publishNow: async (draftId) => {
    const response = await api.post(`/publish/${draftId}/now`);
    return {
      linkedInPostId: response.linkedInPostId,
      linkedInPostUrl: response.linkedInPostUrl,
      publishedAt: response.publishedAt,
    };
  },

  /**
   * Schedule a draft for a future time
   * @param {string} draftId
   * @param {Date} scheduledAt
   * @returns {Promise<{ scheduledAt, jobId }>}
   */
  schedulePost: async (draftId, scheduledAt) => {
    const response = await api.post(`/publish/${draftId}/schedule`, {
      scheduledAt: scheduledAt.toISOString(),
    });
    return { scheduledAt: response.scheduledAt, jobId: response.jobId };
  },

  /**
   * Cancel a scheduled post
   * @param {string} draftId
   */
  cancelSchedule: async (draftId) => {
    await api.post(`/publish/${draftId}/cancel`);
  },

  /**
   * Get LinkedIn connection status
   * @returns {Promise<{ connected, devTokenActive, profile }>}
   */
  getLinkedInStatus: async () => {
    const response = await api.get('/publish/linkedin/status');
    return {
      connected: response.connected,
      devTokenActive: response.devTokenActive || false,
      profile: response.profile,
    };
  },

  /**
   * Get LinkedIn OAuth URL to redirect user to
   * @returns {Promise<string>} authUrl
   */
  getLinkedInAuthUrl: async () => {
    const response = await api.get('/publish/linkedin/auth-url');
    return response.authUrl;
  },

  /**
   * Disconnect LinkedIn account
   */
  disconnectLinkedIn: async () => {
    await api.post('/publish/linkedin/disconnect');
  },

  /**
   * Get optimal posting times
   * @returns {Promise<{ times, bestDays }>}
   */
  getOptimalTimes: async () => {
    const response = await api.get('/publish/optimal-times');
    return { times: response.times, bestDays: response.bestDays };
  },
};

export default publishService;