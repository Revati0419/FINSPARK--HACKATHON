// ✅ utils/settings.js
// This file manages rendering and handling events in the settings panel.

function renderSettingsPanel() {
    const settingsView = document.getElementById('ai-settings-view');
    settingsView.innerHTML = `
        <div class="ai-panel-body settings-body">
            <div class="setting-row">
                <label for="theme-toggle">Enable Dark Mode</label>
                <label class="switch"><input type="checkbox" id="theme-toggle" ${assistantState.theme === 'night' ? 'checked' : ''}><span class="slider round"></span></label>
            </div>
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
            <div class="setting-row">
                <label for="cloud-tts-toggle">Enable High-Quality Voices</label>
                <label class="switch"><input type="checkbox" id="cloud-tts-toggle" ${assistantState.useCloudTTS ? 'checked' : ''}><span class="slider round"></span></label>
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
        <div class="ai-panel-footer"><button id="save-settings-btn">Save Settings</button></div>
    `;
    addSettingsEventListeners();
}

// --- THIS IS THE CORRECTED AND COMPLETE FUNCTION ---
function addSettingsEventListeners() {
    const saveButton = document.getElementById('save-settings-btn');
    if (!saveButton) return;

    saveButton.addEventListener('click', () => {
        console.log("Save button clicked!");

        // 1. Read all the current values from the form inputs
        const newTheme = document.getElementById('theme-toggle').checked ? 'night' : 'sunny';
        const newLanguage = document.getElementById('language-setting').value;
        const newAudioMode = document.querySelector('input[name="audio-mode"]:checked').value;
        const newUseCloudTTS = document.getElementById('cloud-tts-toggle').checked;
        const newTooltipsEnabled = document.getElementById('tooltip-toggle').checked;
        const newFormHelperEnabled = document.getElementById('form-helper-toggle').checked;

        console.log("New Language Selected:", newLanguage);

        // 2. Update the global assistantState object
        assistantState.theme = newTheme;
        assistantState.language = newLanguage;
        assistantState.audioMode = newAudioMode;
        assistantState.useCloudTTS = newUseCloudTTS;
        assistantState.tooltipsEnabled = newTooltipsEnabled;
        assistantState.formHelperEnabled = newFormHelperEnabled;
        
        console.log("Global state updated:", assistantState);

        // 3. Apply changes that have an immediate visual effect
        applyTheme(newTheme);

        // 4. Save the entire state object to make it persistent
        chrome.storage.sync.set(assistantState, () => {
            // This is a callback function that runs after the save is complete
            if (chrome.runtime.lastError) {
                console.error("Error saving settings:", chrome.runtime.lastError);
                showNotification("Error: Could not save settings.", true);
            } else {
                console.log("Settings successfully saved to chrome.storage.");
                showNotification('Settings saved successfully!');
                
                // 5. Tell the AI panel to update its greeting with the new language
                if (window.setAiPanelGreeting) {
                    window.setAiPanelGreeting();
                }
            }
        });
    });
}