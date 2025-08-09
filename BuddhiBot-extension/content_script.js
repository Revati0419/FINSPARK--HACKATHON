
console.log("✅ [Web Assistant] Content script loaded on this page.");

// --- EMBEDDED SVGS for icons ---
// This object contains all your SVG icon data.
const ICONS = {
    translate: `<svg viewBox="0 0 24 24">...</svg>`,
    ai: `<svg viewBox="0 0 24 24">...</svg>`,
    audio: `<svg viewBox="0 0 24 24">...</svg>`,
    sunny: `<svg viewBox="0 0 24 24">...</svg>`,
    night: `<svg viewBox="0 0 24 24">...</svg>`,
    close: `<svg viewBox="0 0 24 24">...</svg>`,
    send: `<svg viewBox="0 0 24 24">...</svg>`,
    settings: `<svg viewBox="0 0 24 24">...</svg>`,
    help: `<svg viewBox="0 0 24 24">...</svg>`
};
let assistantState = {
    isBarEnabled: true,
    theme: 'sunny',
    language: 'en', // Default to English
    audioMode: 'both', // Default audio mode
    useCloudTTS: false, // New setting for high-quality voices
    tooltipsEnabled: false,
    formHelperEnabled: false
};

let bar, aiPanel, tooltip, formHelper;


// --- MAIN INITIALIZATION LOGIC ---
function init() {
    loadSettings();
}

function loadSettings() {
    chrome.storage.sync.get(Object.keys(assistantState), (result) => {
        // Merge saved settings, ensuring defaults exist for new features
        assistantState = { ...assistantState, ...result };
        
        if (assistantState.isBarEnabled) {
            createFloatingBar();
            createAiPanel();
            if (assistantState.tooltipsEnabled) initAiTooltips();
            if (assistantState.formHelperEnabled) initFormHelper();
        }
        applyTheme(assistantState.theme);
    });
}

// --- UI CREATION ---
function createFloatingBar() {
    if (document.getElementById('assistant-pro-bar')) return;
    bar = document.createElement('div');
    bar.id = 'assistant-pro-bar';
    bar.innerHTML = `
        <button id="assistant-translate-btn" class="assistant-bar-btn" title="Translate Page">${ICONS.translate}</button>
        <button id="assistant-ai-btn" class="assistant-bar-btn" title="AI Assistant">${ICONS.ai}</button>
        <button id="assistant-audio-btn" class="assistant-bar-btn" title="Read Selection">${ICONS.audio}</button>
        <button id="assistant-settings-btn" class="assistant-bar-btn" title="Settings">${ICONS.settings}</button>
        <button id="assistant-theme-btn" class="assistant-bar-btn" title="Toggle Theme"></button>
    `;
    document.body.appendChild(bar);
    addBarEventListeners();
    makeDraggable(bar);
}

function createAiPanel() {
    if (document.getElementById('assistant-pro-ai-panel')) return;
    aiPanel = document.createElement('div');
    aiPanel.id = 'assistant-pro-ai-panel';
    aiPanel.innerHTML = `
        <div class="ai-panel-header">
            <span class="ai-panel-title">AI Chat</span>
            <button class="ai-panel-close-btn">${ICONS.close}</button>
        </div>
        
        <!-- START: The Chat View with the full form -->
        <div id="ai-chat-view" class="ai-panel-view active">
            <div class="ai-panel-body">
                <div class="message bot"><p>Hello! How can I help you today?</p></div>
            </div>
            <div class="ai-panel-footer">
                <form id="ai-chat-form">
                    <input type="text" id="ai-user-input" placeholder="Ask a question..." autocomplete="off">
                    <button type="submit" id="ai-send-button" title="Send">${ICONS.send}</button>
                </form>
            </div>
        </div>
        <!-- END: The Chat View -->

        <!-- The Settings View (this can be empty, it's filled by renderSettingsPanel) -->
        <div id="ai-settings-view" class="ai-panel-view">
        </div>
    `;
    
    // Add the panel to the page
    document.body.appendChild(aiPanel);

    // Add listener for the panel's main close button
    aiPanel.querySelector('.ai-panel-close-btn').addEventListener('click', () => {
        aiPanel.classList.remove('visible');
    });

    // Now, this function will work because #ai-chat-form exists in the HTML above.
    addChatEventListeners();
}

