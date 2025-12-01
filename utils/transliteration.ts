
const devanagariMap: { [key: string]: string } = {
    // Vowels
    'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
    // Consonants
    'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
    'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
    'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
    'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
    'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
    'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
    'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
    // Vowel Signs (Matras)
    'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
    // Other signs
    'ं': 'n', 'ः': 'h', 'ँ': 'n',
    // Special Symbol
    'ॐ': 'Om',
    // Punctuation
    '।': '.', '॥': '.',
    // Numerals (for completeness)
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
};

const consonants = new Set([
    'क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ',
    'ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न',
    'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व',
    'श', 'ष', 'स', 'ह',
]);

const vowelReplacingMatras = new Set(['ा', 'ि', 'ी', 'ु', 'ू', 'ृ', 'े', 'ै', 'ो', 'ौ']);
const halant = '्';

export const transliterateDevanagari = (text: string): string => {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        if (consonants.has(char)) {
            result += devanagariMap[char];
            const nextChar = i + 1 < text.length ? text[i + 1] : null;
            if (nextChar === null || (!vowelReplacingMatras.has(nextChar) && nextChar !== halant)) {
                result += 'a';
            }
        } else if (vowelReplacingMatras.has(char)) {
            if (result.endsWith('a')) {
                result = result.slice(0, -1);
            }
            result += devanagariMap[char];
        } else if (char === halant) {
             if (result.endsWith('a')) {
                result = result.slice(0, -1);
            }
        } else if (devanagariMap[char]) {
             result += devanagariMap[char];
        } else {
            result += char;
        }
    }
    return result;
};
