
"use strict";

const form = document.querySelector(".js-form");
const fields = ["name", "email", "comments"].map(id => document.getElementById(id));
const feedback = document.getElementById("js-feedback");
const errorList = document.getElementById("error-list");
const comments = document.getElementById("comments");
const commentsInfo = document.getElementById("comments-info");
const historyInput = document.getElementById("form-errors");

const form_errors = [];
const edited = new Set();
let pendingErrors = null;

feedback.hidden = false;

function errorFor(field) {
    field.setCustomValidity("");

    const validity = field.validity;
    const label = field.labels[0].textContent.replace("*", "").trim();

    if (validity.valueMissing) {
        return `${label} is required.`;
    }

    if (validity.typeMismatch) {
        return `${label}: enter a valid email address.`;
    }

    if (validity.tooShort ||
        (field.value.length > 0 && field.minLength > 0 &&
         field.value.length < field.minLength)) {
        return `${label}: enter at least ${field.minLength} characters.`;
    }

    return "";
}

function showErrors() {
    errorList.replaceChildren();

    for (const field of fields) {
        if (!field.dataset.error) continue;

        const item = document.createElement("li");
        item.id = `${field.id}-error`;
        item.textContent = field.dataset.error;
        errorList.append(item);
    }

    errorList.parentElement.hidden = !errorList.children.length;
}

function validateField(field, display = false) {
    const message = errorFor(field);

    field.setCustomValidity(message);
    field.dataset.error = display ? message : "";
    field.setAttribute("aria-invalid", String(display && Boolean(message)));

    const descriptions = [];

    if (display && message) {
        descriptions.push(`${field.id}-error`);
    }

    if (field === comments) {
        descriptions.push("comments-info");
    }

    if (descriptions.length) {
        field.setAttribute("aria-describedby", descriptions.join(" "));
    } else {
        field.removeAttribute("aria-describedby");
    }

    showErrors();
    return message;
}

function updateCount() {
    const remaining = comments.maxLength - comments.value.length;

    commentsInfo.classList.toggle("count-warning", remaining <= 100);

    commentsInfo.textContent = remaining === 0
        ? "Character limit reached (0 remaining)."
        : remaining <= 100
            ? `Approaching the character limit: ${remaining} characters remaining.`
            : `${remaining} characters remaining.`;
}

for (const field of fields) {
    field.addEventListener("input", () => {
        edited.add(field);

        validateField(field, field.getAttribute("aria-invalid") === "true");

        if (field === comments) updateCount();
    });

    field.addEventListener("blur", () => {
        if (edited.has(field)) validateField(field, true);
    });
}

form.addEventListener("invalid", event => {
    const field = event.target;
    if (!fields.includes(field)) return;

    if (!pendingErrors) {
        pendingErrors = new Map();

        queueMicrotask(() => {
            for (const [field, message] of pendingErrors) {
                form_errors.push({ field: field.name, error: message });
            }
            pendingErrors = null;
        });
    }

    const message = validateField(field, true);
    if (message) pendingErrors.set(field, message);
}, true);

form.addEventListener("submit", () => {
    historyInput.value = JSON.stringify(form_errors);
});

updateCount();
showErrors();
