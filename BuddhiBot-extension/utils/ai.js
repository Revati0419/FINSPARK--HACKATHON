// ✅ utils/ai.js
// This file manages the AI Panel's UI, chat logic, tooltips, and form helper.

function createAiPanel() {
    if (document.getElementById('assistant-pro-ai-panel')) return;
    aiPanel = document.createElement('div');
    aiPanel.id = 'assistant-pro-ai-panel';

    // The HTML for the voice controls STAYS HERE because it's part of the panel's layout.
    aiPanel.innerHTML = `
        <div class="ai-panel-header">
            <span class="ai-panel-title">AI Chat</span>
            <select id="ai-model-selector">
                <option value="chat">AI Chat</option>
                <option value="explain">Expert Explainer</option>
            </select>
            <button class="ai-panel-close-btn">${ICONS.close}</button>
        </div>
        <div id="ai-chat-view" class="ai-panel-view active">
            <div class="ai-panel-body"><div class="message bot"><p>Hello! How can I help you today?</p></div></div>
            <div class="ai-panel-footer">
                <form id="ai-chat-form">
                    <div class="voice-input-controls">
                        <button type="button" id="ai-mic-button" class="assistant-icon-btn" title="Voice Input">
                            <svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1.2-9.1c0-.66.54-1.2 1.2-1.2s1.2.54 1.2 1.2V9c0 .66-.54 1.2-1.2 1.2s-1.2-.54-1.2-1.2V4.9zm4.8 4.2c0 2.5-2.02 4.1-4.6 4.1s-4.6-1.6-4.6-4.1H5c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92h-1.4z"/></svg>
                        </button>
                        <select id="ai-voice-language-selector">
                            <option value="en-US">English</option>
                            <option value="mr-IN">Marathi</option>
                            <option value="hi-IN">Hindi</option>
                        </select>
                    </div>
                    <input type="text" id="ai-user-input" placeholder="Ask a question..." autocomplete="off">
                    <button type="submit" id="ai-send-button" title="Send">${ICONS.send}</button>
                </form>
            </div>
        </div>
        <div id="ai-settings-view" class="ai-panel-view"></div>
    `;
    document.body.appendChild(aiPanel);
    aiPanel.querySelector('.ai-panel-close-btn').addEventListener('click', () => aiPanel.classList.remove('visible'));

    // Attach event listeners
    addChatEventListeners();
    // This call now runs the function from our separate speech.js file, as defined in manifest.json
    initSpeechRecognition();
}

function addChatEventListeners() {
    const chatForm = aiPanel.querySelector('#ai-chat-form');
    const userInput = aiPanel.querySelector('#ai-user-input');
    const modelSelector = aiPanel.querySelector('#ai-model-selector');

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = userInput.value.trim();
        if (userMessage === '') return;

        addChatMessage(userMessage, 'user');
        userInput.value = '';
        const loadingMessage = addChatMessage('...', 'bot loading');
        const currentMode = modelSelector.value;
        let aiResponse = "Sorry, something went wrong.";

        try {
            // This correctly calls your local python backend
            const response = await fetch('http://127.0.0.1:5001', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage, mode: currentMode }),
            });
            if (!response.ok) throw new Error('AI backend failed');
            const data = await response.json();
            aiResponse = data.answer;

        } catch (error) {
            console.error('Error with AI backend:', error);
            aiResponse = "Sorry, I can't connect to the AI right now.";
        }

        loadingMessage.innerHTML = `<p>${aiResponse}</p>`;
        loadingMessage.classList.remove('loading');
    });
}

// --- The initSpeechRecognition function has been REMOVED from this file ---
// --- It now lives in its own dedicated utils/speech.js file ---


// --- ALL YOUR OTHER FUNCTIONS FOR AI.JS REMAIN BELOW ---

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