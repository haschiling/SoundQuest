document.addEventListener("DOMContentLoaded", () => {
    // Get the selected language from localStorage
    const lang = localStorage.getItem("lang") || "hy"; // Default to Armenian if not set

    // Translations for Armenian (hy) and English (en)
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

    // Set the language-specific translations
    const t = translations[lang] || translations.hy;

    // Set translated text for category, guessed text, and buttons
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

    // Set category title text dynamically
    const selectedMix = localStorage.getItem("selectedMix");
    const categoryNames = t.categories; // Use the dynamic category names based on selected language

    if (categoryTitle) {
        categoryTitle.textContent = selectedMix && categoryNames[selectedMix]
            ? `${t.categoryText} ${categoryNames[selectedMix]}`
            : `${t.categoryText} ${t.noCategory}`;
    }

    // Set score
    const scoreElement = document.getElementById("score");
    const score = localStorage.getItem("score");
    scoreElement.textContent = score ? `${score}` : "0";

    // Get song results from localStorage
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

    // Event listeners for buttons
    document.getElementById("repeatBtn").addEventListener("click", repeatGame);
    document.getElementById("endBtn").addEventListener("click", resetGame);

    // Language toggle button
    langBtn.addEventListener("click", () => {
        const newLang = lang === "hy" ? "en" : "hy";
        localStorage.setItem("lang", newLang); // Store the selected language
        location.reload(); // Reload the page to apply the new language
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