// --- EVENT LISTENERS ---
function addBarEventListeners() {
    document.getElementById('assistant-translate-btn').addEventListener('click', handlePageTranslation);
    document.getElementById('assistant-ai-btn').addEventListener('click', () => { /* ... */ });
    
    // --- THIS IS THE NEW, COMPLETE AUDIO BUTTON LOGIC ---
    document.getElementById('assistant-audio-btn').addEventListener('click', async () => {
        const selectedText = window.getSelection().toString().trim();
        if (!selectedText) {
            showNotification('Please select text to read.', true);
            return;
        }

        const useCloud = assistantState.useCloudTTS;
        const mode = assistantState.audioMode;
        const lang = assistantState.language;
        const langCode = langMap[lang] || langMap['en'];

        // --- BRANCH 1: HIGH-QUALITY VOICE LOGIC ---
        if (useCloud) {
            let textToSpeak = selectedText;
            let langCodeToUse = langMap['en']; // Default to English voice

            // We translate the text first unless the mode is "English Only".
            if (mode !== 'english-only') {
                langCodeToUse = langCode; // Use the primary language voice
                if (lang !== 'en') {
                    textToSpeak = await translateText(selectedText, lang);
                }
            }
            
            if (textToSpeak && !textToSpeak.includes('[Translation Error]')) {
                playAudioWithCloudAPI(textToSpeak, langCodeToUse);
            }
        // --- BRANCH 2: STANDARD VOICE LOGIC ---
        } else {
            if (mode === 'both') {
                playAudioInSequence(selectedText, lang);
            } else if (mode === 'target-only') {
                const translatedText = await translateText(selectedText, lang);
                if(translatedText && !translatedText.includes('[Translation Error]')) {
                     playAudio(translatedText, lang);
                }
            } else if (mode === 'english-only') {
                playAudio(selectedText, 'en');
            }
        }
    });

    document.getElementById('assistant-settings-btn').addEventListener('click', () => {
        aiPanel.classList.toggle('visible');
        showAiPanelTab('ai-settings-view');
        renderSettingsPanel();
    });
    document.getElementById('assistant-theme-btn').addEventListener('click', toggleTheme);
}

function addChatEventListeners() {
    const chatForm = aiPanel.querySelector('#ai-chat-form');
    const userInput = aiPanel.querySelector('#ai-user-input');
    const BACKEND_URL = 'http://127.0.0.1:5001/chatbot';

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = userInput.value.trim();
        if (userMessage === '') return;
        addChatMessage(userMessage, 'user');
        userInput.value = '';
        const loadingMessage = addChatMessage('...', 'bot loading');
        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage }),
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            loadingMessage.innerHTML = `<p>${data.answer}</p>`;
            loadingMessage.classList.remove('loading');
        } catch (error) {
            console.error('Error connecting to the backend:', error);
            loadingMessage.innerHTML = `<p>Sorry, I can't connect. Please ensure the backend server is running.</p>`;
            loadingMessage.classList.remove('loading');
        }
    });
}

function addChatMessage(text, type) {
    const chatBody = aiPanel.querySelector('.ai-panel-body');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    if (type.includes('loading')) {
        messageDiv.innerHTML = `<span></span><span></span><span></span>`;
    } else {
        const p = document.createElement('p');
        p.textContent = text;
        messageDiv.appendChild(p);
    }
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
    return messageDiv;
}
// MODIFIED: Now a full settings panel renderer

