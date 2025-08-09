// ✅ [Web Assistant] content_script.js (Main Controller)
// This script handles initialization, state management, and core UI creation.

console.log("✅ [Web Assistant] Content script loaded on this page.");
// ADD THIS LINE

// --- ICONS & CONFIGURATION ---
const ICONS = {
    translate: `<svg viewBox="0 0 24 24"><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>`,
    explain: `<svg viewBox="0 0 24 24"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/></svg>`,
    ai: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15.61c-1.94-.42-3.53-1.49-4.59-2.92l1.62-1.22c.67.93 1.6 1.63 2.76 2.05v2.09zm-3.41-5.69c-.2-.62-.3-1.27-.3-1.92s.1-1.3.3-1.92l-1.61-1.23c-.53 1.03-.89 2.18-.98 3.4h2.59zm6.82 5.69v-2.09c1.16-.42 2.09-1.12 2.76-2.05l1.62 1.22c-1.06 1.43-2.65 2.5-4.59 2.92zm2.59-4.39c.2-.62.3-1.27.3-1.92s-.1-1.3-.3-1.92l1.61-1.23c.53 1.03.89 2.18.98 3.4h-2.59zM12 6c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`,
    audio: `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`,
    settings: `<svg viewBox="0 0 24 24"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69-.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19-.15-.24-.42-.12-.64l2 3.46c.12.22.39.3.61-.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2 3.46c.12-.22-.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>`,
    mic: `<svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1.2-9.1c0-.66.54-1.2 1.2-1.2s1.2.54 1.2 1.2V9c0 .66-.54 1.2-1.2 1.2s-1.2-.54-1.2-1.2V4.9zm4.8 4.2c0 2.5-2.02 4.1-4.6 4.1s-4.6-1.6-4.6-4.1H5c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92h-1.4z"/></svg>`,

    close: `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
    send: `<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`,
    help: `<svg viewBox="0 0 24 24"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/></svg>`
};
const langMap = { 'hi': 'hi-IN', 'mr': 'mr-IN', 'gu': 'gu-IN', 'bn': 'bn-IN', 'ta': 'ta-IN', 'te': 'te-IN', 'en': 'en-US' };

// --- GLOBAL STATE & UI ELEMENT REFERENCES ---
let assistantState = {
    isBarEnabled: true, theme: 'sunny', language: 'en',
    audioMode: 'both', useCloudTTS: false, 
    formHelperEnabled: false
};
let bar, aiPanel, tooltip, formHelper;

// --- INITIALIZATION ---
function init() {
    loadSettings();
}

function loadSettings() {
    chrome.storage.sync.get(Object.keys(assistantState), (result) => {
        assistantState = { ...assistantState, ...result };
        if (assistantState.isBarEnabled) {
            createFloatingBar();
            createAiPanel(); // from ai.js
        }
        applyTheme(assistantState.theme);
    });
}

function createFloatingBar() {
    if (document.getElementById('assistant-pro-bar')) return;
    bar = document.createElement('div');
    bar.id = 'assistant-pro-bar';
    // --- MODIFIED: Replaced the tooltip button with the new microphone button ---
    bar.innerHTML = `
        <button id="assistant-translate-btn" class="assistant-bar-btn" title="Translate Page">${ICONS.translate}</button>
        <button id="assistant-ai-btn" class="assistant-bar-btn" title="AI Assistant">${ICONS.ai}</button>
        <button id="assistant-audio-btn" class="assistant-bar-btn" title="Read Selection">${ICONS.audio}</button>
        <button id="assistant-settings-btn" class="assistant-bar-btn" title="Settings">${ICONS.settings}</button>
        <button id="assistant-mic-btn" class="assistant-bar-btn" title="Voice Input">${ICONS.mic}</button>
    `;
    document.body.appendChild(bar);
    addBarEventListeners();
    makeDraggable(bar);
}

// ✅ In content_script.js

/**
 * This function's only job is to attach the correct handler to each button on the floating bar.
 */
function addBarEventListeners() {
    document.getElementById('assistant-translate-btn').addEventListener('click', handlePageTranslation);
    document.getElementById('assistant-ai-btn').addEventListener('click', handleAiButtonClick);
    document.getElementById('assistant-audio-btn').addEventListener('click', handleAudioButtonClick);
    document.getElementById('assistant-settings-btn').addEventListener('click', handleSettingsButtonClick);
    document.getElementById('assistant-mic-btn').addEventListener('click', handleGlobalVoiceInput); // This calls the function from speech.js
}


/**
 * This function contains the logic for what happens when the AI button is clicked.
 */
function handleAiButtonClick() {
    const selectedText = window.getSelection().toString().trim();
    
    // Ensure the panel is created if it doesn't exist yet
    if (!aiPanel) createAiPanel();
    
    aiPanel.classList.add('visible');
    showAiPanelTab('ai-chat-view'); // from ai.js

    // Set the correct greeting every time the panel is opened
    if (window.setAiPanelGreeting) {
        window.setAiPanelGreeting();
    }

    // If the user has selected text, pre-fill the input and set to "Expert Explainer" mode
    if (selectedText) {
        const userInput = aiPanel.querySelector('#ai-user-input');
        const chatForm = aiPanel.querySelector('#ai-chat-form');
        userInput.value = `Explain this: "${selectedText}"`;
        aiPanel.querySelector('#ai-model-selector').value = 'explain';
        // Automatically submit the form to get the explanation
        if (chatForm) chatForm.requestSubmit();
    } else {
        // If no text is selected, default to standard "AI Chat" mode
        aiPanel.querySelector('#ai-model-selector').value = 'chat';
    }
}


/**
 * This function contains the logic for what happens when the Settings button is clicked.
 */
function handleSettingsButtonClick() {
    if (!aiPanel) createAiPanel();
    aiPanel.classList.toggle('visible');
    showAiPanelTab('ai-settings-view'); // from ai.js
    renderSettingsPanel(); // from settings.js
}


/**
 * This function contains the full logic for the Text-to-Speech "Read Selection" button.
 */
async function handleAudioButtonClick() {
    const selectedText = window.getSelection().toString().trim();
    if (!selectedText) {
        showNotification('Please select some text to read aloud.', true);
        return;
    }

    // Get the primary language from the global state (e.g., 'hi')
    const targetLang = assistantState.language; 
    // Convert it to the code the API needs (e.g., 'hi-IN')
    const targetLangCode = langMap[targetLang] || langMap['en'];

    // --- Logic for HIGH-QUALITY (Cloud) Voices ---
    if (assistantState.useCloudTTS) {
        showNotification('Using high-quality voice...');
        if (assistantState.audioMode === 'english-only') {
            playAudioWithCloudAPI(selectedText, 'en-US');

        } else if (assistantState.audioMode === 'target-only') {
            const translatedText = await translateText(selectedText, targetLang);
            if (translatedText && !translatedText.includes('[Error]')) {
                playAudioWithCloudAPI(translatedText, targetLangCode);
            }

        } else { // 'both' mode: Play English, then the Primary language
            const englishAudio = await getCloudAudio(selectedText, 'en-US');
            if (englishAudio) {
                englishAudio.play();
                // When the English audio finishes, play the translated version
                englishAudio.onended = async () => {
                    if (targetLang !== 'en') {
                        const translatedText = await translateText(selectedText, targetLang);
                        if (translatedText && !translatedText.includes('[Error]')) {
                            playAudioWithCloudAPI(translatedText, targetLangCode);
                        }
                    }
                };
            }
        }
    // --- Logic for STANDARD (Browser) Voices ---
    } else {
        showNotification('Using standard browser voice...');
        if (assistantState.audioMode === 'english-only') {
            playAudioWithBrowser(selectedText, 'en');

        } else if (assistantState.audioMode === 'target-only') {
            const translatedText = await translateText(selectedText, targetLang);
            if (translatedText && !translatedText.includes('[Error]')) {
                playAudioWithBrowser(translatedText, targetLang);
            }

        } else { // 'both' mode
            // This function from audio.js handles the sequence automatically for browser voices
            playAudioInSequence(selectedText, targetLang);
        }
    }
}

    



async function handlePageTranslation() {
    const translateBtn = document.getElementById('assistant-translate-btn');
    if (translateBtn.classList.contains('processing')) return; // Prevent multiple clicks

    // --- THIS IS THE KEY CHANGE ---
    // Instead of disabling, we add the .processing class
    translateBtn.classList.add('processing'); 
    
    // We still show notifications for status updates
    showNotification('Processing page text...');

    try {
        const textNodes = getTextNodes();
        if (textNodes.length === 0) {
            showNotification('No text found to translate.', true);
            return;
        }

        const selectedLanguage = assistantState.language;
        const separator = '|||---|||';
        const MAX_CHUNK_LENGTH = 4000;
        const textChunks = [];
        const nodeMap = [];
        let currentChunk = [];
        let currentChunkNodes = [];

        for (const node of textNodes) {
            currentChunk.push(node.nodeValue);
            currentChunkNodes.push(node);
            if (currentChunk.join(separator).length > MAX_CHUNK_LENGTH) {
                textChunks.push(currentChunk.join(separator));
                nodeMap.push(currentChunkNodes);
                currentChunk = [];
                currentChunkNodes = [];
            }
        }
        if (currentChunk.length > 0) {
            textChunks.push(currentChunk.join(separator));
            nodeMap.push(currentChunkNodes);
        }

        showNotification(`Translating ${textChunks.length} batches...`);
        const translationPromises = textChunks.map(chunk => translateText(chunk, selectedLanguage));
        const translatedChunks = await Promise.all(translationPromises);
        
        if (translatedChunks.some(c => c.includes('[Error]'))) {
            throw new Error("One or more translation batches failed.");
        }
        
        for (let i = 0; i < translatedChunks.length; i++) {
            const translatedParts = translatedChunks[i].split(separator);
            const originalNodes = nodeMap[i];
            if (translatedParts.length === originalNodes.length) {
                originalNodes.forEach((node, index) => {
                    node.nodeValue = ` ${translatedParts[index].trim()} `;
                });
            } else {
                console.warn(`Mismatch in chunk ${i}. Original: ${originalNodes.length}, Translated: ${translatedParts.length}.`);
            }
        }
        showNotification('Page translation complete! 🎉');

    } catch (error) {
        console.error('Page translation failed:', error);
        showNotification(`Error: ${error.message}`, true);
    } finally {
        // --- THIS IS THE OTHER KEY CHANGE ---
        // We remove the .processing class to restore the button's original state
        translateBtn.classList.remove('processing');
    }
}
// --- HELPER FUNCTIONS (SHARED) ---
function getTextNodes() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: node => {
            if (node.parentNode.closest('#assistant-pro-bar, #assistant-pro-ai-panel')) {
                return NodeFilter.FILTER_REJECT;
            }
            const parentTag = node.parentNode.nodeName.toUpperCase();
            if (parentTag === 'SCRIPT' || parentTag === 'STYLE' || parentTag === 'NOSCRIPT') {
                return NodeFilter.FILTER_REJECT;
            }
            if (!node.nodeValue.trim()) {
                return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
        }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    return nodes;
}

function showNotification(message, isError = false) {
    let notification = document.querySelector('.assistant-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'assistant-notification';
        document.body.appendChild(notification);
    }
    notification.textContent = message;
    notification.className = `assistant-notification visible ${isError ? 'error' : ''}`;
    setTimeout(() => notification.classList.remove('visible'), 4000);
}

function applyTheme(theme) {
    const elementsToTheme = document.querySelectorAll('#assistant-pro-bar, #assistant-pro-ai-panel, #assistant-pro-tooltip, #assistant-pro-form-helper');
    assistantState.theme = theme;
    if (theme === 'night') {
        document.documentElement.classList.add('assistant-night-theme-html');
        elementsToTheme.forEach(el => el && el.classList.add('night-theme'));
    } else {
        document.documentElement.classList.remove('assistant-night-theme-html');
        elementsToTheme.forEach(el => el && el.classList.remove('night-theme'));
    }
}

function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    element.onmousedown = dragMouseDown;
    function dragMouseDown(e) { e.preventDefault(); pos3 = e.clientX; pos4 = e.clientY; document.onmouseup = closeDragElement; document.onmousemove = elementDrag; }
    function elementDrag(e) { e.preventDefault(); pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY; pos3 = e.clientX; pos4 = e.clientY; element.style.top = (element.offsetTop - pos2) + "px"; element.style.left = (element.offsetLeft - pos1) + "px"; }
    function closeDragElement() { document.onmouseup = null; document.onmousemove = null; }
}

function destroyUI() {
    if (bar) bar.remove();
    if (aiPanel) aiPanel.remove();
    if (tooltip) tooltip.remove();
    if (formHelper) formHelper.remove();
    bar = aiPanel = tooltip = formHelper = null;
}

// --- CHROME MESSAGE LISTENER ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleBar') {
        assistantState.isBarEnabled = request.isEnabled;
        if (request.isEnabled) {
            init();
        } else {
            destroyUI();
        }
    }
});

// --- RUN SCRIPT ---
init();