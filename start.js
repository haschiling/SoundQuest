document.addEventListener("DOMContentLoaded", () => {
    const langBtn = document.querySelector(".lang-button");
    const title = document.querySelector(".title");
    const allHeadings = document.querySelectorAll("h2");

    let isEnglish = localStorage.getItem("lang") === "en";

    function updateLanguage() {
        if (isEnglish) {
            langBtn.textContent = "EN";
            title.textContent = "SoundQuest";
            allHeadings[0].textContent = "WordQuest";
            allHeadings[1].textContent = "SoloQuest";
        } else {
            langBtn.textContent = "ՀԱ";
            title.textContent = "ՍաունդՔվեսթ";
            allHeadings[0].textContent = "ԽոսքՔվեսթ";
            allHeadings[1].textContent = "ՄեղեդիՔվեսթ";
        }
    }

    updateLanguage();

    langBtn.addEventListener("click", () => {
        isEnglish = !isEnglish;
        localStorage.setItem("lang", isEnglish ? "en" : "hy");
        updateLanguage();
    });
});


function selectMode(mode) {
    localStorage.setItem("selectedMode", mode);
    console.log("Mode selected:", mode);
    window.location.href = "category.html";
}
