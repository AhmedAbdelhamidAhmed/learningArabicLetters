// Utility Functions

// Arabic letters data - UPDATED: All letters have max 6 icons
const ARABIC_LETTERS = [
    { letter: 'أ', name: 'ألف', count: 2, order: 1, unicode: '0627' }, // icon01.png, icon02.png
    { letter: 'ب', name: 'باء', count: 1, order: 2, unicode: '0628' }, // icon01.png
    { letter: 'ت', name: 'تاء', count: 4, order: 3, unicode: '062A' }, // icon01-04.png
    { letter: 'ث', name: 'ثاء', count: 4, order: 4, unicode: '062B' }, // icon01-04.png
    { letter: 'ج', name: 'جيم', count: 4, order: 5, unicode: '062C' }, // icon01-04.png
    { letter: 'ح', name: 'حاء', count: 3, order: 6, unicode: '062D' }, // icon01-03.png
    { letter: 'خ', name: 'خاء', count: 3, order: 7, unicode: '062E' }, // icon01-03.png
    { letter: 'د', name: 'دال', count: 2, order: 8, unicode: '062F' }, // icon01-02.png
    { letter: 'ذ', name: 'ذال', count: 3, order: 9, unicode: '0630' }, // icon01-03.png
    { letter: 'ر', name: 'راء', count: 2, order: 10, unicode: '0631' }, // icon01-02.png
    { letter: 'ز', name: 'زاي', count: 1, order: 11, unicode: '0632' }, // icon01.png
    { letter: 'س', name: 'سين', count: 3, order: 12, unicode: '0633' }, // icon01-03.png
    { letter: 'ش', name: 'شين', count: 4, order: 13, unicode: '0634' }, // icon01-04.png
    { letter: 'ص', name: 'صاد', count: 3, order: 14, unicode: '0635' }, // icon01-03.png
    { letter: 'ض', name: 'ضاد', count: 1, order: 15, unicode: '0636' }, // icon01.png
    { letter: 'ط', name: 'طاء', count: 2, order: 16, unicode: '0637' }, // icon01-02.png
    { letter: 'ظ', name: 'ظاء', count: 1, order: 17, unicode: '0638' }, // icon01.png
    { letter: 'ع', name: 'عين', count: 2, order: 18, unicode: '0639' }, // icon01-02.png
    { letter: 'غ', name: 'غين', count: 3, order: 19, unicode: '063A' }, // icon01-03.png
    { letter: 'ف', name: 'فاء', count: 2, order: 20, unicode: '0641' }, // icon01-02.png
    { letter: 'ق', name: 'قاف', count: 1, order: 21, unicode: '0642' }, // icon01.png
    { letter: 'ك', name: 'كاف', count: 1, order: 22, unicode: '0643' }, // icon01.png
    { letter: 'ل', name: 'لام', count: 1, order: 23, unicode: '0644' }, // icon01.png
    { letter: 'م', name: 'ميم', count: 3, order: 24, unicode: '0645' }, // icon01-03.png
    { letter: 'ن', name: 'نون', count: 2, order: 25, unicode: '0646' }, // icon01-02.png
    { letter: 'ه', name: 'هاء', count: 0, order: 26, unicode: '0647' }, // no icon files
    { letter: 'و', name: 'واو', count: 2, order: 27, unicode: '0648' }, // icon01-02.png
    { letter: 'ي', name: 'ياء', count: 1, order: 28, unicode: '064A' }  // icon01.png
];

// Helper Functions
function getLetterData(letter) {
    return ARABIC_LETTERS.find(l => l.letter === letter) || ARABIC_LETTERS[ARABIC_LETTERS.length - 1];
}

function getLetterIndex(letter) {
    return ARABIC_LETTERS.findIndex(l => l.letter === letter);
}

function getNextLetter(currentLetter) {
    const index = getLetterIndex(currentLetter);
    if (index < ARABIC_LETTERS.length - 1) {
        return ARABIC_LETTERS[index + 1].letter;
    }
    return currentLetter;
}

function getPreviousLetter(currentLetter) {
    const index = getLetterIndex(currentLetter);
    if (index > 0) {
        return ARABIC_LETTERS[index - 1].letter;
    }
    return currentLetter;
}

