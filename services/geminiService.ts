
import { GoogleGenAI, Modality } from '@google/genai';

// Assume API_KEY is set in the environment
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this context, we assume it's always available.
  console.warn("API key not found. Please set process.env.API_KEY.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });
const model = "gemini-2.5-flash-preview-tts";

export const synthesizeText = async (text: string, voice: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [{ text }] }],
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
      throw new Error("No audio data received from API.");
    }
    
    return base64Audio;
  } catch (error) {
    console.error("Error synthesizing text:", error);
    throw new Error("Failed to synthesize audio. Please check your script or API key.");
  }
};
