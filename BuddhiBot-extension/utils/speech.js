// ✅ utils/speech.js
// This file manages the GLOBAL voice input with a PROACTIVE permission-guiding flow.

let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let permissionState = 'prompt'; // 'prompt', 'granted', or 'denied'

/**
 * Main function called from the floating bar to start or stop voice input.
 */
async function handleGlobalVoiceInput() {
    if (isRecording) {
        if (mediaRecorder) mediaRecorder.stop();
        return;
    }

    // --- NEW: Proactive Permission Handling ---
    if (permissionState === 'denied') {
        console.warn("Microphone permission was previously denied. Showing guide.");
        // Instead of a simple notification, show the detailed guide modal.
        showPermissionGuideModal();
        return;
    }

    // If we reach here, state is 'prompt' or 'granted'.
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        permissionState = 'granted';
        startGlobalRecording(stream);
    } catch (err) {
        console.error("Error accessing microphone:", err);
        permissionState = 'denied'; 
        showNotification("Microphone access was denied.", true);
    }
}

/**
 * Creates and shows a modal that instructs the user on how to re-enable permissions.
 */
function showPermissionGuideModal() {
    // Prevent creating multiple modals
    if (document.getElementById('assistant-permission-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'assistant-permission-modal';
    
    modal.innerHTML = `
        <div class="permission-modal-content">
            <h3>Microphone Access Needed</h3>
            <p>BuddhiBot needs permission to use your microphone. You've previously blocked it for this site.</p>
            <div class="permission-steps">
                <span><strong>1.</strong> Click the 🔒 padlock icon in the address bar.</span>
                <span><strong>2.</strong> Find "Microphone" and turn the toggle ON.</span>
                <span><strong>3.</strong> Reload the page if prompted.</span>
            </div>
            <button id="permission-retry-btn" class="btn-primary">I've Enabled It, Try Again</button>
        </div>
    `;

    document.body.appendChild(modal);
    applyTheme(assistantState.theme); // Apply the current theme to the modal

    // When the user clicks "Try Again", we close the modal and re-run the main logic.
    document.getElementById('permission-retry-btn').addEventListener('click', () => {
        modal.remove();
        // Reset the state to 'prompt' so it will try to ask again.
        permissionState = 'prompt'; 
        handleGlobalVoiceInput();
    });
}


/**
 * Starts the recording process. This is only called after permission is granted.
 * @param {MediaStream} stream The user's microphone stream.
 */
function startGlobalRecording(stream) {
    const micButton = document.getElementById('assistant-mic-btn');
    if (!micButton) return;

    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = event => audioChunks.push(event.data);
    
    mediaRecorder.onstart = () => {
        isRecording = true;
        micButton.classList.add('listening');
        showNotification('Listening...');
    };

    mediaRecorder.onstop = () => {
        isRecording = false;
        micButton.classList.remove('listening');
        showNotification('Processing voice input...');
        
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);

        reader.onloadend = async () => {
            const base64Audio = reader.result.split(',')[1];
            const langCode = langMap[assistantState.language] || 'en-US';
            const transcript = await getTranscriptionFromCloud(base64Audio, langCode);

            if (transcript && !transcript.includes('[Error]')) {
                handleAiButtonClick(); // Open the AI panel
                setTimeout(() => { // Wait for panel to render
                    const chatInput = document.getElementById('ai-user-input');
                    if (chatInput) {
                        chatInput.value = transcript;
                        chatInput.focus();
                    }
                }, 100);
            } else if (transcript === "") {
                showNotification("Could not hear anything.", true);
            }
        };
    };

    mediaRecorder.start();
}