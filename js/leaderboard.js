// ===== Leaderboard Logic for QuizSpark =====

class Leaderboard {
    constructor() {
        this.scores = [];
        this.filteredScores = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.totalPages = 1;
        this.currentFilter = 'all';
        this.timeFilter = 'all';
        
        this.initializeElements();
        this.loadScores();
        this.setupEventListeners();
        this.renderLeaderboard();
        this.updateStats();
        this.loadAchievements();
    }

    initializeElements() {
        // Filter elements
        this.categoryFilter = document.getElementById('categoryFilter');
        this.timeFilterSelect = document.getElementById('timeFilter');
        this.resetScoresBtn = document.getElementById('resetScores');
        
        // Podium elements
        this.firstPlace = document.getElementById('firstPlace');
        this.secondPlace = document.getElementById('secondPlace');
        this.thirdPlace = document.getElementById('thirdPlace');
        
        // Table elements
        this.leaderboardBody = document.getElementById('leaderboardBody');
        this.totalPlayers = document.getElementById('totalPlayers');
        this.averageScore = document.getElementById('averageScore');
        
        // Pagination elements
        this.prevPageBtn = document.getElementById('prevPage');
        this.nextPageBtn = document.getElementById('nextPage');
        this.currentPageSpan = document.getElementById('currentPage');
        this.totalPagesSpan = document.getElementById('totalPages');
        
        // Personal stats elements
        this.personalStats = document.getElementById('personalStats');
        this.personalBest = document.getElementById('personalBest');
        this.totalQuizzes = document.getElementById('totalQuizzes');
        this.avgPersonalScore = document.getElementById('avgPersonalScore');
        this.personalRank = document.getElementById('personalRank');
        
        // Achievements elements
        this.badgesGrid = document.getElementById('badgesGrid');
        
        // Modal elements
        this.deleteModal = document.getElementById('deleteModal');
        this.confirmDeleteBtn = document.getElementById('confirmDelete');
        this.cancelDeleteBtn = document.getElementById('cancelDelete');
    }

    loadScores() {
        const savedScores = localStorage.getItem('quizSparkLeaderboard');
        this.scores = savedScores ? JSON.parse(savedScores) : [];
        
        // Sort scores by score (descending)
        this.scores.sort((a, b) => b.score - a.score);
        
        // Add ranks to scores
        this.scores.forEach((score, index) => {
            score.rank = index + 1;
        });
        
        // Apply initial filters
        this.applyFilters();
    }

    applyFilters() {
        let filtered = [...this.scores];
        
        // Apply category filter
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(score => score.category === this.currentFilter);
        }
        
        // Apply time filter
        if (this.timeFilter !== 'all') {
            const now = new Date();
            filtered = filtered.filter(score => {
                const scoreDate = new Date(score.timestamp);
                
                switch(this.timeFilter) {
                    case 'today':
                        return scoreDate.toDateString() === now.toDateString();
                    case 'week':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return scoreDate >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        return scoreDate >= monthAgo;
                    default:
                        return true;
                }
            });
        }
        
