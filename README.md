# QuizSpark - Interactive Quiz System

QuizSpark is a modern, responsive quiz application built with vanilla JavaScript, HTML, and CSS. It features multiple quiz categories, timed quizzes, detailed scoring, and a leaderboard system.

## Features

- **Multiple Quiz Categories**: General Knowledge, Science & Technology, Programming, History, and Mathematics
- **Customizable Quiz Settings**: Choose number of questions, enable/disable timer, and set difficulty level
- **Timed Quizzes**: Optional timer for added challenge
- **Detailed Feedback**: Immediate feedback with explanations for each question
- **Leaderboard System**: Track top scores with filtering options
- **Achievements**: Unlock badges based on quiz performance
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Offline Support**: Uses localStorage for data persistence

## Project Structure

```
QuizSpark/
├── assets/
│   ├── images/
│   └── screenshots/
├── css/
│   ├── quiz.css
│   └── style.css
├── data/
│   └── questions.json
├── js/
│   ├── leaderboard.js
│   ├── main.js
│   ├── quiz.js
│   └── utils.js
├── index.html
├── quiz.html
├── leaderboard.html
└── README.md
```

## Getting Started

1. Clone or download the repository
2. Open `index.html` in a web browser
3. Start taking quizzes!

No build process or dependencies required - it's pure vanilla JavaScript!

## How It Works

### Main Components

1. **Home Page (`index.html`)**: Entry point with category selection and quiz settings
2. **Quiz Page (`quiz.html`)**: Interactive quiz interface with timer and navigation
3. **Leaderboard Page (`leaderboard.html`)**: Score tracking with filtering and achievements

### Data Storage

All data is stored in the browser's localStorage:
- Quiz settings
- Leaderboard scores
- User preferences

### JavaScript Modules

- **main.js**: Controls the home page and quiz initialization
- **quiz.js**: Manages quiz logic, timing, and scoring
- **leaderboard.js**: Handles score tracking and display
- **utils.js**: Utility functions for common operations

## Security Features

- Input sanitization for player names
- XSS prevention through safe DOM manipulation
- Data validation for all user inputs

## Customization

### Adding Questions

Edit `data/questions.json` to add new questions. Each question should have:
- `id`: Unique identifier
- `question`: The question text
- `options`: Array of answer choices
- `correctAnswer`: Index of the correct answer (0-based)
- `difficulty`: Difficulty level (easy, medium, hard)
- `explanation`: Detailed explanation of the correct answer

### Styling

Modify the CSS files to change the appearance:
- `css/style.css`: General site styling
- `css/quiz.css`: Quiz-specific styling

## Browser Support

QuizSpark works in all modern browsers that support:
- localStorage
- ES6 JavaScript features
- CSS3 features

## Development

### Code Quality

- Consistent naming conventions
- Modular architecture
- JSDoc-style comments
- Error handling and validation

### Performance Optimizations

- Efficient DOM manipulation
- Event delegation where appropriate
- Minimal reflows and repaints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Icons from EmojiOne
- Design inspiration from modern quiz applications