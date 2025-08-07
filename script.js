function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    // If we open the KYC modal and it happens to be on step 3, start the camera.
    if (modalId === 'kycModal' && kycForm.dataset.currentStep === '3') {
        startCamera();
    }
}

// ★★★ MODIFIED to handle camera state and form resets ★★★
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }

    // Always stop the camera when a modal is closed, just in case.
    stopCameraStream();

    // Reset the specific form that was closed
    if (modalId === 'fundTransferModal') {
        resetFundTransferForm();
    }
    if (modalId === 'kycModal') {
        resetKycForm();
    }
}

window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target.id);
    }
});


// --- FUND TRANSFER LOGIC ---
const fundTransferForm = document.getElementById('fundTransferForm');

function goToNextStep(currentStep) {
    if (currentStep === 2) {
        const account = document.getElementById('beneficiaryAccount').value;
        const amount = document.getElementById('transferAmount').value;
        const remarks = document.getElementById('remarks').value;

        document.getElementById('confirm-account').textContent = account;
        document.getElementById('confirm-amount').textContent = `₹ ${amount}`;
        document.getElementById('confirm-remarks').textContent = remarks || 'N/A';
    }
    showStep(currentStep + 1);
}

function goToPrevStep(currentStep) {
    showStep(currentStep - 1);
}

function showStep(stepNumber) {
    const steps = fundTransferForm.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('#fundTransferModal .progress-step');
    
    steps.forEach(step => step.classList.remove('active'));
    fundTransferForm.querySelector(`.form-step[data-step='${stepNumber}']`).classList.add('active');

    progressSteps.forEach(pStep => {
         pStep.classList.remove('active');
         if (parseInt(pStep.dataset.step) <= stepNumber) {
             pStep.classList.add('active');
         }
    });
    
    fundTransferForm.dataset.currentStep = stepNumber;
}

function resetFundTransferForm() {
    fundTransferForm.reset();
    showStep(1);
}


// --- KYC FORM LOGIC ---
const kycForm = document.getElementById('kycForm');

function goToKycNextStep(currentStep) {
    showKycStep(currentStep + 1);
}

function goToKycPrevStep(currentStep) {
    showKycStep(currentStep - 1);
}

// ★★★ MODIFIED to handle camera state ★★★
function showKycStep(stepNumber) {
    const steps = kycForm.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.kyc-progress-bar .progress-step');

    // --- CAMERA LOGIC INTEGRATION ---
    // If we are leaving the selfie step, turn off the camera.
    if (kycForm.dataset.currentStep === '3' && stepNumber !== 3) {
        stopCameraStream();
    }
    
    steps.forEach(step => step.classList.remove('active'));
    kycForm.querySelector(`.form-step[data-step='${stepNumber}']`).classList.add('active');

    // If we are entering the selfie step, turn on the camera.
    if (stepNumber === 3) {
        startCamera();
    }
    // --- END CAMERA LOGIC ---

    progressSteps.forEach(pStep => {
         pStep.classList.remove('active');
         if (parseInt(pStep.dataset.step) <= stepNumber) {
             pStep.classList.add('active');
         }
    });
    kycForm.dataset.currentStep = stepNumber;
}

function setupUploadArea(areaId, inputId) {
    const uploadArea = document.getElementById(areaId);
    const fileInput = document.getElementById(inputId);
    
    if (uploadArea) {
        uploadArea.addEventListener('click', () => fileInput.click());
    }
    if (fileInput) {
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                const fileName = fileInput.files[0].name;
                uploadArea.querySelector('span').textContent = fileName;
                uploadArea.classList.add('file-added');
            }
        });
    }
}

setupUploadArea('pan-upload-area', 'pan-file-input');
setupUploadArea('aadhaar-upload-area', 'aadhaar-file-input');

function resetKycForm() {
    kycForm.reset();
    showKycStep(1);
    
    const uploadAreas = kycForm.querySelectorAll('.upload-area');
    uploadAreas.forEach(area => {
        area.classList.remove('file-added');
        area.querySelector('span').textContent = 'Click or drop file';
    });
}


// ★★★ NEW SECTION FOR WEBCAM FUNCTIONALITY ★★★
let cameraStream = null;

async function startCamera() {
    // Avoid starting a new stream if one is already running
    if (cameraStream) return;

    try {
        // Request access to the user's camera
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' }, // Prefer the front-facing camera
            audio: false 
        });
        
        // Attach the stream to our video element
        const cameraFeed = document.getElementById('camera-feed');
        if (cameraFeed) {
            cameraFeed.srcObject = stream;
            cameraStream = stream; // Store the stream so we can stop it later
        }

    } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Could not access the camera. Please ensure you have a camera and have granted permission in your browser.");
    }
}

function stopCameraStream() {
    if (cameraStream) {
        // Stop each track in the stream to turn off the camera light
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null; // Clear the variable
    }
}