/**
 * Draft status options: 'draft' | 'scheduled' | 'published'
 * Tone options: 'Professional' | 'Reflective' | 'Thought Leader' | 'Casual-Pro'
 */

/**
 * Creates a new draft object
 * @param {Object} params
 * @param {string} params.id
 * @param {string} params.userId
 * @param {string} params.rawTranscript
 * @param {string} params.tone
 * @returns {Object} Draft object
 */
export const createDraft = ({
  id = '',
  userId = '',
  rawTranscript = '',
  aiRefinedText = '',
  userEditedText = '',
  title = '',
  tone = 'Professional',
  status = 'draft',
  scheduledAt = null,
  publishedAt = null,
  audioUri = null,
  audioDurationMs = 0,
  mediaAttachments = []
}) => ({
  id,
  userId,
  
  // Content stages
  rawTranscript,        // Original voice transcription
  aiRefinedText,        // AI-processed content
  userEditedText,       // Final user-edited version
  
  // Metadata
  title,
  tone,
  status,
  
  // Scheduling
  scheduledAt,
  publishedAt,
  
  // Timestamps
  createdAt: new Date(),
  updatedAt: new Date(),
  
  // Audio reference (optional, for replay)
  audioUri,
  audioDurationMs,

  mediaAttachments
});

/**
 * Gets display-ready text (prioritizes user edits)
 * @param {Object} draft
 * @returns {string}
 */
export const getDisplayText = (draft) => {
  return draft.userEditedText || draft.aiRefinedText || draft.rawTranscript;
};

/**
 * Generates title from content
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const generateTitleFromContent = (text, maxLength = 40) => {
  const cleaned = text.replace(/\n/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength).trim() + '...';
};

/**
 * Available tones
 */
export const DRAFT_TONES = [
  'Professional',
  'Reflective',
  'Thought Leader',
  'Casual-Pro',
];

/**
 * Available statuses
 */
export const DRAFT_STATUSES = [
  'draft',
  'scheduled',
  'published',
];