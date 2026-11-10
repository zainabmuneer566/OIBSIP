// Temperature Converter – vanilla JavaScript
const form = document.getElementById("converter");
const input = document.getElementById("temp");
const unitSelect = document.getElementById("unit");
const errorBox = document.getElementById("error");
const resultsBox = document.getElementById("results");
const out = {
  C: document.getElementById("out-C"),
  F: document.getElementById("out-F"),
  K: document.getElementById("out-K"),
};

// Absolute zero expressed in each unit
const ABSOLUTE_ZERO = { C: -273.15, F: -459.67, K: 0 };
const UNIT_NAMES = { C: "°C", F: "°F", K: "K" };

// Matches optional sign, digits, optional decimal part (e.g. -12, 3.5, .5)
const NUMBER_PATTERN = /^[+-]?(\d+(\.\d*)?|\.\d+)$/;

// --- Conversion formulas: everything goes through Celsius ---
function toCelsius(value, unit) {
  if (unit === "C") return value;
  if (unit === "F") return (value - 32) * 5 / 9;
  return value - 273.15; // Kelvin
}
function fromCelsius(c) {
  return {
    C: c,
    F: c * 9 / 5 + 32,
    K: c + 273.15,
  };
}

// --- Validation: returns an error message, or "" if the input is valid ---
function validate() {
  const raw = input.value.trim();
  if (raw === "") return "Please enter a temperature value.";
  if (!NUMBER_PATTERN.test(raw)) {
    return "Enter numbers only (for example 25, -40 or 36.6).";
  }
  const value = parseFloat(raw);
  const unit = unitSelect.value;
  if (value < ABSOLUTE_ZERO[unit]) {
    return `Not possible: ${value} ${UNIT_NAMES[unit]} is below absolute zero ` +
           `(${ABSOLUTE_ZERO[unit]} ${UNIT_NAMES[unit]}).`;
  }
  return "";
}

function showError(message) {
  errorBox.textContent = message;
  input.classList.toggle("invalid", message !== "");
  input.setAttribute("aria-invalid", message !== "" ? "true" : "false");
}

function round(n) {
  // Round to 2 decimals and avoid "-0"
  const r = Math.round(n * 100) / 100;
  return Object.is(r, -0) ? 0 : r;
}

function convert() {
  const message = validate();
  showError(message);
  if (message) {
    resultsBox.hidden = true;
    return;
  }
  const value = parseFloat(input.value.trim());
  const all = fromCelsius(toCelsius(value, unitSelect.value));
  for (const u of ["C", "F", "K"]) {
    out[u].textContent = `${round(all[u])} ${UNIT_NAMES[u]}`;
  }
  resultsBox.hidden = false;
}

// Convert button (and Enter key) triggers the calculation
form.addEventListener("submit", (e) => {
  e.preventDefault();
  convert();
});

// Real-time validation while typing / changing unit
function liveCheck() {
  if (input.value.trim() === "") {
    showError("");
    resultsBox.hidden = true;
    return;
  }
  showError(validate());
}
input.addEventListener("input", liveCheck);
unitSelect.addEventListener("change", liveCheck);
