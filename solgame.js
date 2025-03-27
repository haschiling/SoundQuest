import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = "https://gbpcccwimpsnvopjyxes.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdicGNjY3dpbXBzbnZvcGp5eGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NDc0OTMsImV4cCI6MjA1ODQyMzQ5M30.AFLVmnyo7zHX11u0wiTa-cb3nSWr-ZfM8MqD1xWIQt0";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let optionsContainer, mediaContainer, countdownText, timerBar;
let questions = [];
let currentQuestionIndex = 0;
let timerInterval;
let timeLeft = 60; 
let isTimerRunning = false;
let answered = false;

document.addEventListener("DOMContentLoaded", () => {
    optionsContainer = document.getElementById('options-container');
    mediaContainer = document.getElementById('media-container');
    timerBar = document.getElementById('timer-bar');
    countdownText = document.getElementById('countdown-text');

    document.querySelector('.close-btn').addEventListener('click', () => {
        window.location.href = 'category.html';  
    });

    fetchQuestions();
});

async function fetchQuestions() {
    const selectedCategory = localStorage.getItem('selectedMix');
    console.log("Selected category from localStorage:", selectedCategory);

    if (!selectedCategory) {
        console.error("No category selected. Please select a category first.");
        return;
    }

    let tableName = '';
    if (selectedCategory === 'armMix' || selectedCategory === 'armenian') {
        tableName = 'armMix';  
    } else if (selectedCategory === 'rusMix' || selectedCategory === 'russian') {
        tableName = 'rusMix';  
    } else if (selectedCategory === 'engMix' || selectedCategory === 'english') {
        tableName = 'engMix'; 
    } else {
        console.error("Invalid category selected.");
        return;
    }

    const { data, error } = await supabase
        .from(tableName)
        .select('id, fileUrl, options, correctAnswer');

    if (error) {
        console.error("Error fetching questions:", error.message);
        return;
    }

    console.log("Fetched data:", data);  

    if (data && data.length > 0) {
        questions = data;
        loadQuestion();
    } else {
        console.warn("No questions found in the database for category:", selectedCategory);
    }
}


function loadQuestion() {
    if (questions.length === 0) return;

    const question = questions[currentQuestionIndex];

    console.log("Type of question.options:", typeof question.options);
    console.log("question.options:", question.options);

    mediaContainer.innerHTML = '';
    optionsContainer.innerHTML = '';
    stopTimer(); 
    answered = false; 

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

    if (Array.isArray(options)) {
        options.forEach(option => {
            const button = document.createElement('button');
            button.classList.add('option');
            button.textContent = option;
            button.onclick = () => checkAnswer(option, question.correctAnswer);
            optionsContainer.appendChild(button);
        });
    } else {
        console.error("Options is not an array. Please check the data format.");
    }

    const videoElement = document.getElementById('video-player');
    videoElement.onended = () => {
        if (!isTimerRunning && !answered) {  
            startTimer();
        }
    };
}

function checkAnswer(selected, correct) {
    if (answered) return; 

    answered = true; 

    console.log("Selected answer:", selected);
    console.log("Correct answer:", correct);

    const selectedTrimmed = selected.trim().toLowerCase();
    const correctTrimmed = correct.trim().toLowerCase();

    if (selectedTrimmed === correctTrimmed) {
        alert("✅ Correct!");
    } else {
        alert("❌ Wrong!");
    }

    stopTimer(); 
    nextQuestion();
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
    countdownText.textContent = `${timeLeft}s`; 
}

function nextQuestion() {
    currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
    loadQuestion();
}
