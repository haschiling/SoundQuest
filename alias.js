function start() {
  const team1 = document.getElementById("team1").value.trim();
  const team2 = document.getElementById("team2").value.trim();

  const lang = localStorage.getItem("lang");

  if (!team1 || !team2) {
    alert(lang === "en" ? "Please enter names for both teams." : "Խնդրում ենք մուտքագրել երկու թիմերի անունները։");
    return;
  }

  localStorage.setItem("group1", team1);
  localStorage.setItem("group2", team2);

  if (!localStorage.getItem("turnCount")) {
    localStorage.setItem("turnCount", "0");
  }

  window.location.href = "groupgame.html";
}

function updateTotal(teamId, score) {
  const current = parseInt(localStorage.getItem(teamId)) || 0;
  const newTotal = current + score;
  localStorage.setItem(teamId, newTotal);
  const el = document.getElementById(teamId);
  if (el) el.textContent = newTotal;
}

function restoreRowScores() {
  for (let i = 1; i <= 5; i++) {
    const team1Score = localStorage.getItem(`team1-row-${i}`);
    const team2Score = localStorage.getItem(`team2-row-${i}`);
    if (team1Score !== null) {
      const cell1 = document.getElementById(`team1-row-${i}`);
      if (cell1) cell1.textContent = team1Score;
    }
    if (team2Score !== null) {
      const cell2 = document.getElementById(`team2-row-${i}`);
      if (cell2) cell2.textContent = team2Score;
    }
  }
}

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

function isReload() {
  const navEntries = performance.getEntriesByType("navigation");
  if (navEntries.length > 0 && navEntries[0].type === "reload") {
    return true;
  }
  return performance.navigation.type === 1;
}

function goBack() {
  clearGame();
  window.location.href = "category.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const lang = localStorage.getItem("lang");

  if (lang === "en") {
    const teamLabels = document.querySelectorAll("label[for]");
    if (teamLabels.length >= 2) {
      teamLabels[0].textContent = "Team 1";
      teamLabels[1].textContent = "Team 2";
    }

    const inputs = document.querySelectorAll("input[type='text']");
    if (inputs.length >= 2) {
      inputs[0].placeholder = "Name...";
      inputs[1].placeholder = "Name...";
    }

    const forwardBtn = document.querySelector("button[onclick='start()']");
    if (forwardBtn) forwardBtn.textContent = "Next";

    const backBtn = document.querySelector(".back-button");
    if (backBtn) backBtn.textContent = "⬅";
  }

  if (isReload()) {
    clearGame();
    return;
  }

  const group1 = localStorage.getItem("group1") || (lang === "en" ? "Team 1" : "Խումբ 1");
  const group2 = localStorage.getItem("group2") || (lang === "en" ? "Team 2" : "Խումբ 2");

  const team1Input = document.getElementById("team1");
  const team2Input = document.getElementById("team2");
  if (team1Input) team1Input.value = group1;
  if (team2Input) team2Input.value = group2;

  const team1TotalEl = document.getElementById("team1-total");
  const team2TotalEl = document.getElementById("team2-total");

  if (team1TotalEl) team1TotalEl.textContent = localStorage.getItem("team1-total") || "0";
  if (team2TotalEl) team2TotalEl.textContent = localStorage.getItem("team2-total") || "0";

  restoreRowScores();

  let score = parseInt(localStorage.getItem("groupScore"));
  let turnCount = parseInt(localStorage.getItem("turnCount")) || 0;

  if (!isNaN(score) && turnCount < 10) {
    const isTeam1 = turnCount % 2 === 0;
    const teamKey = isTeam1 ? "team1" : "team2";
    const rowIndex = Math.floor(turnCount / 2) + 1;
    const cellId = `${teamKey}-row-${rowIndex}`;
    const cell = document.getElementById(cellId);

    if (cell && cell.textContent.trim() === "") {
      cell.textContent = score;
      updateTotal(`${teamKey}-total`, score);

      localStorage.setItem(`${teamKey}-row-${rowIndex}`, score.toString());

      turnCount += 1;
      localStorage.setItem("turnCount", turnCount.toString());

      if (turnCount === 10) {
        clearGame();
      }
    }
  }

  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", goBack);
  }
});