function numberToArabicWords(number) {
    const arabicNumbers = ['صفر', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة'];
    return arabicNumbers[number] || number.toString();
}

// URL Parameter Functions
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function setUrlParameter(url, paramName, paramValue) {
    const urlObj = new URL(url, window.location.origin);
    urlObj.searchParams.set(paramName, paramValue);
    return urlObj.toString();
}

function redirectToLetterPage(letter) {
    // Create URL with letter parameter
    const url = `letter.html?letter=${encodeURIComponent(letter)}`;
    window.location.href = url;
}

function redirectWithLetter(url, letter) {
    const newUrl = setUrlParameter(url, 'letter', letter);
    window.location.href = newUrl;
}

// Local Storage Functions (for progress only, not for current letter)
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Error saving to storage:', error);
        return false;
    }
}

function getFromStorage(key, defaultValue = null) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
        console.error('Error reading from storage:', error);
        return defaultValue;
    }
}

function saveProgress(letter) {
    const progress = getFromStorage('learningProgress', {});
    progress[letter] = {
        visited: true,
        lastVisit: new Date().toISOString(),
        completed: true
    };
    saveToStorage('learningProgress', progress);
}

function getProgress() {
    return getFromStorage('learningProgress', {});
}

function getProgressPercentage() {
    const progress = getProgress();
    const visitedLetters = Object.keys(progress).length;
    return Math.round((visitedLetters / ARABIC_LETTERS.length) * 100);
}

// Audio Functions
function playSound(soundType) {
    // This is a placeholder for sound playback
    console.log(`Playing ${soundType} sound`);
}

function speakLetter(letter) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(letter);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.8;
        utterance.pitch = 1;
        speechSynthesis.speak(utterance);
    } else {
        console.log('Speech synthesis not supported');
    }
}

// Image Loading Functions
function preloadImages(letter, count) {
    const promises = [];
    for (let i = 1; i <= count; i++) {
        const imageUrl = `صور/${letter}/icon${i.toString().padStart(2, '0')}.png`;
        promises.push(loadImage(imageUrl));
    }
    return Promise.all(promises);
}

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
    });
}

function checkImageExists(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

// DOM Helper Functions
function createElement(tag, classes = [], attributes = {}) {
    const element = document.createElement(tag);

    if (classes.length > 0) {
        element.classList.add(...classes);
    }

    for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value);
    }

    return element;
}

function showNotification(message, type = 'info', duration = 3000) {
    const notification = createElement('div', ['notification', `notification-${type}`]);
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#4cc9f0' : type === 'error' ? '#e63946' : '#4361ee'};
        color: white;
        padding: 12px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

function showLoader(container) {
    const loader = createElement('div', ['loader']);
    loader.innerHTML = `
        <div class="spinner"></div>
        <p>جاري التحميل...</p>
    `;
    loader.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
    `;

    const spinner = loader.querySelector('.spinner');
    if (spinner) {
        spinner.style.cssText = `
            width: 50px;
            height: 50px;
            border: 5px solid rgba(67, 97, 238, 0.2);
            border-top-color: #4361ee;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
        `;
    }

    container.innerHTML = '';
    container.appendChild(loader);
}

function hideLoader(container) {
    const loader = container.querySelector('.loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            if (loader.parentNode === container) {
                container.removeChild(loader);
            }
        }, 300);
    }
}

// Validation Functions
function isValidLetter(letter) {
    return ARABIC_LETTERS.some(l => l.letter === letter);
}

function validateImageCount(letter) {
    const letterData = getLetterData(letter);
    return Math.min(letterData.count, 6); // Maximum 6 images
}

// Event Helpers
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export for use in other files
window.AppUtils = {
    ARABIC_LETTERS,
    getLetterData,
    getLetterIndex,
    getNextLetter,
    getPreviousLetter,
    numberToArabicWords,

    // URL Functions
    getUrlParameter,
    setUrlParameter,
    redirectToLetterPage,
    redirectWithLetter,

    // Storage Functions
    saveToStorage,
    getFromStorage,
    saveProgress,
    getProgress,
    getProgressPercentage,

    // Other Functions
    playSound,
    speakLetter,
    preloadImages,
    loadImage,
    checkImageExists,
    createElement,
    showNotification,
    showLoader,
    hideLoader,
    isValidLetter,
    validateImageCount,
    debounce,
    throttle
};

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);