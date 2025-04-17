document.addEventListener("DOMContentLoaded", () => {
    const scoreElement = document.getElementById("score");
    const songListContainer = document.getElementById("song-list");
    const categoryTitle = document.getElementById("category-title");


    const score = localStorage.getItem("score");
    scoreElement.textContent = score ? ` ${score} ` : "Հաշիվ: 0";


    const selectedMix = localStorage.getItem("selectedMix");
    const categoryNames = {
        armenian: "Հայկական",
        russian: "Ռուսական",
        english: "Անգլերեն",
        mix: "Խառը"
    };
    if (categoryTitle) {
        categoryTitle.textContent = selectedMix && categoryNames[selectedMix]
            ? `Կատեգորիա՝ ${categoryNames[selectedMix]}`
            : "Կատեգորիա չընտրված է";
    }


    const songList = getGameResults();

    if (songList.length === 0) {
        songListContainer.textContent = "Խաղի արդյունքները չեն գտնվել։";
        return;
    }


    songListContainer.innerHTML = "";
    songList.forEach(song => {
        const div = document.createElement("div");
        div.textContent = song.title;
        div.style.color = song.correct ? "white" : "#585555";
        div.classList.add("song-item");
        songListContainer.appendChild(div);
    });
});

function getGameResults() {
    try {
        const stored = localStorage.getItem("songResults");
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Error loading song results:", e);
        return [];
    }
}

function repeatGame() {
    location.reload();
}

function resetGame() {
    localStorage.removeItem("score");
    localStorage.removeItem("songResults");
    localStorage.removeItem("selectedMix");
    window.location.href = "start.html";
}
