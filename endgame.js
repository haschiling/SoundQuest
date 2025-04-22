import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = "https://gbpcccwimpsnvopjyxes.supabase.co";
const SUPABASE_KEY = "YOUR_SUPABASE_KEY"; // Replace this with your actual key
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
let timerInterval;
let currentCorrectAnswer = "";

fetchQuestions();

async function fetchQuestions() {
    let selectedCategory = localStorage.getItem('selectedMix');
    if (!selectedCategory) return;

    const categoryMapping = {
        armenian: 'armMix',
        russian: 'rusMix',
        english: 'engMix',
        mix: 'mix'
    };

    selectedCategory = categoryMapping[selectedCategory];
    if (!selectedCategory) return;

    let allQuestions = [];

    if (selectedCategory === 'mix') {
        const tables = ['armMix', 'rusMix', 'engMix'];
        for (let table of tables) {
            const { data, error } = await supabase.from(table).select('id, fileUrl, options, correctAnswer');
            if (!error) allQuestions = allQuestions.concat(data);
        }
    } else {
        const { data, error } = await supabase.from(selectedCategory).select('id, fileUrl, options, correctAnswer');
        if (!error) allQuestions = data;
    }

    if (allQuestions.length > 0) {
        questions = allQuestions;
        loadRandomQuestion();
    }
}

function loadRandomQuestion() {
    if (questions.length === 0) return;

    answerText.textContent = ""; // Clear answer text

    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * questions.length);
    } while (answeredQuestions.includes(randomIndex) && answeredQuestions.length < questions.length);

    const question = questions[randomIndex];
    answeredQuestions.push(randomIndex);
    currentCorrectAnswer = question.correctAnswer;

    mediaContainer.innerHTML = `
        <video id="video-player" controls autoplay muted>
            <source src="${question.fileUrl}?t=${Date.now()}" type="video/mp4">
        </video>
    `;

    const videoPlayer = document.getElementById('video-player');
    videoPlayer.onplay = () => {
        if (!timerInterval) startTimer();
    };
}

function nextQuestion() {
    clearInterval(timerInterval);
    timerInterval = null;
    loadRandomQuestion();
}

function guessAnswer() {
    score++;
    scoreDisplay.textContent = "Հաշիվ: " + score;
    nextQuestion();
}

function startTimer() {
    let timeLeft = 60;
    let width = 100;

    timerBar.style.width = width + "%";
    countdownText.textContent = `00:${timeLeft}`;

    timerInterval = setInterval(() => {
        timeLeft--;
        width = (timeLeft / 60) * 100;
        timerBar.style.width = width + "%";
        countdownText.textContent = `00:${timeLeft < 10 ? "0" + timeLeft : timeLeft}`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            nextQuestion();
        }
    }, 1000);
}

function goBack() {
    window.history.back();
}

// Event listeners
skipBtn.addEventListener('click', nextQuestion);
guessBtn.addEventListener('click', guessAnswer);
answerBtn.addEventListener('click', () => {
    answerText.textContent = `Ճիշտ պատասխանն է՝ ${currentCorrectAnswer}`;
});
