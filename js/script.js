// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initMobileMenu();
    initSmoothScroll();
    initFormValidation();
    initScrollAnimations();
    initNavbarScroll();
    initScrollToTop();
    initStatsCounter();
});

// Mobile Menu Toggle
function initMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });
    }
    
    // Close menu when clicking a nav link on mobile
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        });
    });
}

// Smooth Scrolling for Navigation Links
function initSmoothScroll() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Get navbar height for offset
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = targetPosition - navbarHeight;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Form Validation and Submission
function initFormValidation() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm()) {
                // Show loading state
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.textContent;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                submitBtn.disabled = true;
                
                // Simulate form submission (replace with actual API call)
                setTimeout(function() {
                    // Reset form
                    contactForm.reset();
                    
                    // Show success message
                    const formMessage = document.createElement('div');
                    formMessage.className = 'form-message success';
                    formMessage.textContent = 'Thank you! Your message has been sent successfully.';
                    contactForm.appendChild(formMessage);
                    
                    // Reset button
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                    
                    // Remove message after 5 seconds
                    setTimeout(function() {
                        formMessage.remove();
                    }, 5000);
                }, 1500);
            }
        });
    }
}

// Validate Form Fields
function validateForm() {
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const message = document.getElementById('message');
    let isValid = true;
    
    // Remove any existing error messages
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    
    // Validate name
    if (name.value.trim() === '') {
        showError(name, 'Please enter your name');
        isValid = false;
    }
    
    // Validate email
    if (email.value.trim() === '') {
        showError(email, 'Please enter your email');
        isValid = false;
    } else if (!isValidEmail(email.value)) {
        showError(email, 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate message
    if (message.value.trim() === '') {
        showError(message, 'Please enter your message');
        isValid = false;
    }
    
    return isValid;
}

// Helper function to show error messages
function showError(input, message) {
    const formGroup = input.parentElement;
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    formGroup.appendChild(errorMessage);
    input.classList.add('error');
    
    // Remove error state on input
    input.addEventListener('input', function() {
        input.classList.remove('error');
        const error = formGroup.querySelector('.error-message');
        if (error) {
            error.remove();
        }
    });
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Scroll-based Animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.service-card, .about-content, .contact-card, .section-header');
    
    // Initial check for elements in viewport on page load
    checkElementsInViewport(animatedElements);
    
    // Check on scroll
    window.addEventListener('scroll', function() {
        checkElementsInViewport(animatedElements);
    });
}

// Helper function to check if elements are in viewport
function checkElementsInViewport(elements) {
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // If element is in viewport, add visible class
        if (elementPosition.top < windowHeight * 0.85) {
            element.classList.add('visible');
        }
    });
}

// Navbar State Change on Scroll
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Stats Counter Animation
function initStatsCounter() {
    const stats = document.querySelectorAll('.stat-number');
    let counted = false;
    
    function startCounting() {
        if (counted) return;
        
        stats.forEach(stat => {
            const targetValue = parseInt(stat.textContent);
            const duration = 2000; // ms
            const startTime = Date.now();
            let currentValue = 0;
            
            function updateCounter() {
                const elapsedTime = Date.now() - startTime;
                const progress = Math.min(elapsedTime / duration, 1);
                
                // Easing function for smoother animation
                const easeOutQuad = progress * (2 - progress);
                
                currentValue = Math.floor(easeOutQuad * targetValue);
                stat.textContent = currentValue + '+';
                
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                }
            }
            
            requestAnimationFrame(updateCounter);
        });
        
        counted = true;
    }
    
    // Start counter when stats section is in view
    const statsSection = document.querySelector('.stats-container');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startCounting();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(statsSection);
    }
}

// Scroll to Top Button
function initScrollToTop() {
    // Create the scroll-to-top button dynamically
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.className = 'scroll-top-btn';
    scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(scrollTopBtn);
    
    // Show/hide the button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });
    
    // Scroll to top on click
    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Add hover effects for interactive elements
document.querySelectorAll('.service-card, .social-icon, .btn').forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.classList.add('hover');
    });
    
    item.addEventListener('mouseleave', function() {
        this.classList.remove('hover');
    });
});

// Handle responsive behaviors
window.addEventListener('resize', function() {
    // Reset mobile menu state on window resize
    if (window.innerWidth > 768) {
        const menuToggle = document.getElementById('mobile-menu');
        const navMenu = document.querySelector('.nav-menu');
        
        if (menuToggle && menuToggle.classList.contains('active')) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    }
});

// Add preloader functionality
window.addEventListener('load', function() {
    // Remove preloader if it exists
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        setTimeout(function() {
            preloader.classList.add('preloader-hidden');
            
            setTimeout(function() {
                preloader.style.display = 'none';
            }, 500);
        }, 500);
    }
    
    // Trigger initial animations
    document.querySelectorAll('.animate-pop-in').forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('animated');
        }, 150 * index);
    });
});

