console.log("✅ [Web Assistant] Content script loaded on this page.")

// --- EMBEDDED SVGS for icons ---
const ICONS = {
    translate: `<svg viewBox="0 0 24 24"><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>`,
    ai: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15.61c-1.94-.42-3.53-1.49-4.59-2.92l1.62-1.22c.67.93 1.6 1.63 2.76 2.05v2.09zm-3.41-5.69c-.2-.62-.3-1.27-.3-1.92s.1-1.3.3-1.92l-1.61-1.23c-.53 1.03-.89 2.18-.98 3.4h2.59zm6.82 5.69v-2.09c1.16-.42 2.09-1.12 2.76-2.05l1.62 1.22c-1.06 1.43-2.65 2.5-4.59 2.92zm2.59-4.39c.2-.62.3-1.27.3-1.92s-.1-1.3-.3-1.92l1.61-1.23c.53 1.03.89 2.18.98 3.4h-2.59zM12 6c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`,
    audio: `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`,
    sunny: `<svg viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.64 5.64c.39.39 1.02.39 1.41 0s.39-1.02 0-1.41L5.64 2.81c-.39-.39-1.02-.39-1.41 0s-.39 1.02 0 1.41l1.41 1.42zm12.72 12.72c.39.39 1.02.39 1.41 0s.39-1.02 0-1.41l-1.41-1.42c-.39-.39-1.02-.39-1.41 0s-.39 1.02 0 1.41l1.41 1.42zM2.81 18.36c.39.39 1.02.39 1.41 0s.39-1.02 0-1.41l-1.42-1.41c-.39-.39-1.02-.39-1.41 0s-.39 1.02 0 1.41l1.42 1.41z"/></svg>`,
    night: `<svg viewBox="0 0 24 24"><path d="M9.37 5.51A7.35 7.35 0 009.1 7.5c0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27C17.45 17.19 14.93 19 12 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49z"/></svg>`,
    close: `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
    send: `<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`,
    // NEW: Icons for new features
    settings: `<svg viewBox="0 0 24 24"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2 3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>`,
    help: `<svg viewBox="0 0 24 24"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/></svg>`
};
let assistantState = {
    isBarEnabled: true,
    theme: 'sunny',
    language: 'hi',
    tooltipsEnabled: false,
    formHelperEnabled: false
};

let bar, aiPanel, tooltip, formHelper; // To hold references to the DOM elements

// --- MAIN INITIALIZATION LOGIC ---
function init() {
    loadSettings();
}

function loadSettings() {
    chrome.storage.sync.get(Object.keys(assistantState), (result) => {
        // Merge saved settings with defaults
        console.log('ACTION: Loading settings from storage. Saved language was:', result.language);
        assistantState = { ...assistantState, ...result };
        
        if (assistantState.isBarEnabled) {
            createFloatingBar();
            createAiPanel();
            // NEW: Initialize features based on loaded settings
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
    // MODIFIED: Removed language selector, added settings button
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
    // MODIFIED: Moved settings panel logic into its own function
    aiPanel.innerHTML = `
        <div class="ai-panel-header">
            <span class="ai-panel-title">AI Chat</span>
            <button class="ai-panel-close-btn">${ICONS.close}</button>
        </div>
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
        <div id="ai-settings-view" class="ai-panel-view">
            </div>
    `;
    document.body.appendChild(aiPanel);

    aiPanel.querySelector('.ai-panel-close-btn').addEventListener('click', () => {
        aiPanel.classList.remove('visible');
    });
    addChatEventListeners();
}

// --- EVENT LISTENERS ---
function addBarEventListeners() {
    document.getElementById('assistant-translate-btn').addEventListener('click', handlePageTranslation);
    document.getElementById('assistant-ai-btn').addEventListener('click', () => {
        aiPanel.classList.toggle('visible');
        showAiPanelTab('ai-chat-view'); // Default to chat view
    });
    // MODIFIED: Audio button now reads selected text
    document.getElementById('assistant-audio-btn').addEventListener('click', () => {
        const selectedText = window.getSelection().toString().trim();
        if (selectedText) {
            playAudio(selectedText, assistantState.language);
        } else {
            showNotification('Please select text to read.', true);
        }
    });
    document.getElementById('assistant-settings-btn').addEventListener('click', () => {
        aiPanel.classList.toggle('visible');
        showAiPanelTab('ai-settings-view'); // Show settings view
        renderSettingsPanel(); // Render settings content
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
function renderSettingsPanel() {
    const settingsView = document.getElementById('ai-settings-view');
    settingsView.innerHTML = `
        <div class="ai-panel-body settings-body">
            <h3>Settings</h3>
            
            <div class="setting-row">
                <label for="language-setting">Primary Language</label>
                <select id="language-setting">
                    <option value="hi" ${assistantState.language === 'hi' ? 'selected' : ''}>Hindi</option>
                    <option value="mr" ${assistantState.language === 'mr' ? 'selected' : ''}>Marathi</option>
                    <option value="bn" ${assistantState.language === 'bn' ? 'selected' : ''}>Bengali</option>
                    <option value="gu" ${assistantState.language === 'gu' ? 'selected' : ''}>Gujarati</option>
                    <option value="ta" ${assistantState.language === 'ta' ? 'selected' : ''}>Tamil</option>
                    <option value="te" ${assistantState.language === 'te' ? 'selected' : ''}>Telugu</option>
                </select>
            </div>

            <div class="setting-row">
                <label for="tooltip-toggle">Enable AI Tooltips</label>
                <label class="switch">
                    <input type="checkbox" id="tooltip-toggle" ${assistantState.tooltipsEnabled ? 'checked' : ''}>
                    <span class="slider round"></span>
                </label>
            </div>

            <div class="setting-row">
                <label for="form-helper-toggle">Enable Form Helper</label>
                <label class="switch">
                    <input type="checkbox" id="form-helper-toggle" ${assistantState.formHelperEnabled ? 'checked' : ''}>
                    <span class="slider round"></span>
                </label>
            </div>
        </div>
        <div class="ai-panel-footer">
            <button id="save-settings-btn">Save and Apply</button>
        </div>
    `;

    // Add event listener for the save button
    document.getElementById('save-settings-btn').addEventListener('click', () => {
        // Update state from UI
        assistantState.language = document.getElementById('language-setting').value;
        assistantState.tooltipsEnabled = document.getElementById('tooltip-toggle').checked;
        assistantState.formHelperEnabled = document.getElementById('form-helper-toggle').checked;

        // Save to chrome storage
        chrome.storage.sync.set(assistantState, () => {
            console.log('ACTION: Settings saved. Language is now:', assistantState.language); 
            showNotification('Settings saved!');
            // Reload the extension's features
            destroyUI();
            init();
        });
    });
}
// Make sure this is the ONLY handlePageTranslation function in your file.
// It should be located around line 219.
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