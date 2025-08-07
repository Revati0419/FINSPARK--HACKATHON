// Set initial state when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({
        isBarEnabled: true,
        isHoverTranslateEnabled: true,
        isAudioEnabled: true,
        theme: 'sunny',
        targetLanguage: 'hi' // Default to Hindi. Others: 'mr', 'gu', 'bn'
    });
    console.log("Web Assistant default settings initialized.");
});