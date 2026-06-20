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
const normalizeBtn        = document.getElementById("breakdown-normalize");

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
  normalizeBtn.disabled = isOk;
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


// --- Copy to clipboard ---

const copyToClipboard = async (el) => {
  const text = el.textContent.trim();
  if (!text || text === '0' || text === '—' || text === 'Valores inválidos') return;
  try {
    await navigator.clipboard.writeText(text);
    const original = el.textContent;
    el.textContent = '¡Copiado!';
    el.classList.add('is-copied');
    setTimeout(() => {
      el.textContent = original;
      el.classList.remove('is-copied');
    }, 1000);
  } catch { /* clipboard no disponible */ }
};

[...document.querySelectorAll('.breakdown__result'), resultBox].forEach(el => {
  el.setAttribute('title', 'Clic para copiar');
  el.addEventListener('click', () => copyToClipboard(el));
});


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
  calculateCompound();
});


// === COMPOUND INTEREST CALCULATOR ===

const compoundPrincipalInput    = document.getElementById("compound-principal");
const compoundRateInput         = document.getElementById("compound-rate");
const compoundYearsInput        = document.getElementById("compound-years");
const compoundFrequencySelect   = document.getElementById("compound-frequency");
const compoundContributionInput = document.getElementById("compound-contribution");

const compoundResPrincipal     = document.getElementById("compound-res-principal");
const compoundResContributions = document.getElementById("compound-res-contributions");
const compoundResInterest      = document.getElementById("compound-res-interest");
const compoundResTotal         = document.getElementById("compound-res-total");
const compoundTableBody        = document.querySelector("#compound-table tbody");

const formatMXN = (value) =>
  "$" + new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const computeCompoundYear = (P, r, n, pmt, t) => {
  const periods       = n * t;
  const ratePerPeriod = r / n;
  let balance;
  if (ratePerPeriod === 0) {
    balance = P + pmt * periods;
  } else {
    const factor = Math.pow(1 + ratePerPeriod, periods);
    balance = P * factor + pmt * (factor - 1) / ratePerPeriod;
  }
  const additionalDeposits = pmt * n * t;
  const interest           = balance - P - additionalDeposits;
  return { balance, additionalDeposits, interest: Math.max(0, interest) };
};

let compoundChart = null;

const buildCompoundChart = (labels, principalArr, contributionsArr, interestArr) => {
  const style       = getComputedStyle(document.documentElement);
  const colPrincipal = style.getPropertyValue("--color-secondary").trim();
  const colContrib   = style.getPropertyValue("--color-primary").trim();
  const colInterest  = style.getPropertyValue("--color-compound-interest").trim();
  const colText      = style.getPropertyValue("--color-text").trim();
  const colMuted     = style.getPropertyValue("--color-text-muted").trim();

  if (compoundChart) {
    compoundChart.destroy();
    compoundChart = null;
  }

  const canvas = document.getElementById("compound-chart");
  const ctx    = canvas.getContext("2d");

  compoundChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Depósito inicial",
          data: principalArr,
          backgroundColor: colPrincipal,
          stack: "compound",
        },
        {
          label: "Depósitos adicionales",
          data: contributionsArr,
          backgroundColor: colContrib,
          stack: "compound",
        },
        {
          label: "Interés acumulado",
          data: interestArr,
          backgroundColor: colInterest,
          stack: "compound",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300 },
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: colText,
            font: { size: 12, family: "'Inter', sans-serif" },
            boxWidth: 14,
            padding: 16,
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${formatMXN(ctx.raw)}`,
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          ticks: { color: colMuted, font: { size: 11 } },
          grid: { display: false },
        },
        y: {
          stacked: true,
          ticks: {
            color: colMuted,
            font: { size: 11 },
            callback: (v) => formatMXN(v),
          },
          grid: { color: "rgba(132, 169, 140, 0.12)" },
        },
      },
    },
  });
};

const calculateCompound = () => {
  const P   = parseFloat(compoundPrincipalInput.value)    || 0;
  const r   = (parseFloat(compoundRateInput.value)        || 0) / 100;
  const t   = Math.max(1, Math.min(50, parseInt(compoundYearsInput.value) || 1));
  const n   = parseInt(compoundFrequencySelect.value)     || 12;
  const pmt = parseFloat(compoundContributionInput.value) || 0;

  const labels           = [];
  const principalArr     = [];
  const contributionsArr = [];
  const interestArr      = [];
  const rows             = [];

  for (let year = 1; year <= t; year++) {
    const { balance, additionalDeposits, interest } = computeCompoundYear(P, r, n, pmt, year);
    labels.push(year === 1 ? "1 año" : `${year} años`);
    principalArr.push(P);
    contributionsArr.push(additionalDeposits);
    interestArr.push(interest);
    rows.push({ year, principal: P, additionalDeposits, interest, total: balance });
  }

  const last = rows[rows.length - 1];
  compoundResPrincipal.textContent     = formatMXN(last.principal);
  compoundResContributions.textContent = formatMXN(last.additionalDeposits);
  compoundResInterest.textContent      = formatMXN(last.interest);
  compoundResTotal.textContent         = formatMXN(last.total);

  compoundTableBody.innerHTML = rows
    .map(({ year, principal, additionalDeposits, interest, total }) =>
      `<tr>
        <td>${year}</td>
        <td>${formatMXN(principal)}</td>
        <td>${formatMXN(additionalDeposits)}</td>
        <td>${formatMXN(interest)}</td>
        <td>${formatMXN(total)}</td>
      </tr>`
    )
    .join("");

  buildCompoundChart(labels, principalArr, contributionsArr, interestArr);
};

[compoundPrincipalInput, compoundRateInput, compoundYearsInput, compoundContributionInput].forEach(
  (input) => input.addEventListener("input", calculateCompound)
);
compoundFrequencySelect.addEventListener("change", calculateCompound);

calculateCompound();
