// --- Percentage calculator ---

const percentageInput = document.getElementById("percentage");
const amountInput     = document.getElementById("amount");
const resultBox       = document.getElementById("result");
const clearBtn        = document.getElementById("clearBtn");

const SESSION_PCT = "pct_percentage";
const SESSION_AMT = "pct_amount";

const savePercentageState = () => {
  sessionStorage.setItem(SESSION_PCT, percentageInput.value);
  sessionStorage.setItem(SESSION_AMT, amountInput.value);
};

const restorePercentageState = () => {
  const pct = sessionStorage.getItem(SESSION_PCT);
  const amt = sessionStorage.getItem(SESSION_AMT);
  if (pct !== null) percentageInput.value = pct;
  if (amt !== null) amountInput.value = amt;
  if (pct || amt) calculatePercentage();
};

const calculatePercentage = () => {
  const aRaw = percentageInput.value.trim();
  const bRaw = amountInput.value.trim();

  if (!aRaw || !bRaw) {
    resultBox.textContent = "0";
    return;
  }

  const pct    = Number.parseFloat(aRaw);
  const amount = Number.parseFloat(bRaw.replace(/,/g, ''));

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
  sessionStorage.removeItem(SESSION_PCT);
  sessionStorage.removeItem(SESSION_AMT);
  percentageInput.focus();
};

percentageInput.addEventListener("input", () => { calculatePercentage(); savePercentageState(); });
amountInput.addEventListener("input", () => { formatMoneyInput(amountInput); calculatePercentage(); savePercentageState(); });

clearBtn.addEventListener("click", clearFields);

resultBox.setAttribute('title', 'Clic para copiar');
resultBox.addEventListener('click', () => copyToClipboard(resultBox));

restorePercentageState();
