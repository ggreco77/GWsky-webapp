// scripts/draw-zone.js

function drawZone() {
  const raMin = parseFloat($("#ra_min").val());
  const decMin = parseFloat($("#dec_min").val());
  const raMax = parseFloat($("#ra_max").val());
  const decMax = parseFloat($("#dec_max").val());
  const id = $("#id_zone").val();

  // Validate inputs
  if (isNaN(raMin) || isNaN(decMin) || isNaN(raMax) || isNaN(decMax) || !id) {
    showError("Please fill all parameters correctly.");
    return;
  }

  if (raMin < 0 || raMin >= 360 || raMax < 0 || raMax >= 360) {
    showError("RA must be in the range [0, 360). Ex: 120.5");
    return;
  }

  if (decMin < -90 || decMin > 90 || decMax < -90 || decMax > 90) {
    showError("DEC must be in the range [-90, 90]. Ex: -45.2");
    return;
  }

  if (createdMOCs.has(id)) {
    showError(`This identifying name is already used: ${id}. Enter a new id.`);
    return;
  }

  // Create MOC for the zone
  try {
    const depth = 10; // Default depth for MOC
    const zoneMOC = moc.MOC.fromZone(depth, raMin, decMin, raMax, decMax);

    // Save and display result
    createdMOCs.set(id, zoneMOC);

    const json = zoneMOC.toJson();
    const parsed = JSON.parse(json);

    const color = CSS_COLOR_NAMES[MOC_colour];
    const aladinMOC = A.MOCFromJSON(parsed, {
      opacity: 0.7,
      color: color,
      lineWidth: 1,
      fill: true,
      adaptativeDisplay: false,
      name: id,
    });

    MOC_colour++;
    aladin.addMOC(aladinMOC);
    registerMoc(id, zoneMOC);

    showToast(
      `✅ MOC '${id}' created successfully!\nRA: [${raMin}, ${raMax}], DEC: [${decMin}, ${decMax}]`,
      color
    );
  } catch (err) {
    console.error(err);
    showError("Invalid parameter or MOC generation failed.");
  }
}

// Helper function to display error messages
function showError(message) {
  alert(message);
}

// You can extend the `showError` function for customized alerts or toasts as needed.
