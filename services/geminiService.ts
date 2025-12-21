
import { GoogleGenAI, Modality, HarmCategory, HarmBlockThreshold } from '@google/genai';

// In Vite, environment variables are typically accessed via import.meta.env
// However, our vite.config.ts handles the mapping so process.env.API_KEY works.
const API_KEY = process.env.API_KEY;

const modelName = "gemini-2.5-flash-preview-tts";

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

export const synthesizeText = async (text: string, voice: string): Promise<string | null> => {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please set VITE_API_KEY in your environment variables.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ parts: [{ text: text }] }],
      config: {
        safetySettings: safetySettings,
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
        console.error("API response did not contain audio data:", response);
        const finishReason = response.candidates?.[0]?.finishReason;
        if (finishReason && finishReason !== 'STOP') {
            throw new Error(`API returned no audio. Reason: ${finishReason}. Content might be flagged or empty.`);
        }
        throw new Error("No audio data received from API.");
    }
    
    return base64Audio;
  } catch (error) {
    console.error("Error synthesizing text:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Failed to synthesize audio. Check your connection and API key.");
  }
};
