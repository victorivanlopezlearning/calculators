// --- Format helpers ---

const formatNumber = (value) =>
  new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);


const getInputValue = (input) => Number.parseFloat(input.value.trim());


// --- Percentage calculator ---

const percentageInput = document.getElementById("percentage");
const amountInput     = document.getElementById("amount");
const resultBox       = document.getElementById("result");
const clearBtn        = document.getElementById("clearBtn");

const calculatePercentage = () => {
  const aRaw = percentageInput.value.trim();
  const bRaw = amountInput.value.trim();

  if (!aRaw || !bRaw) {
    resultBox.textContent = "0";
    return;
  }

  const pct    = Number.parseFloat(aRaw);
  const amount = Number.parseFloat(bRaw);

  if (Number.isNaN(pct) || Number.isNaN(amount)) {
    resultBox.textContent = "Valores inválidos";
    return;
  }

  resultBox.textContent = formatNumber((pct * amount) / 100);
};

const clearFields = () => {
  percentageInput.value = "";
  amountInput.value = "";
  resultBox.textContent = "0";
  percentageInput.focus();
};

[percentageInput, amountInput].forEach(input => {
  input.addEventListener("input", calculatePercentage);
});

clearBtn.addEventListener("click", clearFields);


// --- Breakdown calculator ---

const incomeInput         = document.getElementById("income");
const breakdownValidation = document.getElementById("breakdown-validation");
const breakdownBarEl      = document.getElementById("breakdown-bar");
const breakdownTotalEl    = document.getElementById("breakdown-total");

const breakdownConfig = [
  { id: "reinversion", pctId: "pct-reinversion", defaultPct: 40 },
  { id: "ahorro",      pctId: "pct-ahorro",      defaultPct: 20 },
  { id: "sueldo",      pctId: "pct-sueldo",      defaultPct: 40 },
];

const loadBreakdownPercentages = () => {
  breakdownConfig.forEach(({ pctId, defaultPct }) => {
    const stored = localStorage.getItem(pctId);
    document.getElementById(pctId).value = stored !== null ? stored : defaultPct;
  });
};

const saveBreakdownPercentages = () => {
  breakdownConfig.forEach(({ pctId }) => {
    localStorage.setItem(pctId, document.getElementById(pctId).value);
  });
};

const getBreakdownPercentages = () =>
  breakdownConfig.map(({ pctId }) => {
    const val = getInputValue(document.getElementById(pctId));
    return Number.isNaN(val) || val < 0 ? 0 : val;
  });

const renderBreakdownBar = () => {
  const percentages = getBreakdownPercentages();
  const total = Math.round(percentages.reduce((a, b) => a + b, 0) * 100) / 100;
  const displayDenom = Math.max(total, 100);

  breakdownBarEl.innerHTML = "";
  breakdownConfig.forEach(({ id }, i) => {
    const pct = percentages[i];
    if (pct <= 0) return;
    const seg = document.createElement("div");
    seg.className = "breakdown__bar-seg";
    seg.style.width = (pct / displayDenom * 100) + "%";
    seg.style.background = `var(--color-${id})`;
    breakdownBarEl.appendChild(seg);
  });

  if (total < 100) {
    const seg = document.createElement("div");
    seg.className = "breakdown__bar-seg breakdown__bar-seg--unallocated";
    seg.style.width = ((100 - total) / displayDenom * 100) + "%";
    breakdownBarEl.appendChild(seg);
  }

  const isOk = total === 100;
  breakdownTotalEl.textContent = `Total: ${formatNumber(total)}%`;
  breakdownTotalEl.className = "breakdown__total" +
    (isOk ? " breakdown__total--ok" : total > 0 ? " breakdown__total--error" : "");
};

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
    setBreakdownValidation(`Los porcentajes suman ${formatNumber(total)}%. Deben sumar exactamente 100%.`, "error");
    return;
  }

  setBreakdownValidation("", "ok");

  breakdownConfig.forEach(({ id }, i) => {
    document.getElementById(id).textContent = formatNumber((percentages[i] * income) / 100);
  });
};

const normalizeToHundred = () => {
  const percentages = getBreakdownPercentages();
  const total = percentages.reduce((a, b) => a + b, 0);
  if (total === 0) return;

  const normalized = percentages.map(p => Math.round(p / total * 100));
  const sum = normalized.reduce((a, b) => a + b, 0);
  const diff = 100 - sum;
  if (diff !== 0) {
    const maxIdx = normalized.indexOf(Math.max(...normalized));
    normalized[maxIdx] += diff;
  }

  breakdownConfig.forEach(({ pctId }, i) => {
    document.getElementById(pctId).value = normalized[i];
    localStorage.setItem(pctId, normalized[i]);
  });

  renderBreakdownBar();
  calculateBreakdown();
};

loadBreakdownPercentages();
renderBreakdownBar();

incomeInput.addEventListener("input", calculateBreakdown);
breakdownConfig.forEach(({ pctId }) => {
  document.getElementById(pctId).addEventListener("input", () => {
    saveBreakdownPercentages();
    renderBreakdownBar();
    calculateBreakdown();
  });
});

document.getElementById("breakdown-normalize").addEventListener("click", normalizeToHundred);


// --- Theme toggle ---

const themeToggleBtn = document.getElementById("themeToggle");

const applyTheme = (dark) => {
  document.documentElement.dataset.theme = dark ? "dark" : "";
  themeToggleBtn.textContent = dark ? "☀️" : "🌙";
};

const isDarkOnLoad = document.documentElement.dataset.theme === "dark";
applyTheme(isDarkOnLoad);

themeToggleBtn.addEventListener("click", () => {
  const nowDark = document.documentElement.dataset.theme !== "dark";
  localStorage.setItem("theme", nowDark ? "dark" : "light");
  applyTheme(nowDark);
});
