"use strict";

const themeToggle = document.getElementById("theme-toggle");
const root = document.documentElement;

let theme = "dark";

try {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "light" || savedTheme === "dark") {
        theme = savedTheme;
    }
} catch (error) {
    // Continue using the default theme if storage is unavailable.
}

function applyTheme() {
    root.dataset.theme = theme;

    if (themeToggle) {
        themeToggle.textContent = theme === "dark"
            ? "Switch to light mode"
            : "Switch to dark mode";
    }
}

applyTheme();

if (themeToggle) {
    themeToggle.hidden = false;

    themeToggle.addEventListener("click", () => {
        function switchTheme() {
            theme = theme === "dark" ? "light" : "dark";
            applyTheme();

            try {
                localStorage.setItem("theme", theme);
            } catch (error) {
                // Theme still works without storage.
            }
        }

        if (document.startViewTransition &&
            !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            document.startViewTransition(switchTheme);
        } else {
            switchTheme();
        }
    });
}