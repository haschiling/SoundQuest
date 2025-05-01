import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase setup
const SUPABASE_URL = "https://gbpcccwimpsnvopjyxes.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdicGNjY3dpbXBzbnZvcGp5eGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NDc0OTMsImV4cCI6MjA1ODQyMzQ5M30.AFLVmnyo7zHX11u0wiTa-cb3nSWr-ZfM8MqD1xWIQt0";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM elements
const videoElement = document.getElementById('media');
const timerBar = document.getElementById('timer-bar');
const countdownText = document.getElementById('countdown-text');
const skipBtn = document.getElementById('skip-btn');
const guessBtn = document.getElementById('guess-btn');
const showAnswerBtn = document.getElementById('answer-btn');
const answerText = document.getElementById('answer-text');
const scoreDisplay = document.getElementById('score');

// Game state
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let answeredQuestions = [];
let timerInterval;
let timeLeft = 60;
let gameEnded = false;

// Ensure required data exists
if (!localStorage.getItem('selectedMix') || !localStorage.getItem('groupName')) {
    localStorage.setItem('selectedMix', 'armenian'); // default fallback
    localStorage.setItem('groupName', 'DefaultGroup');
}

startGame();

async function startGame() {
    const selectedCategory = localStorage.getItem('selectedMix');
    const groupName = localStorage.getItem('groupName');

    if (!selectedCategory || !groupName) {
        alert("Missing category or group name.");
        return;
    }

    const tableMap = {
        armenian: 'armMix',
        russian: 'rusMix',
        english: 'engMix',
        mix: ['armMix', 'rusMix', 'engMix']
    };

    const tables = Array.isArray(tableMap[selectedCategory])
        ? tableMap[selectedCategory]
        : [tableMap[selectedCategory]];

    let allQuestions = [];
    for (let table of tables) {
        const { data, error } = await supabase.from(table).select('*');
        if (error) {
            console.error(`Error fetching from ${table}:`, error);
            continue;
        }
        allQuestions = allQuestions.concat(data);
    }

    if (allQuestions.length === 0) {
        alert("No questions found.");
        return;
    }

    questions = allQuestions;
    loadNextQuestion();
    startTimer();
}

function loadNextQuestion() {
    if (gameEnded || answeredQuestions.length >= questions.length) {
        endGame();
        return;
    }

    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * questions.length);
    } while (answeredQuestions.includes(randomIndex));

    currentQuestionIndex = randomIndex;
    answeredQuestions.push(randomIndex);

    const question = questions[randomIndex];
    answerText.textContent = "";

    videoElement.src = question.fileUrl + `?t=${Date.now()}`;
    videoElement.load();
    videoElement.play().catch(() => {
        console.warn("Autoplay prevented. User interaction required.");
    });

    videoElement.dataset.answer = question.correctAnswer;
}

skipBtn.addEventListener('click', () => {
    if (gameEnded) return;
    loadNextQuestion();
});

guessBtn.addEventListener('click', () => {
    if (gameEnded) return;

    score++;
    scoreDisplay.textContent = "Հաշիվ: " + score;
    loadNextQuestion();
});

showAnswerBtn.addEventListener('click', () => {
    if (gameEnded) return;

    const answer = videoElement.dataset.answer;
    answerText.textContent = "Correct Answer: " + answer;
});

function startTimer() {
    timerBar.style.width = "100%";
    countdownText.textContent = `00:${timeLeft < 10 ? "0" + timeLeft : timeLeft}`;

    timerInterval = setInterval(() => {
        timeLeft--;
        const percent = (timeLeft / 60) * 100;
        timerBar.style.width = percent + "%";
        countdownText.textContent = `00:${timeLeft < 10 ? "0" + timeLeft : timeLeft}`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

async function endGame() {
    if (gameEnded) return;
    gameEnded = true;

    const groupName = localStorage.getItem('groupName');

    if (groupName) {
        const { data, error } = await supabase
            .from('groups')
            .select('score')
            .eq('groupName', groupName)
            .single();

        const currentScore = data ? data.score || 0 : 0;

        const { error: updateError } = await supabase
            .from('groups')
            .upsert({ groupName, score: currentScore + score });

        if (updateError) {
            console.error("Score update failed:", updateError);
        }
    }

    localStorage.setItem('groupScore', score);
    window.location.href = "alias.html";
}

// Going back to category
window.goBack = function() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    gameEnded = true;
    window.location.href = "category.html";
};
