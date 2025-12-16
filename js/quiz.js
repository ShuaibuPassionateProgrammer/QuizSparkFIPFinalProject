// ===== Quiz Logic for QuizSpark =====
// Cross-browser compatibility polyfills
if (!Array.prototype.filter) {
    Array.prototype.filter = function (func, thisArg) {
        'use strict';
        if (!((typeof func === 'Function' || typeof func === 'function') && this))
            throw new TypeError();

        var len = this.length >>> 0,
            res = new Array(len), // preallocate array
            t = this, c = 0, i = -1;

        if (thisArg === undefined) {
            while (++i !== len) {
                // checks to see if the key was set
                if (i in this) {
                    if (func(t[i], i, t)) {
                        res[c++] = t[i];
                    }
                }
            }
        } else {
            while (++i !== len) {
                // checks to see if the key was set
                if (i in this) {
                    if (func.call(thisArg, t[i], i, t)) {
                        res[c++] = t[i];
                    }
                }
            }
        }

        res.length = c; // shrink down array to proper size
        return res;
    };
}

if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (callback, thisArg) {
        if (this == null) {
            throw new TypeError('Array.prototype.forEach called on null or undefined');
        }

        var T, k;
        var O = Object(this);
        var len = parseInt(O.length) || 0;

        if (typeof callback !== "function") {
            throw new TypeError(callback + ' is not a function');
        }

        if (arguments.length > 1) {
            T = thisArg;
        }

        k = 0;
        while (k < len) {
            var kValue;
            if (k in O) {
                kValue = O[k];
                callback.call(T, kValue, k, O);
            }
            k++;
        }
    };
}

class Quiz {
    constructor() {
        console.log('Quiz constructor called');
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.totalQuestions = 10;
        this.timerEnabled = true;
        this.timerDuration = 30; // seconds per question
        this.timeRemaining = this.timerDuration;
        this.timerInterval = null;
        this.userAnswers = [];
        this.quizStarted = false;
        this.quizCompleted = false;
        this.startTime = null;
        this.endTime = null;

        console.log('Initializing elements...');
        this.initializeElements();
        console.log('Loading quiz parameters...');
        this.loadQuizParameters();
        console.log('Setting up event listeners...');
        this.setupEventListeners();
        console.log('Updating UI...');
        this.updateUI();
        console.log('Loading questions...');
        // Load questions after a small delay to ensure UI is ready
        setTimeout(() => {
            this.loadQuestions();
        }, 100);
        console.log('Quiz constructor completed');
    }

    initializeElements() {
        console.log('Initializing DOM elements...');

        // Quiz info elements
        this.categoryTitle = document.getElementById('categoryTitle');
        this.quizDescription = document.getElementById('quizDescription');
        this.questionNumber = document.getElementById('questionNumber');
        this.questionDifficulty = document.getElementById('questionDifficulty');
        this.questionText = document.getElementById('questionText');
        this.optionsContainer = document.getElementById('optionsContainer');

        // Check if all elements are present
        const requiredElements = [
            { element: this.categoryTitle, name: 'categoryTitle' },
            { element: this.quizDescription, name: 'quizDescription' },
            { element: this.questionNumber, name: 'questionNumber' },
            { element: this.questionDifficulty, name: 'questionDifficulty' },
            { element: this.questionText, name: 'questionText' },
            { element: this.optionsContainer, name: 'optionsContainer' }
        ];

        const missingElements = requiredElements.filter(item => !item.element);
        if (missingElements.length > 0) {
            console.error('Missing required DOM elements:', missingElements.map(item => item.name));
            throw new Error(`Missing required DOM elements: ${missingElements.map(item => item.name).join(', ')}`);
        }

        console.log('Quiz info elements initialized');

        // Control elements
        this.timerElement = document.getElementById('timer');
        this.timerValue = this.timerElement.querySelector('.timer-value');
        this.scoreElement = document.getElementById('score');
        this.scoreValue = this.scoreElement.querySelector('.score-value');

        console.log('Control elements initialized');

        // Navigation elements
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.submitBtn = document.getElementById('submitBtn');
        this.endQuizBtn = document.getElementById('endQuizBtn');

        console.log('Navigation elements initialized');

        // Progress elements
        this.progressBar = document.getElementById('progressBar');
        this.progressText = document.getElementById('progressText');

        console.log('Progress elements initialized');

        // Statistics elements
        this.correctCount = document.getElementById('correctCount');
        this.incorrectCount = document.getElementById('incorrectCount');
        this.skippedCount = document.getElementById('skippedCount');

        console.log('Statistics elements initialized');

        // Feedback elements
        this.feedbackPanel = document.getElementById('feedbackPanel');
        this.feedbackContent = document.getElementById('feedbackContent');
        this.closeFeedback = document.getElementById('closeFeedback');

        console.log('Feedback elements initialized');

        // Results modal elements
        this.resultsModal = document.getElementById('resultsModal');
        this.scorePercent = document.getElementById('scorePercent');
        this.finalScore = document.getElementById('finalScore');
        this.totalQuestionsElement = document.getElementById('totalQuestions');
        this.resultCorrect = document.getElementById('resultCorrect');
        this.resultIncorrect = document.getElementById('resultIncorrect');
        this.timeTaken = document.getElementById('timeTaken');
        this.accuracy = document.getElementById('accuracy');
        this.resultsFeedback = document.getElementById('resultsFeedback');
        this.saveScoreBtn = document.getElementById('saveScoreBtn');
        this.retryBtn = document.getElementById('retryBtn');
        this.homeBtn = document.getElementById('homeBtn');
        this.playerNameInput = document.getElementById('playerNameInput');
        this.playerName = document.getElementById('playerName');
        this.saveNameBtn = document.getElementById('saveNameBtn');

        console.log('Results modal elements initialized');

        // Review button
        this.reviewBtn = document.getElementById('reviewBtn');

        console.log('All DOM elements initialized');
    }

