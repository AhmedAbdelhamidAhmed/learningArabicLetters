// Letter Page JavaScript

// Global variables
let currentLetter = 'ي';
let currentIndex = 0;
let letterData = null;
let animationTimers = [];
let isAnimating = false;
let totalDoors = 0;
let doorsOpened = 0;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    initializeLetterPage();
    setupLetterEventListeners();
});

// Initialize letter page - FIXED: Read from URL parameter
function initializeLetterPage() {
    // Get selected letter from URL parameter
    const urlLetter = AppUtils.getUrlParameter('letter');

    // Validate the URL letter
    if (urlLetter && AppUtils.isValidLetter(urlLetter)) {
        currentLetter = urlLetter;
    } else {
        // Default to 'ي' if no valid letter in URL
        currentLetter = 'ي';
    }

    currentIndex = AppUtils.getLetterIndex(currentLetter);

    if (currentIndex === -1) {
        currentIndex = AppUtils.ARABIC_LETTERS.length - 1;
        currentLetter = AppUtils.ARABIC_LETTERS[currentIndex].letter;
    }

    letterData = AppUtils.getLetterData(currentLetter);
    totalDoors = AppUtils.validateImageCount(currentLetter);

    // Update UI
    updateLetterInfo();
    createDoors();
    updateNavigationButtons();

    // Preload images and start animation
    preloadLetterImages().then(() => {
        // Start animation after images are loaded
        setTimeout(() => {
            startAnimation();
        }, 1000);
    }).catch(error => {
        console.error('Error preloading images:', error);
        // Start anyway even if images fail to load
        setTimeout(() => {
            startAnimation();
        }, 1000);
    });

    // Save progress
    AppUtils.saveProgress(currentLetter);
}

// Setup event listeners
function setupLetterEventListeners() {
    // Modal close events
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLetterInfo();
            closeImageModal();
        }
    });

    // Close modals when clicking outside
    const letterInfoModal = document.getElementById('letterInfoModal');
    if (letterInfoModal) {
        letterInfoModal.addEventListener('click', (e) => {
            if (e.target === letterInfoModal) {
                closeLetterInfo();
            }
        });
    }

    const imageModal = document.getElementById('imageModal');
    if (imageModal) {
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal) {
                closeImageModal();
            }
        });
    }
}

// Update letter information in UI
function updateLetterInfo() {
    if (!letterData) return;

    // Update elements
    document.getElementById('currentLetter').textContent = letterData.letter;
    document.getElementById('letterName').textContent = letterData.name;
    document.getElementById('bigLetter').textContent = letterData.letter;
    document.getElementById('letterTitle').textContent = `حرف ${letterData.name}`;
    document.getElementById('exampleCount').textContent = letterData.count;
    document.getElementById('doorCount').textContent = totalDoors;
    document.getElementById('letterOrder').textContent = letterData.order;

    // Update description
    document.getElementById('descLetter').textContent = letterData.name;
    document.getElementById('descOrder').textContent = AppUtils.numberToArabicWords(letterData.order);
    document.getElementById('descCount').textContent = AppUtils.numberToArabicWords(letterData.count);

    // Update images subtitle
    document.getElementById('imagesSubtitle').textContent =
        `الأبواب ستفتح تباعاً كل 3 ثواني (${totalDoors} أبواب)`;

    // Update page title
    document.title = `حرف ${letterData.letter} - تطبيق الحروف العربية`;
}

// Create door elements
function createDoors() {
    const imagesContainer = document.getElementById('imagesContainer');
    if (!imagesContainer) return;

    // Clear container
    imagesContainer.innerHTML = '';
    doorsOpened = 0;

    // Create door elements
    for (let i = 1; i <= totalDoors; i++) {
        const imageItem = AppUtils.createElement('div', ['image-item']);
        imageItem.id = `image-${i}`;
        imageItem.dataset.index = i;
        imageItem.dataset.state = 'closed';
        imageItem.style.opacity = '0';
        imageItem.style.transform = 'translateY(20px)';

        // Create door image
        const doorImage = AppUtils.createElement('img', ['door-image']);
        doorImage.src = 'assets/images/door-open.gif';
        doorImage.alt = `باب ${i}`;
        doorImage.id = `door-${i}`;

        // Create image number
        const numberSpan = AppUtils.createElement('span', ['image-number']);
        numberSpan.textContent = i;

        // Create caption (will be shown when image loads)
        const caption = AppUtils.createElement('div', ['image-caption']);
        caption.textContent = `مثال ${i}`;

        // Assemble
        imageItem.appendChild(doorImage);
        imageItem.appendChild(numberSpan);
        imageItem.appendChild(caption);

        // Add click event for image modal
        imageItem.addEventListener('click', () => {
            if (imageItem.dataset.state === 'opened') {
                openImageModal(i);
            }
        });

        imagesContainer.appendChild(imageItem);

        // Add animation delay for entrance
        setTimeout(() => {
            imageItem.style.opacity = '1';
            imageItem.style.transform = 'translateY(0)';
        }, i * 100);
    }
}

