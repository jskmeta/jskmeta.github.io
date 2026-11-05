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

    initMockupSwitcher();
  }

  function initMockupSwitcher() {
    const tabBtns = document.querySelectorAll(".mockup-tab-btn");
    const source = document.getElementById("squint-mockup-source");
    const img = document.getElementById("squint-mockup-img");
    if (!tabBtns.length || !source || !img) return;

    const views = {
      live: {
        webp: "images/squint-device-mockup.webp",
        png: "images/squint-device-mockup.png",
        alt: "Squint iOS magnifier interface with live camera viewfinder, vertical zoom slider rail, bottom preset buttons, and torch brightness control",
      },
      freeze: {
        webp: "images/squint-freeze-inspect.webp",
        png: "images/squint-freeze-inspect.png",
        alt: "Squint freeze inspection interface showing magnified prescription label with high-contrast text and barcode",
      },
    };

    tabBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const viewKey = this.getAttribute("data-view");
        const view = views[viewKey];
        if (!view) return;

        tabBtns.forEach(function (b) {
          b.classList.remove("active");
          b.setAttribute("aria-selected", "false");
        });
        this.classList.add("active");
        this.setAttribute("aria-selected", "true");

        // Subtle cross-fade
        img.style.opacity = "0.3";
        setTimeout(function () {
          source.srcset = view.webp;
          img.src = view.png;
          img.alt = view.alt;
          img.style.opacity = "1";
        }, 120);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
