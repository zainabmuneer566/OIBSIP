// ---------- Elements ----------
const displayEl = document.getElementById("display");
const expressionEl = document.getElementById("expression");
const buttons = document.querySelectorAll(".btn");

// ---------- State ----------
let current = "0";      // number currently being typed / shown
let previous = null;    // stored left-hand number
let operator = null;    // pending operator
let resetNext = false;  // true -> next digit starts a new number
let hasError = false;

const MAX_LENGTH = 15;

// ---------- Helpers ----------
function format(num) {
  // toFixed(10) avoids floating point noise like 0.1 + 0.2 = 0.30000000000000004
  return String(parseFloat(num.toFixed(10)));
}

function updateDisplay() {
  displayEl.textContent = current;
  displayEl.classList.toggle("error", hasError);
  expressionEl.textContent =
    previous !== null && operator !== null ? format(previous) + " " + operator : "";
}

function calculate(a, b, op) {
  switch (op) {
    case "+":
      return a + b;
    case "−":
      return a - b;
    case "×":
      return a * b;
    case "÷":
      if (b === 0) {
        return null; // division by zero
      }
      return a / b;
    default:
      return b;
  }
}

function showError() {
  current = "Cannot divide by 0";
  hasError = true;
  previous = null;
  operator = null;
  resetNext = true;
  updateDisplay();
}

// ---------- Actions ----------
function clearAll() {
  current = "0";
  previous = null;
  operator = null;
  resetNext = false;
  hasError = false;
  updateDisplay();
}

function inputDigit(digit) {
  if (hasError) {
    clearAll();
  }
  if (resetNext) {
    current = digit;
    resetNext = false;
  } else if (current.length < MAX_LENGTH) {
    current = current === "0" ? digit : current + digit;
  }
  updateDisplay();
}

function inputDecimal() {
  if (hasError) {
    clearAll();
  }
  if (resetNext) {
    current = "0.";
    resetNext = false;
  } else if (!current.includes(".")) {
    current += ".";
  }
  updateDisplay();
}

function chooseOperator(op) {
  if (hasError) {
    return;
  }

  // Pressing two operators in a row just replaces the operator
  if (operator !== null && resetNext) {
    operator = op;
    updateDisplay();
    return;
  }

  // Operator chaining: calculate the pending operation first
  if (operator !== null) {
    const result = calculate(previous, parseFloat(current), operator);
    if (result === null) {
      showError();
      return;
    }
    previous = result;
    current = format(result);
  } else {
    previous = parseFloat(current);
  }

  operator = op;
  resetNext = true;
  updateDisplay();
}

function evaluate() {
  if (hasError || operator === null || previous === null) {
    return;
  }

  const right = parseFloat(current);
  const result = calculate(previous, right, operator);
  if (result === null) {
    showError();
    return;
  }

  const finished = format(previous) + " " + operator + " " + format(right) + " =";
  current = format(result);
  previous = null;
  operator = null;
  resetNext = true;
  updateDisplay();
  expressionEl.textContent = finished;
}

function backspace() {
  if (hasError) {
    clearAll();
    return;
  }
  if (resetNext) {
    return; // cannot edit a finished result
  }
  current = current.length > 1 ? current.slice(0, -1) : "0";
  updateDisplay();
}

// ---------- Button event listeners (no inline onclick) ----------
buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    const type = button.dataset.type;
    const value = button.dataset.value;

    switch (type) {
      case "number":
        inputDigit(value);
        break;
      case "decimal":
        inputDecimal();
        break;
      case "operator":
        chooseOperator(value);
        break;
      case "equals":
        evaluate();
        break;
      case "clear":
        clearAll();
        break;
      case "backspace":
        backspace();
        break;
    }
  });
});

// ---------- Keyboard support (bonus) ----------
document.addEventListener("keydown", function (event) {
  const key = event.key;

  if (key >= "0" && key <= "9") {
    inputDigit(key);
  } else if (key === ".") {
    inputDecimal();
  } else if (key === "+") {
    chooseOperator("+");
  } else if (key === "-") {
    chooseOperator("−");
  } else if (key === "*") {
    chooseOperator("×");
  } else if (key === "/") {
    event.preventDefault();
    chooseOperator("÷");
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    evaluate();
  } else if (key === "Backspace") {
    backspace();
  } else if (key === "Escape") {
    clearAll();
  }
});

updateDisplay();
