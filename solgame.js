import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";


const firebaseConfig = {
    apiKey: "AIzaSyB4dUtZAtPPtcuEuzX6R3h7Q8K7Dw5-5k",
    authDomain: "soundquest-cc7cf.firebaseapp.com",
    databaseURL: "https://soundquest-cc7cf-default-rtdb.firebaseio.com",
    projectId: "soundquest-cc7cf",
    storageBucket: "soundquest-cc7cf.appspot.com",
    messagingSenderId: "716322746712",
    appId: "1:716322746712:web:bfbcf1bd47a71cd059752d",
    measurementId: "G-K1ZQ432PZC"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let optionsContainer, mediaContainer, countdownText, timerBar;
let questions = [];
let currentQuestionIndex = 0;
let timerInterval;
let timeLeft = 60;
let isTimerRunning = false;

document.addEventListener("DOMContentLoaded", () => {
    optionsContainer = document.getElementById('options-container');
    mediaContainer = document.getElementById('media-container');
    timerBar = document.getElementById('timer-bar');
    countdownText = document.getElementById('countdown-text');


    const closeButton = document.querySelector('.close-btn');
    closeButton.addEventListener('click', () => {
        window.location.href = 'category.html';  
    });

    if (!optionsContainer || !mediaContainer || !timerBar || !countdownText) {
        console.error("Some DOM elements not found.");
        return;
    }

    fetchQuestions();
});

async function fetchQuestions() {
    const dbRef = ref(db, 'questions');
    try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            const fetchedQuestions = snapshot.val();
            questions = Object.values(fetchedQuestions);
            if (questions.length > 0) {
                loadQuestion();
            }
        } else {
            console.warn("No questions found in the database.");
        }
    } catch (error) {
        console.error("Error fetching questions:", error);
    }
}

function loadQuestion() {
    if (questions.length === 0) return;

    const question = questions[currentQuestionIndex];
    let mediaType = "image";

    if (question.fileUrl.includes("youtube.com") || question.fileUrl.includes("drive.google.com")) {
        mediaType = "video";
    }

    mediaContainer.innerHTML = '';
    optionsContainer.innerHTML = '';
    stopTimer();

    if (mediaType === "video") {
        if (question.fileUrl.includes("youtube.com")) {
            const youtubeId = getYouTubeVideoId(question.fileUrl);
            mediaContainer.innerHTML = `<div id="video-player"></div>`;
            loadYouTubePlayer(youtubeId);
        } else {
            const driveId = getGoogleDriveId(question.fileUrl);
            console.log("Extracted Drive ID:", driveId);

            mediaContainer.innerHTML = `
                <iframe id="video-player"
                        src="https://drive.google.com/file/d/${driveId}/preview"
                        width="640" height="480"
                        allow="autoplay; encrypted-media"
                        allowfullscreen
                        frameborder="0">
                </iframe>
            `;

            setTimeout(() => {
                if (!isTimerRunning) startTimer();
            }, 20000); 
        }
    } else {
        mediaContainer.innerHTML = `<img src="${question.fileUrl}" alt="Clip" width="100%" />`;
        if (!isTimerRunning) startTimer();
    }

    question.options.forEach(option => {
        const button = document.createElement('button');
        button.classList.add('option');
        button.textContent = option;
        button.onclick = answerQuestion;
        optionsContainer.appendChild(button);
    });
}

function getYouTubeVideoId(url) {
    const match = url.match(/[?&]v=([^&#]+)/);
    return match ? match[1] : null;
}

function getGoogleDriveId(url) {
    const regex = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function loadYouTubePlayer(videoId) {
    if (window.YT && YT.Player) {
        createYTPlayer(videoId);
    } else {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
        window.onYouTubeIframeAPIReady = () => createYTPlayer(videoId);
    }
}

function createYTPlayer(videoId) {
    new YT.Player('video-player', {
        height: '480',
        width: '640',
        videoId: videoId,
        events: {
            'onStateChange': event => {
                if (event.data === YT.PlayerState.ENDED) {
                    if (!isTimerRunning) startTimer();
                }
            }
        }
    });
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
            nextQuestion();
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
}

function updateTimerBar() {
    timerBar.style.width = (timeLeft / 60) * 100 + "%";
}

function updateCountdownText() {
    if (countdownText) {
        countdownText.textContent = `${timeLeft}s`;
    }
}

function nextQuestion() {
    currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
    timeLeft = 60;
    loadQuestion();
}

function answerQuestion() {
    stopTimer();
    nextQuestion();
}
