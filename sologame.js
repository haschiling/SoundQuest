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
    const lang = localStorage.getItem("lang");
    const isEnglish = lang === "en";

    // Safely update UI text
    const timeLabel = document.querySelector('.header span');
    if (timeLabel) {
        timeLabel.textContent = isEnglish ? 'Time:' : 'Ժամանակ:';
    }

    scoreText = document.getElementById('score');
    if (scoreText) {
        scoreText.textContent = isEnglish ? 'Score: 0' : 'Հաշիվ: 0';
    }

    optionsContainer = document.getElementById('options-container');
    mediaContainer = document.getElementById('media-container');
    timerBar = document.getElementById('timer-bar');
    countdownText = document.getElementById('countdown-text');

    localStorage.removeItem('score');
    localStorage.removeItem('songResults');
    score = 0;
    updateScore();

    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            window.location.href = 'category.html';
        });
    }

    fetchQuestions();
});

async function fetchQuestions() {
    let selectedCategory = localStorage.getItem('selectedMix');
    if (!selectedCategory) {
        console.error("No category selected.");
        return;
    }

    const categoryMapping = {
        armenian: 'armMix',
        russian: 'rusMix',
        english: 'engMix',
        mix: 'mix'
    };

    selectedCategory = categoryMapping[selectedCategory];
    if (!selectedCategory) {
        console.error("Invalid category.");
        return;
    }

    let allQuestions = [];

    if (selectedCategory === 'mix') {
        const tables = ['armMix', 'rusMix', 'engMix'];
        for (let table of tables) {
            const { data, error } = await supabase.from(table).select('id, fileUrl, options, correctAnswer');
            if (error) {
                console.error(`Error from ${table}:`, error.message);
            } else {
                allQuestions = allQuestions.concat(data);
            }
        }
    } else {
        const { data, error } = await supabase.from(selectedCategory).select('id, fileUrl, options, correctAnswer');
        if (error) {
            console.error(`Error fetching from ${selectedCategory}:`, error.message);
        } else {
            allQuestions = data;
        }
    }

    if (allQuestions.length > 0) {
        questions = allQuestions;
        loadRandomQuestion();
    } else {
        console.warn(`No questions found in ${selectedCategory}`);
    }
}

function loadRandomQuestion() {
    if (questions.length === 0) return;

    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * questions.length);
    } while (answeredQuestions.includes(randomIndex) && answeredQuestions.length < questions.length);

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
    videoElement.onplay = () => {
        if (!isTimerRunning) {
            startTimer();
        }
    };

    let options = question.options;
    if (typeof options === 'string') {
        options = options.split(',').map(o => o.trim());
    } else if (typeof options === 'object' && !Array.isArray(options)) {
        options = Object.values(options);
    }

    if (Array.isArray(options)) {
        options.forEach(option => {
            const button = document.createElement('button');
            button.classList.add('option');
            button.textContent = option;
            button.onclick = () => checkAnswer(option, question.correctAnswer);
            optionsContainer.appendChild(button);
        });
    } else {
        console.error("Invalid options format.");
    }
}

function checkAnswer(selected, correct) {
    if (answered) return;
    answered = true;

    const isCorrect = selected.trim().toLowerCase() === correct.trim().toLowerCase();

    if (isCorrect) {
        score++;
    }

    songResults.push({
        title: correct,
        correct: isCorrect
    });

    localStorage.setItem("songResults", JSON.stringify(songResults));
    updateScore();

    const optionButtons = document.querySelectorAll('.option');
    optionButtons.forEach(btn => {
        const optionText = btn.textContent.trim().toLowerCase();
        if (optionText === correct.trim().toLowerCase()) {
            btn.style.color = 'white';
        } else {
            btn.style.color = '#585555';
        }
        btn.disabled = true;
    });

    setTimeout(nextQuestion, 2000);
}

function updateScore() {
    if (scoreText) {
        const lang = localStorage.getItem("lang");
        const isEnglish = lang === "en";
        scoreText.textContent = (isEnglish ? "Score: " : "Հաշիվ: ") + score;
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

function updateTimerBar() {
    if (timerBar) {
        timerBar.style.width = (timeLeft / 60) * 100 + "%";
    }
}

function updateCountdownText() {
    if (countdownText) {
        countdownText.textContent = `${timeLeft}s`;
    }
}

function nextQuestion() {
    if (answeredQuestions.length >= questions.length) {
        openEndPage();
    } else {
        loadRandomQuestion();
    }
}

function openEndPage() {
    localStorage.setItem('score', score);
    localStorage.setItem('songResults', JSON.stringify(songResults));
    window.location.href = 'endgame.html';
}
