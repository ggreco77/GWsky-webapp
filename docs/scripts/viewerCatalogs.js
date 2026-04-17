import { proxyUrl, fetchFitsAsBytes } from "./config.js";

const CATALOG_URL = proxyUrl(
  "https://virgo.pg.infn.it/maps/transient_catalogs.json",
);

// ======================================================
// MAIN
// ======================================================

$(document).ready(function () {
  // ======================================================
  // LOCAL STATE (NO GLOBAL VARIABLES)
  // ======================================================
  const state = {
    urlCatalog: null,
    gwoscUrl: null,
    zenodoUrl: null,
    publicationData: null,
    currentMocCatalog: null,
    loadedMocNames: new Set(), // Assicurati che questa sia definita come un Set
  };

  // ======================================================
  // LOAD CATALOG UI
  // ======================================================

  loadJsonData("catalog");

  function loadJsonData(id, parent_id) {
    $.getJSON(CATALOG_URL, function (data) {
      let html_code = `<option value="">Select ${id}</option>`;

      data.reverse().forEach((value) => {
        if (
          (id === "catalog" && value.parent_id === "0") ||
          (id !== "catalog" && value.parent_id === parent_id)
        ) {
          html_code += `<option value="${value.id}">${value.name}</option>`;
        }
      });

      $(`#${id}`).html(html_code);
    });
  }

  // ======================================================
  // EVENTS
  // ======================================================

  $("#catalog").on("change", function () {
    const catalog_id = $(this).val();

    if (!catalog_id) {
      $("#event").html('<option value="">Select event</option>');
      $("#analysis").html('<option value="">Select analysis</option>');
      return;
    }

    loadJsonData("event", catalog_id);
  });

  $("#event").on("change", function () {
    const event_id = $(this).val();

    if (!event_id) {
      $("#analysis").html('<option value="">Select analysis</option>');
      return;
    }

    loadJsonData("analysis", event_id);
  });

  $("#analysis").on("change", function () {
    const analysis_id = $(this).val();

    if (!analysis_id) return;

    $.getJSON(CATALOG_URL, function (data) {
      const selected = data.find((v) => v.id === analysis_id);
      if (!selected) return;

      const {
        name,
        parent_id,
        skymap_url,
        gwosc_url,
        zenodo_url,
        publication_data,
      } = selected;

      document.getElementById("id_plane_catalog").value =
        `${parent_id} ${name}`;

      // UPDATE STATE (NO GLOBALS)
      state.urlCatalog = skymap_url;
      state.gwoscUrl = gwosc_url;
      state.zenodoUrl = zenodo_url;
      state.publicationData = publication_data;
    });
  });

  // ======================================================
  // MAIN FUNCTION
  // ======================================================

  async function fromCatalog() {
    const threshold = $("#quantity_catalog").val().trim();
    const id_plane = $("#id_plane_catalog").val().trim();

    if (!state.urlCatalog) {
      alert("No skymap selected");
      return;
    }

    if (!id_plane) {
      alert("Missing identification name");
      return;
    }

    const moc_name = `${id_plane} MOC ${threshold}`;

    // Check if this exact MOC name was already loaded
    if (state.loadedMocNames.has(moc_name)) {
      alert(
        "This plane with the selected threshold has already been loaded.\nPlease choose a new one.",
      );
      return;
    }

    const url_proxy = proxyUrl(state.urlCatalog);

    try {
      $("button, body, label").css("cursor", "progress");

      try {
        state.currentMocCatalog = await moc.MOC.fromMultiOrderMapFitsUrl(
          url_proxy,
          0.0,
          threshold,
          false,
          false,
          false,
          false,
          "*/*",
        );
      } catch (e1) {
        const fitsBytes = await fetchFitsAsBytes(state.urlCatalog);

        state.currentMocCatalog = await moc.MOC.fromFitsSkymap(
          fitsBytes,
          0,
          0.0,
          threshold,
          false,
          false,
          false,
          false,
          "*/*",
        );
      }

      const mocObj = state.currentMocCatalog;

      const disjoint = mocObj.splitIndirectCount();
      const parts = mocObj.splitIndirect();

      const coverage = mocObj.coveragePercentage().toFixed(3);
      const depth = mocObj.getDepth();
      const area = ((coverage * 41252.96125) / 100).toFixed(1);

      let details = "";

      if (disjoint === 1) {
        details = "<em>🧩 Continuous sky region</em><br><br>";
      } else {
        const sub = parts
          .map((m, i) => ({
            i: i + 1,
            p: parseFloat(m.coveragePercentage().toFixed(3)),
          }))
          .sort((a, b) => b.p - a.p);

        details =
          `🔗 Disjoint MOCs: ${disjoint}<br><strong>Sub-MOCs:</strong><ul>` +
          sub.map((x) => `<li>MOC ${x.i}: ${x.p.toFixed(3)}%</li>`).join("") +
          `</ul>`;
      }

      document.getElementById("infoCatalog").innerHTML =
        `ℹ️ <strong>GW Sky Map</strong><br>` +
        `🆔 ${moc_name}<br>` +
        `📐 Depth: ${depth}<br>` +
        `🌌 Coverage: ${coverage}%<br>` +
        `📏 Area: ${area} deg²<br>` +
        details +
        `<br><a href="${state.gwoscUrl}" target="_blank">GWOSC</a><br>` +
        `<a href="${state.zenodoUrl}" target="_blank">Zenodo</a><br>` +
        `📄 ${state.publicationData}`;

      document.getElementById("infoCatalog").style.color =
        CSS_COLOR_NAMES[MOC_colour];

      document.getElementById("infoCatalogColor").style.background =
        CSS_COLOR_NAMES[MOC_colour];

      const jmoc = JSON.parse(mocObj.toJson(80));

      const layer = A.MOCFromJSON(jmoc, {
        opacity: 0.7,
        color: CSS_COLOR_NAMES[MOC_colour],
        lineWidth: 1,
        fill: true,
        adaptativeDisplay: false,
        name: moc_name,
      });

      MOC_colour++;
      aladin.addMOC(layer);

      registerMoc(moc_name, mocObj);

      // Save only after successful load
      state.loadedMocNames.add(moc_name);
    } catch (err) {
      console.error(err);
      alert("❌ Error loading skymap:\n" + err.message);
    } finally {
      $("button, body, label").css("cursor", "default");
    }
  }

  // ======================================================
  // EXPORT
  // ======================================================
  window.fromCatalog = fromCatalog;
});
