// ==========================================
// IMPORT SHARED CONFIG
// ==========================================
import { proxyUrl, fetchFitsAsBytes } from "./config.js";

// ==========================================
// GLOBAL STATE
// ==========================================
let current_moc_url = null;
const loadedMocNames = new Set();

// ==========================================
// MAIN FUNCTION (fromURL)
// ==========================================
async function fromURL() {
  const to_threshold_url = $("#quantity_url").val();
  const url = $("#url").val();
  const id_plane_url = $("#id_plane_url").val();

  if (!url) {
    alert("The URL box is empty");
    return;
  }

  if (!id_plane_url) {
    alert("The MOC identification name box is empty");
    return;
  }

  const moc_name_url = `${id_plane_url} MOC ${to_threshold_url}`;

  // Verifica se il piano con la stessa threshold è già stato caricato
  if (loadedMocNames.has(moc_name_url)) {
    alert(
      "This plane with the selected threshold has already been loaded.\nPlease choose a new one.",
    );
    return;
  }

  // Usa il proxy solo quando necessario
  const url_proxy = proxyUrl(url); // Applica proxy qui, solo una volta

  try {
    $("button, body, label").css("cursor", "progress");

    try {
      // Tentativo di caricare il MOC direttamente
      current_moc_url = await moc.MOC.fromMultiOrderMapFitsUrl(
        url_proxy, // utilizza il proxy applicato
        0.0,
        to_threshold_url,
        false,
        false,
        false,
        false,
        "*/*",
      );
    } catch (err1) {
      // 🔥 fallback se non riesce a caricare il MOC direttamente
      const fitsBytes = await fetchFitsAsBytes(url); // fallback
      current_moc_url = moc.MOC.fromFitsSkymap(
        fitsBytes,
        0,
        0.0,
        to_threshold_url,
        false,
        false,
        false,
        false,
        "*/*",
      );
    }

    // =========================
    // STATS (mostra le statistiche del MOC)
    // =========================
    const disjoint_mocs = current_moc_url.splitIndirectCount();
    const moc_split_indirect = current_moc_url.splitIndirect();

    const coverage_percentage = current_moc_url.coveragePercentage().toFixed(3);
    const space_depth = current_moc_url.getDepth();
    const area_sq_deg = ((coverage_percentage * 41252.96125) / 100).toFixed(1);

    let info_details = "";

    if (disjoint_mocs === 1) {
      info_details +=
        "<em>🧩 This MOC is continuous across the sky.</em><br><br>";
    } else {
      const subMocs = moc_split_indirect
        .map((moc, i) => ({
          index: i + 1,
          percentage: parseFloat(moc.coveragePercentage().toFixed(3)),
        }))
        .sort((a, b) => b.percentage - a.percentage);

      const htmlListItems = subMocs.map(
        (m) =>
          `<li>Coverage sub-MOC ${m.index}: ${m.percentage.toFixed(3)} %</li>`,
      );

      info_details +=
        `🔗 Number of disjoint MOCs: ${disjoint_mocs}` +
        `<br><strong>📚 Sub-MOC Details:</strong><ul>${htmlListItems.join("")}</ul>`;
    }

    // =========================
    // UI - visualizza le informazioni MOC
    // =========================
    document.getElementById("infoUrl").innerHTML =
      `ℹ️ <strong>Info MOC coverage</strong><br>` +
      `🆔 Identification name: ${moc_name_url}<br>` +
      `📐 MOC order: ${space_depth}<br>` +
      `🌌 Coverage: ${coverage_percentage} % of sky<br>` +
      `📏 Area: ${area_sq_deg} square degrees<br>` +
      info_details;

    const jmoc = current_moc_url.toJson(80);
    const jmoc_parsed = JSON.parse(jmoc);

    const user_moc = A.MOCFromJSON(jmoc_parsed, {
      opacity: 0.7,
      color: CSS_COLOR_NAMES[MOC_colour],
      lineWidth: 1,
      fill: true,
      adaptativeDisplay: false,
      name: moc_name_url,
    });

    // Aggiorna UI
    document.getElementById("infoUrl").style.color =
      CSS_COLOR_NAMES[MOC_colour];

    document.getElementById("infoUrlColor").style.background =
      CSS_COLOR_NAMES[MOC_colour];

    MOC_colour++;
    aladin.addMOC(user_moc);
    registerMoc(moc_name_url, current_moc_url);

    // Aggiungi il piano MOC al Set dopo il caricamento
    loadedMocNames.add(moc_name_url);
  } catch (err) {
    alert("❌ Error loading MOC:\n" + (err.message || err));
    console.error(err);
  } finally {
    $("button, body, label").css("cursor", "default");
  }
}

window.fromURL = fromURL; // Esporre la funzione
