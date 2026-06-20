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
  percentageInput.focus();
};

percentageInput.addEventListener("input", calculatePercentage);
amountInput.addEventListener("input", () => { formatMoneyInput(amountInput); calculatePercentage(); });

clearBtn.addEventListener("click", clearFields);

resultBox.setAttribute('title', 'Clic para copiar');
resultBox.addEventListener('click', () => copyToClipboard(resultBox));
