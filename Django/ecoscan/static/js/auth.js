document.addEventListener('DOMContentLoaded', function() {
    // Tab Switching
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.form-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and forms
            tabs.forEach(t => t.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding form
            tab.classList.add('active');
            const formId = tab.dataset.tab + 'Form';
            document.getElementById(formId).classList.add('active');
        });
    });

    // Password Visibility Toggle
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const passwordInput = toggle.previousElementSibling;
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggle.classList.remove('fa-eye');
                toggle.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                toggle.classList.remove('fa-eye-slash');
                toggle.classList.add('fa-eye');
            }
        });
    });

    // Form Validation and Submission
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        const password = this.querySelector('input[type="password"]').value;

        // Basic validation
        if (!isValidEmail(email)) {
            showError(this, 'Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            showError(this, 'Password must be at least 6 characters long');
            return;
        }

        // If validation passes, you can submit the form
        console.log('Login form submitted:', { email });
        // Add your API call or form submission logic here
    });

    signupForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const fullName = this.querySelector('input[type="text"]').value;
    const email = this.querySelector('input[type="email"]').value;
    const password = this.querySelector('input[type="password"]').value;

    try {
        const response = await fetch('/auth/signup/', { // Update URL based on your Django setup
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'), // Include CSRF token
            },
            body: JSON.stringify({ full_name: fullName, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert('Account created successfully!');
            window.location.href = '/auth/login/'; // Redirect to login page
        } else {
            showError(signupForm, data.message || 'Signup failed');
        }
    } catch (error) {
        showError(signupForm, 'An error occurred. Please try again.');
    }
    });

    // Helper to get CSRF token
    function getCookie(name) {
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith(name + '='))
            ?.split('=')[1];
        return cookieValue || '';
    }


    // Social Authentication Buttons
    const socialButtons = document.querySelectorAll('.social-button');
    socialButtons.forEach(button => {
        button.addEventListener('click', function() {
            const platform = this.querySelector('i').classList[1].split('-')[1];
            console.log(`Initiating ${platform} authentication`);
            // Add your social auth logic here
        });
    });

    // Helper Functions
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showError(form, message) {
        // Remove any existing error messages
        const existingError = form.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Create and append new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = 'red';
        errorDiv.style.marginTop = '10px';
        errorDiv.style.fontSize = '14px';
        errorDiv.textContent = message;
        form.appendChild(errorDiv);

        // Remove error message after 3 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }
});