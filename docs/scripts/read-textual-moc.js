/**
 * Parse a Textual MOC JSON and display its textual content
 * in the info panel and as a popup on hover in Aladin Lite.
 *
 * @param {string} jsonString - The raw JSON string of the MOC
 * @param {string} panelId - The ID of the info panel (e.g. 'infoLocal')
 */
function displayTextualMocInfo(jsonString, panelId) {
  let data;
  try {
    data = JSON.parse(jsonString);
  } catch (e) {
    return; // not valid JSON, skip
  }

  const hasText = data.hasOwnProperty("text") && data.text;
  const hasMeta =
    data.hasOwnProperty("metadata") && Object.keys(data.metadata).length > 0;
  const hasCells =
    data.hasOwnProperty("annotated_cells") &&
    Object.keys(data.annotated_cells).length > 0;

  if (!hasText && !hasMeta && !hasCells) return;

  // Build HTML for the info panel
  const panel = document.getElementById(panelId);
  if (!panel) return;

  let html =
    '<div class="tmoc-info" style="margin-top:1em; padding:0.8em; background:#e8f5e9; border-left:4px solid #009688; border-radius:4px;">';
  html +=
    '<p style="margin:0 0 0.5em 0; font-weight:bold;">📝 Textual MOC detected</p>';

  // Text
  if (hasText) {
    html += '<div style="margin-bottom:0.8em;">';
    html += "<strong>Text:</strong>";
    html +=
      '<div style="background:white; padding:0.5em; margin-top:0.3em; border-radius:3px; max-height:150px; overflow-y:auto; font-size:0.85em; white-space:pre-wrap;">';
    html += escapeHtml(data.text);
    html += "</div></div>";
  }

  // Metadata
  if (hasMeta) {
    html += '<div style="margin-bottom:0.8em;">';
    html += "<strong>Metadata:</strong>";
    html +=
      '<table style="width:100%; margin-top:0.3em; font-size:0.85em; border-collapse:collapse;">';
    for (const [key, val] of Object.entries(data.metadata)) {
      html += "<tr>";
      html +=
        '<td style="padding:2px 6px; background:#f5f5f5; font-weight:bold; border:1px solid #ddd;">' +
        escapeHtml(key) +
        "</td>";
      html +=
        '<td style="padding:2px 6px; background:white; border:1px solid #ddd;">' +
        escapeHtml(String(val)) +
        "</td>";
      html += "</tr>";
    }
    html += "</table></div>";
  }

  // Annotated cells
  if (hasCells) {
    html += "<div>";
    html += "<strong>Annotated cells:</strong>";
    let cellCount = 0;
    for (const ord of Object.keys(data.annotated_cells)) {
      cellCount += Object.keys(data.annotated_cells[ord]).length;
    }
    html +=
      '<span style="font-size:0.85em; margin-left:0.5em;">' +
      cellCount +
      " annotated pixel(s)</span>";
    html += "</div>";
  }

  html += "</div>";

  panel.insertAdjacentHTML("beforeend", html);

  // Store text for popup on hover
  if (hasText) {
    window._textualMocData = window._textualMocData || {};
    window._textualMocData[panelId] = data;
  }
}

/**
 * Enable popup on hover over MOC region in Aladin Lite.
 * Call this after the MOC overlay is added to Aladin.
 *
 * @param {Object} aladinInstance - The Aladin Lite instance
 * @param {string} panelId - The panel ID to retrieve stored text
 */
function enableTextualMocPopup(aladinInstance, panelId) {
  if (!window._textualMocData || !window._textualMocData[panelId]) return;

  const data = window._textualMocData[panelId];

  // Create popup element if not exists
  let popup = document.getElementById("tmoc-popup");
  if (!popup) {
    popup = document.createElement("div");
    popup.id = "tmoc-popup";
    popup.style.cssText =
      "display:none; position:absolute; z-index:1000; " +
      "background:rgba(0,77,77,0.92); color:white; " +
      "padding:10px 14px; border-radius:6px; " +
      "max-width:350px; font-size:0.82em; " +
      "pointer-events:none; line-height:1.4; " +
      "box-shadow: 0 2px 8px rgba(0,0,0,0.3);";
    document.body.appendChild(popup);
  }

  // Build popup content
  let content = "";
  if (data.text) {
    const preview =
      data.text.length > 300 ? data.text.substring(0, 300) + "…" : data.text;
    content += '<div style="margin-bottom:0.4em;"><strong>Text:</strong></div>';
    content +=
      '<div style="white-space:pre-wrap;">' + escapeHtml(preview) + "</div>";
  }
  if (data.metadata) {
    content +=
      '<div style="margin-top:0.6em;"><strong>Metadata:</strong></div>';
    for (const [k, v] of Object.entries(data.metadata)) {
      content +=
        "<div><em>" +
        escapeHtml(k) +
        ":</em> " +
        escapeHtml(String(v)) +
        "</div>";
    }
  }

  // Track mouse over the Aladin div
  const aladinDiv = document.getElementById("aladin-lite-div");
  if (!aladinDiv) return;

  aladinDiv.addEventListener("mousemove", function (e) {
    var ra, dec;
    try {
      var coords = aladinInstance.pix2world(e.offsetX, e.offsetY);
      if (!coords) {
        popup.style.display = "none";
        return;
      }
      // v3 latest may return {ra, dec} object or [ra, dec] array
      if (Array.isArray(coords)) {
        ra = coords[0];
        dec = coords[1];
      } else if (coords.ra !== undefined && coords.dec !== undefined) {
        ra = coords.ra;
        dec = coords.dec;
      } else {
        popup.style.display = "none";
        return;
      }
    } catch (e) {
      popup.style.display = "none";
      return;
    }

    var mocObj = window.currentMoc;
    if (!mocObj) {
      popup.style.display = "none";
      return;
    }

    try {
      var isInside = mocObj.contains(ra, dec);

      if (isInside) {
        popup.innerHTML = content;
        popup.style.display = "block";
        popup.style.left = e.pageX + 15 + "px";
        popup.style.top = e.pageY + 15 + "px";
      } else {
        popup.style.display = "none";
      }
    } catch (err) {
      popup.style.display = "none";
    }
  });

  aladinDiv.addEventListener("mouseleave", function () {
    popup.style.display = "none";
  });
}

