// --- translator.js (Complete Version with High-Quality Audio) ---

// IMPORTANT: This key now needs to have BOTH "Generative Language API" (Gemini)
// AND "Cloud Text-to-Speech API" enabled in your Google Cloud project.
const GOOGLE_CLOUD_API_KEY = 'AIzaSyDvhhF9AQCNedCuFvbWCM91Adjcmw5oapY';

/**
 * Translates text using the Google Gemini API.
 */
async function translateText(text, targetLang) {
    if (!text || !text.trim()) { return ""; }
    if (targetLang === 'en') { return text; } // Don't translate if the target is English

    if (GOOGLE_CLOUD_API_KEY.includes('PASTE_YOUR')) {
        const msg = "ERROR: You must add your Google Cloud API Key to translator.js";
        console.error(msg);
        showNotification(msg, true); 
        return `[Translation Error]`;
    }
    
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GOOGLE_CLOUD_API_KEY}`;
    const prompt = `Translate the following text to the language with ISO 639-1 code '${targetLang}'. Respond with ONLY the translated text, nothing else. Text: "${text}"`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        if (!response.ok) throw new Error(`API request failed with status ${response.status}.`);
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Translation API Error:", error);
        showNotification(`Translation Error: ${error.message}`, true);
        return `[Translation Error]`;
    }
}

/**
 * Uses Google Cloud API to generate and play high-quality audio.
 */
async function playAudioWithCloudAPI(text, langCode) {
    if (GOOGLE_CLOUD_API_KEY.includes('PASTE_YOUR')) {
        showNotification('High-quality voices are not configured.', true);
        return;
    }

    const API_URL = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_CLOUD_API_KEY}`;
    
    // High-quality "WaveNet" voices. Find more in Google Cloud documentation.
    const voiceNames = {
        'mr-IN': 'mr-IN-Wavenet-B', // Female
        'hi-IN': 'hi-IN-Wavenet-B', // Female
        'en-US': 'en-US-Wavenet-D', // Male
        'bn-IN': 'bn-IN-Wavenet-B', // Female
        'gu-IN': 'gu-IN-Wavenet-B', // Female
        'ta-IN': 'ta-IN-Wavenet-B', // Female
        'te-IN': 'te-IN-Wavenet-B'  // Female
    };

    const requestBody = {
        input: { text: text },
        voice: {
            languageCode: langCode,
            name: voiceNames[langCode] || langCode
        },
        audioConfig: { audioEncoding: 'MP3' }
    };

    try {
        showNotification('Generating high-quality audio...');
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) throw new Error('Cloud TTS API request failed.');
        const data = await response.json();
        
        if (data.audioContent) {
            const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
            audio.play();
        } else {
            throw new Error('No audio content in API response.');
        }
    } catch (error) {
        console.error("Cloud TTS Error:", error);
        showNotification('Could not play high-quality audio.', true);
    }
}

// --- STANDARD QUALITY (BROWSER) AUDIO FUNCTIONS ---

const langMap = { 
    'hi': 'hi-IN', 'mr': 'mr-IN', 'gu': 'gu-IN', 'bn': 'bn-IN', 
    'ta': 'ta-IN', 'te': 'te-IN', 'en': 'en-US' 
};

/**
 * STANDARD Pronouncer: Plays audio in one specified language using browser voices.
 */
function playAudio(text, langCode) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); 
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langMap[langCode] || langMap['en'];
    utterance.rate = 0.85; // Slightly slower for clarity
    window.speechSynthesis.speak(utterance);
}

/**
 * STANDARD Sequencer: Plays English then primary language using browser voices.
 */
function playAudioInSequence(text, targetLang) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); 
    const englishUtterance = new SpeechSynthesisUtterance(text);
    englishUtterance.lang = langMap['en'];
    englishUtterance.rate = 0.9;

    englishUtterance.onend = async () => {
        if (targetLang === 'en') return;
        try {
            const translatedText = await translateText(text, targetLang);
            if (translatedText && !translatedText.includes('[Translation Error]')) {
                const preferredUtterance = new SpeechSynthesisUtterance(translatedText);
                preferredUtterance.lang = langMap[targetLang] || langMap['en'];
                preferredUtterance.rate = 0.85;
                setTimeout(() => window.speechSynthesis.speak(preferredUtterance), 150);
            }
        } catch (error) { /* Errors are handled in translateText */ }
    };
    
    window.speechSynthesis.speak(englishUtterance);
}