
// scripts/draw-ellipse.js

function drawEllipse() {
  const ra = parseFloat($("#ra_ellipse").val());
  const dec = parseFloat($("#dec_ellipse").val());
  const a = parseFloat($("#semi_major").val());
  const b = parseFloat($("#semi_minor").val());
  const pa = parseFloat($("#angle_ellipse").val());
  const id = $("#id_ellipse").val();

  if (isNaN(ra) || isNaN(dec) || isNaN(a) || isNaN(b) || isNaN(pa) || !id) {
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
    const ellipseMOC = moc.MOC.fromEllipse(depth, ra, dec, a, b, pa);

    createdMOCs.set(id, ellipseMOC);

    const json = ellipseMOC.toJson();
    const parsed = JSON.parse(json);

    const color = CSS_COLOR_NAMES[MOC_colour];
    const aladinMOC = A.MOCFromJSON(parsed, {
      opacity: 0.7,
      color: color,
      lineWidth: 1,
      adaptativeDisplay: false,
      fill: true,
      name: id,
    });

    MOC_colour++;
    aladin.addMOC(aladinMOC);
    registerMoc(id, ellipseMOC);

    showToast(
      `✅  MOC '${id}' created successfully!\nRA: ${ra}, DEC: ${dec}, a: ${a}, b: ${b}, PA: ${pa}`,
      color,
    );
  } catch (err) {
    console.error(err);
    alert("Invalid parameter or MOC generation failed.");
  }
}
