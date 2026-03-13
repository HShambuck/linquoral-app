import api from "./api";
import { TONE_DESCRIPTIONS } from "../utils/constants";

const aiService = {
  transcribeAudio: async (audioUri, { language = "en" } = {}) => {
    const formData = new FormData();
    formData.append("audio", {
      uri: audioUri,
      type: "audio/m4a",
      name: "recording.m4a",
    });
    formData.append("language", language);

    const response = await api.post("/ai/transcribe", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000, // 2 min
    });

    return {
      transcript: response.transcript,
      confidence: response.confidence || 1.0,
      durationMs: response.durationMs || 0,
    };
  },

  refineTranscript: async (
    rawTranscript,
    { tone = "Professional", context = "" } = {},
  ) => {
    const response = await api.post(
      "/ai/refine",
      {
        rawTranscript,
        tone,
        toneDescription:
          TONE_DESCRIPTIONS[tone] || TONE_DESCRIPTIONS["Professional"],
        context,
        preserveVoice: true,
      },
      { timeout: 60000 },
    );

    return {
      refinedText: response.refinedText,
      suggestions: response.suggestions || [],
    };
  },

  changeTone: async (text, newTone) => {
    const response = await api.post(
      "/ai/change-tone",
      {
        text,
        newTone,
        toneDescription:
          TONE_DESCRIPTIONS[newTone] || TONE_DESCRIPTIONS["Professional"],
      },
      { timeout: 60000 },
    );
    return { refinedText: response.refinedText };
  },

  getSuggestions: async (text) => {
    const response = await api.post(
      "/ai/suggestions",
      { text },
      { timeout: 30000 },
    );
    return { suggestions: response.suggestions || [] };
  },

  generateTitle: async (text) => {
    const response = await api.post(
      "/ai/generate-title",
      { text },
      { timeout: 30000 },
    );
    return response.title;
  },

  // Full pipeline — transcribe + refine + title in one backend call
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
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 180000, // 3 minutes — covers long recordings + 3 Groq calls
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
    const response = await api.post(
      "/ai/apply-edit",
      {
        currentText,
        editInstructions,
        tone,
      },
      { timeout: 60000 },
    );
    return { refinedText: response.refinedText };
  },

  checkHealth: async () => {
    try {
      await api.get("/ai/health");
      return true;
    } catch {
      return false;
    }
  },
};

export default aiService;
