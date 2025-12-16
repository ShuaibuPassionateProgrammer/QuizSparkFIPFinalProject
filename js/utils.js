// ===== Utility Functions for QuizSpark =====

class QuizUtils {
    constructor() {
        // Initialize utility methods
        this.initializeStorage();
        this.initializeTheme();
        this.setupServiceWorker();
    }

    // ===== Local Storage Utilities =====
    
    initializeStorage() {
        // Ensure localStorage is available
        if (!this.isLocalStorageAvailable()) {
            console.warn('localStorage is not available. Some features may not work.');
            this.showStorageWarning();
        }
    }

    isLocalStorageAvailable() {
        try {
            const testKey = '__quizspark_test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }

    getStorageItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error getting item ${key}:`, error);
            return defaultValue;
        }
    }

    setStorageItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error setting item ${key}:`, error);
            return false;
        }
    }

    removeStorageItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing item ${key}:`, error);
            return false;
        }
    }

    clearStorage() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }

    // ===== Theme Utilities =====
    
    initializeTheme() {
        // Set default theme if not set
        const currentTheme = this.getStorageItem('quizSparkTheme', 'palette1');
        this.applyTheme(currentTheme);
    }

    applyTheme(themeName) {
        document.body.className = '';
        document.body.classList.add(`theme-${themeName}`);
        this.setStorageItem('quizSparkTheme', themeName);
        
        // Dispatch theme change event
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: themeName } }));
    }

    getCurrentTheme() {
        return this.getStorageItem('quizSparkTheme', 'palette1');
    }

    getThemeColors(themeName = null) {
        const theme = themeName || this.getCurrentTheme();
        const themes = {
            palette1: {
                primary: '#8ECAE6',
                primaryDark: '#219EBC',
                secondary: '#023047',
                accent: '#FFB703',
                accentDark: '#FB8500'
            },
            palette2: {
                primary: '#FDC5F5',
                primaryDark: '#F7AEF8',
                secondary: '#B388EB',
                accent: '#8093F1',
                accentDark: '#72DDF7'
            },
            palette3: {
                primary: '#EDAE49',
                primaryDark: '#D1495B',
                secondary: '#00798C',
                accent: '#30638E',
                accentDark: '#003D5B'
            }
        };
        
        return themes[theme] || themes.palette1;
    }

    // ===== Date & Time Utilities =====
    
    formatDate(date, format = 'medium') {
        const d = new Date(date);
        
        const formats = {
            short: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            medium: d.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
            }),
            long: d.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
            }),
            time: d.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit'
            }),
            full: d.toLocaleString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit', 
                minute: '2-digit'
            })
        };
        
        return formats[format] || formats.medium;
    }

    formatTime(seconds, format = 'auto') {
        if (seconds < 60) {
            return `${Math.round(seconds)} seconds`;
        }
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        
        if (format === 'compact') {
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
        
        if (minutes < 60) {
            return `${minutes} minute${minutes !== 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
        }
        
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
    }

    getTimeAgo(date) {
        const now = new Date();
        const past = new Date(date);
        const diffInSeconds = Math.floor((now - past) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Just now';
        }
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
        }
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
        }
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) {
            return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
        }
        
        const diffInWeeks = Math.floor(diffInDays / 7);
        if (diffInWeeks < 4) {
            return `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''} ago`;
        }
        
        return this.formatDate(date, 'short');
    }

    // ===== String Utilities =====
    
    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    truncateText(str, maxLength, suffix = '...') {
        if (!str) return '';
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength - suffix.length) + suffix;
    }

    sanitizeInput(str) {
        if (!str) return '';
        return String(str)
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .trim()
            .substring(0, 50); // Limit length to 50 characters
    }

    sanitizeForHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .trim()
            .substring(0, 50);
    }

    generateRandomString(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // ===== Number Utilities =====
    
    formatNumber(num, decimals = 0) {
        if (isNaN(num)) return '0';
        return num.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    calculatePercentage(part, total) {
        if (total === 0) return 0;
        return Math.round((part / total) * 100);
    }

    // ===== Array Utilities =====
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    uniqueArray(array) {
        return [...new Set(array)];
    }

    sortByKey(array, key, order = 'asc') {
        return [...array].sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            
            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // ===== DOM Utilities =====
    
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else if (key.startsWith('on')) {
                element.addEventListener(key.substring(2).toLowerCase(), value);
            } else {
                element.setAttribute(key, value);
            }
        });
        
        // Append children
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });
        
        return element;
    }

    showElement(element, display = 'block') {
        if (element) {
            element.style.display = display;
        }
    }

    hideElement(element) {
        if (element) {
            element.style.display = 'none';
        }
    }

    toggleElement(element, display = 'block') {
        if (element) {
            if (element.style.display === 'none') {
                element.style.display = display;
            } else {
                element.style.display = 'none';
            }
        }
    }

    addClass(element, className) {
        if (element) {
            element.classList.add(className);
        }
    }

    removeClass(element, className) {
        if (element) {
            element.classList.remove(className);
        }
    }

    toggleClass(element, className) {
        if (element) {
            element.classList.toggle(className);
        }
    }

    // ===== Event Utilities =====
    
    debounce(func, wait) {
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

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // ===== Notification Utilities =====
    
    showNotification(message, type = 'info', duration = 3000) {
        const container = document.getElementById('notification-container') || this.createNotificationContainer();
        
        const notification = this.createElement('div', {
            className: `notification notification-${type}`,
            style: `
                background: ${this.getNotificationColor(type)};
                color: ${type === 'warning' ? 'var(--dark)' : 'white'};
                padding: 1rem 1.5rem;
                border-radius: var(--radius-md);
                margin-bottom: 0.5rem;
                animation: slideInRight 0.3s ease;
                box-shadow: var(--shadow-md);
                display: flex;
                align-items: center;
                gap: 0.75rem;
            `
        }, [
            this.getNotificationIcon(type),
            message
        ]);
        
        container.appendChild(notification);
        
        // Auto remove after duration
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
        
        return notification;
    }

    createNotificationContainer() {
        const container = this.createElement('div', {
            id: 'notification-container',
            style: `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                max-width: 350px;
            `
        });
        
        document.body.appendChild(container);
        
        // Add animation styles
        const style = this.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
        
        return container;
    }

    getNotificationColor(type) {
        const colors = {
            success: 'var(--success)',
            error: 'var(--danger)',
            warning: 'var(--warning)',
            info: 'var(--info)'
        };
        return colors[type] || colors.info;
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    // ===== Validation Utilities =====
    
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    isValidName(name) {
        return name && name.trim().length >= 2 && name.length <= 50;
    }

    isValidScore(score) {
        return !isNaN(score) && score >= 0 && score <= 100;
    }

    // ===== Animation Utilities =====
    
    fadeIn(element, duration = 300) {
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.min(progress / duration, 1);
            
            element.style.opacity = opacity.toString();
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    fadeOut(element, duration = 300) {
        if (!element) return;
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.max(1 - progress / duration, 0);
            
            element.style.opacity = opacity.toString();
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
                element.style.opacity = '1';
            }
        };
        
        requestAnimationFrame(animate);
    }

    slideIn(element, direction = 'up', duration = 300) {
        if (!element) return;
        
        const directions = {
            up: 'translateY(20px)',
            down: 'translateY(-20px)',
            left: 'translateX(20px)',
            right: 'translateX(-20px)'
        };
        
        element.style.transform = directions[direction] || directions.up;
        element.style.opacity = '0';
        element.style.display = 'block';
        
        setTimeout(() => {
            element.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;
            element.style.transform = 'translate(0, 0)';
            element.style.opacity = '1';
        }, 10);
    }

    // ===== Browser Utilities =====
    
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        let version = 'Unknown';
        
        if (ua.includes('Firefox')) {
            browser = 'Firefox';
            version = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || 'Unknown';
        } else if (ua.includes('Chrome') && !ua.includes('Edg')) {
            browser = 'Chrome';
            version = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || 'Unknown';
        } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
            browser = 'Safari';
            version = ua.match(/Version\/(\d+\.\d+)/)?.[1] || 'Unknown';
        } else if (ua.includes('Edg')) {
            browser = 'Edge';
            version = ua.match(/Edg\/(\d+\.\d+)/)?.[1] || 'Unknown';
        }
        
        return { browser, version };
    }

    // ===== Performance Utilities =====
    
    measurePerformance(name, callback) {
        if (window.performance && performance.mark) {
            const startMark = `${name}-start`;
            const endMark = `${name}-end`;
            
            performance.mark(startMark);
            const result = callback();
            performance.mark(endMark);
            
            performance.measure(name, startMark, endMark);
            const measure = performance.getEntriesByName(name)[0];
            
            console.log(`${name} took ${measure.duration.toFixed(2)}ms`);
            
            // Clean up
            performance.clearMarks(startMark);
            performance.clearMarks(endMark);
            performance.clearMeasures(name);
            
            return result;
        }
        
        return callback();
    }

    // ===== Service Worker Utilities =====
    
    setupServiceWorker() {
        // Temporarily disabled for debugging
        /*
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(
                    (registration) => {
                        console.log('ServiceWorker registration successful:', registration.scope);
                    },
                    (error) => {
                        console.log('ServiceWorker registration failed:', error);
                    }
                );
            });
        }
        */
    }

    // ===== Error Handling Utilities =====
    
    showError(message, duration = 5000) {
        return this.showNotification(message, 'error', duration);
    }

    showSuccess(message, duration = 3000) {
        return this.showNotification(message, 'success', duration);
    }

    showWarning(message, duration = 4000) {
        return this.showNotification(message, 'warning', duration);
    }

    showStorageWarning() {
        if (!this.isLocalStorageAvailable()) {
            this.showWarning(
                'Your browser does not support local storage. Some features may not work properly.',
                10000
            );
        }
    }

    handleError(error, context = '') {
        console.error(`Error in ${context}:`, error);
        
        // Show user-friendly error
        this.showError(
            `An error occurred${context ? ` in ${context}` : ''}. Please try again.`
        );
        
        // Send to analytics if available
        if (window.gtag) {
            window.gtag('event', 'exception', {
                description: error.message,
                fatal: false
            });
        }
    }

    // ===== Quiz Specific Utilities =====
    
    calculateQuizScore(correctAnswers, totalQuestions) {
        return Math.round((correctAnswers / totalQuestions) * 100);
    }

    getDifficultyMultiplier(difficulty) {
        const multipliers = {
            easy: 1,
            medium: 1.5,
            hard: 2
        };
        return multipliers[difficulty] || 1;
    }

    generateSessionId() {
        return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getCategoryDisplayName(category) {
        const categories = {
            general: 'General Knowledge',
            science: 'Science & Technology',
            programming: 'Programming',
            history: 'History',
            math: 'Mathematics'
        };
        return categories[category] || this.capitalizeFirst(category);
    }

    getCategoryIcon(category) {
        const icons = {
            general: '🌍',
            science: '🔬',
            programming: '💻',
            history: '📜',
            math: '🧮'
        };
        return icons[category] || '❓';
    }
}

