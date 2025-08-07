/**
 * MOCK: Translates a given text to a target language.
 * In a real app, this would make an API call (e.g., to Google Translate, HuggingFace).
 * @param {string} text - The text to translate.
 * @param {string} targetLang - The target language code (e.g., 'hi', 'mr').
 * @returns {Promise<string>} - The translated text.
 */
async function translateText(text, targetLang) {
    if (!text || !text.trim()) {
        return "";
    }
    console.log(`MOCK API: Translating "${text}" to ${targetLang}`);
    // Simulate a network delay
    return new Promise(resolve => {
        setTimeout(() => {
            const mockTranslations = {
                'hi': 'नमस्ते', // Hello
                'mr': 'नमस्कार', // Hello
                'gu': 'નમસ્તે',   // Hello
                'bn': 'নমস্কার'   // Hello
            };
            // Return a simple mock translation for demonstration
            resolve(`[${mockTranslations[targetLang] || 'Translated'}] ${text}`);
        }, 300);
    });
}

/**
 * MOCK: Gets a simple AI-based explanation for a given text label.
 * In a real app, this would make a call to your GenAI backend.
 * @param {string} labelText - The text from the element (e.g., a button or label).
 * @returns {Promise<string>} - The simple explanation.
 */
async function getAIExplanation(labelText) {
    labelText = labelText.toLowerCase();
    let explanation = "This is a standard interface element."; // Default

    if (labelText.includes("email")) {
        explanation = "Please enter your full email address here (e.g., name@example.com).";
    } else if (labelText.includes("password")) {
        explanation = "Enter your secure password. Make sure it is strong.";
    } else if (labelText.includes("submit") || labelText.includes("sign in")) {
        explanation = "Click this button to send the information you entered.";
    } else if (labelText.includes("search")) {
        explanation = "Type what you are looking for and press Enter.";
    }

    // Simulate network delay
    return new Promise(resolve => setTimeout(() => resolve(explanation), 200));
}

/**
 * Uses the browser's Web Speech API to play audio of the given text.
 * This is a real implementation and requires no API key.
 * @param {string} text - The text to convert to speech.
 * @param {string} lang - The BCP 47 language code (e.g., 'hi-IN').
 */
function playAudio(text, lang) {
    if ('speechSynthesis' in window) {
        // Map simple codes to more specific BCP 47 codes for better voice matching
        const langMap = {
            'hi': 'hi-IN',
            'mr': 'mr-IN',
            'gu': 'gu-IN',
            'bn': 'bn-IN',
            'en': 'en-US'
        };

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langMap[lang] || 'en-US';
        utterance.rate = 0.9;
        
        window.speechSynthesis.cancel(); // Cancel any previous speech
        window.speechSynthesis.speak(utterance);
    } else {
        console.error('Web Speech API is not supported in this browser.');
    }
}