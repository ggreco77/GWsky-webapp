document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.getElementById("navbar");
  const aladinDiv = document.getElementById("aladin-lite-div");
  let timeout = null;

  function hideNavbar() {
    navbar.classList.add("navbar-hidden");
  }

  function showNavbar() {
    navbar.classList.remove("navbar-hidden");
  }

  function handleMouseMove() {
    if (!aladinDiv.classList.contains("aladin-fullscreen")) return;
    hideNavbar();
    clearTimeout(timeout);
    timeout = setTimeout(showNavbar, 3000);
  }

  const observer = new MutationObserver(() => {
    if (aladinDiv.classList.contains("aladin-fullscreen")) {
      document.addEventListener("mousemove", handleMouseMove);
      showNavbar();
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      showNavbar();
      clearTimeout(timeout);
    }
  });

  observer.observe(aladinDiv, {
    attributes: true,
    attributeFilter: ["class"],
  });
});
