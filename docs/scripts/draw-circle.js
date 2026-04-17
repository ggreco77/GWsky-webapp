// scripts/draw-circle.js

function drawCircle() {
  const ra = parseFloat($("#ra_circle").val());
  const dec = parseFloat($("#dec_circle").val());
  const radius = parseFloat($("#radius_circle").val());
  const id = $("#id_circle").val();

  if (isNaN(ra) || isNaN(dec) || isNaN(radius) || !id) {
    alert("Please fill all parameters correctly.");
    return;
  }

  if (ra < 0 || ra >= 360) {
    alert("RA must be in the range [0, 360). Ex: 120.5");
    return;
  }

  if (dec < -90 || dec > 90) {
    alert("DEC must be in the range [-90, 90]. Ex: -45.2");
    return;
  }

  if (createdMOCs.has(id)) {
    alert(`This identifying name is already used: ${id}. Enter a new id.`);
    return;
  }

  try {
    const depth = 10;
    const circleMOC = moc.MOC.fromCone(depth, ra, dec, radius);

    createdMOCs.set(id, circleMOC);

    const json = circleMOC.toJson();
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
    registerMoc(id, circleMOC);

    showToast(
      `✅ MOC '${id}' created successfully!\nRA: ${ra}, DEC: ${dec}, Radius: ${radius}`,
      color,
    );
  } catch (err) {
    console.error(err);
    alert("Invalid parameter or MOC generation failed.");
  }
}