// --- SETTINGS PANEL ---
function renderSettingsPanel() {
    const settingsView = document.getElementById('ai-settings-view');
    settingsView.innerHTML = `
        <div class="ai-panel-body settings-body">
            <h3>Settings</h3>
            
            <div class="setting-row">
                <label for="language-setting">Primary Language</label>
                <select id="language-setting">
                    <option value="en" ${assistantState.language === 'en' ? 'selected' : ''}>English</option>
                    <option value="hi" ${assistantState.language === 'hi' ? 'selected' : ''}>Hindi</option>
                    <option value="mr" ${assistantState.language === 'mr' ? 'selected' : ''}>Marathi</option>
                    <option value="bn" ${assistantState.language === 'bn' ? 'selected' : ''}>Bengali</option>
                    <option value="gu" ${assistantState.language === 'gu' ? 'selected' : ''}>Gujarati</option>
                    <option value="ta" ${assistantState.language === 'ta' ? 'selected' : ''}>Tamil</option>
                    <option value="te" ${assistantState.language === 'te' ? 'selected' : ''}>Telugu</option>
                </select>
            </div>

            <div class="setting-group">
                <label>Audio Playback Mode</label>
                <div class="radio-group">
                    <div class="radio-option"><input type="radio" id="audio-both" name="audio-mode" value="both" ${assistantState.audioMode === 'both' ? 'checked' : ''}><label for="audio-both">English, then Primary</label></div>
                    <div class="radio-option"><input type="radio" id="audio-target" name="audio-mode" value="target-only" ${assistantState.audioMode === 'target-only' ? 'checked' : ''}><label for="audio-target">Primary Language Only</label></div>
                    <div class="radio-option"><input type="radio" id="audio-english" name="audio-mode" value="english-only" ${assistantState.audioMode === 'english-only' ? 'checked' : ''}><label for="audio-english">English Only</label></div>
                </div>
            </div>

            <!-- NEW HIGH-QUALITY VOICE TOGGLE -->
            <div class="setting-row">
                <label for="cloud-tts-toggle">Enable High-Quality Voices</label>
                <label class="switch">
                    <input type="checkbox" id="cloud-tts-toggle" ${assistantState.useCloudTTS ? 'checked' : ''}>
                    <span class="slider round"></span>
                </label>
            </div>

            <div class="setting-row">
                <label for="tooltip-toggle">Enable AI Tooltips</label>
                <label class="switch"><input type="checkbox" id="tooltip-toggle" ${assistantState.tooltipsEnabled ? 'checked' : ''}><span class="slider round"></span></label>
            </div>

            <div class="setting-row">
                <label for="form-helper-toggle">Enable Form Helper</label>
                <label class="switch"><input type="checkbox" id="form-helper-toggle" ${assistantState.formHelperEnabled ? 'checked' : ''}><span class="slider round"></span></label>
            </div>
        </div>
        <div class="ai-panel-footer">
            <button id="save-settings-btn">Save and Apply</button>
        </div>
    `;
    addSettingsSaveListener();
}
function addSettingsSaveListener() {
    document.getElementById('save-settings-btn').addEventListener('click', () => {
        // Read all values from the UI
        assistantState.language = document.getElementById('language-setting').value;
        assistantState.audioMode = document.querySelector('input[name="audio-mode"]:checked').value;
        assistantState.useCloudTTS = document.getElementById('cloud-tts-toggle').checked;
        assistantState.tooltipsEnabled = document.getElementById('tooltip-toggle').checked;
        assistantState.formHelperEnabled = document.getElementById('form-helper-toggle').checked;

        // Save the entire updated state object
        chrome.storage.sync.set(assistantState, () => {
            console.log('ACTION: Settings saved. Cloud TTS enabled:', assistantState.useCloudTTS); 
            showNotification('Settings saved!');
            destroyUI();
            init();
        });
    });
}
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

        // --- THIS IS THE CORRECT WAY ---
        // It uses the language stored in the 'assistantState' object from your settings.
        const selectedLanguage = assistantState.language;

        const CHUNK_SIZE = 40;

        for (let i = 0; i < textNodes.length; i += CHUNK_SIZE) {
            const chunk = textNodes.slice(i, i + CHUNK_SIZE);
            const combinedText = chunk.map(n => n.nodeValue).join('|||');
            
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

// NEW: Shows the correct tab in the AI panel
function showAiPanelTab(tabId) {
    document.querySelectorAll('.ai-panel-view').forEach(view => view.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    const title = tabId === 'ai-settings-view' ? 'Settings' : 'AI Chat';
    aiPanel.querySelector('.ai-panel-title').textContent = title;
}



// NEW: Frontend logic for AI Tooltips
function initAiTooltips() {
    console.log("💡 AI Tooltips Enabled");
    document.body.addEventListener('mouseover', handleTooltipMouseOver);
    document.body.addEventListener('mouseout', handleTooltipMouseOut);
}

async function handleTooltipMouseOver(e) {
    const target = e.target.closest('a, button, input, [role="button"], [role="link"]');
    if (!target) return;

    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'assistant-pro-tooltip';
        document.body.appendChild(tooltip);
    }
    
    const textContent = target.textContent.trim() || target.placeholder || target.name || 'this element';
    tooltip.innerHTML = '<i>AI is thinking...</i>';
    tooltip.style.display = 'block';
    updateTooltipPosition(e);

    // Call the mock backend function for now
    const explanation = await getAIExplanation(textContent);
    tooltip.textContent = explanation;
    updateTooltipPosition(e);
}

function handleTooltipMouseOut() {
    if (tooltip) tooltip.style.display = 'none';
}

function updateTooltipPosition(e) {
    if (!tooltip) return;
    tooltip.style.left = `${e.pageX + 15}px`;
    tooltip.style.top = `${e.pageY + 15}px`;
}

// NEW: Frontend logic for Form Helper
function initFormHelper() {
    console.log("✍️ Form Helper Enabled");
    document.body.addEventListener('focusin', handleFormFocus);
}

function handleFormFocus(e) {
    const input = e.target.closest('input, textarea, select');
    if (!input) {
        if (formHelper) formHelper.remove();
        formHelper = null;
        return;
    }
    const form = input.closest('form');
    if (!form) return;

    if (!formHelper) {
        formHelper = document.createElement('div');
        formHelper.id = 'assistant-pro-form-helper';
        document.body.appendChild(formHelper);
    }
    
    // Simple frontend implementation
    const label = form.querySelector(`label[for="${input.id}"]`);
    formHelper.innerHTML = `
        <div class="form-helper-header">${ICONS.help} Form Helper</div>
        <div class="form-helper-body">
            <p><strong>Current Field:</strong> ${label ? label.textContent : (input.name || 'Unnamed Field')}</p>
            <p><strong>Type:</strong> ${input.type || 'text'}</p>
        </div>
    `;
    // Position helper next to the form
    const formRect = form.getBoundingClientRect();
    formHelper.style.top = `${formRect.top + window.scrollY}px`;
    formHelper.style.left = `${formRect.right + window.scrollX + 10}px`;
}

























// --- NEW HELPER & TRANSLATION FUNCTIONS ---

function getTextNodes() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: node => {
            const parentTag = node.parentNode.nodeName.toUpperCase();
            if (parentTag === 'SCRIPT' || parentTag === 'STYLE' || parentTag === 'NOSCRIPT' || node.parentNode.closest('#assistant-pro-bar, #assistant-pro-ai-panel')) {
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


// --- EXISTING HELPER FUNCTIONS ---
function toggleTheme() {
    chrome.storage.sync.get('theme', (result) => {
        const newTheme = result.theme === 'sunny' ? 'night' : 'sunny';
        chrome.storage.sync.set({ theme: newTheme }, () => applyTheme(newTheme));
    });
}

function applyTheme(theme) {
    const themeIconBtn = document.getElementById('assistant-theme-btn');
    const elementsToTheme = document.querySelectorAll('#assistant-pro-bar, #assistant-pro-ai-panel');
    if (theme === 'night') {
        document.body.classList.add('assistant-night-mode');
        elementsToTheme.forEach(el => el.classList.add('night-theme'));
        if (themeIconBtn) themeIconBtn.innerHTML = ICONS.sunny;
    } else {
        document.body.classList.remove('assistant-night-mode');
        elementsToTheme.forEach(el => el.classList.remove('night-theme'));
        if (themeIconBtn) themeIconBtn.innerHTML = ICONS.night;
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
    bar = null;
    aiPanel = null;
}

// --- CHROME MESSAGE LISTENER ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleBar') {
        if (request.isEnabled) {
            init();
        } else {
            destroyUI();
        }
    }
});

// --- RUN SCRIPT ---
init();