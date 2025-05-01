document.addEventListener("DOMContentLoaded", () => {

    const lang = localStorage.getItem("lang") || "hy"; 


    const translations = {
        hy: {
            guessedText: "Դուք գուշակել եք",
            songText: "երգ!",
            repeatBtn: "Նորից ?",
            endBtn: "Ավարտել",
            categoryText: "Կատեգորիա՝",
            noResults: "Խաղի արդյունքները չեն գտնվել։",
            noCategory: "Կատեգորիա ընտրված չէ",
            langBtn: "English",
            categories: {
                armenian: "ԱրմՄիքս",
                russian: "ՌուսՄիքս",
                english: "ԱնգՄիքս",
                mix: "Միքս"
            }
        },
        en: {
            guessedText: "You guessed",
            songText: "songs!",
            repeatBtn: "Repeat?",
            endBtn: "End",
            categoryText: "Category:",
            noResults: "No game results found.",
            noCategory: "No category selected",
            langBtn: "Հայերեն",
            categories: {
                armenian: "ArmMix",
                russian: "RusMix",
                english: "EngMix",
                mix: "Mix"
            }
        }
    };


    const t = translations[lang] || translations.hy;


    const guessedText = document.getElementById("guessed-text");
    const songText = document.getElementById("song-text");
    const repeatBtn = document.getElementById("repeatBtn");
    const endBtn = document.getElementById("endBtn");
    const categoryTitle = document.getElementById("category-title");
    const langBtn = document.getElementById("langBtn");

    if (guessedText) guessedText.textContent = t.guessedText;
    if (songText) songText.textContent = t.songText;
    if (repeatBtn) repeatBtn.textContent = t.repeatBtn;
    if (endBtn) endBtn.textContent = t.endBtn;
    if (langBtn) langBtn.textContent = t.langBtn;


    const selectedMix = localStorage.getItem("selectedMix");
    const categoryNames = t.categories;

    if (categoryTitle) {
        categoryTitle.textContent = selectedMix && categoryNames[selectedMix]
            ? `${t.categoryText} ${categoryNames[selectedMix]}`
            : `${t.categoryText} ${t.noCategory}`;
    }


    const scoreElement = document.getElementById("score");
    const score = localStorage.getItem("score");
    scoreElement.textContent = score ? `${score}` : "0";

    const songList = getGameResults();
    const songListContainer = document.getElementById("song-list");

    if (songList.length === 0) {
        songListContainer.textContent = t.noResults;
    } else {
        songListContainer.innerHTML = "";
        songList.forEach(song => {
            const div = document.createElement("div");
            div.textContent = song.title;
            div.style.color = song.correct ? "white" : "#585555";
            div.classList.add("song-item");
            songListContainer.appendChild(div);
        });
    }


    document.getElementById("repeatBtn").addEventListener("click", repeatGame);
    document.getElementById("endBtn").addEventListener("click", resetGame);

    langBtn.addEventListener("click", () => {
        const newLang = lang === "hy" ? "en" : "hy";
        localStorage.setItem("lang", newLang); 
        location.reload(); 
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
    window.location.href = "sologame.html";
}

function resetGame() {
    localStorage.removeItem("score");
    localStorage.removeItem("songResults");
    localStorage.removeItem("selectedMix");
    window.location.href = "category.html";
}
