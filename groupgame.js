import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';


const SUPABASE_URL = "https://gbpcccwimpsnvopjyxes.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdicGNjY3dpbXBzbnZvcGp5eGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NDc0OTMsImV4cCI6MjA1ODQyMzQ5M30.AFLVmnyo7zHX11u0wiTa-cb3nSWr-ZfM8MqD1xWIQt0"; // Replace with your actual key
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


const videoElement = document.getElementById('media');
const timerBar = document.getElementById('timer-bar');
const countdownText = document.getElementById('countdown-text');
const skipBtn = document.getElementById('skip-btn');
const guessBtn = document.getElementById('guess-btn');
const answerBtn = document.getElementById('answer-btn');
const answerText = document.getElementById('answer-text');
const scoreDisplay = document.getElementById('score');
const mediaContainer = document.getElementById('media-container');

let questions = [];
let answeredQuestions = [];
let score = 0;
let timeLeft = 60;
let currentCorrectAnswer = "";


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
            const { data, error } = await supabase.from(table).select('id, fileUrl, correctAnswer');
            if (!error) allQuestions = allQuestions.concat(data);
        }
    } else {
        const { data, error } = await supabase.from(selectedCategory).select('id, fileUrl, correctAnswer');
        if (!error) allQuestions = data;
    }

    if (allQuestions.length > 0) {
        questions = allQuestions;
        loadRandomQuestion();
        startTimer();
    } else {
        console.warn("No questions available.");
    }
}

function loadRandomQuestion() {
    answerText.textContent = "";

    if (answeredQuestions.length === questions.length) {
        answeredQuestions = [];
    }

    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * questions.length);
    } while (answeredQuestions.includes(randomIndex) && answeredQuestions.length < questions.length);

    answeredQuestions.push(randomIndex);

    const question = questions[randomIndex];
    currentCorrectAnswer = question.correctAnswer || "Անհայտ պատասխան";

    mediaContainer.innerHTML = `
        <video id="video-player" controls autoplay muted>
            <source src="${question.fileUrl}?t=${Date.now()}" type="video/mp4">
        </video>
    `;
}

function guessAnswer() {
    score++;
    scoreDisplay.textContent = "Հաշիվ: " + score;
    loadRandomQuestion();
}

function startTimer() {
    const interval = setInterval(() => {
        timeLeft--;
        timerBar.style.width = (timeLeft / 60) * 100 + "%";
        countdownText.textContent = `00:${timeLeft < 10 ? "0" + timeLeft : timeLeft}`;

        if (timeLeft <= 0) {
            clearInterval(interval);
            endGame();
        }
    }, 1000);
}

function showAnswer() {
    answerText.textContent = `Ճիշտ պատասխանն է՝ ${currentCorrectAnswer}`;
}

function endGame() {
    localStorage.setItem("groupScore", score);
    window.location.href = "endgame.html";
}


skipBtn.addEventListener('click', loadRandomQuestion);
guessBtn.addEventListener('click', guessAnswer);
answerBtn.addEventListener('click', showAnswer);


fetchQuestions();
