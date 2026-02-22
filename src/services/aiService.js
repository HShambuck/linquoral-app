import api from "./api";
import { TONE_DESCRIPTIONS } from "../utils/constants";

/**
 * AI Service for Linquoral
 * Handles speech-to-text transcription and AI text refinement
 *
 * Design Principle: AI must refine, not overwrite.
 * Output should sound human, preserving the user's authentic voice.
 */
const aiService = {
  /**
   * Transcribe audio file to text using speech-to-text
   * @param {string} audioUri - Path to audio file
   * @param {Object} options
   * @param {string} options.language - Language code (default: 'en')
   * @returns {Promise<Object>} { transcript, confidence, durationMs }
   */
  transcribeAudio: async (audioUri, { language = "en" } = {}) => {
    // Create form data for file upload
    const formData = new FormData();

    // Append audio file
    formData.append("audio", {
      uri: audioUri,
      type: "audio/m4a", // or 'audio/wav' depending on recording format
      name: "recording.m4a",
    });

    formData.append("language", language);

    const response = await api.post("/ai/transcribe", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000, // Allow longer timeout for transcription
    });

    return {
      transcript: response.transcript,
      confidence: response.confidence || 1.0,
      durationMs: response.durationMs || 0,
    };
  },

  /**
   * Refine transcript into professional LinkedIn post
   * Preserves user's authentic voice while improving structure and clarity
   *
   * @param {string} rawTranscript - Original voice transcription
   * @param {Object} options
   * @param {string} options.tone - Desired tone (Professional, Reflective, etc.)
   * @param {string} options.context - Additional context (optional)
   * @returns {Promise<Object>} { refinedText, suggestions }
   */
  refineTranscript: async (
    rawTranscript,
    { tone = "Professional", context = "" } = {},
  ) => {
    const response = await api.post("/ai/refine", {
      rawTranscript,
      tone,
      toneDescription:
        TONE_DESCRIPTIONS[tone] || TONE_DESCRIPTIONS["Professional"],
      context,
      preserveVoice: true, // Always preserve user's authentic voice
    });

    return {
      refinedText: response.refinedText,
      suggestions: response.suggestions || [],
    };
  },

  /**
   * Re-refine text with a different tone
   * Useful when user wants to switch tones after initial refinement
   *
   * @param {string} text - Current text (can be user-edited)
   * @param {string} newTone - New desired tone
   * @returns {Promise<Object>} { refinedText }
   */
  changeTone: async (text, newTone) => {
    const response = await api.post("/ai/change-tone", {
      text,
      newTone,
      toneDescription:
        TONE_DESCRIPTIONS[newTone] || TONE_DESCRIPTIONS["Professional"],
    });

    return {
      refinedText: response.refinedText,
    };
  },

  /**
   * Get improvement suggestions for user-edited text
   * Non-intrusive suggestions that user can accept or ignore
   *
   * @param {string} text - User's text
   * @returns {Promise<Object>} { suggestions }
   */
  getSuggestions: async (text) => {
    const response = await api.post("/ai/suggestions", {
      text,
    });

    return {
      suggestions: response.suggestions || [],
      // Each suggestion: { type, original, suggested, reason }
    };
  },

  /**
   * Generate a title from post content
   * @param {string} text - Post content
   * @returns {Promise<string>} Generated title
   */
  generateTitle: async (text) => {
    const response = await api.post("/ai/generate-title", {
      text,
    });

    return response.title;
  },

  /**
   * Full pipeline: Transcribe audio and refine in one call
   * Reduces round trips for better UX
   *
   * @param {string} audioUri - Path to audio file
   * @param {Object} options
   * @param {string} options.tone - Desired tone
   * @param {string} options.language - Language code
   * @returns {Promise<Object>} { transcript, refinedText, title, durationMs }
   */
  processVoicePost: async (
    audioUri,
    { tone = "Professional", language = "en" } = {},
  ) => {
    const formData = new FormData();

    formData.append("audio", {
      uri: audioUri,
      type: "audio/m4a",
      name: "recording.m4a",
    });

    formData.append("tone", tone);
    formData.append(
      "toneDescription",
      TONE_DESCRIPTIONS[tone] || TONE_DESCRIPTIONS["Professional"],
    );
    formData.append("language", language);

    const response = await api.post("/ai/process-voice", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 90000, // Allow longer timeout for full pipeline
    });

    return {
      transcript: response.transcript,
      refinedText: response.refinedText,
      title: response.title,
      durationMs: response.durationMs || 0,
      confidence: response.confidence || 1.0,
    };
  },

  applyVoiceEdit: async (
    currentText,
    editInstructions,
    tone = "Professional",
  ) => {
    const response = await api.post("/ai/apply-edit", {
      currentText,
      editInstructions,
      tone,
    });
    return { refinedText: response.refinedText };
  },

  /**
   * Check AI service health/availability
   * @returns {Promise<boolean>}
   */
  checkHealth: async () => {
    try {
      await api.get("/ai/health");
      return true;
    } catch (error) {
      return false;
    }
  },
};

export default aiService;
