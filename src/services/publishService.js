import api from './api';
import * as Clipboard from 'expo-clipboard';
import { Share, Linking, Platform } from 'react-native';

/**
 * Publishing service for Linquoral
 * Handles posting to LinkedIn and scheduling
 * 
 * Design Principle: No silent auto-posting. 
 * User chooses when and how to publish.
 */
const publishService = {
  /**
   * Publish a draft immediately to LinkedIn
   * @param {string} draftId - ID of the draft to publish
   * @returns {Promise<Object>} { success, linkedInPostId, publishedAt }
   */
  publishNow: async (draftId) => {
    const response = await api.post(`/publish/${draftId}/now`);

    return {
      success: true,
      linkedInPostId: response.linkedInPostId,
      publishedAt: new Date(response.publishedAt),
    };
  },

  /**
   * Schedule a draft for future posting
   * @param {string} draftId - ID of the draft
   * @param {Date} scheduledAt - When to publish
   * @returns {Promise<Object>} { success, scheduledAt, jobId }
   */
  schedule: async (draftId, scheduledAt) => {
    const response = await api.post(`/publish/${draftId}/schedule`, {
      scheduledAt: scheduledAt.toISOString(),
    });

    return {
      success: true,
      scheduledAt: new Date(response.scheduledAt),
      jobId: response.jobId,
    };
  },

  /**
   * Cancel a scheduled post
   * @param {string} draftId - ID of the draft
   * @returns {Promise<Object>} { success }
   */
  cancelScheduled: async (draftId) => {
    const response = await api.post(`/publish/${draftId}/cancel`);

    return {
      success: true,
    };
  },

  /**
   * Reschedule an already scheduled post
   * @param {string} draftId - ID of the draft
   * @param {Date} newScheduledAt - New scheduled time
   * @returns {Promise<Object>} { success, scheduledAt }
   */
  reschedule: async (draftId, newScheduledAt) => {
    // Cancel existing schedule and create new one
    await publishService.cancelScheduled(draftId);
    return await publishService.schedule(draftId, newScheduledAt);
  },

  /**
   * Copy post text to clipboard for manual pasting
   * @param {string} text - Post content
   * @returns {Promise<boolean>}
   */
  copyToClipboard: async (text) => {
    try {
      await Clipboard.setStringAsync(text);
      return true;
    } catch (error) {
      console.warn('Error copying to clipboard:', error);
      return false;
    }
  },

  /**
   * Open LinkedIn app or website for manual posting
   * @param {string} text - Pre-filled post content (optional)
   * @returns {Promise<boolean>}
   */
  openLinkedIn: async (text = '') => {
    try {
      // LinkedIn share URL
      const linkedInUrl = 'https://www.linkedin.com/feed/';
      
      // Try to open LinkedIn app first
      const linkedInAppUrl = Platform.select({
        ios: 'linkedin://feed',
        android: 'linkedin://feed',
      });

      const canOpenApp = await Linking.canOpenURL(linkedInAppUrl);
      
      if (canOpenApp) {
        await Linking.openURL(linkedInAppUrl);
      } else {
        // Fallback to web
        await Linking.openURL(linkedInUrl);
      }
      
      return true;
    } catch (error) {
      console.warn('Error opening LinkedIn:', error);
      return false;
    }
  },

  /**
   * Share post content using native share sheet
   * @param {string} text - Post content
   * @param {string} title - Share dialog title
   * @returns {Promise<Object>} { success, action }
   */
  sharePost: async (text, title = 'Share your LinkedIn post') => {
    try {
      const result = await Share.share(
        {
          message: text,
          title: title,
        },
        {
          dialogTitle: title,
        }
      );

      return {
        success: true,
        action: result.action,
        activityType: result.activityType,
      };
    } catch (error) {
      console.warn('Error sharing:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Check LinkedIn connection status
   * @returns {Promise<Object>} { connected, profile }
   */
  checkLinkedInConnection: async () => {
    try {
      const response = await api.get('/publish/linkedin/status');
      return {
        connected: response.connected,
        profile: response.profile,
      };
    } catch (error) {
      return {
        connected: false,
        profile: null,
      };
    }
  },

  /**
   * Initiate LinkedIn OAuth connection
   * @returns {Promise<Object>} { authUrl }
   */
  connectLinkedIn: async () => {
    const response = await api.get('/publish/linkedin/auth-url');
    return {
      authUrl: response.authUrl,
    };
  },

  /**
   * Disconnect LinkedIn account
   * @returns {Promise<boolean>}
   */
  disconnectLinkedIn: async () => {
    try {
      await api.post('/publish/linkedin/disconnect');
      return true;
    } catch (error) {
      console.warn('Error disconnecting LinkedIn:', error);
      return false;
    }
  },

  /**
   * Get scheduled posts queue
   * @returns {Promise<Array>} List of scheduled posts
   */
  getScheduledQueue: async () => {
    const response = await api.get('/publish/scheduled');
    return response.scheduled || [];
  },

  /**
   * Get optimal posting times based on engagement data
   * @returns {Promise<Array>} Suggested time slots
   */
  getOptimalTimes: async () => {
    try {
      const response = await api.get('/publish/optimal-times');
      return response.times || [];
    } catch (error) {
      // Return default times if API fails
      return [
        { time: '09:00', label: 'Morning', engagement: 'high' },
        { time: '12:00', label: 'Midday', engagement: 'medium' },
        { time: '17:00', label: 'Evening', engagement: 'high' },
      ];
    }
  },
};

export default publishService;