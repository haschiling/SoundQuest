
function getGameResults() {
    
    return [
        { title: "See You Again - Wiz Khalifa ft. Charlie Puth", correct: true },
        { title: "Cars Outside - James Arthur", correct: true },
        { title: "Easy On Me - Adele", correct: false },
        { title: "Until I Found You - Stephen Sanchez", correct: true },
        { title: "Lovely - Billie Eilish & Khalid", correct: false },
        { title: "Blinding Lights - The Weeknd", correct: true },
    ];
}

function displayResults() {
    const songList = getGameResults();
    const songListContainer = document.getElementById("song-list");
    const score = songList.filter(song => song.correct).length; 

 
    document.getElementById("score").textContent = score;

    songListContainer.innerHTML = '';


    songList.forEach(song => {
        const songItem = document.createElement("div");
        songItem.classList.add("song-item");
        songItem.textContent = song.title;
        if (song.correct) {
            songItem.classList.add("correct");
        } else {
            songItem.classList.add("wrong");
        }
        songListContainer.appendChild(songItem);
    });
}

function repeatGame() {
    location.reload(); 
}

function endGame() {
    window.location.href = "file:///C:/Users/elizn/Downloads/start%20(1).html"; 
}

displayResults();