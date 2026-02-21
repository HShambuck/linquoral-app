import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '../utils/constants';

/**
 * Axios instance configured for Linquoral API
 */
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - adds auth token to requests
 */
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Error reading auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - handles common errors
 */
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear stored token
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      
      // You could emit an event here to trigger logout in the app
      // For now, just reject
      return Promise.reject({
        code: 'UNAUTHORIZED',
        message: 'Session expired. Please log in again.',
      });
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        code: 'NETWORK_ERROR',
        message: 'Unable to connect. Please check your internet connection.',
      });
    }

    // Handle server errors
    if (error.response.status >= 500) {
      return Promise.reject({
        code: 'SERVER_ERROR',
        message: 'Something went wrong. Please try again later.',
      });
    }

    // Return API error message if available
    return Promise.reject({
      code: error.response.data?.code || 'ERROR',
      message: error.response.data?.message || 'An error occurred.',
      details: error.response.data?.details,
    });
  }
);

/**
 * API helper methods
 */
export const apiHelpers = {
  /**
   * Sets the auth token for subsequent requests
   * @param {string} token
   */
  setAuthToken: async (token) => {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  /**
   * Clears the auth token
   */
  clearAuthToken: async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  /**
   * Gets the current auth token
   * @returns {Promise<string|null>}
   */
  getAuthToken: async () => {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },
};

export default api;