/**
 * Escape HTML special characters.
 */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

/**
 * Save a MOC as a Textual MOC (JSON) following Greco et al. (2026).
 */
function saveTextualMoc(mocObj, filename) {
  if (!mocObj) {
    alert("No MOC available. Please create a credible area first.");
    return;
  }
  try {
    var mocJson = JSON.parse(mocObj.toJson(null));
    var text = document.getElementById("tmoc_text").value.trim();
    var metaKeys = document.querySelectorAll(".tmoc-meta-key");
    var metaVals = document.querySelectorAll(".tmoc-meta-val");
    var metadata = {};
    for (var i = 0; i < metaKeys.length; i++) {
      var k = metaKeys[i].value.trim();
      var v = metaVals[i].value.trim();
      if (k) metadata[k] = v;
    }
    if (text) mocJson["text"] = text;
    if (Object.keys(metadata).length > 0) mocJson["metadata"] = metadata;
    var jsonString = JSON.stringify(mocJson, null, 2);
    var blob = new Blob([jsonString], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = (filename || "textual_moc") + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    alert("Error: " + e.message);
  }
}

/**
 * Add a new metadata key-value row.
 */
function addMetadataRow() {
  var container = document.getElementById("tmoc_metadata_rows");
  var row = document.createElement("div");
  row.className = "tmoc-meta-row";
  row.style.cssText = "display:flex; gap:0.5em; margin-bottom:0.4em;";
  row.innerHTML =
    '<input class="w3-input tmoc-meta-key" type="text" placeholder="key" style="width:40%;">' +
    '<input class="w3-input tmoc-meta-val" type="text" placeholder="value" style="width:50%;">' +
    '<button class="button" style="width:10%; padding:0;" onclick="this.parentElement.remove()">\u2715</button>';
  container.appendChild(row);
}

/**
 * Load a Textual MOC JSON file from local device.
 * Parses the MOC, displays it in Aladin, and shows text/metadata.
 */
function loadTextualMoc() {
  var input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = function (e) {
    var file = e.target.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function (ev) {
      var jsonString = ev.target.result;
      var data;
      try {
        data = JSON.parse(jsonString);
      } catch (err) {
        alert("Invalid JSON file.");
        return;
      }

      // Extract only MOC keys (order/npix) - keys that are numbers
      var mocOnly = {};
      for (var key in data) {
        if (!isNaN(key)) {
          mocOnly[key] = data[key];
        }
      }

      try {
        // Load MOC from JSON string
        var mocJsonStr = JSON.stringify(mocOnly);
        var mocObj = window.moc.MOC.fromJson(mocJsonStr);

        window.currentMoc = mocObj;
        current_moc = mocObj;

        // Get MOC info
        var coverage = mocObj.coveragePercentage().toFixed(3);
        var depth = mocObj.getDepth();
        var area = ((coverage * 41252.96125) / 100).toFixed(1);
        var mocName = file.name.replace(".json", "");

        // Display in Aladin
        var jmoc = JSON.parse(mocObj.toJson(80));
        var aladinMoc = A.MOCFromJSON(jmoc, {
          opacity: 0.5,
          color: CSS_COLOR_NAMES[MOC_colour],
          lineWidth: 1,
          adaptativeDisplay: false,
          fill: true,
          name: mocName,
        });

        // Disjoint sub-MOCs
        var disjoint_mocs = 0;
        var moc_split_indirect = [];
        try {
          disjoint_mocs = mocObj.splitIndirectCount();
          moc_split_indirect = mocObj.splitIndirect();
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
            var pct = parseFloat(
              moc_split_indirect[i].coveragePercentage().toFixed(3),
            );
            subMocs.push({ index: i + 1, percentage: pct });
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

        document.getElementById("infoLocal").innerHTML =
          "ℹ️ <strong>Info MOC coverage</strong><br>" +
          "🆔 Identification name: " +
          mocName +
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
          info_details;

        document.getElementById("infoLocal").style.color =
          CSS_COLOR_NAMES[MOC_colour];
        document.getElementById("infoLocalColor").style.background =
          CSS_COLOR_NAMES[MOC_colour];

        MOC_colour++;
        aladin.addMOC(aladinMoc);

        // Display textual content and enable popup
        displayTextualMocInfo(jsonString, "infoLocal");
        enableTextualMocPopup(aladin, "infoLocal");
      } catch (err) {
        alert("Error loading MOC from JSON:\n" + (err.message || err));
        console.error(err);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}
