function FITSfile() {
  var FITSf = document.getElementById("FITSfile");

  if ("files" in FITSf) {
    if (FITSf.files.length == 0) {
      alert("Select one or more files.");
    } else {
      for (var i = 0; i < FITSf.files.length; i++) {
        try {
          var reader = new FileReader();
          reader.onload = function (e) {
            data = new Uint8Array(e.target.result);
          };
          reader.readAsArrayBuffer(FITSf.files[i]);
        } catch (err) {}
      }
    }
  }
}
