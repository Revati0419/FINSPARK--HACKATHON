// ✅ utils/audio.js
// This file manages AUDIO PLAYBACK LOGIC. It USES the service files to get data.



/**
 * Plays high-quality audio by requesting it from the services layer.
 */
async function playAudioWithCloudAPI(text, langCode) {
    showNotification('Generating high-quality audio...');
    // Calls the service function from speech_services.js
    const audio = await getCloudAudio(text, langCode);
    if (audio) {
        audio.play();
        audio.onended = () => showNotification('Audio playback complete.');
    } else {
        showNotification('Could not play high-quality audio.', true);
    }
}

/**
 * Plays standard quality audio using the browser's built-in speech synthesis.
 */
function playAudioWithBrowser(text, langCode) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langMap[langCode] || langMap['en'];
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
}

/**
 * Plays two audio clips in sequence using standard quality voices.
 */
function playAudioInSequence(text, targetLang) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const englishUtterance = new SpeechSynthesisUtterance(text);
    englishUtterance.lang = langMap['en'];
    englishUtterance.rate = 0.9;
    englishUtterance.onend = async () => {
        if (targetLang === 'en') return;
        // Calls the service function from translator.js
        const translatedText = await translateText(text, targetLang);
        if (translatedText && !translatedText.includes('[Error]')) {
            const preferredUtterance = new SpeechSynthesisUtterance(translatedText);
            preferredUtterance.lang = langMap[targetLang] || langMap['en'];
            preferredUtterance.rate = 0.85;
            setTimeout(() => window.speechSynthesis.speak(preferredUtterance), 150);
        }
    };
    window.speechSynthesis.speak(englishUtterance);
}