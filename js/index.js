// Main Page JavaScript

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    setupEventListeners();
    loadLetters();
});

// Page initialization
function initializePage() {
    // Calculate total examples - UPDATED: Now 96 total
    const totalExamples = AppUtils.ARABIC_LETTERS.reduce((sum, letter) => sum + letter.count, 0);

    // Update statistics
    document.getElementById('totalLetters').textContent = AppUtils.ARABIC_LETTERS.length;
    document.getElementById('totalExamples').textContent = totalExamples;

    // Load progress
    const progressPercentage = AppUtils.getProgressPercentage();
    if (progressPercentage > 0) {
        showNotification(`لقد تعلمت ${progressPercentage}% من الحروف حتى الآن!`, 'success');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', AppUtils.debounce(handleSearch, 300));
    }

    // Filter buttons - UPDATED: Removed 7-10 filter
    const filterButtons = document.querySelectorAll('[data-filter]');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            // Apply filter
            filterLetters(button.dataset.filter);
        });
    });

    // Instructions modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideInstructions();
        }
    });

    // Close modal when clicking outside
    const instructionsModal = document.getElementById('instructionsModal');
    if (instructionsModal) {
        instructionsModal.addEventListener('click', (e) => {
            if (e.target === instructionsModal) {
                hideInstructions();
            }
        });
    }
}

// Load letters into the grid
function loadLetters() {
    const lettersGrid = document.getElementById('lettersGrid');
    if (!lettersGrid) return;

    // Show loader
    AppUtils.showLoader(lettersGrid);

    // Clear existing content
    lettersGrid.innerHTML = '';

    // Sort letters alphabetically
    const sortedLetters = [...AppUtils.ARABIC_LETTERS].sort((a, b) =>
        a.name.localeCompare(b.name, 'ar')
    );

    // Create letter cards
    setTimeout(() => {
        sortedLetters.forEach((letterData, index) => {
            const col = AppUtils.createElement('div', ['col-6', 'col-sm-4', 'col-md-3', 'col-lg-2']);

            const letterCard = createLetterCard(letterData, index);
            col.appendChild(letterCard);

            lettersGrid.appendChild(col);
        });

        // Hide loader
        AppUtils.hideLoader(lettersGrid);

        // Add animation
        animateLetters();
    }, 500);
}

// Create a letter card
function createLetterCard(letterData, index) {
    const card = AppUtils.createElement('div', ['letter-card']);
    card.dataset.letter = letterData.letter;
    card.dataset.count = letterData.count;

    // Add animation delay
    card.style.animationDelay = `${index * 0.05}s`;

    // Letter icon
    const icon = AppUtils.createElement('div', ['letter-icon']);
    icon.textContent = letterData.letter;

    // Letter name
    const name = AppUtils.createElement('div', ['letter-name']);
    name.textContent = letterData.name;

    // Examples count
    const examples = AppUtils.createElement('div', ['letter-examples']);
    const examplesIcon = AppUtils.createElement('i', ['fas', 'fa-image']);
    const examplesText = document.createTextNode(` ${letterData.count} مثال`);

    examples.appendChild(examplesIcon);
    examples.appendChild(examplesText);

    // Order badge
    const badge = AppUtils.createElement('div', ['letter-badge']);
    badge.textContent = letterData.order;

    // Progress indicator
    const progress = AppUtils.getProgress();
    if (progress[letterData.letter]) {
        const progressIndicator = AppUtils.createElement('div', ['progress-indicator']);
        progressIndicator.innerHTML = '<i class="fas fa-check-circle"></i>';
        progressIndicator.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            color: #4cc9f0;
            font-size: 1.2rem;
        `;
        card.appendChild(progressIndicator);
    }

    // Assemble card
    card.appendChild(badge);
    card.appendChild(icon);
    card.appendChild(name);
    card.appendChild(examples);

    // Add click event - FIXED: Use URL parameters instead of localStorage
    card.addEventListener('click', () => {
        selectLetter(letterData.letter);
    });

    // Add hover effects
    card.addEventListener('mouseenter', () => {
        AppUtils.playSound('hover');
        card.classList.add('hover');
    });

    card.addEventListener('mouseleave', () => {
        card.classList.remove('hover');
    });

    return card;
}

// Animate letters entrance
function animateLetters() {
    const letters = document.querySelectorAll('.letter-card');
    letters.forEach((letter, index) => {
        setTimeout(() => {
            letter.style.opacity = '1';
            letter.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

// Handle letter selection - FIXED: Use URL parameters
function selectLetter(letter) {
    // Play click sound
    AppUtils.playSound('click');

    // Add visual feedback
    const card = document.querySelector(`.letter-card[data-letter="${letter}"]`);
    if (card) {
        card.classList.add('selected');
        card.style.transform = 'scale(0.95)';

        // Redirect using URL parameter
        setTimeout(() => {
            AppUtils.redirectToLetterPage(letter);
        }, 300);
    } else {
        // Direct redirect if card not found
        AppUtils.redirectToLetterPage(letter);
    }
}

// Handle search
function handleSearch(event) {
    const searchTerm = event.target.value.trim().toLowerCase();
    const letters = document.querySelectorAll('.letter-card');

    letters.forEach(card => {
        const letter = card.dataset.letter;
        const name = card.querySelector('.letter-name').textContent;

        if (letter.includes(searchTerm) || name.toLowerCase().includes(searchTerm)) {
            card.parentElement.style.display = 'block';
            card.classList.add('search-match');
        } else {
            card.parentElement.style.display = 'none';
            card.classList.remove('search-match');
        }
    });
}

// Filter letters by count - UPDATED: Removed 7-10 filter
function filterLetters(filterType) {
    const letters = document.querySelectorAll('.letter-card');

    letters.forEach(card => {
        const count = parseInt(card.dataset.count);
        let shouldShow = true;

        switch (filterType) {
            case '1-3':
                shouldShow = count >= 1 && count <= 3;
                break;
            case '4-6':
                shouldShow = count >= 4 && count <= 6;
                break;
            // REMOVED: 7-10 filter case
            default:
                shouldShow = true;
        }

        card.parentElement.style.display = shouldShow ? 'block' : 'none';
    });
}

// Show instructions modal
function showInstructions() {
    const modal = document.getElementById('instructionsModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        AppUtils.playSound('open');
    }
}

// Hide instructions modal
function hideInstructions() {
    const modal = document.getElementById('instructionsModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        AppUtils.playSound('close');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    AppUtils.showNotification(message, type, 3000);
}

// Make functions available globally
window.selectLetter = selectLetter;
window.showInstructions = showInstructions;
window.hideInstructions = hideInstructions;