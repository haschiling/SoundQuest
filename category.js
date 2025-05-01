document.addEventListener('DOMContentLoaded', function () {

    const toggleModeButton = document.getElementById('toggle-mode');

    // Toggle between solo and group mode
    if (toggleModeButton) {
        toggleModeButton.addEventListener('click', function () {
            let newMode = localStorage.getItem('selectedMode') === 'group' ? 'solo' : 'group';
            localStorage.setItem('selectedMode', newMode);
            console.log(`Selected mode: ${newMode}`);
        });
    } else {
        console.error('Mode toggle button not found!');
    }

    // Save selected music mix to localStorage
    const radioButtons = document.querySelectorAll('input[name="mix"]');
    radioButtons.forEach((button) => {
        button.addEventListener('change', function () {
            localStorage.setItem('selectedMix', this.value);
            console.log("Selected category:", this.value);
        });
    });

    // Set radio button checked state based on saved mix
    const selectedMix = localStorage.getItem('selectedMix');
    if (selectedMix) {
        const selectedRadioButton = document.querySelector(`input[value="${selectedMix}"]`);
        if (selectedRadioButton) {
            selectedRadioButton.checked = true;
        }
    }

    // Start button navigation logic
    const startButton = document.getElementById('start-button');
    if (startButton) {
        startButton.addEventListener('click', function () {
            const mode = localStorage.getItem('selectedMode');
            const category = localStorage.getItem('selectedMix');

            if (!mode || !category) {
                alert('Խնդրում ենք ընտրել երաժշտական ոճ և կատեգորիա');
            } else {
                if (mode === 'group') {
                    console.log('Redirecting to alias.html');
                    window.location.href = "alias.html";
                } else {
                    console.log('Redirecting to sologame.html');
                    window.location.href = "sologame.html";
                }
            }
        });
    } else {
        console.error('Start button not found!');
    }

    // Push initial history state
    history.pushState(null, "", location.href);

    // Handle back navigation to go to start.html
    window.addEventListener("popstate", function () {
        const mode = localStorage.getItem("selectedMode");
        const mix = localStorage.getItem("selectedMix");

        localStorage.clear(); // Clear all game-related data
        if (mode) localStorage.setItem("selectedMode", mode);
        if (mix) localStorage.setItem("selectedMix", mix);

        location.replace("start.html"); // Prevent returning to this page again
    });
});
