// ===== Main JavaScript for QuizSpark Home Page =====

class QuizApp {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.loadLeaderboardPreview();
        this.setupModals();
    }

    initializeElements() {
        // Modal elements
        this.startModal = document.getElementById('startModal');
        this.closeModalBtn = document.querySelector('.close');
        this.startQuizBtn = document.getElementById('startQuizBtn');
        this.numQuestionsSelect = document.getElementById('numQuestions');
        this.timerToggle = document.getElementById('timerToggle');
        this.timerValue = document.getElementById('timerValue');
        this.difficultySelect = document.getElementById('difficulty');
        
        // Settings
        this.selectedCategory = 'general';
        this.quizSettings = this.loadQuizSettings();
        
        // Leaderboard preview
        this.leaderboardTable = document.querySelector('.leaderboard-table');
    }

    setupEventListeners() {
        // Category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const categoryCard = e.target.closest('.category-card');
                this.selectedCategory = categoryCard.dataset.category;
                this.showStartModal();
            });
        });

        // Modal events
        this.closeModalBtn.addEventListener('click', () => this.hideStartModal());
        this.startQuizBtn.addEventListener('click', () => {
            this.startQuiz();
        });
        
        // Timer toggle
        this.timerToggle.addEventListener('change', () => {
            this.updateTimerValue();
        });

        // Settings change events
        this.numQuestionsSelect.addEventListener('change', () => this.saveSettings());
        this.difficultySelect.addEventListener('change', () => this.saveSettings());
        this.timerToggle.addEventListener('change', () => this.saveSettings());

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.startModal) {
                this.hideStartModal();
            }
        });

        // Load leaderboard data
        this.loadLeaderboardPreview();
    }

    setupModals() {
        // Initialize modal state
        this.startModal.style.display = 'none';
    }

    showStartModal() {
        // Load saved settings
        this.loadSettings();
        
        // Update modal UI with current settings
        this.numQuestionsSelect.value = this.quizSettings.numQuestions;
        this.timerToggle.checked = this.quizSettings.enableTimer;
        this.difficultySelect.value = this.quizSettings.difficulty;
        this.updateTimerValue();
        
        // Show modal with animation
        this.startModal.style.display = 'flex';
        setTimeout(() => {
            this.startModal.classList.add('active');
        }, 10);
    }

    hideStartModal() {
        this.startModal.classList.remove('active');
        setTimeout(() => {
            this.startModal.style.display = 'none';
        }, 300);
    }

    updateTimerValue() {
        const isTimerEnabled = this.timerToggle.checked;
        this.timerValue.textContent = isTimerEnabled ? '30 seconds per question' : 'Timer disabled';
        this.timerValue.style.color = isTimerEnabled ? 'var(--success)' : 'var(--gray-dark)';
    }

    startQuiz() {
        // Save current settings
        this.saveSettings();
        
        // Get quiz parameters
        const numQuestions = parseInt(this.numQuestionsSelect.value);
        const enableTimer = this.timerToggle.checked;
        const difficulty = this.difficultySelect.value;
        
        // Validate parameters
        if (isNaN(numQuestions) || numQuestions < 1 || numQuestions > 50) {
            alert('Invalid number of questions selected. Please choose between 1 and 50.');
            return;
        }
        
        // Hide modal
        this.hideStartModal();
        
        // Navigate to quiz page with parameters
        const quizUrl = `quiz.html?category=${encodeURIComponent(this.selectedCategory)}&questions=${numQuestions}&timer=${enableTimer}&difficulty=${encodeURIComponent(difficulty)}`;
        
        // Add loading animation to button
        this.startQuizBtn.classList.add('loading');
        this.startQuizBtn.textContent = 'Loading...';
        
        // Use a more robust navigation approach
        setTimeout(() => {
            try {
                window.location.href = quizUrl;
            } catch (error) {
                console.error('Navigation error:', error);
                this.startQuizBtn.classList.remove('loading');
                this.startQuizBtn.textContent = 'Start Quiz Now!';
                alert('Failed to start quiz. Please try again.');
            }
        }, 300);
    }

    saveSettings() {
        const settings = {
            numQuestions: this.numQuestionsSelect.value,
            enableTimer: this.timerToggle.checked,
            difficulty: this.difficultySelect.value,
            lastCategory: this.selectedCategory
        };
        
        localStorage.setItem('quizSparkSettings', JSON.stringify(settings));
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('quizSparkSettings');
        if (savedSettings) {
            this.quizSettings = JSON.parse(savedSettings);
        } else {
            // Default settings
            this.quizSettings = {
                numQuestions: '10',
                enableTimer: true,
                difficulty: 'medium',
                lastCategory: 'general'
            };
        }
    }

    loadQuizSettings() {
        return this.quizSettings || this.loadSettings();
    }

    loadLeaderboardPreview() {
        // Get top 5 scores from localStorage
        const scores = this.getLeaderboardScores();
        const topScores = scores.slice(0, 5);
        
        // Clear existing rows except header
        const rows = this.leaderboardTable.querySelectorAll('.leaderboard-row:not(.header)');
        rows.forEach(row => row.remove());
        
        // Add top scores to preview
        topScores.forEach((score, index) => {
            const row = this.createLeaderboardRow(score, index + 1);
            this.leaderboardTable.appendChild(row);
        });
        
        // If no scores, show message
        if (topScores.length === 0) {
            const emptyRow = document.createElement('div');
            emptyRow.className = 'leaderboard-row';
            emptyRow.innerHTML = '<div class="empty-message" style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--gray-dark);">No scores yet. Be the first to take a quiz!</div>';
            this.leaderboardTable.appendChild(emptyRow);
        }
    }

    getLeaderboardScores() {
        const scores = localStorage.getItem('quizSparkLeaderboard');
        if (scores) {
            return JSON.parse(scores).sort((a, b) => b.score - a.score);
        }
        return [];
    }

    createLeaderboardRow(scoreData, rank) {
        const row = document.createElement('div');
        row.className = 'leaderboard-row';
        
        // Format time
        const formattedTime = this.formatTime(scoreData.timeTaken);
        
        // Format player name (truncate if too long)
        const playerName = scoreData.playerName.length > 15 
            ? scoreData.playerName.substring(0, 12) + '...'
            : scoreData.playerName;
        
        row.innerHTML = `
            <span class="rank">${this.getRankIcon(rank)} ${rank}</span>
            <span class="name">${playerName}</span>
            <span class="score">${scoreData.score}%</span>
            <span class="time">${formattedTime}</span>
        `;
        
        // Add click event to view full leaderboard
        row.addEventListener('click', () => {
            window.location.href = 'leaderboard.html';
        });
        
        return row;
    }

    getRankIcon(rank) {
        switch(rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return rank;
        }
    }

    formatTime(seconds) {
        if (seconds < 60) {
            return `${Math.round(seconds)}s`;
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return `${minutes}m ${remainingSeconds}s`;
    }

    // Category-specific start functions
    startQuizByCategory(category) {
        this.selectedCategory = category;
        this.showStartModal();
    }
}

