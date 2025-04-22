function selectMode(mode) {
    localStorage.setItem('selectedMode', mode);
    console.log("Mode selected:", mode);
    window.location.href = "category.html"; 
}


const mode = localStorage.getItem('selectedMode');
console.log("Selected mode:", mode);