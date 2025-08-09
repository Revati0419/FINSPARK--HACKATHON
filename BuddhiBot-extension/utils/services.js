// ✅ utils/services.js
// This file is the central hub for all external Google Cloud API communications.

// The build script will replace this placeholder with your real API key.
const GOOGLE_CLOUD_API_KEY = '__API_KEY_PLACEHOLDER__';

/**
 * SERVICE 1: Translates text using the Google Gemini API.
 */
async function translateText(text, targetLang) {
    if (!text || !text.trim() || targetLang === 'en') return text;
    if (GOOGLE_CLOUD_API_KEY.includes('PLACEHOLDER')) {
        showNotification("API Key is missing. Run ./build.sh", true);
        return `[API Key Error]`;
    }
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GOOGLE_CLOUD_API_KEY}`;
    const prompt = `Translate the following text into the language with code '${targetLang}'. Preserve context and separators (|||). Provide only the translated text. Text: "${text}"`;
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        if (!response.ok) throw new Error(`API request failed: ${response.status}`);
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Translation API Error:", error);
        return `[Translation Error]`;
    }
}

/**
 * SERVICE 2: Generates high-quality audio using the Cloud Text-to-Speech API.
 */
async function getCloudAudio(text, langCode) {
    if (GOOGLE_CLOUD_API_KEY.includes('PLACEHOLDER')) return null;
    const API_URL = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_CLOUD_API_KEY}`;
    const voiceNames = {
        'mr-IN': 'mr-IN-Wavenet-A', 'hi-IN': 'hi-IN-Neural2-A', 'gu-IN': 'gu-IN-Wavenet-A',
        'bn-IN': 'bn-IN-Wavenet-A', 'ta-IN': 'ta-IN-Neural2-B', 'te-IN': 'te-IN-Standard-B',
        'en-US': 'en-US-Neural2-J'
    };
    const requestBody = {
        input: { text: text },
        voice: { languageCode: langCode, name: voiceNames[langCode] || langCode },
        audioConfig: { audioEncoding: 'MP3' }
    };
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        if (!response.ok) throw new Error('Cloud TTS API request failed.');
        const data = await response.json();
        if (data.audioContent) return new Audio(`data:audio/mp3;base64,${data.audioContent}`);
        throw new Error('No audio content received.');
    } catch (error) {
        console.error("Cloud TTS Error:", error);
        return null;
    }
}

/**
 * SERVICE 3: Transcribes voice using the Cloud Speech-to-Text API.
 */
async function getTranscriptionFromCloud(audioBase64, langCode) {
    if (GOOGLE_CLOUD_API_KEY.includes('PLACEHOLDER')) return "[API Key Error]";
    const API_URL = `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_CLOUD_API_KEY}`;
    const requestBody = {
        config: { languageCode: langCode, enableAutomaticPunctuation: true },
        audio: { content: audioBase64 }
    };
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody.error.message);
        }
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            return data.results[0].alternatives[0].transcript;
        }
        return "";
    } catch (error) {
        console.error("Cloud Speech-to-Text Error:", error);
        return "[Recognition Error]";
    }
}