    loadQuizParameters() {
        console.log('Loading quiz parameters from URL...');
        console.log('Current URL:', window.location.href);
        console.log('Search params:', window.location.search);

        // Get parameters from URL
        const urlParams = new URLSearchParams(window.location.search);
        this.category = urlParams.get('category') || 'general';
        this.totalQuestions = parseInt(urlParams.get('questions')) || 10;
        this.timerEnabled = urlParams.get('timer') === 'true';
        this.difficulty = urlParams.get('difficulty') || 'medium';

        console.log('Raw parameters from URL:', {
            categoryParam: urlParams.get('category'),
            questionsParam: urlParams.get('questions'),
            timerParam: urlParams.get('timer'),
            difficultyParam: urlParams.get('difficulty')
        });

        console.log('Parsed parameters:', {
            category: this.category,
            totalQuestions: this.totalQuestions,
            timerEnabled: this.timerEnabled,
            difficulty: this.difficulty
        });

        // Validate category
        const validCategories = ['general', 'science', 'programming', 'history', 'math'];
        // Use indexOf for better browser compatibility
        if (validCategories.indexOf(this.category) === -1) {
            console.warn('Invalid category detected:', this.category, 'Defaulting to general');
            this.category = 'general';
        }

        // Validate totalQuestions
        if (isNaN(this.totalQuestions) || this.totalQuestions < 1 || this.totalQuestions > 50) {
            console.warn('Invalid number of questions:', this.totalQuestions, 'Defaulting to 10');
            this.totalQuestions = 10;
        }

        // Validate difficulty
        const validDifficulties = ['easy', 'medium', 'hard', 'all'];
        if (!validDifficulties.includes(this.difficulty)) {
            console.warn('Invalid difficulty:', this.difficulty, 'Defaulting to medium');
            this.difficulty = 'medium';
        }

        console.log('Validated parameters:', {
            category: this.category,
            totalQuestions: this.totalQuestions,
            timerEnabled: this.timerEnabled,
            difficulty: this.difficulty
        });

        // Update UI with parameters
        this.updateCategoryTitle();
        this.updateQuizDescription();
    }

    updateCategoryTitle() {
        const categoryNames = {
            'general': 'General Knowledge',
            'science': 'Science & Technology',
            'programming': 'Programming',
            'history': 'History',
            'math': 'Mathematics'
        };

        this.categoryTitle.textContent = `${categoryNames[this.category] || 'General'} Quiz`;
    }

    updateQuizDescription() {
        const timerText = this.timerEnabled ? 'with timer' : 'untimed';
        this.quizDescription.textContent =
            `Test your knowledge with ${this.totalQuestions} questions ${timerText}`;
    }

