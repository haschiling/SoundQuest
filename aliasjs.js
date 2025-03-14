let team1Total = 0;
let team2Total = 0;
let roundNumber = 1;

function addRound() {
    const team1Score = Math.floor(Math.random() * 10);
    const team2Score = Math.floor(Math.random() * 10);

    team1Total += team1Score;
    team2Total += team2Score;

    const team1Scores = document.getElementById("team1-scores");
    const team2Scores = document.getElementById("team2-scores");

    const scoreRow1 = document.createElement("div");
    scoreRow1.classList.add("score-row");
    scoreRow1.textContent = team1Score;
    team1Scores.appendChild(scoreRow1);

    const scoreRow2 = document.createElement("div");
    scoreRow2.classList.add("score-row");
    scoreRow2.textContent = team2Score;
    team2Scores.appendChild(scoreRow2);

    document.getElementById("team1-total").textContent = team1Total;
    document.getElementById("team2-total").textContent = team2Total;
}
