// Theme Toggle and Color Scheme Management
(function () {
  function getEffectiveTheme() {
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta && (meta.content === "dark" || meta.content === "light")) {
      return meta.content;
    }
    try {
      const stored = localStorage.getItem("color-scheme");
      if (stored === "dark" || stored === "light") {
        return stored;
      }
    } catch (e) {}

    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(theme, persist) {
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) {
      meta.content = theme;
    }
    document.documentElement.setAttribute("data-theme", theme);

    if (persist) {
      try {
        localStorage.setItem("color-scheme", theme);
      } catch (e) {}
    }

    const nextTheme = theme === "dark" ? "light" : "dark";
    const label = `Switch to ${nextTheme} theme`;
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.setAttribute("aria-label", label);
      btn.setAttribute("title", label);
    }
  }

  function toggleTheme() {
    const current = getEffectiveTheme();
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next, true);
  }

  function init() {
    const current = getEffectiveTheme();
    applyTheme(current, false);

    const btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.addEventListener("click", toggleTheme);
    }

    window.addEventListener("storage", function (e) {
      if (e.key === "color-scheme" && (e.newValue === "light" || e.newValue === "dark")) {
        applyTheme(e.newValue, false);
      }
    });

    if (window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
        try {
          if (!localStorage.getItem("color-scheme")) {
            applyTheme(e.matches ? "dark" : "light", false);
          }
        } catch (err) {}
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
