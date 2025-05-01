import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = "https://gbpcccwimpsnvopjyxes.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdicGNjY3dpbXBzbnZvcGp5eGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NDc0OTMsImV4cCI6MjA1ODQyMzQ5M30.AFLVmnyo7zHX11u0wiTa-cb3nSWr-ZfM8MqD1xWIQt0";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let optionsContainer, mediaContainer, countdownText, timerBar, scoreText;
let questions = [], answeredQuestions = [], songResults = [];
let score = 0, timerInterval, timeLeft = 60, isTimerRunning = false, answered = false;

document.addEventListener("DOMContentLoaded", () => {
  scoreText = document.getElementById('score');
  optionsContainer = document.getElementById('options-container');
  mediaContainer = document.getElementById('media-container');
  timerBar = document.getElementById('timer-bar');
  countdownText = document.getElementById('countdown-text');

  document.querySelector('.close-btn').addEventListener('click', () => {
    window.location.href = 'category.html';
  });

  score = 0;
  localStorage.removeItem('score');
  localStorage.removeItem('songResults');
  updateScore();
  fetchQuestions();
});

async function fetchQuestions() {
  let selectedCategory = localStorage.getItem('selectedMix');
  const map = { armenian: 'armMix', russian: 'rusMix', english: 'engMix', mix: 'mix' };
  selectedCategory = map[selectedCategory];

  if (!selectedCategory) return;

  let allQuestions = [];

  if (selectedCategory === 'mix') {
    const tables = ['armMix', 'rusMix', 'engMix'];
    for (let table of tables) {
      const { data, error } = await supabase.from(table).select('id, fileUrl, options, correctAnswer');
      if (data) allQuestions = allQuestions.concat(data);
    }
  } else {
    const { data } = await supabase.from(selectedCategory).select('id, fileUrl, options, correctAnswer');
    if (data) allQuestions = data;
  }

  if (allQuestions.length) {
    questions = allQuestions;
    loadRandomQuestion();
  }
}

function loadRandomQuestion() {
  if (!questions.length) return;

  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * questions.length);
  } while (answeredQuestions.includes(randomIndex) && answeredQuestions.length < questions.length);

  const question = questions[randomIndex];
  answeredQuestions.push(randomIndex);
  answered = false;

  mediaContainer.innerHTML = '';
  optionsContainer.innerHTML = '';

  const isVideo = question.fileUrl.endsWith('.mp4');

  const media = document.createElement(isVideo ? 'video' : 'audio');
  media.setAttribute('controls', '');
  media.setAttribute('autoplay', '');

  if (isVideo) {
    media.setAttribute('muted', '');
    media.setAttribute('id', 'video-player');
    media.style.height = '360px';
  } else {
    media.removeAttribute('muted');
  }

  const source = document.createElement('source');
  source.src = question.fileUrl + '?t=' + Date.now();
  source.type = isVideo ? 'video/mp4' : 'audio/mpeg';
  media.appendChild(source);

  mediaContainer.appendChild(media);

  if (isVideo) {
    media.onplay = () => {
      if (!isTimerRunning) startTimer();
    };
  } else {
    media.oncanplay = () => {
      media.play().catch(() => {});
      if (!isTimerRunning) startTimer();
    };
  }

  let options = question.options;
  if (typeof options === 'string') options = options.split(',').map(o => o.trim());
  else if (typeof options === 'object' && !Array.isArray(options)) options = Object.values(options);

  options.forEach(option => {
    const btn = document.createElement('button');
    btn.classList.add('option');
    btn.textContent = option;
    btn.onclick = () => checkAnswer(option, question.correctAnswer);
    optionsContainer.appendChild(btn);
  });
}

function checkAnswer(selected, correct) {
  if (answered) return;
  answered = true;

  const isCorrect = selected.trim().toLowerCase() === correct.trim().toLowerCase();
  if (isCorrect) score++;

  songResults.push({ title: correct, correct: isCorrect });
  localStorage.setItem("songResults", JSON.stringify(songResults));
  updateScore();

  document.querySelectorAll('.option').forEach(btn => {
    const optionText = btn.textContent.trim().toLowerCase();
    btn.style.color = optionText === correct.trim().toLowerCase() ? 'white' : '#585555';
    btn.disabled = true;
  });

  setTimeout(nextQuestion, 2000);
}

function updateScore() {
  if (scoreText) scoreText.textContent = "Score: " + score;
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
  if (timerBar) timerBar.style.width = (timeLeft / 60) * 100 + "%";
}

function updateCountdownText() {
  if (countdownText) countdownText.textContent = `${timeLeft}s`;
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
