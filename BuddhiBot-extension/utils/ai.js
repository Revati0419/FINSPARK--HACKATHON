
function createAiPanel() {
    if (document.getElementById('assistant-pro-ai-panel')) return;
    aiPanel = document.createElement('div');
    aiPanel.id = 'assistant-pro-ai-panel';

    // --- THIS IS THE FIX ---
    // The <select id="ai-language-selector"> has been completely removed from the header.
    aiPanel.innerHTML = `
        <div class="ai-panel-header">
            <span class="ai-panel-title">AI Assistant</span>
            <select id="ai-model-selector">
                <option value="chat">AI Chat</option>
                <option value="explain">Expert Explainer</option>
            </select>
            <button class="ai-panel-close-btn">${ICONS.close}</button>
        </div>
        <div id="ai-chat-view" class="ai-panel-view active">
            <div class="ai-panel-body">
                <!-- The greeting will now be set dynamically -->
            </div>
            <div class="ai-panel-footer">
                <form id="ai-chat-form">
                    <div class="voice-input-controls">
                        <button type="button" id="ai-mic-button" class="assistant-icon-btn" title="Voice Input">
                            <svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1.2-9.1c0-.66.54-1.2 1.2-1.2s1.2.54 1.2 1.2V9c0 .66-.54 1.2-1.2 1.2s-1.2-.54-1.2-1.2V4.9zm4.8 4.2c0 2.5-2.02 4.1-4.6 4.1s-4.6-1.6-4.6-4.1H5c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92h-1.4z"/></svg>
                        </button>
                    </div>
                    <input type="text" id="ai-user-input" placeholder="Ask a question..." autocomplete="off">
                    <button type="submit" id="ai-send-button" title="Send">${ICONS.send}</button>
                </form>
            </div>
        </div>
        <div id="ai-settings-view" class="ai-panel-view"></div>
    `;
    // ... The rest of the function remains the same ...
    document.body.appendChild(aiPanel);
    aiPanel.querySelector('.ai-panel-close-btn').addEventListener('click', () => aiPanel.classList.remove('visible'));
    addChatEventListeners();
    initSpeechRecognition();
}


// In utils/ai.js

function addChatEventListeners() {
    const chatForm = aiPanel.querySelector('#ai-chat-form');
    const userInput = aiPanel.querySelector('#ai-user-input');
    // REMOVED: const langSelector is no longer needed.
    const modelSelector = aiPanel.querySelector('#ai-model-selector');
    const BACKEND_URL = 'http://127.0.0.1:5001/chatbot';

    // Greetings now use the BCP-47 codes for consistency
    const GREETINGS = {
        'en-US': 'Hello! How can I help you with your banking questions?',
        'mr-IN': 'नमस्कार! मी तुमच्या बँकिंग प्रश्नांसाठी कशी मदत करू शकते?',
        'hi-IN': 'नमस्ते! मैं आपके बैंकिंग संबंधी प्रश्नों में कैसे मदद कर सकती हूँ?',
        'bn-IN': 'নমস্কার! আমি আপনার ব্যাংকিং সংক্রান্ত প্রশ্নে কিভাবে সাহায্য করতে পারি?',
        'gu-IN': 'নમસ્તે! હું તમારા બેંકિંગ સંબંધિત પ્રશ્નોમાં કેવી રીતે મદદ કરી શકું?'
    };

    // --- NEW: A global function to set the greeting based on the central state ---
    // This will be called when the panel is opened or when settings are saved.
    window.setAiPanelGreeting = () => {
        const chatBody = aiPanel.querySelector('.ai-panel-body');
        chatBody.innerHTML = ''; // Clear conversation
        // Reads the primary language from the GLOBAL assistantState (e.g., 'hi')
        const currentLang = assistantState.language; 
        // Converts it to the code the backend needs (e.g., 'hi-IN')
        const currentLangCode = langMap[currentLang] || langMap['en'];
        const greeting = GREETINGS[currentLangCode] || GREETINGS['en-US'];
        addChatMessage(greeting, 'bot');
    };

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = userInput.value.trim();
        if (userMessage === '') return;

        // --- MODIFIED: Reads the language directly from the global assistantState ---
        const currentLang = assistantState.language;
        const selectedLangCode = langMap[currentLang] || langMap['en'];
        const currentMode = modelSelector.value;

        addChatMessage(userMessage, 'user');
        userInput.value = '';
        const loadingMessage = addChatMessage('...', 'bot loading');
        let aiResponse = "Sorry, something went wrong.";

        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    language: selectedLangCode, // Send the correct BCP-47 code
                    mode: currentMode
                }),
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            aiResponse = data.answer;
        } catch (error) {
            console.error('Error connecting to the backend:', error);
aiResponse = `Sorry, I can't connect. Error: ${error.message}`;
        }

        loadingMessage.innerHTML = `<p>${aiResponse}</p>`;
        loadingMessage.classList.remove('loading');
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