// Preload letter images
async function preloadLetterImages() {
    try {
        await AppUtils.preloadImages(currentLetter, totalDoors);
        updateStatus('جميع الصور جاهزة', 'success');
    } catch (error) {
        console.error('Error preloading images:', error);
        updateStatus('حدث خطأ في تحميل الصور', 'error');
    }
}

// Start the animation sequence
function startAnimation() {
    if (isAnimating) return;

    isAnimating = true;
    doorsOpened = 0;
    animationTimers = [];

    // Update status
    updateStatus('جاري فتح الأبواب...', 'info');

    // Start countdown
    startCountdown();

    // Schedule door openings with 3-second intervals
    for (let i = 1; i <= totalDoors; i++) {
        const timer = setTimeout(() => {
            openDoor(i);
        }, (i - 1) * 3000 + 3000); // First door after 3 seconds, then every 3 seconds

        animationTimers.push(timer);
    }
}

// Start countdown timer
function startCountdown() {
    let countdown = 3;
    const timerValue = document.getElementById('timerValue');
    const timerDisplay = document.getElementById('timerDisplay');

    // Reset timer
    timerValue.textContent = countdown;
    timerDisplay.style.display = 'flex';

    const countdownInterval = setInterval(() => {
        countdown--;
        timerValue.textContent = countdown;

        if (countdown <= 0) {
            clearInterval(countdownInterval);
            timerDisplay.style.display = 'none';
        }
    }, 1000);
}

