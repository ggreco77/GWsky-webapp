let current_moc = null; // saving moc file
const loadedMocNames = new Set();

async function fromLocal() {
  let to_threshold = $("#quantity").val();
  let id_local = $("#id_plane_local").val();

  // Check for empty MOC identification input
  if (id_local === "") {
    alert("The MOC identification name box is empty");
    document.getElementById("infoLocal").innerHTML = "";
    return false;
  }

  // Verifica se il piano MOC con la stessa soglia è già stato caricato
  const moc_name_local = `${id_local} MOC ${to_threshold}`;
  if (loadedMocNames.has(moc_name_local)) {
    alert(
      "This plane with the selected threshold has already been loaded.\nPlease choose a new one.",
    );
    return false;
  }

  // Check if input FITS data is loaded
  if (data === null) {
    alert("No Multi Order sky map is loaded!");
    document.getElementById("infoLocal").innerHTML = "";
    return false;
  }

  try {
    // Try loading a Multi-Order sky map
    let moc_name = await moc.MOC.fromFitsMultiOrderMap(
      data,
      0.0,
      to_threshold,
      false,
      false,
      false,
      false,
    );
    displayMOC(moc_name);
  } catch (err1) {
    try {
      // If the first attempt fails, try loading a standard sky map
      let moc_name = await moc.MOC.fromFitsSkymap(
        data,
        0,
        0.0,
        to_threshold,
        false,
        false,
        false,
        false,
      );
      displayMOC(moc_name);
    } catch (err2) {
      // Display user-friendly error with developer stack trace
      alert(
        "\u274C Error loading the sky map.\n\n" +
          "\ud83d\udd0d The selected file may not be in a valid or compatible format.\n\n" +
          "\ud83d\udcc4 Technical details (for developers):\n" +
          (err2.message || "Unknown error") +
          "\n\n" +
          (err2.stack || "Stack trace not available."),
      );
      document.getElementById("infoLocal").innerHTML = "";
      console.error(err2);
    }
  }

  function displayMOC(moc_name) {
    // Count disjoint sub-MOCs
    let disjoint_mocs = 0;
    //let sub_mocs = [];

    try {
      disjoint_mocs = moc_name.splitIndirectCount(); // ✅ usa il metodo che vuoi
      //sub_mocs = moc_name.split();
    } catch (e) {
      console.warn("⚠️ Failed to split MOC:", e);
      disjoint_mocs = 0;
      //sub_mocs = [];
    }

    moc_split_indirect = moc_name.splitIndirect();

    // Get info on sub-MOCs
    // for (let i = 0; i < moc_split_indirect.length; i++) {
    // console.log("Area sub-MOC " + i + ": " + ((moc_split_indirect[i].coveragePercentage() * 41253) / 100).toFixed(2) + " sq deg");
    //   console.log("Coverage sub-MOC " + i + ": " + moc_split_indirect[i].coveragePercentage().toFixed(3) + " %");

    //  }

    // Split the MOC
    //moc_name.split();
    let coverage_percentage = moc_name.coveragePercentage().toFixed(5);
    console.log(coverage_percentage);
    let space_depth = moc_name.getDepth();
    let area_sq_deg = ((coverage_percentage * 41252.96125) / 100).toFixed(1);

    // Generate display name
    let aladin_name = id_local + " MOC " + to_threshold;

    // Inizia da una stringa vuota
    let info_details = "";
    // let htmlListString = "<ul>\n${htmlListItems.join('\n')}\n</ul>";

    if (disjoint_mocs === 1) {
      info_details +=
        "<em>🧩 This MOC is continuous across the sky.</em><br><br>";
    } else {
      let subMocs = [];

      for (let i = 0; i < moc_split_indirect.length; i++) {
        let percentage = parseFloat(
          moc_split_indirect[i].coveragePercentage().toFixed(3),
        );
        subMocs.push({ index: i + 1, percentage });
      }

      subMocs.sort((a, b) => b.percentage - a.percentage); // decrescente

      let htmlListItems = subMocs.map(
        (moc) =>
          `<li>Coverage sub-MOC ${moc.index}: ${moc.percentage.toFixed(3)} %</li>`,
      );

      let htmlListString = "<ul>" + htmlListItems.join("") + "</ul>";

      info_details +=
        "🔗 Number of disjoint MOCs: " +
        disjoint_mocs +
        "<br><strong>📚 Sub-MOC Details:</strong>" +
        htmlListString;
    }

    // Get info on sub-MOCs

    // console.log("Coverage percentage sub " + moc_name.split());

    // Get info on sub-MOCs
    //for (let i = 0; i < moc_name.length; i++) {
    //  console.log("Coverage percentage sub " + i  + ": " + moc_name[i].coveragePercentage());
    //  }

    // console.log("Coverage percentage sub " + moc_name;

    document.getElementById("infoLocal").innerHTML =
      "ℹ️ <strong>Info MOC coverage</strong><br>" +
      "🆔 Identification name: " +
      aladin_name +
      "<br>" +
      "📐 MOC order: " +
      space_depth +
      "<br>" +
      "🌌 Coverage: " +
      coverage_percentage +
      " % of sky<br>" +
      "📏 Area: " +
      area_sq_deg +
      " square degrees<br>" +
      info_details;

    // Serialize MOC and load into Aladin Lite
    let jmoc = moc_name.toJson(80);
    let jmoc_parsed = JSON.parse(jmoc);

    let user_credible_area = A.MOCFromJSON(jmoc_parsed, {
      opacity: 0.5,
      color: CSS_COLOR_NAMES[MOC_colour],
      lineWidth: 1,
      fill: true,
      adaptativeDisplay: adaptative_display,
      name: aladin_name,
    });

    aladin.gotoRaDec(180, 0);
    document.getElementById("infoLocal").style.color =
      CSS_COLOR_NAMES[MOC_colour];
    document.getElementById("infoLocalColor").style.background =
      CSS_COLOR_NAMES[MOC_colour];

    MOC_colour++;
    aladin.addMOC(user_credible_area);
    registerMoc(aladin_name, moc_name);

    current_moc = moc_name; // ✅ assegna l’oggetto globale

    // --- TEXTUAL MOC SUPPORT ---
    window.currentMoc = moc_name;
    try {
      const decoder = new TextDecoder("utf-8");
      const jsonString = decoder.decode(data);
      displayTextualMocInfo(jsonString, "infoLocal");
      enableTextualMocPopup(aladin, "infoLocal");
    } catch (e) {
      // Not a JSON file, skip silently
    }
    // --- END TEXTUAL MOC SUPPORT ---
  }

  // Aggiungi il piano al Set dopo il caricamento
  loadedMocNames.add(moc_name_local);
}

function saveFITS() {
  let to_threshold = $("#quantity").val();
  let id_local = $("#id_plane_local").val();
  let moc_file_name = id_local + "_MOC_" + to_threshold + ".fits";

  if (!current_moc) {
    alert("No MOC file to save! Press the button: Display Credible Area");
    return false;
  }

  try {
    const bytes = current_moc.toFits(); // ❗ non forziamo compatibilità v1
    const blob = new Blob([bytes], { type: "application/fits" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = moc_file_name; // ✅ nome scelto da te
    a.click();
    URL.revokeObjectURL(a.href);
  } catch (err) {
    alert("❌ Failed to export MOC.\\n\\n" + (err.message || err));
    console.error(err);
    return false;
  }
}