    async loadQuestions() {
        const spinner = document.getElementById('loadingSpinner');

        try {
            console.log('Starting to load questions...');
            console.log('Current category:', this.category);

            // Show loading state
            this.questionText.style.display = 'none';
            this.optionsContainer.style.display = 'none';
            if (spinner) spinner.style.display = 'flex';

            // Define category mappings as requested
            const categoryFiles = {
                'general': 'data/general-knowledge.json',
                'science': 'data/science.json',
                'history': 'data/history.json',
                'math': 'data/mathematics.json',
                'programming': 'data/programming.json'
            };

            const fileName = categoryFiles[this.category];
            const jsonKey = this.category; // Keys inside JSONs match category IDs (general, science, etc.)

            if (!fileName) {
                throw new Error(`Unknown category: ${this.category}`);
            }

            let data;

            // Try to load from localStorage first
            // Versioned cache key to ensure we load fresh data after structure changes
            const cacheKey = `quiz_data_cache_v2_${this.category}`;
            const cachedData = localStorage.getItem(cacheKey);

            if (cachedData) {
                try {
                    data = JSON.parse(cachedData);
                    console.log('Loaded from cache');
                } catch (e) {
                    console.warn('Cache parse error:', e);
                    localStorage.removeItem(cacheKey);
                }
            }

            // Fetch if no data
            if (!data) {
                try {
                    console.log(`Fetching ${fileName}...`);

                    // Add timeout to fetch
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

                    const response = await fetch(fileName, { signal: controller.signal });
                    clearTimeout(timeoutId);

                    if (response.ok) {
                        data = await response.json();
                        localStorage.setItem(cacheKey, JSON.stringify(data));
                    } else {
                        throw new Error(`HTTP ${response.status}`);
                    }
                } catch (fetchError) {
                    console.warn('Fetch failed:', fetchError.message);
                }
            }

            // Fallback to sample if still no data
            if (!data) {
                console.warn('No data, using fallback');
                this.loadSampleQuestions();
                return;
            }

            // Get questions
            let categoryQuestions = data[jsonKey];

            // Robust fallback if key is missing but data exists
            if (!categoryQuestions && typeof data === 'object') {
                console.warn(`Key '${jsonKey}' not found, trying to find first array`);
                const keys = Object.keys(data);
                for (const key of keys) {
                    if (Array.isArray(data[key])) {
                        categoryQuestions = data[key];
                        console.log(`Found questions in key: ${key}`);
                        break;
                    }
                }
            }

            if (!categoryQuestions || categoryQuestions.length === 0) {
                throw new Error('No questions found in data');
            }

            // Filter by difficulty
            if (this.difficulty !== 'all') {
                const filtered = categoryQuestions.filter(q => q.difficulty === this.difficulty);
                if (filtered.length > 0) {
                    categoryQuestions = filtered;
                }
            }

            // Limit questions
            const actualQuestions = Math.min(categoryQuestions.length, this.totalQuestions);

            // Shuffle
            this.questions = this.shuffleArray(categoryQuestions).slice(0, actualQuestions);

            if (this.questions.length === 0) {
                throw new Error('No questions available');
            }

            // Initialize
            this.userAnswers = new Array(this.questions.length).fill(null);

            // Show content
            if (spinner) spinner.style.display = 'none';
            this.questionText.style.display = 'block';
            this.optionsContainer.style.display = 'grid';

            this.startQuiz();

        } catch (error) {
            console.error('Error loading questions:', error);
            this.loadSampleQuestions();
        } finally {
            // Ensure spinner is hidden in case of unhandled errors
            if (spinner && spinner.style.display === 'flex') {
                // Only hide if we didn't successfully start (which hides it)
                // But loadSampleQuestions also hides it.
                // This is just a safety net.
                // However, if we are here, we likely already handled it.
            }
        }
    }

