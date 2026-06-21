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

const COMPOUND_KEYS = {
  principal:    "compound_principal",
  rate:         "compound_rate",
  years:        "compound_years",
  frequency:    "compound_frequency",
  contribution: "compound_contribution",
};

const saveCompoundState = () => {
  sessionStorage.setItem(COMPOUND_KEYS.principal,    compoundPrincipalInput.value);
  sessionStorage.setItem(COMPOUND_KEYS.rate,         compoundRateInput.value);
  sessionStorage.setItem(COMPOUND_KEYS.years,        compoundYearsInput.value);
  sessionStorage.setItem(COMPOUND_KEYS.frequency,    compoundFrequencySelect.value);
  sessionStorage.setItem(COMPOUND_KEYS.contribution, compoundContributionInput.value);
};

const restoreCompoundState = () => {
  const p = sessionStorage.getItem(COMPOUND_KEYS.principal);
  const r = sessionStorage.getItem(COMPOUND_KEYS.rate);
  const y = sessionStorage.getItem(COMPOUND_KEYS.years);
  const f = sessionStorage.getItem(COMPOUND_KEYS.frequency);
  const c = sessionStorage.getItem(COMPOUND_KEYS.contribution);
  if (p !== null) compoundPrincipalInput.value    = p;
  if (r !== null) compoundRateInput.value         = r;
  if (y !== null) compoundYearsInput.value        = y;
  if (f !== null) compoundFrequencySelect.value   = f;
  if (c !== null) compoundContributionInput.value = c;
};

let compoundChart = null;

const buildCompoundChart = (labels, principalArr, contributionsArr, interestArr) => {
  const style        = getComputedStyle(document.documentElement);
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
  const P   = parseFloat(compoundPrincipalInput.value.replace(/,/g, ''))    || 0;
  const r   = (parseFloat(compoundRateInput.value)                          || 0) / 100;
  const t   = Math.max(1, Math.min(50, parseInt(compoundYearsInput.value)   || 1));
  const n   = parseInt(compoundFrequencySelect.value)                       || 12;
  const pmt = parseFloat(compoundContributionInput.value.replace(/,/g, '')) || 0;

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

[compoundPrincipalInput, compoundContributionInput].forEach((input) => {
  input.addEventListener("input", () => { formatMoneyInput(input); calculateCompound(); saveCompoundState(); });
});
[compoundRateInput, compoundYearsInput].forEach(
  (input) => input.addEventListener("input", () => { calculateCompound(); saveCompoundState(); })
);
compoundFrequencySelect.addEventListener("change", () => { calculateCompound(); saveCompoundState(); });

document.addEventListener("themeChanged", () => calculateCompound());

restoreCompoundState();
calculateCompound();
