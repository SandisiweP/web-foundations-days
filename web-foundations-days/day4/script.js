// Select elements
const noteText = document.getElementById("note-text");
const charCount = document.getElementById("char-count");
const wordCount = document.getElementById("word-count");
const clearBtn = document.getElementById("clear-btn");
const themeToggle = document.getElementById("theme-toggle");

// Update counters and check warning/over limits
function updateCounts() {
    const text = noteText.value;
    const length = text.length;

    const trimmed = text.trim();
    const words = trimmed === "" ? 0 : trimmed.split(/\s+/).length;

    charCount.textContent = `${length} / 200 characters`;
    wordCount.textContent = `${words} words`;

    charCount.className = "";

    if (length > 200) {
        charCount.classList.add("over");
    } else if (length > 180) {
        charCount.classList.add("warning");
    }
}

// Save draft on input
noteText.addEventListener("input", () => {
    updateCounts();
    localStorage.setItem("noteDraft", noteText.value);
});

// Clear functionality
function clearNote() {
    noteText.value = "";
    localStorage.removeItem("noteDraft");
    updateCounts();
    noteText.focus();
}

clearBtn.addEventListener("click", clearNote);

// Clear on Escape key
noteText.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        clearNote();
    }
});

// Theme switcher
function setTheme(isDark) {
    if (isDark) {
        document.body.classList.add("dark");
        themeToggle.textContent = "Light mode";
        localStorage.setItem("theme", "dark");
    } else {
        document.body.classList.remove("dark");
        themeToggle.textContent = "Dark mode";
        localStorage.setItem("theme", "light");
    }
}

themeToggle.addEventListener("click", () => {
    const isCurrentlyDark = document.body.classList.contains("dark");
    setTheme(!isCurrentlyDark);
});

// Restore saved state on page load
window.addEventListener("DOMContentLoaded", () => {
    const savedDraft = localStorage.getItem("noteDraft");
    if (savedDraft !== null) {
        noteText.value = savedDraft;
    }

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        setTheme(true);
    } else {
        setTheme(false);
    }

    updateCounts();
});