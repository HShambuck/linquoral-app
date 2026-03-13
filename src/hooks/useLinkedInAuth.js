// src/hooks/useLinkedInAuth.js
import { useState, useCallback } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import api from '../services/api';

export const useLinkedInAuth = () => {
  const { refresh, refreshUser, dispatch } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const connectLinkedIn = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Get the auth URL from backend
      const { data } = await api.get('/publish/linkedin/auth-url');
      const authUrl = data.authUrl;

      // Open browser — blocks until user completes or dismisses
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        'linqoral://linkedin-connected'
      );

      if (result.type === 'success' && result.url) {
        const url = new URL(result.url);
        const success = url.searchParams.get('success') === 'true';
        const recovered = url.searchParams.get('recovered') === 'true';
        const recoveryToken = url.searchParams.get('token');

        if (success && recovered && recoveryToken) {
          // Account recovery — swap to the recovered account's token
          await authService.storeToken(recoveryToken);
          const session = await authService.restoreSession();

          if (session?.user) {
            dispatch({ type: 'UPDATE_USER', payload: { user: session.user } });
          }

          return { success: true, recovered: true };
        }

        if (success) {
          // Normal LinkedIn connect — just refresh user data
          await refreshUser();
          return { success: true, recovered: false };
        }

        const errorMsg = url.searchParams.get('error') || 'LinkedIn connection failed';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      // User cancelled
      return { success: false, cancelled: true };
    } catch (err) {
      const message = err.message || 'Failed to connect LinkedIn';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsConnecting(false);
    }
  }, [refresh, refreshUser, dispatch]);

  const disconnect = useCallback(async () => {
    try {
      await api.post('/publish/linkedin/disconnect');
      await refreshUser();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [refreshUser]);

  return {
    connectLinkedIn,
    disconnect,
    isConnecting,
    error,
    clearError: () => setError(null),
  };
};