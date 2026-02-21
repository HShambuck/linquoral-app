import api, { apiHelpers } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import { createUser, generateInitials } from '../models/User';

/**
 * Authentication service for Linquoral
 * Handles user authentication with minimal PII
 */
const authService = {
  /**
   * Register a new user (minimal registration)
   * @param {Object} params
   * @param {string} params.displayName - User's display name
   * @param {string} params.preferredTone - Default tone preference
   * @returns {Promise<Object>} { user, token }
   */
  register: async ({ displayName, preferredTone = 'Professional' }) => {
    const response = await api.post('/auth/register', {
      displayName,
      preferredTone,
    });

    const { user, token } = response;

    // Store token
    await apiHelpers.setAuthToken(token);

    // Store user data locally
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    return {
      user: createUser({
        id: user.id,
        displayName: user.displayName,
        preferredTone: user.preferredTone,
        isDarkMode: true,
        stats: user.stats,
      }),
      token,
    };
  },

  /**
   * Login with device/anonymous auth
   * For MVP, we use device-based authentication
   * @returns {Promise<Object>} { user, token }
   */
  loginAnonymous: async () => {
    const response = await api.post('/auth/anonymous');

    const { user, token } = response;

    // Store token
    await apiHelpers.setAuthToken(token);

    // Store user data locally
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    return {
      user: createUser({
        id: user.id,
        displayName: user.displayName || 'User',
        preferredTone: user.preferredTone || 'Professional',
        isDarkMode: true,
        stats: user.stats,
      }),
      token,
    };
  },

  /**
   * Restore session from stored token
   * @returns {Promise<Object|null>} user or null if no session
   */
  restoreSession: async () => {
    try {
      const token = await apiHelpers.getAuthToken();
      
      if (!token) {
        return null;
      }

      // Validate token with server
      const response = await api.get('/auth/me');

      const { user } = response;

      // Update local storage
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      return createUser({
        id: user.id,
        displayName: user.displayName,
        preferredTone: user.preferredTone,
        isDarkMode: user.isDarkMode ?? true,
        stats: user.stats,
      });
    } catch (error) {
      // Clear invalid session
      await authService.logout();
      return null;
    }
  },

  /**
   * Update user profile
   * @param {Object} updates
   * @returns {Promise<Object>} Updated user
   */
  updateProfile: async (updates) => {
    const response = await api.patch('/auth/profile', updates);

    const { user } = response;

    // Update local storage
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    return createUser({
      id: user.id,
      displayName: user.displayName,
      preferredTone: user.preferredTone,
      isDarkMode: user.isDarkMode,
      stats: user.stats,
    });
  },

  /**
   * Logout and clear session
   */
  logout: async () => {
    try {
      // Notify server (optional, for token invalidation)
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with local cleanup even if server call fails
      console.warn('Logout API call failed:', error);
    }

    // Clear local data
    await apiHelpers.clearAuthToken();
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
  },

  /**
   * Check if onboarding is complete
   * @returns {Promise<boolean>}
   */
  isOnboardingComplete: async () => {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
    return value === 'true';
  },

  /**
   * Mark onboarding as complete
   */
  completeOnboarding: async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
  },

  /**
   * Get locally stored user (for offline access)
   * @returns {Promise<Object|null>}
   */
  getStoredUser: async () => {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      if (userData) {
        const parsed = JSON.parse(userData);
        return createUser(parsed);
      }
      return null;
    } catch (error) {
      console.warn('Error reading stored user:', error);
      return null;
    }
  },
};

export default authService;