
// scripts/draw-ring.js

function drawRing() {
  const ra = parseFloat($("#ra_ring").val());
  const dec = parseFloat($("#dec_ring").val());
  const r1 = parseFloat($("#internal_radius").val());
  const r2 = parseFloat($("#external_radius").val());
  const id = $("#id_ring").val();

  if (isNaN(ra) || isNaN(dec) || isNaN(r1) || isNaN(r2) || !id) {
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
    const ringMOC = moc.MOC.fromRing(depth, ra, dec, r1, r2);

    createdMOCs.set(id, ringMOC);

    const json = ringMOC.toJson();
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
    registerMoc(id, ringMOC);

    showToast(
      `✅  MOC '${id}' created successfully!\nRA: ${ra}, DEC: ${dec}, R1: ${r1}, R2: ${r2}`,
      color,
    );
  } catch (err) {
    console.error(err);
    alert("Invalid parameter or MOC generation failed.");
  }
}
