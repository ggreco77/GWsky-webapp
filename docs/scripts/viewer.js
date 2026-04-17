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
var momoc = null;

// A $( document ).ready() block.
$(document).ready(function () {
  console.log("ready!");

  // Starting
  $("#dosth").click(function () {
    var to_threshold = $("#quantity").val(); // to_threshold
    var filename_path = $("#FITSfile").val(); // get filename path
    var filename = filename_path.split("\\")[2]; // get only filename

    console.log("Credibility level: " + to_threshold);

    try {
      //name, data: UInt8Array, from_threshold: f64, to_threshold: f64, asc: bool, not_strict: bool, split: bool, revese_recursive_descent: bool
      moc_name = "MOC" + " " + to_threshold + " " + filename; // set MOC name
      // Check same layers
      if (moc.list().includes(moc_name)) {
        alert("This credible area already exists!");
        return;
      }
      moc.fromFitsMulitOrderMap(
        moc_name,
        momoc,
        0.0,
        to_threshold,
        false,
        false,
        false,
        false,
      );
    } catch (err) {
      if (typeof err == "string") {
        alert("It is not a multiorder map!");
        momoc = null;
      } else {
        alert("No Multi Order SkyMap is loaded!");
        console.log(err);
      }
      return;
    }
    // MOC Json serialization valid for Aladin
    jmoc = moc.toJson(moc_name);
    jmoc_parsed = JSON.parse(jmoc);

    user_credible_area = A.MOCFromJSON(jmoc_parsed, {
      opacity: 0.7,
      color: CSS_COLOR_NAMES[MOC_colour],
      lineWidth: 1,
      adaptativeDisplay: false,
      fill: true,
      perimeter: true,
      name: moc_name,
    });
    MOC_colour++;
    aladin.addMOC(user_credible_area);
  });

  // IStarting
  $("#FITSfile").change(function () {
    var FITSf = document.getElementById("FITSfile");

    if ("files" in FITSf) {
      if (FITSf.files.length == 0) {
        alert("Select one or more files.");
      } else {
        for (var i = 0; i < FITSf.files.length; i++) {
          try {
            var reader = new FileReader();
            reader.onload = function (e) {
              momoc = new Uint8Array(e.target.result);
            };
            reader.readAsArrayBuffer(FITSf.files[i]);
          } catch (err) {}
        }
      }
    }
  });
});
