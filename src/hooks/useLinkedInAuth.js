// src/hooks/useLinkedInAuth.js

import { useState, useEffect, useCallback } from 'react';
import { Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import publishService from '../services/publishService';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';

const useLinkedInAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState({
    connected: false,
    devTokenActive: false,
    profile: null,
  });

  // Access auth context so we can refresh the user after LinkedIn connects
  const { updateProfile } = useAuth();

  /**
   * Refresh LinkedIn connection status from backend.
   * Also re-fetches the full user so AuthContext stays in sync.
   */
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await publishService.getLinkedInStatus();
      setStatus(result);
      setError(null);

      // Keep AuthContext user in sync so publishing works immediately
      const freshUser = await authService.getMe();
      if (freshUser) {
        updateProfile({ linkedInConnected: freshUser.linkedInConnected });
      }
    } catch (err) {
      setError('Failed to load LinkedIn status');
    } finally {
      setIsRefreshing(false);
    }
  }, [updateProfile]);

  // Load status on mount
  useEffect(() => {
    refresh();
  }, []);

  /**
   * Handle the deep link after LinkedIn OAuth callback.
   * linqoral://linkedin-connected?success=true&firstName=X&lastName=Y
   * linqoral://linkedin-connected?success=false&error=MESSAGE
   */
  const handleDeepLink = useCallback(async (event) => {
    const url = event.url || event;
    if (!url || !url.includes('linkedin-connected')) return;

    await WebBrowser.dismissBrowser().catch(() => {});

    const queryString = url.split('?')[1] || '';
    const params = {};
    queryString.split('&').forEach((pair) => {
      const [key, value] = pair.split('=');
      if (key) params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });

    if (params.success === 'true') {
      await refresh();
      setError(null);
    } else {
      const errorMsg = params.error || 'LinkedIn connection failed';
      setError(friendlyError(errorMsg));
    }

    setIsLoading(false);
  }, [refresh]);

  // Register deep link listener
  useEffect(() => {
    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url && url.includes('linkedin-connected')) {
        handleDeepLink({ url });
      }
    });

    return () => subscription.remove();
  }, [handleDeepLink]);

  /**
   * Start LinkedIn OAuth flow
   */
  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const authUrl = await publishService.getLinkedInAuthUrl();
      await WebBrowser.openBrowserAsync(authUrl, {
        showTitle: false,
        toolbarColor: '#0A66C2',
        secondaryToolbarColor: '#ffffff',
        enableBarCollapsing: true,
      });
      // Browser closed by user without completing — reset loading
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
      // Sync AuthContext so publish screens know LinkedIn is gone
      updateProfile({ linkedInConnected: false });
    } catch (err) {
      setError('Failed to disconnect LinkedIn. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [updateProfile]);

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