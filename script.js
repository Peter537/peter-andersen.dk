// Toggle pause/resume on click or spacebar
(function () {
  const rotator = document.getElementById("rotator");
  if (!rotator) return;

  rotator.addEventListener("click", () => {
    rotator.classList.toggle("paused");
  });

  // Allow keyboard toggle when focused
  rotator.setAttribute("tabindex", "0");
  rotator.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.key === " ") {
      e.preventDefault();
      rotator.classList.toggle("paused");
    }
  });
})();
