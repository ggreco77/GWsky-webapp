// Global registry of MOC objects by name
window.mocRegistry = window.mocRegistry || {};

/**
 * Register a MOC object with a name.
 */
function registerMoc(name, mocObj) {
  window.mocRegistry[name] = mocObj;
  updateMocSelectors();
}

/**
 * Update all dropdown selectors with available MOC names.
 */
function updateMocSelectors() {
  var names = Object.keys(window.mocRegistry);
  var html = '<option value="">Select MOC</option>';
  names.forEach(function (n) {
    html += '<option value="' + n + '">' + n + "</option>";
  });
  var left = document.getElementById("plane_left");
  var right = document.getElementById("plane_right");
  var tmoc = document.getElementById("tmoc_select");
  var trans = document.getElementById("transient_moc_select");
  if (left) left.innerHTML = html;
  if (right) right.innerHTML = html;
  if (tmoc) tmoc.innerHTML = html;
  if (trans) trans.innerHTML = html;
}

function unionOperation() {
  var nameL = document.getElementById("plane_left").value;
  var nameR = document.getElementById("plane_right").value;
  if (!nameL || !nameR) {
    alert("Select two MOCs.");
    return;
  }

  var mocL = window.mocRegistry[nameL];
  var mocR = window.mocRegistry[nameR];
  if (!mocL || !mocR) {
    alert("MOC not found.");
    return;
  }

  var result = mocL.or(mocR);
  var outName = "Union: " + nameL + " ∪ " + nameR;
  displayOperationResult(result, outName);
}

function intersectionOperation() {
  var nameL = document.getElementById("plane_left").value;
  var nameR = document.getElementById("plane_right").value;
  if (!nameL || !nameR) {
    alert("Select two MOCs.");
    return;
  }

  var mocL = window.mocRegistry[nameL];
  var mocR = window.mocRegistry[nameR];
  if (!mocL || !mocR) {
    alert("MOC not found.");
    return;
  }

  var result = mocL.and(mocR);
  var outName = "Intersection: " + nameL + " ∩ " + nameR;
  displayOperationResult(result, outName);
}

function differenceOperation() {
  var nameL = document.getElementById("plane_left").value;
  var nameR = document.getElementById("plane_right").value;
  if (!nameL || !nameR) {
    alert("Select two MOCs.");
    return;
  }

  var mocL = window.mocRegistry[nameL];
  var mocR = window.mocRegistry[nameR];
  if (!mocL || !mocR) {
    alert("MOC not found.");
    return;
  }

  var result = mocL.xor(mocR);
  var outName = "Sym. Diff: " + nameL + " △ " + nameR;
  displayOperationResult(result, outName);
}

function subtractionOperation() {
  var nameL = document.getElementById("plane_left").value;
  var nameR = document.getElementById("plane_right").value;
  if (!nameL || !nameR) {
    alert("Select two MOCs.");
    return;
  }

  var mocL = window.mocRegistry[nameL];
  var mocR = window.mocRegistry[nameR];
  if (!mocL || !mocR) {
    alert("MOC not found.");
    return;
  }

  var result = mocL.minus(mocR);
  var outName = "Subtraction: " + nameL + " ∖ " + nameR;
  displayOperationResult(result, outName);
}

function displayOperationResult(mocResult, outName) {
  var coverage = mocResult.coveragePercentage().toFixed(5);
  var area = ((coverage * 41252.96125) / 100).toFixed(1);
  var depth = mocResult.getDepth();
  var currentColor = CSS_COLOR_NAMES[MOC_colour];

  // Disjoint sub-MOCs
  var disjoint_mocs = 0;
  var moc_split_indirect = [];
  try {
    disjoint_mocs = mocResult.splitIndirectCount();
    moc_split_indirect = mocResult.splitIndirect();
  } catch (e) {
    disjoint_mocs = 0;
  }

  var info_details = "";
  if (disjoint_mocs === 1) {
    info_details +=
      "<em>🧩 This MOC is continuous across the sky.</em><br><br>";
  } else if (disjoint_mocs > 1) {
    var subMocs = [];
    for (var i = 0; i < moc_split_indirect.length; i++) {
      var percentage = parseFloat(
        moc_split_indirect[i].coveragePercentage().toFixed(3),
      );
      subMocs.push({ index: i + 1, percentage: percentage });
    }
    subMocs.sort(function (a, b) {
      return b.percentage - a.percentage;
    });

    var htmlListItems = subMocs.map(function (m) {
      return (
        "<li>Coverage sub-MOC " +
        m.index +
        ": " +
        m.percentage.toFixed(3) +
        " %</li>"
      );
    });

    info_details +=
      "🔗 Number of disjoint MOCs: " +
      disjoint_mocs +
      "<br><strong>📚 Sub-MOC Details:</strong><ul>" +
      htmlListItems.join("") +
      "</ul>";
  }

  document.getElementById("infoOperation").innerHTML =
    '<div style="font-size: 0.7em;">' +
    "ℹ️ <strong>Info MOC coverage</strong><br>" +
    "🆔 Identification name: " +
    outName +
    "<br>" +
    "📐 MOC order: " +
    depth +
    "<br>" +
    "🌌 Coverage: " +
    coverage +
    " % of sky<br>" +
    "📏 Area: " +
    area +
    " square degrees<br>" +
    info_details +
    "</div>";

  document.getElementById("infoOperation").style.color = currentColor;
  document.getElementById("infoOperationColor").style.background = currentColor;

  var jmoc = JSON.parse(mocResult.toJson(80));
  var overlay = A.MOCFromJSON(jmoc, {
    opacity: 0.7,
    color: currentColor,
    lineWidth: 2,
    fill: true,
    adaptativeDisplay: false,
    name: outName,
  });

  MOC_colour++;
  aladin.addMOC(overlay);
  registerMoc(outName, mocResult);
}
