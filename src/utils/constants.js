// ─── THEME ─────────────────────────────────────────────────────────────────

export const darkTheme = {
  bg: '#0A0C10',
  surface: '#12161E',
  surfaceElevated: '#1A2030',
  border: '#1E2736',
  primary: '#4F8EF7',
  primaryGlow: 'rgba(79,142,247,0.18)',
  accent: '#38E8C4',
  accentGlow: 'rgba(56,232,196,0.15)',
  text: '#EAF0FF',
  textMuted: '#6B7A99',
  textSecondary: '#A8B5CC',
  danger: '#FF5A5A',
  warning: '#FFA940',
  success: '#38E8C4',
  recordPulse: 'rgba(79,142,247,0.25)',
};

export const lightTheme = {
  bg: '#F0F4FA',
  surface: '#FFFFFF',
  surfaceElevated: '#FAFCFF',
  border: '#D8E2F0',
  primary: '#2563EB',
  primaryGlow: 'rgba(37,99,235,0.12)',
  accent: '#0EA67A',
  accentGlow: 'rgba(14,166,122,0.12)',
  text: '#0F172A',
  textMuted: '#8FA1BE',
  textSecondary: '#475569',
  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#0EA67A',
  recordPulse: 'rgba(37,99,235,0.18)',
};

/**
 * Gets theme based on mode
 * @param {boolean} isDark
 * @returns {Object}
 */
export const getTheme = (isDark) => (isDark ? darkTheme : lightTheme);

// ─── TONES ─────────────────────────────────────────────────────────────────

export const TONES = [
  'Professional',
  'Reflective',
  'Thought Leader',
  'Casual-Pro',
];

export const TONE_DESCRIPTIONS = {
  'Professional': 'Polished and business-appropriate',
  'Reflective': 'Thoughtful and introspective',
  'Thought Leader': 'Confident and visionary',
  'Casual-Pro': 'Friendly yet professional',
};

// ─── API ───────────────────────────────────────────────────────────────────
// Determine API base URL based on environment
const getApiBaseUrl = () => {
  // For development, use your local machine's IP
  // Find your IP: 
  // - Windows: ipconfig (look for IPv4 Address)
  // - Mac/Linux: ifconfig (look for inet)
  // - Or use: http://localhost:3000/api for web testing
  
  if (__DEV__) {
    // REPLACE THIS WITH YOUR ACTUAL LOCAL IP ADDRESS
    // Example: return 'http://192.168.1.100:3000/api';
    return 'http://192.168.1.97:3000/api'; // Your current IP from Expo
  }
  
  // For production, use your deployed backend URL
  return 'https://api.linquoral.com'
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};



// ─── LINKEDIN ──────────────────────────────────────────────────────────────

export const LINKEDIN_LIMITS = {
  MAX_POST_LENGTH: 3000,
  RECOMMENDED_LENGTH: 1300,
  MIN_LENGTH: 50,
};

// ─── RECORDING ─────────────────────────────────────────────────────────────

export const RECORDING_CONFIG = {
  MAX_DURATION_MS: 300000, // 5 minutes
  MIN_DURATION_MS: 3000,   // 3 seconds
  SAMPLE_RATE: 44100,
  CHANNELS: 1,
  BIT_RATE: 128000,
};

// ─── APP INFO ──────────────────────────────────────────────────────────────

export const APP_INFO = {
  NAME: 'Linquoral',
  VERSION: '1.0.0',
  TAGLINE: 'Your voice, professionally presented',
};

// ─── SCREEN NAMES ──────────────────────────────────────────────────────────

export const SCREENS = {
  // Auth
  WELCOME: 'Welcome',
  ONBOARDING: 'Onboarding',
  
  // Main
  HOME: 'Home',
  RECORD: 'VoiceCapture',
  EDITOR: 'Edit',
  DRAFTS: 'DraftList',
  PUBLISH_OPTIONS: 'PublishOptions',
  SCHEDULE: 'Schedule',
  SETTINGS: 'Settings',
};

// ─── ASYNC STORAGE KEYS ────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  USER: '@linquoral_user',
  AUTH_TOKEN: '@linquoral_auth_token',
  THEME_MODE: '@linquoral_theme_mode',
  ONBOARDING_COMPLETE: '@linquoral_onboarding_complete',
  DRAFTS_CACHE: '@linquoral_drafts_cache',
};

// ─── TIME SLOTS ────────────────────────────────────────────────────────────

export const TIME_SLOTS = [
  { label: 'Morning', time: '09:00', description: 'Great for professional updates' },
  { label: 'Midday', time: '12:00', description: 'High engagement during lunch' },
  { label: 'Afternoon', time: '15:00', description: 'Catch the afternoon scroll' },
  { label: 'Evening', time: '18:00', description: 'End-of-day reflections' },
];

// ─── TIPS ──────────────────────────────────────────────────────────────────

export const TIPS = [
  {
    icon: '💡',
    title: 'Tip',
    text: 'Students who post consistently get 3× more recruiter views. Your next draft is one tap away.',
  },
  {
    icon: '🎯',
    title: 'Best Practice',
    text: 'Posts between 1000-1300 characters get the highest engagement on LinkedIn.',
  },
  {
    icon: '🗓️',
    title: 'Scheduling',
    text: 'Tuesday through Thursday mornings see the highest professional engagement.',
  },
  {
    icon: '✨',
    title: 'Authenticity',
    text: 'Your unique perspective matters. AI refines your words, not your ideas.',
  },
];

// ─── GREETING HELPER ───────────────────────────────────────────────────────

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};