    loadSampleQuestions() {
        console.log('Loading sample questions as fallback...');

        // Hide spinner and show content
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.style.display = 'none';
        this.questionText.style.display = 'block';
        this.optionsContainer.style.display = 'grid';

        // Sample questions as fallback - ensure we always have enough questions
        const sampleQuestions = [
            {
                id: 1,
                question: "What does HTML stand for?",
                options: [
                    "Hyper Text Markup Language",
                    "High Tech Modern Language",
                    "Hyper Transfer Markup Language",
                    "Home Tool Markup Language"
                ],
                correctAnswer: 0,
                difficulty: "easy",
                explanation: "HTML stands for Hyper Text Markup Language, the standard markup language for web pages."
            },
            {
                id: 2,
                question: "Which planet is known as the Red Planet?",
                options: ["Venus", "Mars", "Jupiter", "Saturn"],
                correctAnswer: 1,
                difficulty: "easy",
                explanation: "Mars is often called the Red Planet due to its reddish appearance."
            },
            {
                id: 3,
                question: "What is the capital of France?",
                options: ["London", "Berlin", "Paris", "Madrid"],
                correctAnswer: 2,
                difficulty: "easy",
                explanation: "Paris is the capital and most populous city of France."
            },
            {
                id: 4,
                question: "What is the largest mammal in the world?",
                options: ["Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
                correctAnswer: 1,
                difficulty: "medium",
                explanation: "The blue whale is the largest mammal and the largest animal ever known to have lived on Earth."
            },
            {
                id: 5,
                question: "Which element has the chemical symbol 'O'?",
                options: ["Gold", "Oxygen", "Osmium", "Oganesson"],
                correctAnswer: 1,
                difficulty: "medium",
                explanation: "Oxygen has the chemical symbol 'O' and is essential for life on Earth."
            }
        ];

        // Duplicate questions if we need more than we have
        let expandedQuestions = [...sampleQuestions];
        while (expandedQuestions.length < this.totalQuestions) {
            expandedQuestions = [...expandedQuestions, ...sampleQuestions];
        }

        // Set questions and limit to totalQuestions
        this.questions = expandedQuestions.slice(0, this.totalQuestions);
        this.userAnswers = new Array(this.questions.length).fill(null);

        // Validate that we have questions
        if (this.questions.length === 0) {
            console.error('No sample questions available');
            this.showError('Unable to load quiz questions. Please try again later.');
            return;
        }

        console.log('Sample questions loaded, starting quiz...');
        this.startQuiz();
    }

    startQuiz() {
        this.quizStarted = true;
        this.startTime = new Date();

        // Show first question
        this.showQuestion(0);

        // Start timer if enabled
        if (this.timerEnabled) {
            this.startTimer();
        }

        // Update navigation buttons
        this.updateNavigationButtons();

        // Update statistics
        this.updateStatistics();
    }

    showQuestion(index) {
        console.log('Showing question index:', index);
        if (index < 0 || index >= this.questions.length) {
            console.warn('Invalid question index:', index, 'Questions length:', this.questions.length);
            return;
        }

        this.currentQuestionIndex = index;
        const question = this.questions[index];
        console.log('Displaying question:', question);

        // Update question number and difficulty
        this.questionNumber.textContent = `Q${index + 1}`;
        this.questionDifficulty.textContent = question.difficulty;
        this.questionDifficulty.className = `question-difficulty ${question.difficulty}`;

        // Update question text
        this.questionText.textContent = question.question;

        // Create options
        this.createOptions(question.options, index);

        // Update progress
        this.updateProgress();

        // Update navigation buttons
        this.updateNavigationButtons();

        // Show feedback for previous answer if available
        this.showQuestionFeedback(index);

        // Trigger animation
        const questionCard = document.getElementById('questionCard');
        questionCard.classList.remove('fade-in');
        void questionCard.offsetWidth; // Trigger reflow
        questionCard.classList.add('fade-in');
    }

    createOptions(options, questionIndex) {
        console.log('Creating options for question index:', questionIndex);
        console.log('Options:', options);

        this.optionsContainer.innerHTML = '';

        const optionLetters = ['A', 'B', 'C', 'D'];

        options.forEach((option, index) => {
            const optionElement = document.createElement('button');
            optionElement.className = 'option';
            optionElement.dataset.index = index;

            // Check if this option was selected
            const isSelected = this.userAnswers[questionIndex] === index;
            const isCorrect = index === this.questions[questionIndex].correctAnswer;
            const isAnswered = this.userAnswers[questionIndex] !== null;

            if (isSelected) {
                optionElement.classList.add('selected');
                if (isAnswered) {
                    optionElement.classList.add(isCorrect ? 'correct' : 'incorrect');
                }
            } else if (isAnswered && isCorrect) {
                optionElement.classList.add('correct');
            }

            // Create option elements safely without innerHTML
            const optionLetterSpan = document.createElement('span');
            optionLetterSpan.className = 'option-letter';
            optionLetterSpan.textContent = optionLetters[index];

            const optionTextSpan = document.createElement('span');
            optionTextSpan.className = 'option-text';
            optionTextSpan.textContent = option; // Safe text content

            optionElement.appendChild(optionLetterSpan);
            optionElement.appendChild(optionTextSpan);
            optionElement.addEventListener('click', () => this.selectOption(index));

            this.optionsContainer.appendChild(optionElement);
        });
        console.log('Options created successfully');
    }

    selectOption(optionIndex) {
        // If already answered, don't allow changes unless in review mode
        if (this.userAnswers[this.currentQuestionIndex] !== null && !this.quizCompleted) {
            return;
        }

        // Remove selection from all options
        const options = this.optionsContainer.querySelectorAll('.option');
        options.forEach(option => {
            option.classList.remove('selected');
        });

        // Add selection to clicked option
        options[optionIndex].classList.add('selected');

        // Save answer
        this.userAnswers[this.currentQuestionIndex] = optionIndex;

        // Update statistics immediately
        this.updateStatistics();

        // Show immediate visual feedback
        this.showImmediateFeedback(optionIndex);

        // Show feedback if timer is disabled or if this is the last question
        if (!this.timerEnabled || this.currentQuestionIndex === this.questions.length - 1) {
            this.showFeedback();
        }

        // Update navigation buttons
        this.updateNavigationButtons();
    }

    updateNavigationButtons() {
        // Previous button
        this.prevBtn.disabled = this.currentQuestionIndex === 0;

        // Next button
        const hasAnswer = this.userAnswers[this.currentQuestionIndex] !== null;
        const isLastQuestion = this.currentQuestionIndex === this.questions.length - 1;

        this.nextBtn.disabled = isLastQuestion;
        this.submitBtn.disabled = !hasAnswer;

        // Update submit button text
        this.submitBtn.textContent = isLastQuestion ? 'Finish Quiz' : 'Submit Answer';
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.showQuestion(this.currentQuestionIndex + 1);

            // Reset timer for new question
            if (this.timerEnabled) {
                this.resetTimer();
            }
        }
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.showQuestion(this.currentQuestionIndex - 1);

            // Reset timer for new question
            if (this.timerEnabled) {
                this.resetTimer();
            }
        }
    }

    submitAnswer() {
        const hasAnswer = this.userAnswers[this.currentQuestionIndex] !== null;

        if (!hasAnswer) {
            this.showNotification('Please select an answer before submitting.', 'warning');
            return;
        }

        // Show feedback immediately
        this.showFeedback();

        // If last question, finish quiz
        if (this.currentQuestionIndex === this.questions.length - 1) {
            setTimeout(() => this.finishQuiz(), 1000);
        } else {
            // Auto-advance to next question after delay
            setTimeout(() => this.nextQuestion(), 1500);
        }
    }

    showImmediateFeedback(optionIndex) {
        // Provide immediate visual feedback without showing full feedback panel
        const question = this.questions[this.currentQuestionIndex];
        const isCorrect = optionIndex === question.correctAnswer;

        // Add visual feedback to the selected option
        const options = this.optionsContainer.querySelectorAll('.option');
        if (isCorrect) {
            options[optionIndex].classList.add('correct');
        } else {
            options[optionIndex].classList.add('incorrect');
            // Also highlight the correct answer
            options[question.correctAnswer].classList.add('correct');
        }

        // Add animation effect
        options[optionIndex].classList.add(isCorrect ? 'correct-animation' : 'incorrect-animation');

        // Remove animation class after animation completes
        setTimeout(() => {
            options[optionIndex].classList.remove(isCorrect ? 'correct-animation' : 'incorrect-animation');
        }, 500);
    }

    showFeedback() {
        const question = this.questions[this.currentQuestionIndex];
        const userAnswer = this.userAnswers[this.currentQuestionIndex];
        const isCorrect = userAnswer === question.correctAnswer;

        // Clear previous feedback content
        while (this.feedbackContent.firstChild) {
            this.feedbackContent.removeChild(this.feedbackContent.firstChild);
        }

        if (userAnswer === null) {
            const para = document.createElement('p');
            para.textContent = 'Please select an answer to see feedback.';
            this.feedbackContent.appendChild(para);
        } else {
            const optionLetters = ['A', 'B', 'C', 'D'];
            const correctLetter = optionLetters[question.correctAnswer];
            const userLetter = optionLetters[userAnswer];

            // Create feedback elements safely
            const correctFeedbackDiv = document.createElement('div');
            correctFeedbackDiv.className = 'correct-feedback';
            correctFeedbackDiv.textContent = isCorrect ? '✅ Correct!' : '❌ Incorrect';

            const userAnswerPara = document.createElement('p');
            userAnswerPara.innerHTML = `Your answer: <strong>${userLetter}. ${this.escapeHtml(question.options[userAnswer])}</strong>`;

            this.feedbackContent.appendChild(correctFeedbackDiv);
            this.feedbackContent.appendChild(userAnswerPara);

            if (!isCorrect) {
                const correctAnswerPara = document.createElement('p');
                correctAnswerPara.innerHTML = `Correct answer: <strong>${correctLetter}. ${this.escapeHtml(question.options[question.correctAnswer])}</strong>`;
                this.feedbackContent.appendChild(correctAnswerPara);
            }

            const explanationDiv = document.createElement('div');
            explanationDiv.className = 'explanation';
            explanationDiv.innerHTML = `<strong>Explanation:</strong> ${this.escapeHtml(question.explanation)}`;

            this.feedbackContent.appendChild(explanationDiv);

            // Visual feedback on options
            const options = this.optionsContainer.querySelectorAll('.option');
            options.forEach((option, index) => {
                if (index === question.correctAnswer) {
                    option.classList.add('correct');
                } else if (index === userAnswer && !isCorrect) {
                    option.classList.add('incorrect');
                }
            });

            // Update score if correct
            if (isCorrect && !this.quizCompleted) {
                this.score += 1;
                this.scoreValue.textContent = this.score;
            }
        }

        this.feedbackPanel.classList.add('visible');
    }

    // Utility method to escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showQuestionFeedback(questionIndex) {
        const userAnswer = this.userAnswers[questionIndex];

        // Clear previous feedback content
        while (this.feedbackContent.firstChild) {
            this.feedbackContent.removeChild(this.feedbackContent.firstChild);
        }

        if (userAnswer !== null) {
            const question = this.questions[questionIndex];
            const isCorrect = userAnswer === question.correctAnswer;
            const optionLetters = ['A', 'B', 'C', 'D'];

            if (this.quizCompleted) {
                // Create feedback elements safely
                const correctFeedbackDiv = document.createElement('div');
                correctFeedbackDiv.className = 'correct-feedback';
                correctFeedbackDiv.textContent = isCorrect ? '✅ Correct' : '❌ Incorrect';

                const userAnswerPara = document.createElement('p');
                userAnswerPara.innerHTML = `Your answer: <strong>${optionLetters[userAnswer]}. ${this.escapeHtml(question.options[userAnswer])}</strong>`;

                this.feedbackContent.appendChild(correctFeedbackDiv);
                this.feedbackContent.appendChild(userAnswerPara);

                if (!isCorrect) {
                    const correctAnswerPara = document.createElement('p');
                    correctAnswerPara.innerHTML = `Correct answer: <strong>${optionLetters[question.correctAnswer]}. ${this.escapeHtml(question.options[question.correctAnswer])}</strong>`;
                    this.feedbackContent.appendChild(correctAnswerPara);
                }

                const explanationDiv = document.createElement('div');
                explanationDiv.className = 'explanation';
                explanationDiv.innerHTML = `<strong>Explanation:</strong> ${this.escapeHtml(question.explanation)}`;

                this.feedbackContent.appendChild(explanationDiv);
            } else {
                const selectedPara = document.createElement('p');
                selectedPara.innerHTML = `You selected: <strong>${optionLetters[userAnswer]}. ${this.escapeHtml(question.options[userAnswer])}</strong>`;

                const reviewPara = document.createElement('p');
                reviewPara.textContent = 'Review mode will show full feedback after quiz completion.';

                this.feedbackContent.appendChild(selectedPara);
                this.feedbackContent.appendChild(reviewPara);
            }

            this.feedbackPanel.classList.add('visible');
        } else {
            const para = document.createElement('p');
            para.textContent = 'No answer selected for this question.';
            this.feedbackContent.appendChild(para);
            this.feedbackPanel.classList.remove('visible');
        }
    }

    startTimer() {
        this.resetTimer();

        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();

            if (this.timeRemaining <= 0) {
                this.handleTimeUp();
            }

            // Visual warning when time is running out
            if (this.timeRemaining <= 10) {
                this.timerValue.style.color = 'var(--danger)';
                this.timerValue.classList.add('pulse');
            }
        }, 1000);
    }

    resetTimer() {
        this.timeRemaining = this.timerDuration;
        this.updateTimerDisplay();

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        this.timerValue.style.color = '';
        this.timerValue.classList.remove('pulse');
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        this.timerValue.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // Add visual warning when time is critically low
        if (this.timeRemaining <= 5) {
            this.timerValue.classList.add('critical-time');
        } else {
            this.timerValue.classList.remove('critical-time');
        }
    }

    handleTimeUp() {
        clearInterval(this.timerInterval);

        // Auto-submit if no answer selected
        if (this.userAnswers[this.currentQuestionIndex] === null) {
            this.userAnswers[this.currentQuestionIndex] = -1; // Mark as skipped
            this.showNotification('Time is up! Question marked as skipped.', 'warning');
        }

        // Show feedback for current question
        this.showFeedback();

        // Auto-advance or finish quiz
        if (this.currentQuestionIndex < this.questions.length - 1) {
            setTimeout(() => this.nextQuestion(), 2000);
        } else {
            setTimeout(() => this.finishQuiz(), 2000);
        }
    }

    updateProgress() {
        const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
        this.progressBar.style.transition = 'width 0.3s ease';
        this.progressBar.style.width = `${progress}%`;
        this.progressText.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.questions.length}`;

        // Add animation class for visual feedback
        this.progressBar.classList.add('progress-animation');
        setTimeout(() => {
            this.progressBar.classList.remove('progress-animation');
        }, 300);
    }

    updateStatistics() {
        let correct = 0;
        let incorrect = 0;
        let skipped = 0;

        this.userAnswers.forEach((answer, index) => {
            if (answer === null || answer === -1) {
                skipped++;
            } else if (answer === this.questions[index]?.correctAnswer) {
                correct++;
            } else {
                incorrect++;
            }
        });

        this.correctCount.textContent = correct;
        this.incorrectCount.textContent = incorrect;
        this.skippedCount.textContent = skipped;

        // Update score
        this.score = correct;
        this.scoreValue.textContent = this.score;
    }

    finishQuiz() {
        this.quizCompleted = true;
        this.endTime = new Date();

        // Stop timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        // Calculate final statistics
        this.calculateFinalResults();

        // Show results modal
        this.showResultsModal();
    }

    calculateFinalResults() {
        const totalTime = (this.endTime - this.startTime) / 1000; // in seconds
        const correctAnswers = this.userAnswers.filter((answer, index) =>
            answer === this.questions[index]?.correctAnswer
        ).length;

        const totalAnswered = this.userAnswers.filter(answer =>
            answer !== null && answer !== -1
        ).length;

        const accuracy = totalAnswered > 0 ? (correctAnswers / totalAnswered) * 100 : 0;
        const scorePercentage = (correctAnswers / this.questions.length) * 100;

        this.finalResults = {
            score: correctAnswers,
            totalQuestions: this.questions.length,
            scorePercentage: Math.round(scorePercentage),
            correctAnswers: correctAnswers,
            incorrectAnswers: this.questions.length - correctAnswers - this.userAnswers.filter(a => a === -1).length,
            skipped: this.userAnswers.filter(a => a === -1).length,
            timeTaken: Math.round(totalTime),
            accuracy: Math.round(accuracy)
        };
    }

    showResultsModal() {
        // Update modal with results
        this.scorePercent.textContent = `${this.finalResults.scorePercentage}%`;
        this.finalScore.textContent = this.finalResults.score;
        this.totalQuestionsElement.textContent = this.finalResults.totalQuestions;
        this.resultCorrect.textContent = this.finalResults.correctAnswers;
        this.resultIncorrect.textContent = this.finalResults.incorrectAnswers;
        this.timeTaken.textContent = this.formatTime(this.finalResults.timeTaken);
        this.accuracy.textContent = `${this.finalResults.accuracy}%`;

        // Set progress circle
        const scoreCircle = document.getElementById('scoreCircle');
        scoreCircle.style.setProperty('--score-percent', `${this.finalResults.scorePercentage}%`);

        // Add feedback based on score
        this.resultsFeedback.innerHTML = this.getResultsFeedback();

        // Show modal
        this.resultsModal.classList.add('active');
    }

    getResultsFeedback() {
        const score = this.finalResults.scorePercentage;

        if (score >= 90) {
            return `
                <h3>🎉 Outstanding! 🎉</h3>
                <p>You've mastered this category! Your knowledge is impressive.</p>
                <p>Share your score and challenge your friends!</p>
            `;
        } else if (score >= 70) {
            return `
                <h3>👍 Great Job! 👍</h3>
                <p>You have a solid understanding of this topic.</p>
                <p>With a little more practice, you'll be at the top!</p>
            `;
        } else if (score >= 50) {
            return `
                <h3>😊 Good Effort! 😊</h3>
                <p>You're on the right track! Keep learning and practicing.</p>
                <p>Try reviewing the questions you missed.</p>
            `;
        } else {
            return `
                <h3>💪 Keep Learning! 💪</h3>
                <p>Every expert was once a beginner. Don't give up!</p>
                <p>Review the material and try again. You'll do better next time!</p>
            `;
        }
    }

    saveToLeaderboard() {
        let playerName = this.playerName.value.trim();

        if (!playerName) {
            this.showNotification('Please enter your name to save to leaderboard.', 'warning');
            return;
        }

        // Sanitize player name to prevent XSS
        playerName = this.escapeHtml(playerName);

        // Get existing leaderboard data
        let leaderboard = JSON.parse(localStorage.getItem('quizSparkLeaderboard') || '[]');

        // Create leaderboard entry
        const entry = {
            playerName: playerName,
            category: this.category,
            score: this.finalResults.scorePercentage,
            correctAnswers: this.finalResults.correctAnswers,
            totalQuestions: this.finalResults.totalQuestions,
            timeTaken: this.finalResults.timeTaken,
            difficulty: this.difficulty,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString()
        };

        // Add to leaderboard
        leaderboard.push(entry);

        // Sort by score (descending)
        leaderboard.sort((a, b) => b.score - a.score);

        // Keep only top 100 scores
        leaderboard = leaderboard.slice(0, 100);

        // Save to localStorage
        localStorage.setItem('quizSparkLeaderboard', JSON.stringify(leaderboard));

        // Show success message
        this.showNotification('Score saved to leaderboard!', 'success');

        // Hide name input
        this.playerNameInput.style.display = 'none';

        // Update save button
        this.saveScoreBtn.textContent = '✓ Saved!';
        this.saveScoreBtn.disabled = true;
        this.saveScoreBtn.style.background = 'var(--success)';
    }

    setupEventListeners() {
        // Navigation buttons
        this.prevBtn.addEventListener('click', () => this.previousQuestion());
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.submitBtn.addEventListener('click', () => this.submitAnswer());
        this.endQuizBtn.addEventListener('click', () => this.confirmEndQuiz());

        // Review button
        this.reviewBtn.addEventListener('click', () => this.enterReviewMode());

        // Feedback panel
        this.closeFeedback.addEventListener('click', () => {
            this.feedbackPanel.classList.remove('visible');
        });

        // Results modal buttons
        this.saveScoreBtn.addEventListener('click', () => this.saveToLeaderboard());
        this.retryBtn.addEventListener('click', () => this.retryQuiz());
        this.homeBtn.addEventListener('click', () => window.location.href = 'index.html');
        this.saveNameBtn.addEventListener('click', () => this.saveToLeaderboard());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.quizCompleted) return;

            switch (e.key) {
                case 'ArrowLeft':
                    if (!this.prevBtn.disabled) this.previousQuestion();
                    break;
                case 'ArrowRight':
                    if (!this.nextBtn.disabled) this.nextQuestion();
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                    const optionIndex = parseInt(e.key) - 1;
                    this.selectOption(optionIndex);
                    break;
                case 'Enter':
                    if (!this.submitBtn.disabled) this.submitAnswer();
                    break;
                case 'Escape':
                    if (this.resultsModal.classList.contains('active')) {
                        this.hideResultsModal();
                    }
                    break;
            }
        });

        // Prevent accidental page leave during quiz
        window.addEventListener('beforeunload', (e) => {
            if (this.quizStarted && !this.quizCompleted) {
                e.preventDefault();
                e.returnValue = 'Your quiz progress will be lost if you leave. Are you sure?';
            }
        });
    }

    confirmEndQuiz() {
        if (confirm('Are you sure you want to end the quiz? Your progress will be saved.')) {
            this.finishQuiz();
        }
    }

    enterReviewMode() {
        this.showQuestion(this.currentQuestionIndex);
        this.showQuestionFeedback(this.currentQuestionIndex);
    }

    retryQuiz() {
        // Reset quiz state
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = new Array(this.questions.length).fill(null);
        this.quizCompleted = false;

        // Hide results modal
        this.hideResultsModal();

        // Restart quiz
        this.startQuiz();

        // Reset UI
        this.updateStatistics();
        this.updateUI();
    }

    hideResultsModal() {
        this.resultsModal.classList.remove('active');
    }

    updateUI() {
        // Update timer visibility
        this.timerElement.style.display = this.timerEnabled ? 'flex' : 'none';

        // Update score display
        this.scoreValue.textContent = this.score;
    }

    // Utility Methods
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    formatTime(seconds) {
        if (seconds < 60) {
            return `${seconds} seconds`;
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // Add to page
        document.body.appendChild(notification);

        // Remove after delay
        setTimeout(() => {
            notification.remove();
        }, 3000);

        return notification;
    }

    showError(message) {
        this.showNotification(message, 'error');
    }
}

// ===== Initialize Quiz =====
function initQuiz() {
    console.log('Document readyState:', document.readyState);

    if (document.readyState === 'loading') {
        // Document is still loading
        console.log('Document still loading, waiting for DOMContentLoaded');
        document.addEventListener('DOMContentLoaded', initializeQuiz);
    } else {
        // Document is already loaded
        console.log('Document already loaded, initializing quiz immediately');
        initializeQuiz();
    }
}

function initializeQuiz() {
    // Add a small delay to ensure all DOM elements are fully loaded
    setTimeout(() => {
        try {
            console.log('Initializing quiz...');
            console.log('Document readyState:', document.readyState);

            // Wait a bit more for DOM to be fully ready
            setTimeout(() => {
                try {
                    // Double-check that required elements exist
                    const requiredElements = [
                        'categoryTitle',
                        'quizDescription',
                        'questionNumber',
                        'questionDifficulty',
                        'questionText',
                        'optionsContainer'
                    ];

                    const missingElements = requiredElements.filter(id => !document.getElementById(id));
                    if (missingElements.length > 0) {
                        throw new Error(`Missing required DOM elements: ${missingElements.join(', ')}`);
                    }

                    // Initialize quiz
                    if (!window.quiz) {
                        window.quiz = new Quiz();
                        console.log('Quiz initialized successfully');
                    } else {
                        console.log('Quiz already initialized');
                    }

                    // Add CSS for notifications if not already added
                    if (!document.getElementById('quiz-notifications-style')) {
                        const style = document.createElement('style');
                        style.id = 'quiz-notifications-style';
                        style.textContent = `
                            .notification {
                                position: fixed;
                                top: 20px;
                                right: 20px;
                                padding: 1rem 1.5rem;
                                border-radius: var(--radius-md);
                                color: white;
                                font-weight: 600;
                                z-index: 10000;
                                animation: slideIn 0.3s ease, slideOut 0.3s ease 2.7s;
                                box-shadow: var(--shadow-lg);
                            }
                            
                            .notification-success {
                                background: var(--success);
                            }
                            
                            .notification-error {
                                background: var(--danger);
                            }
                            
                            .notification-warning {
                                background: var(--warning);
                                color: var(--dark);
                            }
                            
                            .notification-info {
                                background: var(--info);
                            }
                            
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
                            
                            @keyframes slideOut {
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
                    }
                } catch (error) {
                    console.error('Failed to initialize quiz:', error);

                    // Show error in a simpler way
                    alert(`Quiz initialization error: ${error.message}. Returning to home page.`);
                    window.location.href = 'index.html';
                }
            }, 200);
        } catch (error) {
            console.error('Failed to initialize quiz:', error);

            // Show error in a simpler way
            alert(`Quiz initialization error: ${error.message}. Returning to home page.`);
            window.location.href = 'index.html';
        }
    }, 100);
}

// Initialize the quiz
initQuiz();

// ===== Global Functions for HTML onclick handlers =====
// NOTE: This function is duplicated in main.js and can cause conflicts
// The version in main.js should be used instead
// function startQuiz(category) {
//     // This function is called from category cards on home page
//     // We need to ensure we have a proper URL with all parameters
//
//     // Validate category parameter
//     if (!category || typeof category !== 'string') {
//         console.error('Invalid category parameter:', category);
//         category = 'general'; // Default to general
//     }
//
//     // Set default values for parameters
//     const numQuestions = 10;
//     const enableTimer = true;
//     const difficulty = 'medium';
//
//     // Build the URL with all required parameters
//     const url = `quiz.html?category=${encodeURIComponent(category)}&questions=${numQuestions}&timer=${enableTimer}&difficulty=${encodeURIComponent(difficulty)}`;
//     console.log('Navigating to quiz with URL:', url);
//     window.location.href = url;
// }

// ===== Performance Monitoring =====
if (window.performance && performance.mark) {
    performance.mark('quiz-js-loaded');
}