// ===== Initialize Utilities =====
document.addEventListener('DOMContentLoaded', () => {
    // Create global utils instance
    window.utils = new QuizUtils();
    
    // Make some utility functions globally available
    window.formatTime = (seconds) => window.utils.formatTime(seconds);
    window.formatDate = (date, format) => window.utils.formatDate(date, format);
    window.capitalizeFirst = (str) => window.utils.capitalizeFirst(str);
    window.truncateText = (str, length) => window.utils.truncateText(str, length);
    window.showNotification = (msg, type) => window.utils.showNotification(msg, type);
    
    // Add polyfills for older browsers
    addPolyfills();
});

// ===== Polyfills =====
function addPolyfills() {
    // String.prototype.padStart
    if (!String.prototype.padStart) {
        String.prototype.padStart = function padStart(targetLength, padString) {
            targetLength = targetLength >> 0;
            padString = String(padString || ' ');
            if (this.length > targetLength) {
                return String(this);
            } else {
                targetLength = targetLength - this.length;
                if (targetLength > padString.length) {
                    padString += padString.repeat(targetLength / padString.length);
                }
                return padString.slice(0, targetLength) + String(this);
            }
        };
    }
    
    // Array.prototype.includes
    if (!Array.prototype.includes) {
        Array.prototype.includes = function(searchElement, fromIndex) {
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }
            
            var o = Object(this);
            var len = o.length >>> 0;
            
            if (len === 0) {
                return false;
            }
            
            var n = fromIndex | 0;
            var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
            
            while (k < len) {
                if (o[k] === searchElement) {
                    return true;
                }
                k++;
            }
            return false;
        };
    }
    
    // Object.entries
    if (!Object.entries) {
        Object.entries = function(obj) {
            var ownProps = Object.keys(obj),
                i = ownProps.length,
                resArray = new Array(i);
            while (i--) {
                resArray[i] = [ownProps[i], obj[ownProps[i]]];
            }
            return resArray;
        };
    }
}

// ===== Export for Node.js/CommonJS (if needed) =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuizUtils;
}