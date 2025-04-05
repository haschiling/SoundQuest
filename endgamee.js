// Function to get the game results (song titles and whether they were guessed correctly)
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

// Function to display results, including score and song list
function displayResults() {
    const songList = getGameResults();  // Get all the game results
    const songListContainer = document.getElementById("song-list");

    // Calculate score based on the number of correct answers
    const score = songList.filter(song => song.correct).length;

    // Debugging: Log the score to the console to check the calculation
    console.log("Calculated score:", score);

    // Update the score in the HTML
    const scoreElement = document.getElementById("score");
    scoreElement.textContent = score;  // Dynamically update the score element with the calculated score

    // Clear previous song list before rendering the new one
    songListContainer.innerHTML = '';

    // Loop through the song list and display each song along with its status (correct/incorrect)
    songList.forEach(song => {
        const songItem = document.createElement("div");
        songItem.classList.add("song-item");
        songItem.textContent = song.title;

        // Add class based on whether the answer was correct or wrong
        if (song.correct) {
            songItem.classList.add("correct");
        } else {
            songItem.classList.add("wrong");
        }

        // Append the song item to the song list container
        songListContainer.appendChild(songItem);
    });
}

// Function to restart the game (reload the page)
function repeatGame() {
    location.reload(); // Reloads the page to restart the game
}

// Function to end the game (redirects to the start page)
function endGame() {
    window.location.href = "file:///C:/Users/elizn/Downloads/start%20(1).html"; // Update this with the correct URL
}

// Call the displayResults function to render the results on page load
displayResults();