// Open a specific door
async function openDoor(doorNumber) {
    const imageItem = document.getElementById(`image-${doorNumber}`);
    const doorImage = document.getElementById(`door-${doorNumber}`);

    if (!imageItem || !doorImage) return;

    // Update state
    imageItem.dataset.state = 'opening';
    doorsOpened++;

    // Play sound
    AppUtils.playSound('door-open');

    // Animate door opening
    doorImage.style.transform = 'scale(1.2) rotate(10deg)';
    doorImage.style.opacity = '0.5';

    setTimeout(async () => {
        try {
            const imageUrl = `صور/${currentLetter}/icon${doorNumber.toString().padStart(2, '0')}.png`;
            const imageExists = await AppUtils.checkImageExists(imageUrl);

            if (imageExists) {
                const letterImage = AppUtils.createElement('img', ['letter-image']);
                letterImage.src = imageUrl;
                letterImage.alt = `${currentLetter} مثال ${doorNumber}`;
                letterImage.id = `letter-image-${doorNumber}`;
                letterImage.style.opacity = '0';

                // Replace door with letter image
                doorImage.parentNode.replaceChild(letterImage, doorImage);

                // Update state
                imageItem.dataset.state = 'opened';

                // Fade in the new image
                setTimeout(() => {
                    letterImage.style.opacity = '1';
                    letterImage.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        letterImage.style.transform = 'scale(1)';
                    }, 200);
                }, 50);

                // Play sound
                AppUtils.playSound('image-reveal');

                // Update status
                if (doorsOpened === totalDoors) {
                    updateStatus('جميع الأبواب فتحت!', 'success');
                    isAnimating = false;

                    // Show completion message
                    setTimeout(() => {
                        AppUtils.showNotification(`تم فتح جميع الأبواب لحرف ${currentLetter}!`, 'success');
                    }, 500);
                }
            } else {
                throw new Error('Image not found');
            }
        } catch (error) {
            console.error(`Error loading image for door ${doorNumber}:`, error);

            // Show error state
            const errorDiv = AppUtils.createElement('div', ['image-error']);
            errorDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
            errorDiv.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
                color: #e63946;
                font-size: 2rem;
            `;
            doorImage.parentNode.replaceChild(errorDiv, doorImage);

            imageItem.dataset.state = 'error';
        }
    }, 1000);
}

// Update status indicator
function updateStatus(message, type = 'info') {
    const statusIndicator = document.getElementById('statusIndicator');
    if (!statusIndicator) return;

    // Update icon based on type
    let icon = '';
    switch (type) {
        case 'error':
            icon = '<i class="fas fa-exclamation-circle"></i>';
            statusIndicator.style.color = '#e63946';
            break;
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            statusIndicator.style.color = '#4cc9f0';
            break;
        default:
            icon = '<i class="fas fa-spinner fa-spin"></i>';
            statusIndicator.style.color = '#4361ee';
    }

    statusIndicator.innerHTML = `${icon} ${message}`;
}

// Update navigation buttons state
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (prevBtn) {
        prevBtn.disabled = currentIndex === 0;
    }

    if (nextBtn) {
        nextBtn.disabled = currentIndex === AppUtils.ARABIC_LETTERS.length - 1;
    }
}

// Navigate to another letter - FIXED: Use URL parameters
function navigateLetter(direction) {
    if (isAnimating) {
        AppUtils.showNotification('يجب الانتظار حتى انتهاء العرض الحالي', 'warning');
        return;
    }

    // Clear existing timers
    clearAnimationTimers();

    // Determine new letter
    let newLetter = currentLetter;
    if (direction === 'prev' && currentIndex > 0) {
        newLetter = AppUtils.getPreviousLetter(currentLetter);
    } else if (direction === 'next' && currentIndex < AppUtils.ARABIC_LETTERS.length - 1) {
        newLetter = AppUtils.getNextLetter(currentLetter);
    }

    if (newLetter !== currentLetter) {
        // Redirect to new letter page with URL parameter
        AppUtils.redirectToLetterPage(newLetter);
    }
}

// Clear animation timers
function clearAnimationTimers() {
    animationTimers.forEach(timer => clearTimeout(timer));
    animationTimers = [];
}

// Restart animation
function restartAnimation() {
    if (isAnimating) {
        AppUtils.showNotification('العرض قيد التشغيل بالفعل', 'warning');
        return;
    }

    // Clear existing timers
    clearAnimationTimers();

    // Reset state
    doorsOpened = 0;

    // Recreate doors
    createDoors();

    // Start animation
    startAnimation();

    // Play sound
    AppUtils.playSound('restart');
}

// Go back to home page
function goToHome() {
    AppUtils.playSound('click');
    window.location.href = 'index.html';
}

// Speak the current letter
function speakLetter() {
    AppUtils.speakLetter(letterData.letter);
    AppUtils.playSound('speak');

    // Visual feedback
    const speakBtn = document.querySelector('.speak-btn');
    if (speakBtn) {
        speakBtn.classList.add('speaking');
        setTimeout(() => {
            speakBtn.classList.remove('speaking');
        }, 500);
    }
}

// Show letter information modal
function showLetterInfo() {
    const modal = document.getElementById('letterInfoModal');
    if (!modal) return;

    // Update modal content
    document.getElementById('modalBigLetter').textContent = letterData.letter;
    document.getElementById('modalLetterName').textContent = `حرف ${letterData.name}`;
    document.getElementById('modalLetterDescription').textContent =
        `حرف ${letterData.name} هو الحرف ${AppUtils.numberToArabicWords(letterData.order)} في الأبجدية العربية.`;

    // Update examples list
    const examplesList = document.getElementById('examplesList');
    if (examplesList) {
        examplesList.innerHTML = '';

        for (let i = 1; i <= totalDoors; i++) {
            const exampleItem = AppUtils.createElement('div', ['example-item']);
            exampleItem.onclick = () => openImageModal(i);

            const exampleNumber = AppUtils.createElement('div', ['example-number']);
            exampleNumber.textContent = i;

            const exampleText = AppUtils.createElement('div', ['example-text']);
            exampleText.textContent = `مثال ${i} لحرف ${letterData.letter}`;

            exampleItem.appendChild(exampleNumber);
            exampleItem.appendChild(exampleText);
            examplesList.appendChild(exampleItem);
        }
    }

    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Play sound
    AppUtils.playSound('modal-open');
}

// Close letter information modal
function closeLetterInfo() {
    const modal = document.getElementById('letterInfoModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        AppUtils.playSound('modal-close');
    }
}

// Open image modal
function openImageModal(imageNumber) {
    const modal = document.getElementById('imageModal');
    if (!modal) return;

    const imageUrl = `صور/${currentLetter}/icon${imageNumber.toString().padStart(2, '0')}.png`;

    // Update modal content
    document.getElementById('modalImage').src = imageUrl;
    document.getElementById('modalImage').alt = `${currentLetter} مثال ${imageNumber}`;
    document.getElementById('modalImageTitle').textContent = `مثال ${imageNumber}`;
    document.getElementById('modalImageDescription').textContent =
        `هذا مثال ${imageNumber} لحرف ${letterData.name}`;

    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Play sound
    AppUtils.playSound('image-open');
}

// Close image modal
function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        AppUtils.playSound('modal-close');
    }
}

// Make functions available globally
window.goToHome = goToHome;
window.navigateLetter = navigateLetter;
window.speakLetter = speakLetter;
window.restartAnimation = restartAnimation;
window.showLetterInfo = showLetterInfo;
window.closeLetterInfo = closeLetterInfo;
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;