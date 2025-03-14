const mediaContainer = document.getElementById('media');
const timerBar = document.getElementById('timer-bar');
const skipBtn = document.getElementById('skip-btn');
const guessBtn = document.getElementById('guess-btn');
const scoreDisplay = document.getElementById('score');

let score = 0;
let currentQuestion = 0;

const questions = [
    { media: "assets/voice1.mp3" },
    { media: "assets/voice2.mp3" },
    { media: "assets/voice3.mp3" },
    { media: "assets/voice4.mp3" },
    { media: "assets/voice5.mp3" }
];

function loadQuestion() {
    const question = questions[currentQuestion];
    mediaContainer.src = question.media;
    mediaContainer.play();
    startTimer();
}

function nextQuestion() {
    currentQuestion = (currentQuestion + 1) % questions.length;
    loadQuestion();
}

function startTimer() {
    let width = 100;
    timerBar.style.width = width + "%";

    const interval = setInterval(() => {
        width -= 1;
        timerBar.style.width = width + "%";
        if (width <= 0) {
            clearInterval(interval);
            nextQuestion();
        }
    }, 100);
}

function guessAnswer() {
    score++;
    scoreDisplay.textContent = "Score: " + score;
    nextQuestion();
}

skipBtn.addEventListener('click', nextQuestion);
guessBtn.addEventListener('click', guessAnswer);

loadQuestion();