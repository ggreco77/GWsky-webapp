// Global registry of drawn MOCs
const createdMOCs = new Map();

// Create toast container if not exists
if (!document.getElementById("toast-container")) {
  const container = document.createElement("div");
  container.id = "toast-container";
  container.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
  `;
  document.body.appendChild(container);
}

function showToast(message, color) {
  const toast = document.createElement("div");
  toast.style.cssText = `
    background-color: #4CAF50;
    color: white;
    padding: 1.5em 2em;
    border-radius: 8px;
    font-size: 1.1rem;
    text-align: center;
    max-width: 90vw;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    animation: fadein 0.5s;
    display: flex;
    align-items: center;
    gap: 1em;
    transition: opacity 1s ease;
    opacity: 1;
  `;

  const colorBox = document.createElement("div");
  colorBox.style.cssText = `
    width: 24px;
    height: 24px;
    background-color: ${color};
    border: 2px solid white;
    border-radius: 4px;
    flex-shrink: 0;
  `;

  const text = document.createElement("div");
  text.innerText = message;

  toast.appendChild(colorBox);
  toast.appendChild(text);
  document.getElementById("toast-container").appendChild(toast);

  const fadeOutToast = () => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 1000);
    window.removeEventListener("mousemove", fadeOutToast);
    const aladinDiv = document.getElementById("aladin-lite-div");
    if (aladinDiv) aladinDiv.removeEventListener("mouseenter", fadeOutToast);
  };

  window.addEventListener("mousemove", fadeOutToast);

  const aladinDiv = document.getElementById("aladin-lite-div");
  if (aladinDiv) {
    aladinDiv.addEventListener("mouseenter", fadeOutToast);
  }
}

function drawBox() {
  const ra = parseFloat($("#ra_box").val());
  const dec = parseFloat($("#dec_box").val());
  const width = parseFloat($("#width_box").val());
  const height = parseFloat($("#height_box").val());
  const angle = parseFloat($("#angle_box").val());
  const id = $("#id_box").val();

  if (isNaN(ra) || isNaN(dec) || isNaN(width) || isNaN(height) || !id) {
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
    const boxMOC = moc.MOC.fromBox(
      depth,
      ra,
      dec,
      width / 2,
      height / 2,
      angle,
    );

    // Save reference
    createdMOCs.set(id, boxMOC);

    // Serialize to JSON for Aladin
    const json = boxMOC.toJson();
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
    registerMoc(id, boxMOC);

    showToast(
      `✅ MOC '${id}' created successfully!\nRA: ${ra}, DEC: ${dec}, Width: ${width}, Height: ${height}, Angle: ${angle}`,
      color,
    );
  } catch (err) {
    console.error(err);
    alert("Invalid parameter or MOC generation failed.");
  }
}

// Toast keyframes (if desired)
const style = document.createElement("style");
style.textContent = `
@keyframes fadein {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}`;
document.head.appendChild(style);
