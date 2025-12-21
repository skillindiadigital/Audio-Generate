
/**
 * Instead of complex manual transliteration which often gets 
 * Hindi/Sanskrit "schwa deletion" wrong, we now rely on the 
 * Gemini model's native multi-lingual capabilities.
 * 
 * We only replace specific symbols that might confuse the engine.
 */
export const prepareTextForTTS = (text: string): string => {
    let cleaned = text;

    // Replace Om symbol with phonetic equivalent for better clarity
    cleaned = cleaned.replace(/ॐ/g, ' Om ');
    
    // Normalize punctuation
    cleaned = cleaned.replace(/।/g, '. ');
    cleaned = cleaned.replace(/॥/g, '. ');

    // Normalize whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
};
