// "Her voice" sample player: ties the waveform animation to actual audio playback.
(function () {
  const btn = document.getElementById("voice-play-btn");
  const audio = document.getElementById("voice-audio");
  const wave = document.getElementById("voice-wave");
  if (!btn || !audio || !wave) return;

  const label = btn.querySelector(".voice-play-label");
  const icon = btn.querySelector(".voice-play-icon");

  function setPlaying(playing) {
    wave.classList.toggle("wave-paused", !playing);
    btn.classList.toggle("is-playing", playing);
    icon.innerHTML = playing ? "&#10074;&#10074;" : "&#9658;";
    label.textContent = playing ? "Playing..." : "Hear her voice";
  }

  btn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  });

  audio.addEventListener("play", () => setPlaying(true));
  audio.addEventListener("pause", () => setPlaying(false));
  audio.addEventListener("ended", () => setPlaying(false));
})();

// Homepage mobile navigation: a native button supports keyboard and touch activation.
(function () {
  const button = document.getElementById("nav-menu-toggle");
  const menu = document.getElementById("nav-menu");
  if (!button || !menu) return;
  const nav = button.closest("nav");
  const mobile = window.matchMedia("(max-width: 640px)");
  const isOpen = () => button.getAttribute("aria-expanded") === "true";
  function setOpen(open) {
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  button.addEventListener("click", () => setOpen(!isOpen()));
  nav.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) {
      setOpen(false);
      button.focus();
    }
  });
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a") && mobile.matches) {
      setOpen(false);
      button.focus();
    }
  });
  nav.addEventListener("focusout", (event) => {
    if (!nav.contains(event.relatedTarget)) setOpen(false);
  });
  document.addEventListener("click", (event) => {
    if (!nav.contains(event.target)) setOpen(false);
  });
  mobile.addEventListener("change", () => setOpen(false));
})();
