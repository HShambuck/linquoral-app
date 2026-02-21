import { LINKEDIN_LIMITS, RECORDING_CONFIG } from './constants';

// ─── CONTENT VALIDATORS ────────────────────────────────────────────────────

/**
 * Validates post content
 * @param {string} text
 * @returns {Object} { isValid, error, warning }
 */
export const validatePostContent = (text) => {
  const trimmed = (text || '').trim();
  
  if (!trimmed) {
    return {
      isValid: false,
      error: 'Post content cannot be empty',
    };
  }
  
  if (trimmed.length < LINKEDIN_LIMITS.MIN_LENGTH) {
    return {
      isValid: false,
      error: `Post must be at least ${LINKEDIN_LIMITS.MIN_LENGTH} characters`,
    };
  }
  
  if (trimmed.length > LINKEDIN_LIMITS.MAX_POST_LENGTH) {
    return {
      isValid: false,
      error: `Post exceeds LinkedIn's ${LINKEDIN_LIMITS.MAX_POST_LENGTH} character limit`,
    };
  }
  
  if (trimmed.length > LINKEDIN_LIMITS.RECOMMENDED_LENGTH) {
    return {
      isValid: true,
      warning: `Consider shortening. Posts under ${LINKEDIN_LIMITS.RECOMMENDED_LENGTH} characters perform better.`,
    };
  }
  
  return { isValid: true };
};

/**
 * Validates title
 * @param {string} title
 * @returns {Object} { isValid, error }
 */
export const validateTitle = (title) => {
  const trimmed = (title || '').trim();
  
  if (!trimmed) {
    return {
      isValid: false,
      error: 'Title cannot be empty',
    };
  }
  
  if (trimmed.length > 100) {
    return {
      isValid: false,
      error: 'Title must be under 100 characters',
    };
  }
  
  return { isValid: true };
};

// ─── RECORDING VALIDATORS ──────────────────────────────────────────────────

/**
 * Validates recording duration
 * @param {number} durationMs
 * @returns {Object} { isValid, error }
 */
export const validateRecordingDuration = (durationMs) => {
  if (durationMs < RECORDING_CONFIG.MIN_DURATION_MS) {
    return {
      isValid: false,
      error: 'Recording too short. Speak for at least 3 seconds.',
    };
  }
  
  if (durationMs > RECORDING_CONFIG.MAX_DURATION_MS) {
    return {
      isValid: false,
      error: 'Recording too long. Maximum duration is 5 minutes.',
    };
  }
  
  return { isValid: true };
};

// ─── SCHEDULE VALIDATORS ───────────────────────────────────────────────────

/**
 * Validates schedule date
 * @param {Date} date
 * @returns {Object} { isValid, error }
 */
export const validateScheduleDate = (date) => {
  const now = new Date();
  const minScheduleTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
  const maxScheduleTime = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
  
  if (date < minScheduleTime) {
    return {
      isValid: false,
      error: 'Schedule time must be at least 5 minutes in the future',
    };
  }
  
  if (date > maxScheduleTime) {
    return {
      isValid: false,
      error: 'Schedule time cannot be more than 30 days in the future',
    };
  }
  
  return { isValid: true };
};

// ─── USER INPUT VALIDATORS ─────────────────────────────────────────────────

/**
 * Validates display name
 * @param {string} name
 * @returns {Object} { isValid, error }
 */
export const validateDisplayName = (name) => {
  const trimmed = (name || '').trim();
  
  if (!trimmed) {
    return {
      isValid: false,
      error: 'Display name cannot be empty',
    };
  }
  
  if (trimmed.length < 2) {
    return {
      isValid: false,
      error: 'Display name must be at least 2 characters',
    };
  }
  
  if (trimmed.length > 50) {
    return {
      isValid: false,
      error: 'Display name must be under 50 characters',
    };
  }
  
  // Only allow letters, spaces, hyphens, and apostrophes
  const validNameRegex = /^[a-zA-Z\s\-']+$/;
  if (!validNameRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Display name can only contain letters, spaces, hyphens, and apostrophes',
    };
  }
  
  return { isValid: true };
};

// ─── HELPER FUNCTIONS ──────────────────────────────────────────────────────

/**
 * Gets character count status
 * @param {number} length
 * @returns {'good' | 'warning' | 'error'}
 */
export const getCharacterCountStatus = (length) => {
  if (length > LINKEDIN_LIMITS.MAX_POST_LENGTH) return 'error';
  if (length > LINKEDIN_LIMITS.RECOMMENDED_LENGTH) return 'warning';
  return 'good';
};

/**
 * Formats duration in milliseconds to mm:ss
 * @param {number} ms
 * @returns {string}
 */
export const formatDuration = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Formats relative time (e.g., "2h ago", "Yesterday")
 * @param {Date} date
 * @returns {string}
 */
export const formatRelativeTime = (date) => {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Formats scheduled time for display
 * @param {Date} date
 * @returns {string}
 */
export const formatScheduledTime = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

/**
 * Truncates text with ellipsis
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};