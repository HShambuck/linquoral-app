// src/context/UserContext.js

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, darkTheme, lightTheme } from '../utils/constants';
import { useAuth } from './AuthContext';

/**
 * User preferences and settings state
 */
const initialState = {
  isDarkMode: true,
  theme: darkTheme,
  preferredTone: 'Professional',
  notificationsEnabled: true,
};

/**
 * Action types
 */
const USER_ACTIONS = {
  SET_THEME_MODE: 'SET_THEME_MODE',
  SET_PREFERRED_TONE: 'SET_PREFERRED_TONE',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  LOAD_PREFERENCES: 'LOAD_PREFERENCES',
};

/**
 * User reducer
 */
const userReducer = (state, action) => {
  switch (action.type) {
    case USER_ACTIONS.SET_THEME_MODE:
      return {
        ...state,
        isDarkMode: action.payload,
        theme: action.payload ? darkTheme : lightTheme,
      };

    case USER_ACTIONS.SET_PREFERRED_TONE:
      return {
        ...state,
        preferredTone: action.payload,
      };

    case USER_ACTIONS.SET_NOTIFICATIONS:
      return {
        ...state,
        notificationsEnabled: action.payload,
      };

    case USER_ACTIONS.LOAD_PREFERENCES:
      return {
        ...state,
        ...action.payload,
        theme: action.payload.isDarkMode ? darkTheme : lightTheme,
      };

    default:
      return state;
  }
};

/**
 * User Context
 */
const UserContext = createContext(null);

/**
 * User Provider Component
 */
export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);
  const { user, updateProfile } = useAuth();

  /**
   * Load preferences from storage on mount
   */
  React.useEffect(() => {
    const loadPreferences = async () => {
      try {
        const themeModeStr = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE);
        const isDarkMode = themeModeStr !== 'light'; // Default to dark

        dispatch({
          type: USER_ACTIONS.LOAD_PREFERENCES,
          payload: {
            isDarkMode,
            preferredTone: user?.preferredTone || 'Professional',
          },
        });
      } catch (error) {
        console.warn('Error loading preferences:', error);
      }
    };

    loadPreferences();
  }, [user]);

  /**
   * Toggle dark/light mode
   */
  const toggleTheme = useCallback(async () => {
    const newMode = !state.isDarkMode;
    
    dispatch({
      type: USER_ACTIONS.SET_THEME_MODE,
      payload: newMode,
    });

    // Persist preference
    await AsyncStorage.setItem(
      STORAGE_KEYS.THEME_MODE,
      newMode ? 'dark' : 'light'
    );

    // Sync with user profile if logged in
    if (user) {
      await updateProfile({ isDarkMode: newMode });
    }
  }, [state.isDarkMode, user, updateProfile]);

  /**
   * Set specific theme mode
   */
  const setThemeMode = useCallback(async (isDarkMode) => {
    dispatch({
      type: USER_ACTIONS.SET_THEME_MODE,
      payload: isDarkMode,
    });

    await AsyncStorage.setItem(
      STORAGE_KEYS.THEME_MODE,
      isDarkMode ? 'dark' : 'light'
    );

    if (user) {
      await updateProfile({ isDarkMode });
    }
  }, [user, updateProfile]);

  /**
   * Set preferred tone
   */
  const setPreferredTone = useCallback(async (tone) => {
    dispatch({
      type: USER_ACTIONS.SET_PREFERRED_TONE,
      payload: tone,
    });

    if (user) {
      await updateProfile({ preferredTone: tone });
    }
  }, [user, updateProfile]);

  /**
   * Toggle notifications
   */
  const toggleNotifications = useCallback(async () => {
    const newValue = !state.notificationsEnabled;
    
    dispatch({
      type: USER_ACTIONS.SET_NOTIFICATIONS,
      payload: newValue,
    });
  }, [state.notificationsEnabled]);

  const value = {
    ...state,
    toggleTheme,
    setThemeMode,
    setPreferredTone,
    toggleNotifications,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

/**
 * Custom hook to use user context
 */
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

/**
 * Custom hook to get current theme
 */
export const useTheme = () => {
  const { theme, isDarkMode } = useUser();
  return { theme, isDarkMode };
};

export default UserContext;