        this.filteredScores = filtered;
        this.totalPages = Math.ceil(this.filteredScores.length / this.itemsPerPage);
        this.updatePagination();
    }

    renderLeaderboard() {
        // Update podium
        this.updatePodium();
        
        // Update table
        this.updateTable();
        
        // Update stats
        this.updateStats();
        
        // Update personal stats
        this.updatePersonalStats();
    }

    updatePodium() {
        const topScores = this.filteredScores.slice(0, 3);
        
        // Helper function to safely update podium elements
        const updatePodiumElement = (element, playerName, score) => {
            // Clear existing content
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
            
            // Create new content
            const nameSpan = document.createElement('span');
            nameSpan.className = 'player-name';
            nameSpan.textContent = this.truncateName(playerName, 15);
            
            const scoreSpan = document.createElement('span');
            scoreSpan.className = 'player-score';
            scoreSpan.textContent = `${score}%`;
            
            element.appendChild(nameSpan);
            element.appendChild(scoreSpan);
        };
        
        // First place
        if (topScores[0]) {
            updatePodiumElement(this.firstPlace, topScores[0].playerName, topScores[0].score);
        } else {
            updatePodiumElement(this.firstPlace, 'No scores yet', 0);
        }
        
        // Second place
        if (topScores[1]) {
            updatePodiumElement(this.secondPlace, topScores[1].playerName, topScores[1].score);
        } else {
            updatePodiumElement(this.secondPlace, '-', 0);
        }
        
        // Third place
        if (topScores[2]) {
            updatePodiumElement(this.thirdPlace, topScores[2].playerName, topScores[2].score);
        } else {
            updatePodiumElement(this.thirdPlace, '-', 0);
        }
    }

    updateTable() {
        this.leaderboardBody.innerHTML = '';
        
        if (this.filteredScores.length === 0) {
            const emptyRow = document.createElement('div');
            emptyRow.className = 'table-row empty-row';
            emptyRow.style.gridColumn = '1 / -1';
            emptyRow.style.textAlign = 'center';
            emptyRow.style.padding = '2rem';
            emptyRow.style.color = 'var(--gray-dark)';
            emptyRow.textContent = 'No scores yet. Take a quiz to appear here!';
            this.leaderboardBody.appendChild(emptyRow);
            return;
        }
        
        // Calculate pagination slice
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageScores = this.filteredScores.slice(startIndex, endIndex);
        
        pageScores.forEach((score, index) => {
            const globalIndex = startIndex + index;
            const row = this.createTableRow(score, globalIndex + 1);
            this.leaderboardBody.appendChild(row);
        });
    }

    createTableRow(score, displayRank) {
        const row = document.createElement('div');
        row.className = 'table-row';
        row.dataset.scoreId = score.timestamp;
        
        // Format category name
        const categoryNames = {
            'general': 'General',
            'science': 'Science',
            'programming': 'Programming',
            'history': 'History',
            'math': 'Mathematics'
        };
        
        // Format date
        const date = new Date(score.timestamp);
        const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        // Format time
        const formattedTime = this.formatTime(score.timeTaken);
        
        // Create cells safely
        const rankCell = document.createElement('div');
        rankCell.className = 'cell rank';
        rankCell.textContent = `${this.getRankIcon(displayRank)} ${displayRank}`;
        
        const playerCell = document.createElement('div');
        playerCell.className = 'cell player';
        
        const playerNameSpan = document.createElement('span');
        playerNameSpan.className = 'player-name';
        playerNameSpan.textContent = this.truncateName(score.playerName, 20);
        playerCell.appendChild(playerNameSpan);
        
        if (score.difficulty) {
            const difficultySpan = document.createElement('span');
            difficultySpan.className = `player-difficulty ${score.difficulty}`;
            difficultySpan.textContent = score.difficulty;
            playerCell.appendChild(difficultySpan);
        }
        
        const categoryCell = document.createElement('div');
        categoryCell.className = 'cell category';
        categoryCell.textContent = categoryNames[score.category] || score.category;
        
        const scoreCell = document.createElement('div');
        scoreCell.className = 'cell score';
        scoreCell.textContent = `${score.score}%`;
        
        const timeCell = document.createElement('div');
        timeCell.className = 'cell time';
        timeCell.textContent = formattedTime;
        
        const dateCell = document.createElement('div');
        dateCell.className = 'cell date';
        dateCell.textContent = formattedDate;
        
        // Append all cells to row
        row.appendChild(rankCell);
        row.appendChild(playerCell);
        row.appendChild(categoryCell);
        row.appendChild(scoreCell);
        row.appendChild(timeCell);
        row.appendChild(dateCell);
        
        // Add click effect
        row.addEventListener('click', () => {
            this.showScoreDetails(score);
        });
        
        return row;
    }

    updateStats() {
        this.totalPlayers.textContent = this.filteredScores.length;
        
        if (this.filteredScores.length > 0) {
            const totalScore = this.filteredScores.reduce((sum, score) => sum + score.score, 0);
            const average = Math.round(totalScore / this.filteredScores.length);
            this.averageScore.textContent = `${average}%`;
        } else {
            this.averageScore.textContent = '0%';
        }
    }

    updatePersonalStats() {
        // Try to identify current player (simplified - in real app, use user authentication)
        const playerName = localStorage.getItem('quizSparkPlayerName') || 'You';
        const playerScores = this.scores.filter(score => score.playerName === playerName);
        
        if (playerScores.length > 0) {
            this.personalStats.style.display = 'block';
            
            // Personal best
            const bestScore = Math.max(...playerScores.map(s => s.score));
            this.personalBest.textContent = `${bestScore}%`;
            
            // Total quizzes
            this.totalQuizzes.textContent = playerScores.length;
            
            // Average score
            const totalScore = playerScores.reduce((sum, score) => sum + score.score, 0);
            const average = Math.round(totalScore / playerScores.length);
            this.avgPersonalScore.textContent = `${average}%`;
            
            // Global rank (find highest rank)
            const highestRank = Math.min(...playerScores.map(s => s.rank));
            
            // Add crown icon if player is in top 3
            const topScore = playerScores.find(score => score.rank <= 3);
            if (topScore) {
                // Clear existing content
                while (this.personalRank.firstChild) {
                    this.personalRank.removeChild(this.personalRank.firstChild);
                }
                
                // Create new content
                const rankText = document.createTextNode(`#${topScore.rank} `);
                const iconSpan = document.createElement('span');
                iconSpan.innerHTML = this.getRankIcon(topScore.rank);
                
                this.personalRank.appendChild(rankText);
                this.personalRank.appendChild(iconSpan);
            } else {
                this.personalRank.textContent = `#${highestRank}`;
            }
        } else {
            this.personalStats.style.display = 'none';
        }
    }

    updatePagination() {
        this.currentPageSpan.textContent = this.currentPage;
        this.totalPagesSpan.textContent = this.totalPages;
        
        this.prevPageBtn.disabled = this.currentPage === 1;
        this.nextPageBtn.disabled = this.currentPage === this.totalPages || this.totalPages === 0;
    }

    loadAchievements() {
        const achievements = [
            {
                id: 'first_quiz',
                name: 'First Steps',
                description: 'Complete your first quiz',
                icon: '🎯',
                condition: (scores) => scores.length >= 1
            },
            {
                id: 'perfect_score',
                name: 'Perfect Score',
                description: 'Get 100% on any quiz',
                icon: '🌟',
                condition: (scores) => scores.some(s => s.score === 100)
            },
            {
                id: 'quiz_master',
                name: 'Quiz Master',
                description: 'Complete 10 quizzes',
                icon: '🏆',
                condition: (scores) => scores.length >= 10
            },
            {
                id: 'speed_demon',
                name: 'Speed Demon',
                description: 'Complete a quiz in under 2 minutes',
                icon: '⚡',
                condition: (scores) => scores.some(s => s.timeTaken < 120)
            },
            {
                id: 'category_expert',
                name: 'Category Expert',
                description: 'Score 90%+ in all categories',
                icon: '🧠',
                condition: (scores) => {
                    const categories = ['general', 'science', 'programming', 'history', 'math'];
                    return categories.every(cat => {
                        const catScores = scores.filter(s => s.category === cat);
                        return catScores.some(s => s.score >= 90);
                    });
                }
            },
            {
                id: 'consistency',
                name: 'Consistency',
                description: 'Get 80%+ on 5 quizzes in a row',
                icon: '📈',
                condition: (scores) => {
                    if (scores.length < 5) return false;
                    const recentScores = scores.slice(0, 5);
                    return recentScores.every(s => s.score >= 80);
                }
            }
        ];
        
        // Clear existing badges
        while (this.badgesGrid.firstChild) {
            this.badgesGrid.removeChild(this.badgesGrid.firstChild);
        }
        
        // For demo purposes, use all scores
        // In real app, filter by current player
        const playerScores = this.scores; // Use all scores for demo
        
        achievements.forEach(achievement => {
            const badge = document.createElement('div');
            badge.className = `badge ${achievement.condition(playerScores) ? 'unlocked' : 'locked'}`;
            badge.dataset.achievementId = achievement.id;
            
            // Create badge content safely
            const iconDiv = document.createElement('div');
            iconDiv.className = 'badge-icon';
            iconDiv.textContent = achievement.icon;
            
            const nameDiv = document.createElement('div');
            nameDiv.className = 'badge-name';
            nameDiv.textContent = achievement.name;
            
            const descDiv = document.createElement('div');
            descDiv.className = 'badge-description';
            descDiv.textContent = achievement.description;
            
            const statusDiv = document.createElement('div');
            statusDiv.className = 'badge-status';
            statusDiv.textContent = achievement.condition(playerScores) ? '✅ Unlocked' : '🔒 Locked';
            
            // Append all elements to badge
            badge.appendChild(iconDiv);
            badge.appendChild(nameDiv);
            badge.appendChild(descDiv);
            badge.appendChild(statusDiv);
            
            this.badgesGrid.appendChild(badge);
        });
    }

    setupEventListeners() {
        // Filter changes
        this.categoryFilter.addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.currentPage = 1;
            this.applyFilters();
            this.renderLeaderboard();
        });
        
        this.timeFilterSelect.addEventListener('change', (e) => {
            this.timeFilter = e.target.value;
            this.currentPage = 1;
            this.applyFilters();
            this.renderLeaderboard();
        });
        
        // Pagination
        this.prevPageBtn.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.updateTable();
                this.updatePagination();
            }
        });
        
        this.nextPageBtn.addEventListener('click', () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.updateTable();
                this.updatePagination();
            }
        });
        
        // Reset scores
        this.resetScoresBtn.addEventListener('click', () => {
            this.showDeleteConfirmation();
        });
        
        // Delete confirmation modal
        this.confirmDeleteBtn.addEventListener('click', () => {
            this.deleteAllScores();
            this.hideDeleteModal();
        });
        
        this.cancelDeleteBtn.addEventListener('click', () => {
            this.hideDeleteModal();
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.deleteModal) {
                this.hideDeleteModal();
            }
        });
        
        // Export functionality (bonus feature)
        this.setupExportButton();
        
        // Search functionality (bonus feature)
        this.setupSearch();
    }

    setupExportButton() {
        // Create export button if it doesn't exist
        if (!document.getElementById('exportBtn')) {
            const exportBtn = document.createElement('button');
            exportBtn.id = 'exportBtn';
            exportBtn.className = 'action-btn';
            exportBtn.textContent = '📊 Export Data';
            exportBtn.style.marginLeft = '1rem';
            
            exportBtn.addEventListener('click', () => this.exportData());
            
            // Add to filter controls
            const filterControls = document.querySelector('.filter-controls');
            if (filterControls) {
                filterControls.appendChild(exportBtn);
            }
        }
    }

    setupSearch() {
        // Create search input if it doesn't exist
        if (!document.getElementById('searchInput')) {
            const searchContainer = document.createElement('div');
            searchContainer.className = 'filter-group';
            searchContainer.style.marginTop = '1rem';
            
            searchContainer.innerHTML = `
                <label for="searchInput">Search Player:</label>
                <input type="text" id="searchInput" placeholder="Enter player name..." style="
                    padding: 0.5rem;
                    border: 2px solid var(--gray);
                    border-radius: var(--radius-md);
                    font-size: 1rem;
                    min-width: 200px;
                ">
            `;
            
            const filterControls = document.querySelector('.filter-controls');
            if (filterControls) {
                filterControls.appendChild(searchContainer);
                
                const searchInput = document.getElementById('searchInput');
                searchInput.addEventListener('input', (e) => {
                    this.searchPlayers(e.target.value);
                });
            }
        }
    }

    searchPlayers(searchTerm) {
        if (!searchTerm.trim()) {
            this.applyFilters();
            this.renderLeaderboard();
            return;
        }
        
        const searchLower = searchTerm.toLowerCase();
        this.filteredScores = this.scores.filter(score => 
            score.playerName.toLowerCase().includes(searchLower)
        );
        
        this.currentPage = 1;
        this.totalPages = Math.ceil(this.filteredScores.length / this.itemsPerPage);
        
        this.updateTable();
        this.updatePagination();
        this.updateStats();
        this.updatePodium();
    }

    exportData() {
        const data = {
            exportedAt: new Date().toISOString(),
            totalScores: this.scores.length,
            scores: this.scores
        };
        
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `quizspark-leaderboard-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Leaderboard data exported successfully!', 'success');
    }

    showDeleteConfirmation() {
        this.deleteModal.style.display = 'flex';
        setTimeout(() => {
            this.deleteModal.classList.add('active');
        }, 10);
    }

    hideDeleteModal() {
        this.deleteModal.classList.remove('active');
        setTimeout(() => {
            this.deleteModal.style.display = 'none';
        }, 300);
    }

    deleteAllScores() {
        localStorage.removeItem('quizSparkLeaderboard');
        this.scores = [];
        this.filteredScores = [];
        this.currentPage = 1;
        
        this.applyFilters();
        this.renderLeaderboard();
        
        this.showNotification('All scores have been reset.', 'success');
    }

    showScoreDetails(score) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        
        const categoryNames = {
            'general': 'General Knowledge',
            'science': 'Science & Technology',
            'programming': 'Programming',
            'history': 'History',
            'math': 'Mathematics'
        };
        
        const date = new Date(score.timestamp);
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <span class="close" style="
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    font-size: 2rem;
                    cursor: pointer;
                    color: var(--gray-dark);
                ">&times;</span>
                
                <h3 style="color: var(--accent-dark); margin-bottom: 1rem;">Score Details</h3>
                
                <div class="score-details" style="
                    background: var(--gray-light);
                    padding: 1.5rem;
                    border-radius: var(--radius-md);
                    margin-bottom: 1.5rem;
                ">
                    <div class="detail-row" style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                        <span style="font-weight: 600; color: var(--gray-dark);">Player:</span>
                        <span style="font-weight: 700;">${score.playerName}</span>
                    </div>
                    
                    <div class="detail-row" style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                        <span style="font-weight: 600; color: var(--gray-dark);">Category:</span>
                        <span>${categoryNames[score.category] || score.category}</span>
                    </div>
                    
                    <div class="detail-row" style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                        <span style="font-weight: 600; color: var(--gray-dark);">Score:</span>
                        <span style="font-weight: 700; color: var(--success);">${score.score}%</span>
                    </div>
                    
                    <div class="detail-row" style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                        <span style="font-weight: 600; color: var(--gray-dark);">Correct Answers:</span>
                        <span>${score.correctAnswers}/${score.totalQuestions}</span>
                    </div>
                    
                    <div class="detail-row" style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                        <span style="font-weight: 600; color: var(--gray-dark);">Time Taken:</span>
                        <span>${this.formatTime(score.timeTaken)}</span>
                    </div>
                    
                    <div class="detail-row" style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                        <span style="font-weight: 600; color: var(--gray-dark);">Difficulty:</span>
                        <span class="difficulty-badge ${score.difficulty}" style="
                            padding: 0.25rem 0.75rem;
                            border-radius: 1rem;
                            font-size: 0.85rem;
                            font-weight: 600;
                            text-transform: capitalize;
                            background: ${score.difficulty === 'easy' ? 'var(--success)' : 
                                      score.difficulty === 'medium' ? 'var(--warning)' : 
                                      'var(--danger)'};
                            color: ${score.difficulty === 'medium' ? 'var(--dark)' : 'white'};
                        ">${score.difficulty}</span>
                    </div>
                    
                    <div class="detail-row" style="display: flex; justify-content: space-between;">
                        <span style="font-weight: 600; color: var(--gray-dark);">Date:</span>
                        <span>${formattedDate}</span>
                    </div>
                </div>
                
                <div class="modal-actions" style="display: flex; gap: 1rem;">
                    <button class="close-modal-btn" style="
                        flex: 1;
                        padding: 0.75rem;
                        background: var(--primary);
                        color: white;
                        border: none;
                        border-radius: var(--radius-md);
                        font-weight: 600;
                        cursor: pointer;
                    ">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Animate in
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
        
        // Close events
        const closeBtn = modal.querySelector('.close');
        const closeModalBtn = modal.querySelector('.close-modal-btn');
        
        const closeModal = () => {
            modal.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        };
        
        closeBtn.addEventListener('click', closeModal);
        closeModalBtn.addEventListener('click', closeModal);
        
        // Close when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Utility Methods
    truncateName(name, maxLength) {
        if (name.length <= maxLength) return name;
        return name.substring(0, maxLength - 3) + '...';
    }

    formatTime(seconds) {
        if (seconds < 60) {
            return `${Math.round(seconds)}s`;
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return `${minutes}m ${remainingSeconds}s`;
    }

    getRankIcon(rank) {
        switch(rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return `#${rank}`;
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Position at bottom for leaderboard
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: var(--radius-md);
            color: white;
            font-weight: 600;
            z-index: 10000;
            animation: slideInUp 0.3s ease, slideOutDown 0.3s ease 2.7s;
            box-shadow: var(--shadow-lg);
        `;
        
        // Type-specific styles
        const styles = {
            success: 'background: var(--success);',
            error: 'background: var(--danger);',
            warning: 'background: var(--warning); color: var(--dark);',
            info: 'background: var(--info);'
        };
        
        notification.style.cssText += styles[type] || styles.info;
        
        document.body.appendChild(notification);
        
        // Remove after delay
        setTimeout(() => {
            notification.remove();
        }, 3000);
        
        return notification;
    }
}

// ===== Initialize Leaderboard =====
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.leaderboard = new Leaderboard();
        
        // Add CSS for animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInUp {
                from {
                    transform: translateY(100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutDown {
                from {
                    transform: translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateY(100%);
                    opacity: 0;
                }
            }
            
            .table-row {
                transition: all 0.2s ease;
                cursor: pointer;
            }
            
            .table-row:hover {
                background: var(--primary-light) !important;
                transform: translateX(5px);
            }
            
            .badge {
                transition: all 0.3s ease;
            }
            
            .badge.unlocked:hover {
                transform: translateY(-5px) scale(1.05);
                box-shadow: var(--shadow-lg);
            }
            
            .badge.locked {
                filter: grayscale(100%);
                opacity: 0.7;
            }
            
            .badge-status {
                margin-top: 0.5rem;
                font-size: 0.8rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .badge.unlocked .badge-status {
                color: var(--success);
            }
            
            .badge.locked .badge-status {
                color: var(--gray-dark);
            }
            
            .player-difficulty {
                display: inline-block;
                padding: 0.1rem 0.5rem;
                border-radius: 1rem;
                font-size: 0.7rem;
                font-weight: 600;
                text-transform: uppercase;
                margin-left: 0.5rem;
                vertical-align: middle;
            }
            
            .player-difficulty.easy {
                background: rgba(40, 167, 69, 0.2);
                color: var(--success);
            }
            
            .player-difficulty.medium {
                background: rgba(255, 193, 7, 0.2);
                color: var(--warning-dark);
            }
            
            .player-difficulty.hard {
                background: rgba(220, 53, 69, 0.2);
                color: var(--danger);
            }
            
            .empty-row {
                animation: fadeIn 0.5s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + E to export
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                if (window.leaderboard.exportData) {
                    window.leaderboard.exportData();
                }
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal[style*="display: flex"]');
                modals.forEach(modal => {
                    const closeBtn = modal.querySelector('.close');
                    if (closeBtn) closeBtn.click();
                });
            }
        });
        
    } catch (error) {
        console.error('Failed to initialize leaderboard:', error);
        document.body.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                padding: 2rem;
                text-align: center;
                background: linear-gradient(135deg, #8ECAE6 0%, #219EBC 100%);
                color: white;
            ">
                <h1 style="font-size: 3rem; margin-bottom: 1rem;">⚠️ Error</h1>
                <p style="font-size: 1.2rem; margin-bottom: 2rem;">
                    Failed to load the leaderboard. Please check your internet connection and try again.
                </p>
                <button onclick="window.location.href='index.html'" style="
                    padding: 1rem 2rem;
                    background: white;
                    color: #219EBC;
                    border: none;
                    border-radius: 8px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">
                    Return to Home
                </button>
            </div>
        `;
    }
});

