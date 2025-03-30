let score = 0;
let timeLeft = 30;
let timerInterval;

// ** Start Timer **
function startTimer() {
    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            document.getElementById("timer").textContent = `00:${timeLeft < 10 ? "0" + timeLeft : timeLeft}`;
        } else {
            clearInterval(timerInterval);
            alert("Time's up!");
        }
    }, 1000);
}

// ** Go back function **
function goBack() {
    window.history.back();
}

// ** Next Question (Increase Score) **
function nextQuestion() {
    score++;
    document.getElementById("score").textContent = score;
    loadNextMedia();
}

// ** Skip Question **
function skipQuestion() {
    loadNextMedia();
}

// ** Load Next Media (Video/Audio) **
function loadNextMedia() {
    let video = document.getElementById("videoClip");
    if (video) {
        video.src = "next-video.mp4";  // Change dynamically
        video.play();
    }

    let audio = document.getElementById("audioClip");
    if (audio) {
        audio.src = "next-audio.mp3";  // Change dynamically
        audio.play();
    }
}

// ** Start Timer on Page Load **
window.onload = startTimer;
