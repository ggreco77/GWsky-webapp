// Setting Aladin MOC display
let adaptative_display = false;

// Setting Aladin MOC colors
const CSS_COLOR_NAMES = [
  "AliceBlue",
  "AntiqueWhite",
  "Aqua",
  "Aquamarine",
  "Pink",
  "Plum",
  "PowderBlue",
  "Purple",
  "RebeccaPurple",
  "Red",
  "RosyBrown",
  "RoyalBlue",
  "SaddleBrown",
  "Salmon",
  "SandyBrown",
  "SeaGreen",
  "SeaShell",
  "Sienna",
  "Silver",
  "SkyBlue",
  "SlateBlue",
  "SlateGray",
  "SlateGrey",
  "Snow",
  "SpringGreen",
  "SteelBlue",
  "Tan",
  "Teal",
  "Thistle",
  "Tomato",
  "Turquoise",
  "Violet",
  "Wheat",
  "White",
  "WhiteSmoke",
  "Yellow",
  "YellowGreen",
];
const MOC_colour_default = 2;
var MOC_colour = MOC_colour_default;
var data = null; // UInt8Array

function demoWatch1() {
  window.open("https://youtu.be/Ayu5TUwzBT0");
}

function demoWatch2() {
  window.open("https://youtu.be/nCOaNiVUxZI");
}

function demoWatch3() {
  window.open("https://youtu.be/_QXveYTb244");
}

function myCheck() {
  // Get the checkbox
  var checkBox = document.getElementById("myCheck");
  // Get the output text
  var text = document.getElementById("text");

  // If the checkbox is checked, display the output text
  if (checkBox.checked == true) {
    text.style.display = "block";
    adaptative_display = true;
  } else {
    text.style.display = "none";
    adaptative_display = false;
  }
}

function toggleCollapsible(header, targetId) {
  const content = document.getElementById(targetId);
  if (!content) return;

  const isVisible = content.style.display !== "none";
  content.style.display = isVisible ? "none" : "block";

  // Cambia freccia nell'header
  const arrow = header.querySelector(".arrow");
  if (arrow) {
    arrow.textContent = isVisible ? "▶️" : "🔽";
  }
}
