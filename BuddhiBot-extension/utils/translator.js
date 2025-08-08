/**
 * REAL: Translates a given text to a target language using the Google Gemini API.
 * @param {string} text - The text to translate.
 * @param {string} targetLang - The target language code (e.g., 'hi', 'mr').
 * @returns {Promise<string>} - The translated text.
 */
async function translateText(text, targetLang) {
    // This check prevents empty API calls
    if (!text || !text.trim()) {
        return "";
    }

    // --- Direct API Call to Gemini ---
    const GEMINI_API_KEY = 'AIzaSyDvhhF9AQCNedCuFvbWCM91Adjcmw5oapY'; // <-- Use a fresh, private key
    
    // This safety check is important
    if (GEMINI_API_KEY === 'PASTE_YOUR_NEW_SECRET_API_KEY_HERE') {
        const errorMessage = "ERROR: You must replace the placeholder API Key in utils/translator.js";
        console.error(errorMessage);
        showNotification(errorMessage, true); 
        return errorMessage;
    }
    
    // MODIFIED: Using the specific 'gemini-1.0-pro' model name
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;

    const prompt = `IMPORTANT: Translate the following text into the language with code '${targetLang}'. The text might contain parts separated by '|||'. You MUST maintain the '|||' separators between the translated parts in your response. Do not add any extra explanation or introductory text. Just provide the translated text with the separators. Text: "${text}"`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}. This can happen if billing is not enabled on your project.`);
        }

        const data = await response.json();
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content.parts[0].text) {
             throw new Error("Invalid response from API. Might be blocked by safety filters.");
        }
        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error("Translation API Error:", error);
        showNotification(`Translation Error: ${error.message}`, true);
        return `[Translation Error]`;
    }
}


/**
 * MOCK: Gets a simple AI-based explanation for a given text label.
 * (This function remains unchanged)
 */
async function getAIExplanation(labelText) {
    labelText = labelText.toLowerCase();
    let explanation = "This is a standard interface element.";

    if (labelText.includes("email")) {
        explanation = "Please enter your full email address here (e.g., name@example.com).";
    } else if (labelText.includes("password")) {
        explanation = "Enter your secure password. Make sure it is strong.";
    } else if (labelText.includes("submit") || labelText.includes("sign in")) {
        explanation = "Click this button to send the information you entered.";
    } else if (labelText.includes("search")) {
        explanation = "Type what you are looking for and press Enter.";
    }
    
    return new Promise(resolve => setTimeout(() => resolve(explanation), 200));
}

/**
 * Uses the browser's Web Speech API to play audio of the given text.
 * (This function remains unchanged)
 */
function playAudio(text, lang) {
    if ('speechSynthesis' in window) {
        const langMap = { 'hi': 'hi-IN', 'mr': 'mr-IN', 'gu': 'gu-IN', 'bn': 'bn-IN', 'en': 'en-US' };
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langMap[lang] || 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    } else {
        console.error('Web Speech API is not supported in this browser.');
    }
}