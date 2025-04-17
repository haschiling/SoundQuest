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
let videoElement;
let songResults = [];

document.addEventListener("DOMContentLoaded", () => {
    optionsContainer = document.getElementById('options-container');
    mediaContainer = document.getElementById('media-container');
    timerBar = document.getElementById('timer-bar');
    countdownText = document.getElementById('countdown-text');
    scoreText = document.getElementById('score');

    // Reset score when game starts
    localStorage.removeItem('score');
    localStorage.removeItem('songResults');
    score = 0;
    updateScore();

    document.querySelector('.close-btn').addEventListener('click', () => {
        window.location.href = 'category.html';
    });

    fetchQuestions();
});

async function fetchQuestions() {
    let selectedCategory = localStorage.getItem('selectedMix');
    console.log("Selected category from localStorage:", selectedCategory);

    if (!selectedCategory) {
        console.error("No category selected. Please select a category first.");
        return;
    }

    let allQuestions = [];

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
                allQuestions = allQuestions.concat(data);
            }
        }
    } else if (['armMix', 'rusMix', 'engMix'].includes(selectedCategory)) {
        const { data, error } = await supabase
            .from(selectedCategory)
            .select('id, fileUrl, options, correctAnswer');

        if (error) {
            console.error(`Error fetching questions from ${selectedCategory}:`, error.message);
        } else {
            allQuestions = data;
        }
    } else {
        console.error("Invalid category selected.");
        return;
    }

    if (allQuestions.length > 0) {
        questions = allQuestions;
        loadRandomQuestion();
    } else {
        console.warn(`No questions found in ${selectedCategory}.`);
    }
}

function loadRandomQuestion() {
    if (questions.length === 0) return;

    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * questions.length);
    } while (answeredQuestions.includes(randomIndex));

    const question = questions[randomIndex];
    answeredQuestions.push(randomIndex);

    mediaContainer.innerHTML = '';
    optionsContainer.innerHTML = '';
    answered = false;

    mediaContainer.innerHTML = `
        <video id="video-player" controls autoplay muted>
            <source src="${question.fileUrl}?t=${Date.now()}" type="video/mp4">
            Your browser does not support the video tag.
        </video>
    `;

    videoElement = document.getElementById('video-player');

    videoElement.onended = () => {
        if (!answered) {
            startTimer();
        }
    };

    let options = question.options;

    if (typeof options === 'string') {
        options = options.split(',').map(option => option.trim());
    } else if (typeof options === 'object' && !Array.isArray(options)) {
        options = Object.values(options);
    }

    console.log("Processed options array:", options);

    if (Array.isArray(options)) {
        options.forEach(option => {
            const button = document.createElement('button');
            button.classList.add('option');
            button.textContent = option;
            button.onclick = () => checkAnswer(option, question.correctAnswer, question.fileUrl);
            optionsContainer.appendChild(button);
        });
    } else {
        console.error("Options is not an array. Please check the data format.");
    }
}

function checkAnswer(selected, correct) {
    if (answered) return;

    answered = true;

    const normalizedSelected = selected.trim().toLowerCase();
    const normalizedCorrect = correct.trim().toLowerCase();

    const isCorrect = normalizedSelected === normalizedCorrect;

    if (isCorrect) {
        score++;
    }

    songResults.push({
        title: correct,
        correct: isCorrect
    });

    localStorage.setItem("songResults", JSON.stringify(songResults));

    console.log("Saved song result:", songResults);

    updateScore();
    stopTimer();
    nextQuestion();
}

function updateScore() {
    if (scoreText) {
        scoreText.textContent = `Հաշիվ: ${score}`;
    }
}

function startTimer() {
    if (isTimerRunning || timeLeft <= 0) return;

    isTimerRunning = true;
    updateTimerBar();
    updateCountdownText();

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerBar();
        updateCountdownText();

        if (timeLeft <= 0) {
            stopTimer();
            openEndPage();
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
}

function openEndPage() {
    localStorage.setItem('score', score);
    localStorage.setItem('songResults', JSON.stringify(songResults));
    window.location.href = 'endgame.html';
}

function updateTimerBar() {
    timerBar.style.width = (timeLeft / 60) * 100 + "%";
}

function updateCountdownText() {
    countdownText.textContent = `${timeLeft}s`;
}

function nextQuestion() {
    loadRandomQuestion();
}