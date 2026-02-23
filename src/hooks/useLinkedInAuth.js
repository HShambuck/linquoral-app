// src/hooks/useLinkedInAuth.js

import { useState, useEffect, useCallback } from 'react';
import { Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import publishService from '../services/publishService';

/**
 * useLinkedInAuth
 *
 * Manages the full LinkedIn OAuth flow:
 * 1. Fetches auth URL from backend
 * 2. Opens LinkedIn consent screen in an in-app browser
 * 3. Listens for the deep link redirect (linquoral://linkedin-connected)
 * 4. Parses success/error from the URL params
 * 5. Refreshes connection status
 *
 * Usage:
 *   const { status, connect, disconnect, refresh, isLoading, error } = useLinkedInAuth();
 */
const useLinkedInAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState({
    connected: false,
    devTokenActive: false,
    profile: null,
  });

  /**
   * Refresh LinkedIn connection status from backend
   */
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await publishService.getLinkedInStatus();
      setStatus(result);
      setError(null);
    } catch (err) {
      setError('Failed to load LinkedIn status');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Load status on mount
  useEffect(() => {
    refresh();
  }, []);

  /**
   * Handle the deep link that LinkedIn redirects to after OAuth.
   * URL format: linquoral://linkedin-connected?success=true&firstName=X&lastName=Y
   *          or linquoral://linkedin-connected?success=false&error=MESSAGE
   */
  const handleDeepLink = useCallback(async (event) => {
    const url = event.url || event;
    if (!url || !url.includes('linkedin-connected')) return;

    // Close the in-app browser (if still open)
    await WebBrowser.dismissBrowser();

    // Parse query params
    const queryString = url.split('?')[1] || '';
    const params = {};
    queryString.split('&').forEach((pair) => {
      const [key, value] = pair.split('=');
      if (key) params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });

    if (params.success === 'true') {
      // Refresh status from backend to get full profile
      await refresh();
      setError(null);
    } else {
      const errorMsg = params.error || 'LinkedIn connection failed';
      setError(friendlyError(errorMsg));
      setIsLoading(false);
    }

    setIsLoading(false);
  }, [refresh]);

  // Register deep link listener
  useEffect(() => {
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Handle case where app was opened from a cold start via deep link
    Linking.getInitialURL().then((url) => {
      if (url && url.includes('linkedin-connected')) {
        handleDeepLink({ url });
      }
    });

    return () => subscription.remove();
  }, [handleDeepLink]);

  /**
   * Start the LinkedIn OAuth flow
   */
  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const authUrl = await publishService.getLinkedInAuthUrl();

      // Open LinkedIn consent screen in an in-app browser
      // The browser will be dismissed automatically when the deep link fires
      await WebBrowser.openBrowserAsync(authUrl, {
        showTitle: false,
        toolbarColor: '#0A66C2', // LinkedIn blue
        secondaryToolbarColor: '#ffffff',
        enableBarCollapsing: true,
      });

      // If we reach here without the deep link firing (user closed browser manually)
      setIsLoading(false);
    } catch (err) {
      setError('Failed to open LinkedIn login. Please try again.');
      setIsLoading(false);
    }
  }, []);

  /**
   * Disconnect LinkedIn account
   */
  const disconnect = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await publishService.disconnectLinkedIn();
      setStatus({ connected: false, devTokenActive: false, profile: null });
    } catch (err) {
      setError('Failed to disconnect LinkedIn. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    status,
    isLoading,
    isRefreshing,
    error,
    connect,
    disconnect,
    refresh,
  };
};

/**
 * Convert raw LinkedIn/backend error codes into user-friendly messages
 */
const friendlyError = (error) => {
  const map = {
    access_denied: 'You declined LinkedIn access. Tap Connect to try again.',
    missing_params: 'Something went wrong with the LinkedIn redirect. Please try again.',
    invalid_state: 'Security check failed. Please try again.',
    user_not_found: 'Account not found. Please log out and back in.',
  };
  return map[error] || 'LinkedIn connection failed. Please try again.';
};

export default useLinkedInAuth;