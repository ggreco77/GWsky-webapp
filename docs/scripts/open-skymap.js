function openSkymap(evt, loadOperation) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(loadOperation).style.display = "block";
  evt.currentTarget.className += " active";
}

function closeAllTabs() {
  // Nasconde tutte le tabcontent
  document.querySelectorAll(".tabcontent").forEach((tab) => {
    tab.style.display = "none";
  });

  // Rimuove la classe evidenziata (es. w3-dark-grey) da tutti i bottoni
  document.querySelectorAll(".tablinks").forEach((btn) => {
    btn.classList.remove("w3-dark-grey");
    btn.classList.remove("active");
    btn.style.backgroundColor = ""; // reset manuale inline se serve
  });
}
