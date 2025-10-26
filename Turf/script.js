document.addEventListener('DOMContentLoaded', () => {
    // --- Universal Elements ---
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');

    // --- Universal Password Visibility Toggle ---
    if (togglePassword && passwordInput && eyeIcon) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle the eye icon classes for visual feedback
            if (type === 'password') {
                eyeIcon.classList.remove('fa-eye');
                eyeIcon.classList.add('fa-eye-slash');
            } else {
                eyeIcon.classList.remove('fa-eye-slash');
                eyeIcon.classList.add('fa-eye');
            }
            eyeIcon.classList.toggle('far');
            eyeIcon.classList.toggle('fas'); // Use solid icon when open
        });
    }

    // --- Shared Validation Helper Functions ---
    // Simple Email Validation regex
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
    // Simple Phone Validation regex
    const isValidPhone = (phone) => /^\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})$/.test(String(phone));

    const validateField = (inputElement, errorElement, validationFn, errorMessage) => {
        const isCheckbox = inputElement.type === 'checkbox';
        const value = isCheckbox ? inputElement.checked : inputElement.value.trim();
        let isValid = validationFn(value);

        if (isValid) {
            errorElement.textContent = '';
            if (!isCheckbox) inputElement.closest('.input-group')?.classList.remove('error');
        } else {
            errorElement.textContent = errorMessage;
            if (!isCheckbox) inputElement.closest('.input-group')?.classList.add('error');
        }
        return isValid;
    };
    
    // ------------------------------------------------------------------
    // --- 1. LOGIN FORM LOGIC ---
    // ------------------------------------------------------------------
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const emailError = document.getElementById('emailError');
        const passwordError = document.getElementById('passwordError');

        // Live Validation
        emailInput.addEventListener('blur', () => validateField(emailInput, emailError, isValidEmail, 'Please enter a valid email address.'));
        passwordInput.addEventListener('blur', () => validateField(passwordInput, passwordError, val => val.length >= 8, 'Password must be at least 8 characters.'));

        // Note: Form submission is handled by Firebase in login.html
        // Only perform live validation here
    }

    // ------------------------------------------------------------------
    // --- 2. REGISTRATION FORM LOGIC ---
    // ------------------------------------------------------------------
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        const nameInput = document.getElementById('full_name');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        const termsCheckbox = document.getElementById('terms');
        
        const nameError = document.getElementById('nameError');
        const emailError = document.getElementById('emailError');
        const phoneError = document.getElementById('phoneError');
        const termsError = document.getElementById('termsError');

        // Live Validation
        nameInput.addEventListener('blur', () => validateField(nameInput, nameError, val => val.length > 0, 'Full name is required.'));
        emailInput.addEventListener('blur', () => validateField(emailInput, emailError, isValidEmail, 'Please enter a valid email address.'));
        phoneInput.addEventListener('blur', () => validateField(phoneInput, phoneError, isValidPhone, 'Please enter a valid phone number.'));
        const passwordInputReg = document.getElementById('password');
        if (passwordInputReg) {
            passwordInputReg.addEventListener('blur', () => validateField(passwordInputReg, document.getElementById('passwordError'), val => val.length >= 8, 'Password must be at least 8 characters long.'));
        }
        termsCheckbox.addEventListener('change', () => validateField(termsCheckbox, termsError, val => val, 'You must accept the terms.'));

        // Note: Form submission is handled by Firebase in signup.html
        // Only perform live validation here
    }
});
