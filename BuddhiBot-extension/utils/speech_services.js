// ✅ utils/speech_services.js
// This file is dedicated to speech-related Google Cloud services.

/**
 * SERVICE 1: Generates high-quality audio using the Cloud Text-to-Speech API.
 */
async function getCloudAudio(text, langCode) {
    // This is the key check. Use the key from the reliable CONFIG object.
    if (CONFIG.API_KEY.includes('PLACEHOLDER')) {
        showNotification("API Key is missing. Please run ./build.sh", true);
        return null;
    }

    const API_URL = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${CONFIG.API_KEY}`;

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
        if (data.audioContent) {
            return new Audio(`data:audio/mp3;base64,${data.audioContent}`);
        }
        throw new Error('No audio content in API response.');
    } catch (error) {
        console.error("Cloud TTS Error:", error);
        showNotification('Could not generate high-quality audio.', true);
        return null;
    }
}

/**
 * SERVICE 2: Transcribes voice using the Cloud Speech-to-Text API.
 */
async function getTranscriptionFromCloud(audioBase64, langCode) {
    // This is the key check. Use the key from the reliable CONFIG object.
    if (CONFIG.API_KEY.includes('PLACEHOLDER')) {
        showNotification("API Key is missing. Please run ./build.sh", true);
        return "[API Key Error]";
    }

    const API_URL = `https://speech.googleapis.com/v1/speech:recognize?key=${CONFIG.API_KEY}`;
    const requestBody = {
        config: {
            languageCode: langCode,
            enableAutomaticPunctuation: true,
        },
        audio: {
            content: audioBase64,
        },
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });
        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`API request failed: ${errorBody.error.message}`);
        }
        const data = await response.json();
        if (data.results && data.results.length > 0 && data.results[0].alternatives.length > 0) {
            return data.results[0].alternatives[0].transcript;
        }
        return "";
    } catch (error) {
        console.error("Cloud Speech-to-Text Error:", error);
        showNotification(`Voice Recognition Error: ${error.message}`, true);
        return "[Recognition Error]";
    }
}