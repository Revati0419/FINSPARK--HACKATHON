// ✅ utils/translator.js
// This file is dedicated solely to the translation service using the Gemini API.

// The build script will replace this placeholder with your real API key.


/**
 * Translates text using the Google Gemini API.
 * @param {string} text - The text to translate.
 * @param {string} targetLang - The language code to translate into (e.g., 'hi').
 * @returns {Promise<string>} The translated text.
 */
// ✅ utils/translator.js
async function translateText(text, targetLang) {
    if (!text || !text.trim() || targetLang === 'en') {
        return text;
    }

    // This is the key check. Use the key from the reliable CONFIG object.
    if (CONFIG.API_KEY.includes('PLACEHOLDER')) {
        showNotification("API Key is missing. Please run ./build.sh", true);
        return `[API Key Error]`;
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${CONFIG.API_KEY}`;
    const pageTitle = document.title || 'a webpage';
    const prompt = `Translate this text for a webpage titled "${pageTitle}" into language code '${targetLang}': "${text}"`;

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
        showNotification(`Translation Error: ${error.message}`, true);
        return `[Translation Error]`;
    }
}