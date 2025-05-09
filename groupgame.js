import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';


const SUPABASE_URL = "https://gbpcccwimpsnvopjyxes.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdicGNjY3dpbXBzbnZvcGp5eGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NDc0OTMsImV4cCI6MjA1ODQyMzQ5M30.AFLVmnyo7zHX11u0wiTa-cb3nSWr-ZfM8MqD1xWIQt0";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


const videoElement = document.getElementById('media');
const timerBar = document.getElementById('timer-bar');
const countdownText = document.getElementById('countdown-text');
const skipBtn = document.getElementById('skip-btn');
const guessBtn = document.getElementById('guess-btn');
const showAnswerBtn = document.getElementById('answer-btn');
const answerText = document.getElementById('answer-text');
const scoreDisplay = document.getElementById('score');


let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let answeredQuestions = [];
let timerInterval;
let timeLeft = 30;
let gameEnded = false;

if (!localStorage.getItem('selectedMix') || !localStorage.getItem('groupName')) {
    localStorage.setItem('selectedMix', 'armenian');
    localStorage.setItem('groupName', 'DefaultGroup');
}

updateLanguage();
startGame();

function updateLanguage() {
    const lang = localStorage.getItem('lang');
    const isEnglish = lang === 'en';

    if (guessBtn) guessBtn.textContent = isEnglish ? 'Guess' : 'Կռահեցի';
    if (skipBtn) skipBtn.textContent = isEnglish ? 'Skip' : 'Բաց թողնել';
    if (showAnswerBtn) showAnswerBtn.textContent = isEnglish ? 'Show Answer' : 'Ցույց տալ պատասխանը';
    if (scoreDisplay) scoreDisplay.textContent = (isEnglish ? 'Score: ' : 'Հաշիվ: ') + score;

    const timeLabel = document.querySelector('.header span');
    if (timeLabel) timeLabel.textContent = isEnglish ? 'Time:' : 'Ժամանակ:';

    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) closeBtn.title = isEnglish ? 'Go back' : 'Վերադառնալ';
}

window.addEventListener('storage', (event) => {
    if (event.key === 'lang') {
        updateLanguage();
    }
});

function clearGame() {
    for (let i = 1; i <= 5; i++) {
        localStorage.removeItem(`team1-row-${i}`);
        localStorage.removeItem(`team2-row-${i}`);
    }
    localStorage.removeItem("team1-total");
    localStorage.removeItem("team2-total");
    localStorage.removeItem("turnCount");
    localStorage.removeItem("group1");
    localStorage.removeItem("group2");
    localStorage.removeItem("groupScore");
}

async function startGame() {
    const selectedCategory = localStorage.getItem('selectedMix');
    const groupName = localStorage.getItem('groupName');

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
    if (answerText) answerText.textContent = "";

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
    updateLanguage(); 
    loadNextQuestion();
});

showAnswerBtn.addEventListener('click', () => {
    if (gameEnded) return;

    const lang = localStorage.getItem('lang');
    const isEnglish = lang === 'en';
    const answer = videoElement.dataset.answer;
    answerText.textContent = (isEnglish ? "Correct Answer: " : "Ճիշտ պատասխան՝ ") + answer;
});

function startTimer() {
    timerBar.style.width = "100%";
    updateCountdownDisplay();

    timerInterval = setInterval(() => {
        timeLeft--;
        updateCountdownDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

function updateCountdownDisplay() {
    const formattedTime = `00:${timeLeft < 10 ? "0" + timeLeft : timeLeft}`;
    countdownText.textContent = formattedTime;
    timerBar.style.width = (timeLeft / 60) * 100 + "%";
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

window.goBack = function () {
    if (timerInterval) clearInterval(timerInterval);
    clearGame();
    gameEnded = true;
    localStorage.removeItem('groupScore');
    setTimeout(() => {
        window.location.href = "category.html";
    }, 50);
};
