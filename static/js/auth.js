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
            
            // Update URL without page reload
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('form', tab.dataset.tab);
            window.history.pushState({}, '', newUrl);
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

    // loginForm.addEventListener('submit', async function(e) {
    //     e.preventDefault();

    //     // const email = this.querySelector('input[name="email"]').value;
    //     // const password = this.querySelector('input[name="password"]').value;

    //     // Basic validation
    //     if (!isValidEmail(email)) {
    //         showError(this, 'Please enter a valid email address');
    //         return;
    //     }

    //     if (password.length < 6) {
    //         showError(this, 'Password must be at least 6 characters long');
    //         return;
    //     }

    //     // const submitButton = this.querySelector('button[type="submit"]');
    //     // submitButton.disabled = true;
    //     // submitButton.textContent = 'Logging in...';

    //     // try {
    //     //     const response = await fetch('/auth/login/', {
    //     //         method: 'POST',
    //     //         headers: {
    //     //             'Content-Type': 'application/json',
    //     //             'X-CSRFToken': getCookie('csrftoken'),
    //     //         },
    //     //         body: JSON.stringify({ email, password }),
    //     //     });

    //     //     const data = await response.json();

    //     //     if (response.ok && data.redirect_url) {
    //     //         window.location.href = data.redirect_url;
    //     //     } else {
    //     //         showError(this, data.message || 'Login failed');
    //     //     }
    //     // } catch (error) {
    //     //     console.error('Error:', error);
    //     //     showError(this, 'An error occurred. Please try again.');
    //     // } finally {
    //     //     submitButton.disabled = false;
    //     //     submitButton.textContent = 'Login';
    //     // }
    // });

    // signupForm.addEventListener('submit', async function(e) {
    //     e.preventDefault();

    //     const fullName = this.querySelector('input[name="full_name"]').value;
    //     const email = this.querySelector('input[name="email"]').value;
    //     const password = this.querySelector('input[name="password"]').value;
    //     const termsAccepted = this.querySelector('input[type="checkbox"]').checked;

    //     // Basic validation
    //     if (!fullName.trim()) {
    //         showError(this, 'Please enter your full name');
    //         return;
    //     }

    //     if (!isValidEmail(email)) {
    //         showError(this, 'Please enter a valid email address');
    //         return;
    //     }

    //     if (password.length < 6) {
    //         showError(this, 'Password must be at least 6 characters long');
    //         return;
    //     }

    //     if (!termsAccepted) {
    //         showError(this, 'Please accept the Terms of Service and Privacy Policy');
    //         return;
    //     }

    //     const submitButton = this.querySelector('button[type="submit"]');
    //     submitButton.disabled = true;
    //     submitButton.textContent = 'Creating Account...';

    //     // try {
    //     //     const response = await fetch('/auth/signup/', {
    //     //         method: 'POST',
    //     //         headers: {
    //     //             'Content-Type': 'application/json',
    //     //             'X-CSRFToken': getCookie('csrftoken'),
    //     //         },
    //     //         body: JSON.stringify({ full_name: fullName, email, password }),
    //     //     });

    //     //     const data = await response.json();

    //     //     if (response.ok && data.redirect_url) {
    //     //         window.location.href = data.redirect_url;
    //     //     } else {
    //     //         showError(this, data.message || 'Signup failed');
    //     //     }
    //     // } catch (error) {
    //     //     console.error('Error:', error);
    //     //     showError(this, 'An error occurred. Please try again.');
    //     // } finally {
    //     //     submitButton.disabled = false;
    //     //     submitButton.textContent = 'Create Account';
    //     // }
    // });

    // Helper function to get CSRF token
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Helper function to validate email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Helper function to show error messages
    function showError(form, message) {
        // Remove any existing error messages
        const existingError = form.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Create and append new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        // Insert error message after the submit button
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.insertAdjacentElement('afterend', errorDiv);

        // Automatically remove error message after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    // Handle social auth buttons (placeholder functionality)
    const socialButtons = document.querySelectorAll('.social-button');
    socialButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const provider = this.querySelector('i').classList[1].split('-')[1];
            alert(`${provider} authentication coming soon!`);
        });
    });

    // Handle "Forgot password?" link (placeholder functionality)
    const forgotLink = document.querySelector('.forgot-link');
    if (forgotLink) {
        forgotLink.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Password reset functionality coming soon!');
        });
    }
});