// ✅ utils/speech.js
// This file manages MICROPHONE RECORDING. It USES the speech_services file for transcription.

let mediaRecorder;
let audioChunks = [];

/**
 * Initializes voice input using the Google Cloud Speech-to-Text API.
 */
async function initSpeechRecognition() {
    const micButton = document.getElementById('ai-mic-button');
    if (!micButton) return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Media devices API not supported by this browser.");
        micButton.parentElement.style.display = 'none'; // Hide voice controls
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const langSelector = document.getElementById('ai-voice-language-selector');
        const userInput = document.getElementById('ai-user-input');
        const chatForm = document.getElementById('ai-chat-form');

        micButton.addEventListener('click', () => {
            if (mediaRecorder && mediaRecorder.state === "recording") {
                mediaRecorder.stop();
                micButton.classList.remove('listening');
                showNotification('Processing voice input...');
                return;
            }

            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            micButton.classList.add('listening');
            showNotification('Listening...');

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    const base64Audio = reader.result.split(',')[1];
                    const langCode = langSelector.value;
                    // Calls the service function from speech_services.js
                    const transcript = await getTranscriptionFromCloud(base64Audio, langCode);
                    if (transcript && !transcript.includes('[Error]')) {
                        userInput.value = transcript;
                        if (chatForm) chatForm.requestSubmit();
                    }
                    audioChunks = []; // Clear for next recording
                };
            };

            mediaRecorder.ondataavailable = event => audioChunks.push(event.data);
        });
    } catch (err) {
        console.error("Error accessing microphone:", err);
        showNotification("Microphone access denied or not found.", true);
        micButton.parentElement.style.display = 'none';
    }
}