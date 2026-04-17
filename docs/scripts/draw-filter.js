
function checkTransient() {
  var mocName = document.getElementById("transient_moc_select").value;
  var ra = parseFloat(document.getElementById("transient_ra").value);
  var dec = parseFloat(document.getElementById("transient_dec").value);
  var name =
    document.getElementById("transient_name").value.trim() || "Transient";
  var resultBox = document.getElementById("transientResultBox");

  if (!mocName) {
    alert("Please select a MOC.");
    return;
  }
  if (isNaN(ra) || isNaN(dec)) {
    alert("Please enter valid RA and DEC values.");
    return;
  }
  if (ra < 0 || ra >= 360) {
    alert("RA must be in the range [0, 360).");
    return;
  }
  if (dec < -90 || dec > 90) {
    alert("DEC must be in the range [-90, 90].");
    return;
  }

  var mocObj = window.mocRegistry[mocName];
  if (!mocObj) {
    alert("MOC not found.");
    return;
  }

  try {
    var coords = new Float64Array([ra, dec]);
    var isInside = mocObj.filterCoos(coords)[0] === 1;

    // Show result
    resultBox.style.display = "block";
    if (isInside) {
      resultBox.style.background = "#e8f5e9";
      resultBox.style.borderLeft = "4px solid #4CAF50";
      resultBox.innerHTML =
        "✅ <strong>" +
        escapeHtml(name) +
        "</strong> (RA=" +
        ra.toFixed(4) +
        "°, DEC=" +
        dec.toFixed(4) +
        "°) is <strong>inside</strong> " +
        escapeHtml(mocName) +
        ".";
    } else {
      resultBox.style.background = "#ffebee";
      resultBox.style.borderLeft = "4px solid #f44336";
      resultBox.innerHTML =
        "❌ <strong>" +
        escapeHtml(name) +
        "</strong> (RA=" +
        ra.toFixed(4) +
        "°, DEC=" +
        dec.toFixed(4) +
        "°) is <strong>outside</strong> " +
        escapeHtml(mocName) +
        ".";
    }

    // Add marker on Aladin
    var markerColor = isInside ? "#4CAF50" : "#f44336";

    var drawFunction = function (source, canvasCtx, viewParams) {
      // Circle
      canvasCtx.beginPath();
      canvasCtx.arc(source.x, source.y, 8, 0, 2 * Math.PI, false);
      canvasCtx.closePath();
      canvasCtx.strokeStyle = markerColor;
      canvasCtx.lineWidth = 3;
      canvasCtx.globalAlpha = 0.9;
      canvasCtx.stroke();

      // Crosshair
      canvasCtx.beginPath();
      canvasCtx.moveTo(source.x - 12, source.y);
      canvasCtx.lineTo(source.x + 12, source.y);
      canvasCtx.moveTo(source.x, source.y - 12);
      canvasCtx.lineTo(source.x, source.y + 12);
      canvasCtx.strokeStyle = markerColor;
      canvasCtx.lineWidth = 1.5;
      canvasCtx.stroke();

      // Label
      var fov = Math.max(viewParams.fov[0], viewParams.fov[1]);
      if (fov < 180) {
        canvasCtx.globalAlpha = 1;
        canvasCtx.font = "bold 13px Arial";
        canvasCtx.fillStyle = markerColor;
        canvasCtx.fillText(source.data.name, source.x + 14, source.y - 8);

        // Coordinates
        canvasCtx.font = "11px Arial";
        canvasCtx.fillStyle = "#ccc";
        canvasCtx.fillText(
          "RA=" +
            source.data.ra.toFixed(4) +
            "° DEC=" +
            source.data.dec.toFixed(4) +
            "°",
          source.x + 14,
          source.y + 6,
        );
      }
      canvasCtx.globalAlpha = 1;
    };

    var source = A.source(ra, dec, {
      name: name,
      ra: ra,
      dec: dec,
      size: 4.5,
    });

    var cat = A.catalog({
      name: name,
      shape: drawFunction,
      color: markerColor,
    });

    cat.addSources([source]);
    aladin.addCatalog(cat);
    aladin.gotoRaDec(ra, dec);
  } catch (err) {
    alert("Error checking position: " + (err.message || err));
    console.error(err);
  }
}

function escapeHtml(str) {
  var div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}
