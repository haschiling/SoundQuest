
function selectMode(mode) {
    localStorage.setItem('selectedMode', mode);
    console.log("Mode selected:", mode);
    window.location.href = "category.html"; 
}

function loadStylesheet() {
    const screenWidth = window.innerWidth;
    const existingLink = document.getElementById('dynamic-css');

    // Remove the existing stylesheet if it exists
    if (existingLink) {
        existingLink.parentNode.removeChild(existingLink);
    }

    // Create a new link element for the stylesheet
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.id = 'dynamic-css';

    // Load the appropriate stylesheet based on screen width
    if (screenWidth > 768) {
        link.href = 'mainpc.css'; // Desktop CSS
        console.log("Loaded Desktop CSS");
    } else {
        link.href = 'startP.css'; // Mobile CSS
        console.log("Loaded Mobile CSS");
    }

    document.head.appendChild(link);
}

// Load the stylesheet on page load and orientation change
window.onload = loadStylesheet;
window.addEventListener('resize', loadStylesheet);
window.addEventListener('orientationchange', loadStylesheet);
const mode = localStorage.getItem('selectedMode');
console.log("Selected mode:", mode);
