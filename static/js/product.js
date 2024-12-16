// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Image Gallery
    const mainImage = document.querySelector('.main-image img');
    const imageCounter = document.querySelector('.image-counter span');
    const thumbnails = document.querySelectorAll('.image-thumbnails img');
    let currentImageIndex = 0;

    // Tabs
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Mobile Navigation
    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbar = document.querySelector('.navbar');

    // Image Gallery Functions
    function updateMainImage(index) {
        const selectedThumbnail = thumbnails[index];
        mainImage.src = selectedThumbnail.src;
        mainImage.alt = selectedThumbnail.alt;
        imageCounter.textContent = `${index + 1}/${thumbnails.length}`;
        
        // Update active thumbnail
        thumbnails.forEach(thumb => thumb.classList.remove('active'));
        selectedThumbnail.classList.add('active');
        
        currentImageIndex = index;
    }

    // Add click handlers to thumbnails
    thumbnails.forEach((thumbnail, index) => {
        thumbnail.addEventListener('click', () => updateMainImage(index));
    });

    // Add touch swipe support for main image
    let touchStartX = 0;
    let touchEndX = 0;

    mainImage.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    mainImage.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchEndX - touchStartX;

        if (Math.abs(diff) < swipeThreshold) return;

        if (diff > 0 && currentImageIndex > 0) {
            // Swipe right - show previous image
            updateMainImage(currentImageIndex - 1);
        } else if (diff < 0 && currentImageIndex < thumbnails.length - 1) {
            // Swipe left - show next image
            updateMainImage(currentImageIndex + 1);
        }
    }

    // Tab Switching Functions
    function switchTab(tabId) {
        // Update tab buttons
        tabButtons.forEach(button => {
            button.classList.remove('active');
            if (button.dataset.tab === tabId) {
                button.classList.add('active');
            }
        });

        // Update tab contents
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === tabId) {
                content.classList.add('active');
            }
        });
    }

    // Add click handlers to tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            switchTab(button.dataset.tab);
        });
    });

    // Mobile Navigation Toggle
    navbarToggle.addEventListener('click', () => {
        navbar.classList.toggle('mobile-open');
    });

    // Newsletter Form Submission
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            
            if (emailInput.value) {
                // Here you would typically send this to your backend
                console.log('Newsletter signup:', emailInput.value);
                emailInput.value = '';
                alert('Thank you for subscribing!');
            }
        });
    }

    // Lazy Loading for Images
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if ('loading' in HTMLImageElement.prototype) {
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
        });
    } else {
        // Fallback for browsers that don't support lazy loading
        const lazyLoadScript = document.createElement('script');
        lazyLoadScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/lozad.js/1.16.0/lozad.min.js';
        document.body.appendChild(lazyLoadScript);
        
        lazyLoadScript.onload = () => {
            const observer = lozad();
            observer.observe();
        };
    }

    // Score Card Animations
    const scoreCards = document.querySelectorAll('.score-card');
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px'
    };

    const scoreObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                scoreObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    scoreCards.forEach(card => {
        scoreObserver.observe(card);
    });

    // Initialize the page
    updateMainImage(0); // Set initial image
});