function showAiPanelTab(tabId) {
    const panelTitle = aiPanel.querySelector('.ai-panel-title');
    const modelSelector = aiPanel.querySelector('#ai-model-selector');
    document.querySelectorAll('.ai-panel-view').forEach(view => view.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    if (tabId === 'ai-settings-view') {
        panelTitle.textContent = 'Settings';
        modelSelector.style.display = 'none';
    } else {
        panelTitle.textContent = 'AI Chat';
        modelSelector.style.display = 'block';
    }
}

// --- AI Tooltips Logic ---
function initAiTooltips() {
    console.log("💡 AI Tooltips Enabled");
    document.body.addEventListener('mouseover', handleTooltipMouseOver);
    document.body.addEventListener('mouseout', handleTooltipMouseOut);
}

function destroyAiTooltips() {
    console.log("💡 AI Tooltips Disabled");
    document.body.removeEventListener('mouseover', handleTooltipMouseOver);
    document.body.removeEventListener('mouseout', handleTooltipMouseOut);
    if (tooltip) {
        tooltip.remove();
        tooltip = null;
    }
}

async function handleTooltipMouseOver(e) {
    const target = e.target.closest('a, button, input, [role="button"], [role="link"]');
    if (!target) return;
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'assistant-pro-tooltip';
        document.body.appendChild(tooltip);
        applyTheme(assistantState.theme); // Apply theme when created
    }
    const textContent = target.textContent.trim() || target.placeholder || target.name || 'this element';
    tooltip.innerHTML = '<i>AI is thinking...</i>';
    tooltip.style.display = 'block';
    updateTooltipPosition(e);
    // This is where you would call your AI service for an explanation
    const explanation = "This is a placeholder AI explanation.";
    tooltip.textContent = explanation;
    updateTooltipPosition(e);
}

function handleTooltipMouseOut() {
    if (tooltip) tooltip.style.display = 'none';
}

function updateTooltipToggleButton() {
    const btn = document.getElementById('assistant-tooltips-toggle-btn');
    if (btn) {
        btn.innerHTML = assistantState.tooltipsEnabled ? ICONS.tooltips : ICONS.tooltips_off;
        btn.title = assistantState.tooltipsEnabled ? "Disable AI Tooltips" : "Enable AI Tooltips";
    }
}

function updateTooltipPosition(e) {
    if (!tooltip) return;
    tooltip.style.left = `${e.pageX + 15}px`;
    tooltip.style.top = `${e.pageY + 15}px`;
}

// --- Form Helper Logic ---
function initFormHelper() {
    console.log("✍️ Form Helper Enabled");
    document.body.addEventListener('focusin', handleFormFocus);
    document.body.addEventListener('focusout', () => {
        if(formHelper) formHelper.remove();
        formHelper = null;
    });
}

function handleFormFocus(e) {
    const input = e.target.closest('input, textarea, select');
    if (!input || input.type === 'hidden' || input.type === 'submit') return;
    const form = input.closest('form');
    if (!form) return;
    if (!formHelper) {
        formHelper = document.createElement('div');
        formHelper.id = 'assistant-pro-form-helper';
        document.body.appendChild(formHelper);
        applyTheme(assistantState.theme); // Apply theme when created
    }
    const label = form.querySelector(`label[for="${input.id}"]`);
    formHelper.innerHTML = `
        <div class="form-helper-header">${ICONS.help} Form Helper</div>
        <div class="form-helper-body">
            <p><strong>Field:</strong> ${label ? label.textContent : (input.name || 'Unnamed')}</p>
            <p><strong>Type:</strong> ${input.type || 'text'}</p>
        </div>
    `;
    const formRect = form.getBoundingClientRect();
    formHelper.style.top = `${formRect.top + window.scrollY}px`;
    formHelper.style.left = `${formRect.right + window.scrollX + 10}px`;
}