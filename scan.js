// DOM Elements
const sections = document.querySelectorAll('.scan-section');
const progressSteps = document.querySelectorAll('.progress-step');
const nextButtons = document.querySelectorAll('.scan-button.primary');
const cameraButtons = document.querySelectorAll('.scan-button.secondary');

// State Management
let currentStep = 0;
let capturedImages = {
    product: null,
    nutrition: null,
    ingredients: null
};
let stream = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    setupEventListeners();
});

// Event Listeners Setup
function setupEventListeners() {
    // Next/Submit button listeners
    nextButtons.forEach((button, index) => {
        button.addEventListener('click', () => handleNextStep(index));
    });

    // Camera button listeners
    cameraButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            if (index === 0) activateCamera('product');
            else if (index === 1) activateCamera('nutrition');
            else activateCamera('ingredients');
        });
    });
}

// Navigation Functions
function handleNextStep(currentIndex) {
    // Validate current section before proceeding
    if (!validateSection(currentIndex)) return;

    if (currentIndex < sections.length - 1) {
        // Move to next section
        currentStep++;
        updateUI();
    } else {
        // Handle form submission
        handleSubmission();
    }
}

function updateUI() {
    // Update sections visibility
    sections.forEach((section, index) => {
        section.classList.toggle('active', index === currentStep);
    });

    // Update progress indicators
    progressSteps.forEach((step, index) => {
        step.classList.toggle('active', index === currentStep);
    });
}

// Validation
function validateSection(index) {
    switch(index) {
        case 0:
            // Validate product name
            const productName = document.getElementById('productName').value.trim();
            if (!productName) {
                showError('Please enter a product name');
                return false;
            }
            return true;

        case 1:
            // Validate product image
            if (!capturedImages.product) {
                showError('Please take a photo of the product');
                return false;
            }
            return true;

        case 2:
            // Validate nutrition table image
            if (!capturedImages.nutrition) {
                showError('Please take a photo of the nutrition table');
                return false;
            }
            return true;

        case 3:
            // Validate ingredients image
            if (!capturedImages.ingredients) {
                showError('Please take a photo of the ingredients list');
                return false;
            }
            return true;

        default:
            return true;
    }
}

// Camera Handling
async function activateCamera(type) {
    try {
        // Stop any existing stream
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        // Get camera access
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment',
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            } 
        });

        // Create preview elements
        const previewSection = document.querySelector(`#${type}Section .scan-preview`);
        clearPreview(previewSection);

        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.classList.add('camera-preview');
        previewSection.appendChild(video);

        // Update button to capture
        const cameraButton = previewSection.nextElementSibling.querySelector('.secondary');
        cameraButton.innerHTML = '<i class="fas fa-camera"></i> Capture';
        cameraButton.onclick = () => captureImage(type, video, previewSection);

    } catch (error) {
        console.error('Error accessing camera:', error);
        showError('Unable to access camera. Please check permissions.');
    }
}

async function captureImage(type, video, previewSection) {
    try {
        // Create canvas and capture frame
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        // Store captured image
        const imageData = canvas.toDataURL('image/jpeg');
        capturedImages[type] = imageData;

        // Stop camera stream
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }

        // Show captured image
        clearPreview(previewSection);
        const img = document.createElement('img');
        img.src = imageData;
        img.classList.add('captured-image');
        previewSection.appendChild(img);

        // Update button to retake
        const cameraButton = previewSection.nextElementSibling.querySelector('.secondary');
        cameraButton.innerHTML = '<i class="fas fa-redo"></i> Retake';
        cameraButton.onclick = () => activateCamera(type);

    } catch (error) {
        console.error('Error capturing image:', error);
        showError('Failed to capture image. Please try again.');
    }
}

// Utility Functions
function clearPreview(previewSection) {
    // Remove existing preview content
    while (previewSection.firstChild) {
        previewSection.firstChild.remove();
    }
}

function showError(message) {
    // Create error notification
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;

    // Add to document
    document.body.appendChild(notification);

    // Remove after delay
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Form Submission
async function handleSubmission() {
    try {
        const formData = new FormData();
        formData.append('productName', document.getElementById('productName').value);
        formData.append('productImage', capturedImages.product);
        formData.append('nutritionImage', capturedImages.nutrition);
        formData.append('ingredientsImage', capturedImages.ingredients);

        // Show loading state
        const submitButton = nextButtons[nextButtons.length - 1];
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitButton.disabled = true;

        // TODO: Replace with your actual API endpoint
        const response = await fetch('/api/submit-product', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Submission failed');

        // Show success and redirect
        showSuccess('Product successfully submitted!');
        setTimeout(() => {
            window.location.href = '/products';
        }, 2000);

    } catch (error) {
        console.error('Submission error:', error);
        showError('Failed to submit product. Please try again.');
        
        // Reset submit button
        const submitButton = nextButtons[nextButtons.length - 1];
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

