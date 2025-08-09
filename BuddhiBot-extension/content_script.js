// --- EMBEDDED SVGS for icons ---
console.log("✅ [Web Assistant] Content script loaded on this page.")

const ICONS = {
    translate: `<svg viewBox="0 0 24 24"><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>`,
    ai: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15.61c-1.94-.42-3.53-1.49-4.59-2.92l1.62-1.22c.67.93 1.6 1.63 2.76 2.05v2.09zm-3.41-5.69c-.2-.62-.3-1.27-.3-1.92s.1-1.3.3-1.92l-1.61-1.23c-.53 1.03-.89 2.18-.98 3.4h2.59zm6.82 5.69v-2.09c1.16-.42 2.09-1.12 2.76-2.05l1.62 1.22c-1.06 1.43-2.65 2.5-4.59 2.92zm2.59-4.39c.2-.62.3-1.27.3-1.92s-.1-1.3-.3-1.92l1.61-1.23c.53 1.03.89 2.18.98 3.4h-2.59zM12 6c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`,
    audio: `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`,
    sunny: `<svg viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.64 5.64c.39.39 1.02.39 1.41 0s.39-1.02 0-1.41L5.64 2.81c-.39-.39-1.02-.39-1.41 0s-.39 1.02 0 1.41l1.41 1.42zm12.72 12.72c.39.39 1.02.39 1.41 0s.39-1.02 0-1.41l-1.41-1.42c-.39-.39-1.02-.39-1.41 0s-.39 1.02 0 1.41l1.41 1.42zM2.81 18.36c.39.39 1.02.39 1.41 0s.39-1.02 0-1.41l-1.42-1.41c-.39-.39-1.02-.39-1.41 0s-.39 1.02 0 1.41l1.42 1.41z"/></svg>`,
    night: `<svg viewBox="0 0 24 24"><path d="M9.37 5.51A7.35 7.35 0 009.1 7.5c0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27C17.45 17.19 14.93 19 12 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49z"/></svg>`,
    close: `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
    send: `<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`
};

let bar, aiPanel;

function init() {
    chrome.storage.sync.get(['isBarEnabled', 'theme'], (result) => {
        if (result.isBarEnabled) {
            createFloatingBar();
            createAiPanel();
        }
        applyTheme(result.theme || 'sunny');
    });
}

function createFloatingBar() {
    if (document.getElementById('assistant-pro-bar')) return;
    bar = document.createElement('div');
    bar.id = 'assistant-pro-bar';
    bar.innerHTML = `
        <button id="assistant-translate-btn" class="assistant-bar-btn" title="Translate Page">${ICONS.translate}</button>
        <button id="assistant-ai-btn" class="assistant-bar-btn" title="AI Assistant">${ICONS.ai}</button>
        <button id="assistant-audio-btn" class="assistant-bar-btn" title="Toggle Hover Audio">${ICONS.audio}</button>
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
            <span class="ai-panel-title">AI Banking Assistant</span>
            <select id="ai-language-selector" title="Select Language">
                <option value="en">English</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="gu">ગુજરાતી (Gujarati)</option>
            </select>
            <button class="ai-panel-close-btn">${ICONS.close}</button>
        </div>
        <div class="ai-panel-body">
            <div class="message bot"><p>Hello! How can I help you today?</p></div>
        </div>
        <div class="ai-panel-footer">
            <form id="ai-chat-form">
                <input type="text" id="ai-user-input" placeholder="Ask a question..." autocomplete="off">
                <button type="submit" id="ai-send-button" title="Send">${ICONS.send}</button>
            </form>
        </div>
    `;
    document.body.appendChild(aiPanel);
    aiPanel.querySelector('.ai-panel-close-btn').addEventListener('click', () => {
        aiPanel.classList.remove('visible');
    });
    addChatEventListeners();
}

function addBarEventListeners() {
    document.getElementById('assistant-translate-btn').addEventListener('click', () => {
        console.log('Full page translation initiated.');
    });
    document.getElementById('assistant-ai-btn').addEventListener('click', () => {
        aiPanel.classList.toggle('visible');
    });
    document.getElementById('assistant-audio-btn').addEventListener('click', () => {
        console.log('Audio hover toggled.');
    });
    document.getElementById('assistant-theme-btn').addEventListener('click', toggleTheme);
}

// --- vvv THIS ENTIRE FUNCTION IS THE MAIN CHANGE vvv ---
function addChatEventListeners() {
    const chatForm = aiPanel.querySelector('#ai-chat-form');
    const userInput = aiPanel.querySelector('#ai-user-input');
    const langSelector = aiPanel.querySelector('#ai-language-selector');
    const BACKEND_URL = 'http://127.0.0.1:5001/chatbot';

    // --- NEW: A dictionary of greetings for each language ---
    const GREETINGS = {
        en: 'Hello! How can I help you with your banking questions?',
        mr: 'नमस्कार! मी तुमच्या बँकिंग प्रश्नांसाठी कशी मदत करू शकते?',
        hi: 'नमस्ते! मैं आपके बैंकिंग संबंधी प्रश्नों में कैसे मदद कर सकती हूँ?',
        bn: 'নমস্কার! আমি আপনার ব্যাংকিং সংক্রান্ত প্রশ্নে কিভাবে সাহায্য করতে পারি?',
        gu: 'નમસ્તે! હું તમારા બેંકિંગ સંબંધિત પ્રશ્નોમાં કેવી રીતે મદદ કરી શકું?'
    };

    // --- NEW: Event listener for when the language is changed ---
    langSelector.addEventListener('change', (event) => {
        const chatBody = aiPanel.querySelector('.ai-panel-body');
        
        // 1. Clear the entire conversation
        chatBody.innerHTML = ''; 

        // 2. Get the new language and its corresponding greeting
        const newLang = event.target.value;
        const greeting = GREETINGS[newLang] || GREETINGS['en']; // Fallback to English

        // 3. Add the new greeting message to the empty chat window
        addChatMessage(greeting, 'bot');
    });

    // --- This is your existing form submission logic, it remains unchanged ---
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = userInput.value.trim();
        if (userMessage === '') return;
        const selectedLang = langSelector.value;
        addChatMessage(userMessage, 'user');
        userInput.value = '';
        const loadingMessage = addChatMessage('...', 'bot loading');
        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    language: selectedLang
                }),
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
// --- ^^^ THIS ENTIRE FUNCTION IS THE MAIN CHANGE ^^^ ---


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
        elementsToTheme.forEach(el => {
            el.classList.remove('sunny-theme');
            el.classList.add('night-theme');
        });
        if (themeIconBtn) themeIconBtn.innerHTML = ICONS.sunny;
    } else {
        document.body.classList.remove('assistant-night-mode');
        elementsToTheme.forEach(el => {
            el.classList.remove('night-theme');
            el.classList.add('sunny-theme');
        });
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleBar') {
        if (request.isEnabled) {
            init();
        } else {
            destroyUI();
        }
    }
});

init();