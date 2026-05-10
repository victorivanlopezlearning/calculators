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

const breakdownConfig = [
  { id: "reinversion", percentage: 40 },
  { id: "gastos",      percentage: 15 },
  { id: "ahorro",      percentage: 15 },
  { id: "sueldo",      percentage: 30 },
];

const calculateBreakdown = () => {
  const income = getInputValue(incomeInput);

  if (Number.isNaN(income)) {
    breakdownConfig.forEach(({ id }) => {
      document.getElementById(id).textContent = "Inválido";
    });
    return;
  }

  breakdownConfig.forEach(({ id, percentage }) => {
    document.getElementById(id).textContent = formatNumber((percentage * income) / 100);
  });
};

const clearBreakdown = () => {
  incomeInput.value = "";
  breakdownConfig.forEach(({ id }) => {
    document.getElementById(id).textContent = "0";
  });
  incomeInput.focus();
};

incomeInput.addEventListener("input", calculateBreakdown);