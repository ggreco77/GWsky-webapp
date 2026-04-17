// ==========================================
// IMPORT SHARED CONFIG
// ==========================================
import { proxyUrl, fetchFitsAsBytes } from "./config.js";

const CATALOG_URL = proxyUrl(
  "https://virgo.pg.infn.it/maps/alerts_lvk_updated_abc.json"

);

// ==========================================
// MAIN
// ==========================================
$(document).ready(function () {

  // ==========================================
  // LOCAL STATE (NO GLOBAL VARIABLES)
  // ==========================================
  const state = {
    urlAlert: null,
    gracedbUrl: null,
    noticeUrl: null,
    currentMocAlert: null,
    loadedMocNames: new Set(), // Set per tracciare i piani già caricati
  };

  // ==========================================
  // LOAD JSON UI
  // ==========================================
  loadJsonData("run");

  function loadJsonData(id, parent_id) {
    $.getJSON(CATALOG_URL, function (data) {
      let html = `<option value="">Select ${id}</option>`;

      data.reverse().forEach((value) => {
        if (
          (id === "run" && value.parent_id === "0") ||
          (id !== "run" && value.parent_id === parent_id)
        ) {
          html += `<option value="${value.id}">${value.name}</option>`;
        }
      });

      $(`#${id}`).html(html);
    });
  }

  // ==========================================
  // EVENTS
  // ==========================================

  $("#run").on("change", function () {
    const id = $(this).val();

    if (id) {
      loadJsonData("alert", id);
    } else {
      $("#alert").html('<option value="">Select alert</option>');
      $("#notice").html('<option value="">Select notice</option>');
    }
  });

  $("#alert").on("change", function () {
    const id = $(this).val();

    if (id) {
      loadJsonData("notice", id);
    } else {
      $("#notice").html('<option value="">Select notice</option>');
    }
  });

  $("#notice").on("change", function () {
    const id = $(this).val();

    if (!id) {
      $("#notice").html('<option value="">Select notice</option>');
      return;
    }

    $.getJSON(CATALOG_URL, function (data) {
      const selected = data.find((v) => v.id === id);
      if (!selected) return;

      state.urlAlert = selected.skymap_url.replace(
        "https://gracedb.ligo.org",
        "https://virgo.pg.infn.it"
      );

      state.gracedbUrl = selected.gracedb_url;
      state.noticeUrl = selected.notice_url;

      document.getElementById("id_plane_alert").value =
        `${selected.parent_id} ${selected.name}`;
    });
  });

  // ==========================================
  // MAIN FUNCTION
  // ==========================================
  async function fromAlert() {
    const threshold = parseFloat($("#quantity_alert").val());
    const id_plane = $("#id_plane_alert").val();
    const moc_name = `${id_plane} MOC ${threshold}`;

    if (!state.urlAlert || !id_plane) {
      alert("Missing URL or plane ID");
      return;
    }

    // Verifica se questo piano MOC con la stessa threshold è già stato caricato
    if (state.loadedMocNames.has(moc_name)) {
      alert(
        "This plane with the selected threshold has already been loaded.\nPlease choose a new one."
      );
      return;
    }

    try {
      $("button, body, label").css("cursor", "progress");

      const url_proxy = proxyUrl(state.urlAlert);

      try {
        state.currentMocAlert =
          await moc.MOC.fromMultiOrderMapFitsUrl(
            url_proxy,
            0.0,
            threshold,
            false,
            false,
            false,
            false,
            "*/*"
          );
      } catch (e1) {
        const fitsBytes = await fetchFitsAsBytes(state.urlAlert);

        state.currentMocAlert =
          moc.MOC.fromFitsSkymap(
            fitsBytes,
            0,
            0.0,
            threshold,
            false,
            false,
            false,
            false
          );
      }

      // =========================
      // STATS
      // =========================
      const mocObj = state.currentMocAlert;

      const disjoint = mocObj.splitIndirectCount();
      const splits = mocObj.splitIndirect();

      const coverage = mocObj.coveragePercentage().toFixed(3);
      const depth = mocObj.getDepth();
      const area = ((coverage * 41252.96125) / 100).toFixed(1);

      let details =
        disjoint === 1
          ? "<em>🧩 This MOC is continuous across the sky.</em><br><br>"
          : `🔗 Number of disjoint MOCs: ${disjoint}<br>` +
          `<strong>📚 Sub-MOC Details:</strong><ul>` +
          splits
            .map(
              (m, i) =>
                `<li>Coverage sub-MOC ${i + 1}: ${m.coveragePercentage().toFixed(3)} %</li>`
            )
            .join("") +
          "</ul>";

      // =========================
      // UI
      // =========================
      document.getElementById("infoAlert").innerHTML =
        `ℹ️ <strong>Info MOC plane</strong><br>` +
        `🆔 Identification name: ${moc_name}<br>` +
        `📐 MOC order: ${depth}<br>` +
        `🌌 Coverage: ${coverage} % of sky<br>` +
        `📏 Area: ${area} square degrees<br>` +
        details +
        `<br><a href="${state.gracedbUrl}" target="_blank">Event Page</a><br>` +
        `<a href="${state.noticeUrl}" target="_blank">GCNs</a>`;

      document.getElementById("infoAlert").style.color =
        CSS_COLOR_NAMES[MOC_colour];

      document.getElementById("infoAlertColor").style.background =
        CSS_COLOR_NAMES[MOC_colour];

      // =========================
      // ALADIN
      // =========================
      const jmoc = JSON.parse(mocObj.toJson(80));

      const aladin_moc = A.MOCFromJSON(jmoc, {
        opacity: 0.7,
        color: CSS_COLOR_NAMES[MOC_colour],
        lineWidth: 1,
        adaptativeDisplay: false,
        fill: true,
        name: moc_name,
      });

      MOC_colour++;
      aladin.addMOC(aladin_moc);

      registerMoc(moc_name, mocObj);

      // Salva il piano MOC solo dopo un caricamento riuscito
      state.loadedMocNames.add(moc_name);

    } catch (err) {
      alert(`❌ Failed to load alert MOC:\n\n${err.message || err}`);
      console.error(err);
      document.getElementById("infoAlert").innerHTML = "";
    } finally {
      $("button, body, label").css("cursor", "default");
    }
  }

  // ==========================================
  // EXPORT
  // ==========================================
  window.fromAlert = fromAlert;
});