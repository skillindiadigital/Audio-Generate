import { GoogleGenAI, Modality, HarmCategory, HarmBlockThreshold } from '@google/genai';

// Assume API_KEY is set in the environment
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this context, we assume it's always available.
  console.warn("API key not found. Please set process.env.API_KEY.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });
const model = "gemini-2.5-flash-preview-tts";

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
  try {
    const response = await ai.models.generateContent({
      model: model,
      // The TTS model expects a structured Content object, not a plain string.
      contents: [{ parts: [{ text: text }] }],
      safetySettings: safetySettings,
      config: {
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
        console.error("API response did not contain audio data. Full response:", JSON.stringify(response, null, 2));
        const finishReason = response.candidates?.[0]?.finishReason;
        if (finishReason && finishReason !== 'STOP') {
            throw new Error(`API returned no audio. Reason: ${finishReason}. This can happen if the content is empty or flagged by safety filters.`);
        }
        throw new Error("No audio data received from API. This may be caused by a content policy violation or an empty script part.");
    }
    
    return base64Audio;
  } catch (error) {
    console.error("Error synthesizing text:", error);
    if (error instanceof Error) {
        // Re-throw the specific error message from the try block or the original error.
        throw error;
    }
    throw new Error("Failed to synthesize audio. Please check your script, API key, or network connection.");
  }
};