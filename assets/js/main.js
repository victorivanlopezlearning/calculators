const percentageInput = document.getElementById("percentage");
const amountInput = document.getElementById("amount");
const resultBox = document.getElementById("result");
const calcBtn = document.getElementById("calcBtn");
const clearBtn = document.getElementById("clearBtn");

const formatNumber = (value) =>
  new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

const getInputValue = (input) =>
  Number.parseFloat(input.value.trim());

const showResult = (value) => {
  resultBox.textContent = formatNumber(value);
};

const showError = (message = "Valores inválidos") => {
  resultBox.textContent = message;
};

const calculatePercentage = () => {
  const percentage = getInputValue(percentageInput);
  const amount = getInputValue(amountInput);

  if (Number.isNaN(percentage) || Number.isNaN(amount)) {
    showError();
    return;
  }

  const result = (percentage * amount) / 100;

  showResult(result);
};

const clearFields = () => {
  percentageInput.value = "";
  amountInput.value = "";

  showResult(0);
  percentageInput.focus();
};

[percentageInput, amountInput].forEach(input => {
  input.addEventListener("input", calculatePercentage);
});

calcBtn.addEventListener("click", calculatePercentage);
clearBtn.addEventListener("click", clearFields);

// --- Breakdown calculator ---
const incomeInput = document.getElementById("income");
const breakdownValidation = document.getElementById("breakdown-validation");

const breakdownConfig = [
  { id: "reinversion", pctId: "pct-reinversion", defaultPct: 40 },
  { id: "ahorro",      pctId: "pct-ahorro",      defaultPct: 10 },
  { id: "sueldo",      pctId: "pct-sueldo",      defaultPct: 40 },
];

const loadBreakdownPercentages = () => {
  breakdownConfig.forEach(({ pctId, defaultPct }) => {
    const stored = localStorage.getItem(pctId);
    const input = document.getElementById(pctId);
    input.value = stored !== null ? stored : defaultPct;
  });
};

const saveBreakdownPercentages = () => {
  breakdownConfig.forEach(({ pctId }) => {
    localStorage.setItem(pctId, document.getElementById(pctId).value);
  });
};

loadBreakdownPercentages();

const setBreakdownValidation = (message, type) => {
  breakdownValidation.textContent = message;
  breakdownValidation.className = "breakdown__validation" + (type ? ` breakdown__validation--${type}` : "");
};

const calculateBreakdown = () => {
  const income = getInputValue(incomeInput);

  if (Number.isNaN(income) || income < 0) {
    setBreakdownValidation("Ingresa una ganancia mensual válida.", "error");
    breakdownConfig.forEach(({ id }) => {
      document.getElementById(id).textContent = "—";
    });
    return;
  }

  const percentages = breakdownConfig.map(({ pctId }) => getInputValue(document.getElementById(pctId)));

  if (percentages.some((p) => Number.isNaN(p) || p < 0)) {
    setBreakdownValidation("Todos los porcentajes deben ser números válidos y no negativos.", "error");
    return;
  }

  const total = Math.round(percentages.reduce((a, b) => a + b, 0) * 100) / 100;

  if (total !== 100) {
    setBreakdownValidation(`Los porcentajes suman ${total}%. Deben sumar exactamente 100%.`, "error");
    return;
  }

  setBreakdownValidation("", "ok");

  breakdownConfig.forEach(({ id }, i) => {
    document.getElementById(id).textContent = formatNumber((percentages[i] * income) / 100);
  });
};

const clearBreakdown = () => {
  incomeInput.value = "";
  breakdownConfig.forEach(({ pctId, defaultPct, id }) => {
    document.getElementById(pctId).value = defaultPct;
    localStorage.setItem(pctId, defaultPct);
    document.getElementById(id).textContent = "0";
  });
  setBreakdownValidation("", "");
  incomeInput.focus();
};

incomeInput.addEventListener("input", calculateBreakdown);
breakdownConfig.forEach(({ pctId }) => {
  document.getElementById(pctId).addEventListener("input", () => {
    saveBreakdownPercentages();
    calculateBreakdown();
  });
});