// ===== Global Functions =====
function resetLeaderboard() {
    if (window.leaderboard && confirm('Are you sure you want to reset all scores? This cannot be undone.')) {
        window.leaderboard.deleteAllScores();
    }
}

function exportLeaderboard() {
    if (window.leaderboard) {
        window.leaderboard.exportData();
    }
}

// ===== Performance Monitoring =====
if (window.performance && performance.mark) {
    performance.mark('leaderboard-js-loaded');
    performance.measure('leaderboard-initialization', 'leaderboard-js-loaded');
}

// ===== Error Boundary =====
window.addEventListener('error', (event) => {
    if (event.target && event.target.tagName === 'SCRIPT') {
        console.error('Script error:', event.error);
        // Show user-friendly error
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: var(--danger);
            color: white;
            padding: 1rem;
            text-align: center;
            z-index: 10000;
            animation: slideDown 0.3s ease;
        `;
        errorDiv.textContent = 'An error occurred while loading the leaderboard. Please refresh the page.';
        document.body.appendChild(errorDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            errorDiv.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => errorDiv.remove(), 300);
        }, 5000);
    }
});

// Add error animation CSS
const errorStyle = document.createElement('style');
errorStyle.textContent = `
    @keyframes slideDown {
        from { transform: translateY(-100%); }
        to { transform: translateY(0); }
    }
    
    @keyframes slideUp {
        from { transform: translateY(0); }
        to { transform: translateY(-100%); }
    }
`;
document.head.appendChild(errorStyle);