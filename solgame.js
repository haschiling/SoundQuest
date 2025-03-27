import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// 🔹 Replace with your actual Supabase details
const SUPABASE_URL = "https://gbpcccwimpsnvopjyxes.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdicGNjY3dpbXBzbnZvcGp5eGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NDc0OTMsImV4cCI6MjA1ODQyMzQ5M30.AFLVmnyo7zHX11u0wiTa-cb3nSWr-ZfM8MqD1xWIQt0";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let optionsContainer, mediaContainer, countdownText, timerBar;
let questions = [];
let currentQuestionIndex = 0;
let timerInterval;
let timeLeft = 60;  // Set the initial time for each question
let isTimerRunning = false;
let answered = false;  // To track if the user has already answered the question

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
    const { data, error } = await supabase
        .from('questions')
        .select('id, fileUrl, options, correctAnswer');

    if (error) {
        console.error("Error fetching questions:", error.message);
        return;
    }

    console.log("Fetched data:", data);  // Log the fetched data

    if (data && data.length > 0) {
        questions = data;
        loadQuestion();
    } else {
        console.warn("No questions found in the database. Check your Supabase table.");
    }
}

function loadQuestion() {
    if (questions.length === 0) return;

    const question = questions[currentQuestionIndex];

    // Log the type of options for debugging
    console.log("Type of question.options:", typeof question.options);
    console.log("question.options:", question.options);

    // Ensure to reference the correct fields in your database schema
    mediaContainer.innerHTML = '';
    optionsContainer.innerHTML = '';
    stopTimer();  // Stop the timer when the question is changed
    answered = false; // Reset answered status when loading a new question

    // Assuming `fileUrl` is the URL for the video
    mediaContainer.innerHTML = `
        <video id="video-player" controls autoplay>
            <source src="${question.fileUrl}?t=${Date.now()}" type="video/mp4">
            Your browser does not support the video tag.
        </video>
    `;

    // Handle options (if options are a string or not an array)
    let options = question.options;

    // If options is a string, split it into an array
    if (typeof options === 'string') {
        options = options.split(',').map(option => option.trim()); // Split by commas and trim spaces
    } else if (typeof options === 'object' && !Array.isArray(options)) {
        // If options is an object but not an array, convert it to an array
        options = Object.values(options);  // Convert object values into an array
    }

    // Log the final options array to check if it's correct
    console.log("Processed options array:", options);

    // Ensure options is now an array before using `forEach`
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

    // Start the timer when the video ends
    const videoElement = document.getElementById('video-player');
    videoElement.onended = () => {
        if (!isTimerRunning && !answered) {  // Only start the timer if it hasn't been started yet and no answer has been selected
            startTimer();
        }
    };
}

function checkAnswer(selected, correct) {
    if (answered) return; // Prevent answering again if the question has already been answered

    answered = true; // Mark that the question has been answered

    if (selected === correct) {
        alert("✅ Correct!");
    } else {
        alert("❌ Wrong!");
    }
    stopTimer(); // Stop the timer as soon as an answer is selected
    nextQuestion();
}

function startTimer() {
    if (isTimerRunning || timeLeft <= 0) return;

    isTimerRunning = true;
    updateTimerBar();
    updateCountdownText();

    timerInterval = setInterval(() => {
        timeLeft--;  // Decrease time every second
        updateTimerBar();
        updateCountdownText();

        if (timeLeft <= 0) {
            stopTimer();
            nextQuestion();  // Automatically move to the next question when the time is up
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
}

function updateTimerBar() {
    timerBar.style.width = (timeLeft / 60) * 100 + "%";  // Update the progress bar
}

function updateCountdownText() {
    countdownText.textContent = `${timeLeft}s`;  // Update the countdown timer
}

function nextQuestion() {
    currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
    // Do not reset the timeLeft; it continues from the previous question's remaining time
    loadQuestion();
}
