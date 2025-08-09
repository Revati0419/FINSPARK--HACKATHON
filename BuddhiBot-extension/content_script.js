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
    tooltips: `<svg viewBox="0 0 24 24"><path d="M4 2h16v2H4zm4 14h8v-2H8v2zm-2 2h12v-2H6v2zm-4-6h2v-2H2v2zm0-4h2v-2H2v2zm2-4h2V6H4v2zm16 4h2v-2h-2v2zm0-4h2v-2h-2v2zm-2-4h2V6h-2v2z"/></svg>`,
    tooltips_off: `<svg viewBox="0 0 24 24"><path d="M2 12h2v-2H2v2zm4-4h2V6H6v2zm14 0h2v-2h-2v2zm-2 2h2v-2h-2v2zm-2 8h-8v-2h8v2zm2-2h-12v-2h12v2zm4-6h-2v-2h2v2zm-2-4V4H4v2H2V2h20v6h-2z"/></svg>`,
    close: `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
    send: `<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`,
    help: `<svg viewBox="0 0 24 24"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/></svg>`
};
const langMap = { 'hi': 'hi-IN', 'mr': 'mr-IN', 'gu': 'gu-IN', 'bn': 'bn-IN', 'ta': 'ta-IN', 'te': 'te-IN', 'en': 'en-US' };

// --- GLOBAL STATE & UI ELEMENT REFERENCES ---
let assistantState = {
    isBarEnabled: true, theme: 'sunny', language: 'en',
    audioMode: 'both', useCloudTTS: false, tooltipsEnabled: false,
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
            // These functions are now correctly loaded from their own files
            createAiPanel();
            if (assistantState.tooltipsEnabled) initAiTooltips();
            if (assistantState.formHelperEnabled) initFormHelper();
        }
        applyTheme(assistantState.theme);
    });
}

function createFloatingBar() {
    if (document.getElementById('assistant-pro-bar')) return;
    bar = document.createElement('div');
    bar.id = 'assistant-pro-bar';
    bar.innerHTML = `
        <button id="assistant-translate-btn" class="assistant-bar-btn" title="Translate Page">${ICONS.translate}</button>
        <button id="assistant-ai-btn" class="assistant-bar-btn" title="AI Assistant">${ICONS.ai}</button>
        <button id="assistant-audio-btn" class="assistant-bar-btn" title="Read Selection">${ICONS.audio}</button>
        <button id="assistant-settings-btn" class="assistant-bar-btn" title="Settings">${ICONS.settings}</button>
        <button id="assistant-tooltips-toggle-btn" class="assistant-bar-btn" title="Toggle AI Tooltips"></button>
    `;
    document.body.appendChild(bar);
    updateTooltipToggleButton(); // from ai.js
    addBarEventListeners();
    makeDraggable(bar);
}

function addBarEventListeners() {
    document.getElementById('assistant-translate-btn').addEventListener('click', handlePageTranslation);

    document.getElementById('assistant-ai-btn').addEventListener('click', () => {
        const selectedText = window.getSelection().toString().trim();
        aiPanel.classList.add('visible');
        showAiPanelTab('ai-chat-view'); // from ai.js
        if (selectedText) {
            const userInput = aiPanel.querySelector('#ai-user-input');
            const chatForm = aiPanel.querySelector('#ai-chat-form');
            userInput.value = `Explain this: "${selectedText}"`;
            aiPanel.querySelector('#ai-model-selector').value = 'explain';
            if (chatForm) chatForm.requestSubmit();
        } else {
            aiPanel.querySelector('#ai-model-selector').value = 'chat';
        }
    });

    // --- THIS IS THE NEW, FULLY FUNCTIONAL AUDIO BUTTON LOGIC ---
    document.getElementById('assistant-audio-btn').addEventListener('click', async () => {
        const selectedText = window.getSelection().toString().trim();
        if (!selectedText) {
            showNotification('Please select some text to read aloud.', true);
            return;
        }

        const targetLang = assistantState.language; // e.g., 'hi'
        const targetLangCode = langMap[targetLang] || langMap['en']; // e.g., 'hi-IN'

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

            } else { // 'both' mode - Play English, then Primary
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
    });

    document.getElementById('assistant-settings-btn').addEventListener('click', () => {
        aiPanel.classList.toggle('visible');
        showAiPanelTab('ai-settings-view'); // from ai.js
        renderSettingsPanel(); // from settings.js
    });

    document.getElementById('assistant-tooltips-toggle-btn').addEventListener('click', () => {
        assistantState.tooltipsEnabled = !assistantState.tooltipsEnabled;
        chrome.storage.sync.set({ tooltipsEnabled: assistantState.tooltipsEnabled }, () => {
            updateTooltipToggleButton(); // from ai.js
            if (assistantState.tooltipsEnabled) {
                initAiTooltips(); // from ai.js
            } else {
                destroyAiTooltips(); // from ai.js
            }
            showNotification(`AI Tooltips ${assistantState.tooltipsEnabled ? 'Enabled' : 'Disabled'}.`);
        });
    });
}

// --- TRANSLATION LOGIC ---
async function handlePageTranslation() {
    const translateBtn = document.getElementById('assistant-translate-btn');
    if (translateBtn.disabled) return;
    translateBtn.disabled = true;
    translateBtn.classList.add('processing');
    showNotification('Starting translation...');

    try {
        const textNodes = getTextNodes();
        if (textNodes.length === 0) {
            showNotification('No text found to translate.', true);
            return;
        }
        const selectedLanguage = assistantState.language;
        const CHUNK_SIZE = 40;
        for (let i = 0; i < textNodes.length; i += CHUNK_SIZE) {
            const chunk = textNodes.slice(i, i + CHUNK_SIZE);
            const combinedText = chunk.map(n => n.nodeValue).join('|||');
            // Calls the function from translator.js
            const translatedCombinedText = await translateText(combinedText, selectedLanguage);
            const translatedParts = translatedCombinedText.split('|||');
            chunk.forEach((node, index) => {
                if (translatedParts[index]) {
                    node.nodeValue = ` ${translatedParts[index].trim()} `;
                }
            });
            showNotification(`Translating... ${Math.round((i + chunk.length) / textNodes.length * 100)}%`);
        }
        showNotification('Page translation complete! 🎉');
    } catch (error) {
        console.error('Page translation failed:', error);
        showNotification(`Error: ${error.message}`, true);
    } finally {
        translateBtn.disabled = false;
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