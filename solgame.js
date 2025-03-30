import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = "https://gbpcccwimpsnvopjyxes.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdicGNjY3dpbXBzbnZvcGp5eGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NDc0OTMsImV4cCI6MjA1ODQyMzQ5M30.AFLVmnyo7zHX11u0wiTa-cb3nSWr-ZfM8MqD1xWIQt0";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let optionsContainer, mediaContainer, countdownText, timerBar, scoreText;
let questions = [];
let answeredQuestions = [];
let score = 0;
let timerInterval;
let timeLeft = 60;
let isTimerRunning = false;
let answered = false;

document.addEventListener("DOMContentLoaded", () => {
    optionsContainer = document.getElementById('options-container');
    mediaContainer = document.getElementById('media-container');
    timerBar = document.getElementById('timer-bar');
    countdownText = document.getElementById('countdown-text');
    scoreText = document.getElementById('score-text');

    // Close button to navigate to the category selection page
    document.querySelector('.close-btn').addEventListener('click', () => {
        window.location.href = 'category.html';
    });

    // Fetch questions from Supabase
    fetchQuestions();
});

// Fetch questions from the selected category in Supabase
async function fetchQuestions() {
    let selectedCategory = localStorage.getItem('selectedMix');  // Retrieve selected category from localStorage
    console.log("Selected category from localStorage:", selectedCategory);

    if (!selectedCategory) {
        console.error("No category selected. Please select a category first.");
        return;
    }

    let allQuestions = [];

    // Mapping categories to Supabase table names
    const categoryMapping = {
        armenian: 'armMix',
        russian: 'rusMix',
        english: 'engMix',
        mix: 'mix'
    };

    selectedCategory = categoryMapping[selectedCategory];

    if (!selectedCategory) {
        console.error("Invalid category selected.");
        return;
    }

    if (selectedCategory === 'mix') {
        const tableNames = ['armMix', 'rusMix', 'engMix'];
        for (let table of tableNames) {
            const { data, error } = await supabase
                .from(table)
                .select('id, fileUrl, options, correctAnswer');

            if (error) {
                console.error(`Error fetching questions from ${table}:`, error.message);
            } else {
                allQuestions = allQuestions.concat(data);  // Concatenate all questions from different categories
            }
        }
    } else if (['armMix', 'rusMix', 'engMix'].includes(selectedCategory)) {
        const { data, error } = await supabase
            .from(selectedCategory)  // Get questions from the selected category
            .select('id, fileUrl, options, correctAnswer');

        if (error) {
            console.error(`Error fetching questions from ${selectedCategory}:`, error.message);
        } else {
            allQuestions = data;  // Store fetched questions
        }
    } else {
        console.error("Invalid category selected.");
        return;
    }

    if (allQuestions.length > 0) {
        // Update the questions with the public video URL
        questions = allQuestions.map(question => ({
            ...question,
            fileUrl: question.fileUrl.replace('storage/v1/object/public/', 'https://gbpcccwimpsnvopjyxes.supabase.co/storage/v1/object/public/')
        }));
        loadRandomQuestion();  // Load a random question
    } else {
        console.warn(`No questions found in ${selectedCategory}.`);
    }
}

// Load a random question and display the video and options
function loadRandomQuestion() {
    if (questions.length === 0) return;

    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * questions.length);  // Randomly select a question
    } while (answeredQuestions.includes(randomIndex));  // Ensure the same question isn't selected again

    const question = questions[randomIndex];
    answeredQuestions.push(randomIndex);  // Keep track of answered questions

    mediaContainer.innerHTML = '';
    optionsContainer.innerHTML = '';
    stopTimer(); 
    answered = false;

    // Display the video player with the question's video URL
    mediaContainer.innerHTML = ` 
        <video id="video-player" controls autoplay>
            <source src="${question.fileUrl}?t=${Date.now()}" type="video/mp4">
            Your browser does not support the video tag.
        </video>
    `;

    let options = question.options;

    if (typeof options === 'string') {
        options = options.split(',').map(option => option.trim());
    } else if (typeof options === 'object' && !Array.isArray(options)) {
        options = Object.values(options);
    }

    console.log("Processed options array:", options);

    // Display the options as buttons
    if (Array.isArray(options)) {
        options.forEach(option => {
            const button = document.createElement('button');
            button.classList.add('option');
            button.textContent = option;
            button.onclick = () => checkAnswer(option, question.correctAnswer);  // Check the selected answer
            optionsContainer.appendChild(button);
        });
    } else {
        console.error("Options is not an array. Please check the data format.");
    }

    const videoElement = document.getElementById('video-player');
    videoElement.onended = () => {
        if (!isTimerRunning && !answered) {
            startTimer();  // Start the timer when the video ends
        }
    };
}

// Check the selected answer and update score
function checkAnswer(selected, correct) {
    if (answered) return;  // Prevent multiple answers

    answered = true;  // Mark as answered
    console.log("Selected answer:", selected);
    console.log("Correct answer:", correct);

    const normalizedSelected = selected.trim().toLowerCase();  // Normalize the selected answer
    const normalizedCorrect = correct.trim().toLowerCase();  // Normalize the correct answer

    if (normalizedSelected === normalizedCorrect) {
        score++;  // Increment score for correct answer
    }

    updateScore();  // Update the score
    stopTimer();  // Stop the timer
    nextQuestion();  // Load the next question
}

// Update the score on the screen
function updateScore() {
    scoreText.textContent = `Score: ${score}`;  // Update the score display
}

// Start the timer when the video starts
function startTimer() {
    if (isTimerRunning || timeLeft <= 0) return;

    isTimerRunning = true;
    updateTimerBar();  // Update the timer bar
    updateCountdownText();  // Update the countdown text

    timerInterval = setInterval(() => {
        timeLeft--;  // Decrease time left by 1 second
        updateTimerBar();  // Update the timer bar
        updateCountdownText();  // Update the countdown text

        if (timeLeft <= 0) {
            stopTimer();
            openEndPage();  // End the game when time is up
        }
    }, 1000);
}

// Stop the timer
function stopTimer() {
    clearInterval(timerInterval);  // Clear the timer interval
    isTimerRunning = false;
}

// Open the end game page
function openEndPage() {
    window.location.href = 'endgame.html';  // Redirect to the end game page
}

// Update the timer bar width
function updateTimerBar() {
    timerBar.style.width = (timeLeft / 60) * 100 + "%";  // Update the timer bar width
}

// Update the countdown text
function updateCountdownText() {
    countdownText.textContent = `${timeLeft}s`;  // Update the countdown text
}

// Load the next question
function nextQuestion() {
    timeLeft = 60;  // Reset the timer
    loadRandomQuestion();  // Load the next random question
}
