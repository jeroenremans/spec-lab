const THEMES = [
  { id: "teal-corporate", name: "Teal Corporate", swatches: ["#054e5a", "#f4f5f7", "#e1b77e"] },
  { id: "midnight",       name: "Midnight",       swatches: ["#1a1b2e", "#13131f", "#60a5fa"] },
  { id: "warm-paper",     name: "Warm Paper",     swatches: ["#7c4700", "#faf6ef", "#d97706"] },
  { id: "bold-agency",    name: "Bold Agency",    swatches: ["#0a0a0a", "#ff5f1f", "#ffd700"] },
];

export function applyTheme(id) {
  document.documentElement.setAttribute("data-theme", id);
  try { localStorage.setItem("spec-theme", id); } catch(e) {}
  renderThemeDropdown();
}

function renderThemeDropdown() {
  const current = document.documentElement.getAttribute("data-theme") || "teal-corporate";
  const dd = document.getElementById("theme-dropdown");
  dd.innerHTML = THEMES.map((t) => `
    <div class="theme-option${t.id === current ? " active" : ""}" data-tid="${t.id}">
      <span class="theme-swatches">${t.swatches.map((c) => `<span style="background:${c}"></span>`).join("")}</span>
      <span class="theme-name">${t.name}</span>
      <span class="theme-check">✓</span>
    </div>`).join("");
  dd.querySelectorAll(".theme-option").forEach((el) => {
    el.addEventListener("click", () => { applyTheme(el.dataset.tid); closeThemeDropdown(); });
  });
}

export function openThemeDropdown() {
  renderThemeDropdown();
  document.getElementById("theme-dropdown").classList.add("open");
}

export function closeThemeDropdown() {
  document.getElementById("theme-dropdown").classList.remove("open");
}