// ===== Theme Management =====
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('quizSparkTheme') || 'palette1';
        this.applyTheme(this.currentTheme);
        this.setupThemeSelector();
    }

    applyTheme(theme) {
        document.body.className = '';
        document.body.classList.add(`theme-${theme}`);
        localStorage.setItem('quizSparkTheme', theme);
    }

    setupThemeSelector() {
        const themeSelect = document.getElementById('theme');
        if (themeSelect) {
            themeSelect.value = this.currentTheme;
            themeSelect.addEventListener('change', (e) => {
                this.applyTheme(e.target.value);
            });
        }
    }
}

// ===== Page Animations =====
class PageAnimations {
    constructor() {
        this.initializeAnimations();
        this.setupScrollAnimations();
        this.setupHoverEffects();
    }

    initializeAnimations() {
        // Animate category cards on load
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 * index);
        });

        // Animate features
        const features = document.querySelectorAll('.feature');
        features.forEach((feature, index) => {
            feature.style.opacity = '0';
            feature.style.transform = 'translateX(20px)';
            
            setTimeout(() => {
                feature.style.transition = 'all 0.5s ease';
                feature.style.opacity = '1';
                feature.style.transform = 'translateX(0)';
            }, 200 + (100 * index));
        });
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for scroll animations
        document.querySelectorAll('.category-card, .feature, .stat').forEach(el => {
            observer.observe(el);
        });
    }

    setupHoverEffects() {
        // Add hover effects to buttons
        const buttons = document.querySelectorAll('.btn, .category-btn, .action-btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px)';
                button.style.boxShadow = 'var(--shadow-lg)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0)';
                button.style.boxShadow = 'var(--shadow-md)';
            });
        });

        // Add pulse animation to CTA button
        const ctaButton = document.querySelector('.generate-btn');
        if (ctaButton) {
            setInterval(() => {
                ctaButton.classList.toggle('pulse');
            }, 3000);
        }
    }
}

