const optionsContainer = document.getElementById('options-container');
const mediaContainer = document.getElementById('media');
const timerBar = document.getElementById('timer-bar');

const questions = [
    {
        media: "clip1.jpg",
        options: ["See you again", "Car's outside", "Die with a smail", "Royalty"],
    },
    {
        media: "clip2.jpg",
        options: ["Blinding Lights", "Shape of You", "Dance Monkey", "Closer"],
    },
    {
        media: "clip3.jpg",
        options: ["Havana", "Despacito", "Sorry", "Cheap Thrills"],
    },
    {
        media: "clip4.jpg",
        options: ["Uptown Funk", "Bad Guy", "Old Town Road", "Rockstar"],
    },
    {
        media: "clip5.jpg",
        options: ["Hello", "Someone Like You", "Rolling in the Deep", "Skyfall"],
    }
];

let currentQuestion = 0;

function loadQuestion() {
    const question = questions[currentQuestion];
    mediaContainer.src = question.media;
    optionsContainer.innerHTML = '';

    question.options.forEach(option => {
        const button = document.createElement('button');
        button.classList.add('option');
        button.textContent = option;
        button.onclick = nextQuestion;
        optionsContainer.appendChild(button);
    });

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

loadQuestion();