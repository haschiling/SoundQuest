document.addEventListener('DOMContentLoaded', function () {
    const toggleModeButton = document.getElementById('toggle-mode');
    const startButton = document.getElementById('start-button');
    const title = document.querySelector('.title');
    const nameLabel = document.querySelector('.name');


    let isEnglish = localStorage.getItem('lang') === 'en';

    function updateLanguage() {
        if (isEnglish) {
            toggleModeButton.textContent = 'EN';
            title.textContent = 'Categories';
            startButton.textContent = 'Start';
            nameLabel.textContent = 'SoundQuest';
        } else {
            toggleModeButton.textContent = 'ՀԱ';
            title.textContent = 'Կատեգորիաներ';
            startButton.textContent = 'Սկսել';
            nameLabel.textContent = 'ՍաունդՔվեսթ';
        }
    }

    updateLanguage();

    if (toggleModeButton) {
        toggleModeButton.addEventListener('click', function () {
            isEnglish = !isEnglish;
            localStorage.setItem('lang', isEnglish ? 'en' : 'hy');
            updateLanguage();
        });
    }


    const radioButtons = document.querySelectorAll('input[name="mix"]');
    radioButtons.forEach((button) => {
        button.addEventListener('change', function () {
            localStorage.setItem('selectedMix', this.value);
            console.log("Selected category:", this.value);
        });
    });

    const selectedMix = localStorage.getItem('selectedMix');
    if (selectedMix) {
        const selectedRadioButton = document.querySelector(`input[value="${selectedMix}"]`);
        if (selectedRadioButton) {
            selectedRadioButton.checked = true;
        }
    }

    if (startButton) {
        startButton.addEventListener('click', function () {
            const mode = localStorage.getItem('selectedMode');
            const category = localStorage.getItem('selectedMix');

            if (!mode || !category) {
                alert(isEnglish ? 'Please select a mix and category.' : 'Խնդրում ենք ընտրել երաժշտական ոճ և կատեգորիա');
            } else {
                window.location.href = mode === 'group' ? 'alias.html' : 'sologame.html';
            }
        });
    }

    history.pushState(null, "", location.href);

    window.addEventListener("popstate", function () {
        const mode = localStorage.getItem("selectedMode");
        const mix = localStorage.getItem("selectedMix");
        const lang = localStorage.getItem("lang");

        localStorage.clear();
        if (mode) localStorage.setItem("selectedMode", mode);
        if (mix) localStorage.setItem("selectedMix", mix);
        if (lang) localStorage.setItem("lang", lang);

        location.replace("start.html");
    });
});