// ===== Notification System =====
class NotificationSystem {
    constructor() {
        this.notificationContainer = this.createNotificationContainer();
    }

    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 350px;
        `;
        document.body.appendChild(container);
        return container;
    }

    show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Set styles based on type
        const typeStyles = {
            success: {
                background: 'var(--success)',
                color: 'white',
                icon: '✅'
            },
            error: {
                background: 'var(--danger)',
                color: 'white',
                icon: '❌'
            },
            warning: {
                background: 'var(--warning)',
                color: 'var(--dark)',
                icon: '⚠️'
            },
            info: {
                background: 'var(--info)',
                color: 'white',
                icon: 'ℹ️'
            }
        };

        const style = typeStyles[type] || typeStyles.info;
        
        notification.style.cssText = `
            background: ${style.background};
            color: ${style.color};
            padding: 1rem 1.5rem;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            animation: slideIn 0.3s ease;
            transform: translateX(100%);
            opacity: 0;
        `;
        
        notification.innerHTML = `
            <span style="font-size: 1.2rem;">${style.icon}</span>
            <span>${message}</span>
        `;

        this.notificationContainer.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 10);

        // Auto remove after duration
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);

        return notification;
    }

    addCSSAnimation() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ===== Utility Functions =====
class Utilities {
    static formatNumber(num) {
        return num.toLocaleString();
    }

    static capitalizeFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    static getRandomColor() {
        const colors = [
            '#8ECAE6', '#219EBC', '#023047', '#FFB703', '#FB8500',
            '#FDC5F5', '#F7AEF8', '#B388EB', '#8093F1', '#72DDF7',
            '#EDAE49', '#D1495B', '#00798C', '#30638E', '#003D5B'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    static debounce(func, wait) {
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

    static throttle(func, limit) {
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
}

// ===== Initialize Everything =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main app
    window.quizApp = new QuizApp();
    
    // Initialize theme manager
    window.themeManager = new ThemeManager();
    
    // Initialize animations
    window.pageAnimations = new PageAnimations();
    
    // Initialize notification system
    window.notifications = new NotificationSystem();
    window.notifications.addCSSAnimation();
    
    // Make utilities globally available
    window.utils = Utilities;

    // Test notification (optional - remove in production)
    setTimeout(() => {
        window.notifications.show('Welcome to QuizSpark! Ready to test your knowledge?', 'success', 4000);
    }, 1000);

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + 1-5 to select categories
        if (e.ctrlKey || e.metaKey) {
            const key = parseInt(e.key);
            if (key >= 1 && key <= 5) {
                const categories = ['general', 'science', 'programming', 'history', 'math'];
                const category = categories[key - 1];
                const categoryCard = document.querySelector(`[data-category="${category}"]`);
                if (categoryCard) {
                    categoryCard.querySelector('.category-btn').click();
                    e.preventDefault();
                }
            }
        }
        
        // Escape to close modal
        if (e.key === 'Escape' && window.quizApp.startModal.style.display === 'flex') {
            window.quizApp.hideStartModal();
        }
    });

    // Add service worker for PWA capabilities (optional)
    // Temporarily commented out for debugging
/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}
*/

});

// ===== Global Functions =====
function startQuiz(category) {
    // Ensure category is valid
    if (!category || typeof category !== 'string') {
        console.error('Invalid category parameter:', category);
        category = 'general';
    }
    
    // Check if quizApp is initialized
    if (window.quizApp && window.quizApp instanceof QuizApp) {
        // Set the selected category before starting the quiz
        window.quizApp.selectedCategory = category;
        window.quizApp.showStartModal();
    } else {
        // Fallback if quizApp is not available - create URL with default parameters
        const url = `quiz.html?category=${encodeURIComponent(category)}&questions=10&timer=true&difficulty=medium`;
        console.log('Navigating to quiz with URL:', url);
        try {
            window.location.href = url;
        } catch (error) {
            console.error('Navigation error:', error);
            // Show error to user
            alert('Failed to start quiz. Please try again.');
        }
    }
}

// ===== Polyfills for older browsers =====
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

// ===== Performance Monitoring =====
if (typeof PerformanceObserver !== 'undefined') {
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            console.log(`[Performance] ${entry.name}: ${entry.duration.toFixed(2)}ms`);
        }
    });
    observer.observe({ entryTypes: ['measure'] });
}

// ===== Error Handling =====
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    if (window.notifications) {
        window.notifications.show(
            'An error occurred. Please refresh the page.',
            'error',
            5000
        );
    }
    
    // Send error to analytics (optional)
    if (window.ga) {
        window.ga('send', 'exception', {
            exDescription: event.error.message,
            exFatal: false
        });
    }
    
    return false;
});

// ===== Offline Detection =====
window.addEventListener('online', () => {
    if (window.notifications) {
        window.notifications.show('You are back online!', 'success', 3000);
    }
});

window.addEventListener('offline', () => {
    if (window.notifications) {
        window.notifications.show('You are offline. Some features may not work.', 'warning', 5000);
    }
});