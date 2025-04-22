function start() {
    const team1 = document.getElementById("team1").value.trim();
    const team2 = document.getElementById("team2").value.trim();

    if (!team1 || !team2) {
        alert("Խնդրում ենք մուտքագրել երկու խմբերի անունները։");
        return;
    }


    localStorage.setItem("group1", team1);
    localStorage.setItem("group2", team2);

   
    window.location.href = "groupgame.html";
}
