// ✅ utils/settings.js
// This file manages rendering and handling events in the settings panel.

function renderSettingsPanel() {
    const settingsView = document.getElementById('ai-settings-view');
    // --- UPDATED HTML to match your new design ---
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

            <!-- START: NEW Audio Settings Section -->
            <div class="setting-group">
                <label>Audio Playback Mode</label>
                <div class="radio-group">
                    <div class="radio-option">
                        <input type="radio" id="audio-both" name="audio-mode" value="both" ${assistantState.audioMode === 'both' ? 'checked' : ''}>
                        <label for="audio-both">English, then Primary</label>
                    </div>
                    <div class="radio-option">
                        <input type="radio" id="audio-target" name="audio-mode" value="target-only" ${assistantState.audioMode === 'target-only' ? 'checked' : ''}>
                        <label for="audio-target">Primary Language Only</label>
                    </div>
                    <div class="radio-option">
                        <input type="radio" id="audio-english" name="audio-mode" value="english-only" ${assistantState.audioMode === 'english-only' ? 'checked' : ''}>
                        <label for="audio-english">English Only</label>
                    </div>
                </div>
            </div>

            <div class="setting-row">
                <label for="cloud-tts-toggle">Enable High-Quality Voices</label>
                <label class="switch"><input type="checkbox" id="cloud-tts-toggle" ${assistantState.useCloudTTS ? 'checked' : ''}><span class="slider round"></span></label>
            </div>
            <!-- END: NEW Audio Settings Section -->

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

function addSettingsEventListeners() {
    document.getElementById('save-settings-btn').addEventListener('click', () => {
        // --- UPDATED to save all new and old settings ---
        const newTheme = document.getElementById('theme-toggle').checked ? 'night' : 'sunny';

        // Update the global state object with all values from the form
        assistantState.theme = newTheme;
        assistantState.language = document.getElementById('language-setting').value;
        assistantState.audioMode = document.querySelector('input[name="audio-mode"]:checked').value;
        assistantState.useCloudTTS = document.getElementById('cloud-tts-toggle').checked;
        assistantState.tooltipsEnabled = document.getElementById('tooltip-toggle').checked;
        assistantState.formHelperEnabled = document.getElementById('form-helper-toggle').checked;

        // Apply theme instantly without a page reload
        applyTheme(newTheme);

        // Save the entire updated state object to Chrome's storage
        chrome.storage.sync.set(assistantState, () => {
            showNotification('Settings saved!');
        });
    });
}