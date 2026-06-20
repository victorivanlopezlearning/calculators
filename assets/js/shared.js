// --- Format helpers ---

const formatNumber = (value) =>
  new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

const getInputValue = (input) => Number.parseFloat(input.value.trim());


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
  document.dispatchEvent(new CustomEvent("themeChanged"));
});


// --- Active nav link ---

(function () {
  const raw = location.pathname.split('/').pop();
  const currentPath = (raw || 'index').replace(/\.html$/, '');
  document.querySelectorAll('.site-nav__link').forEach(link => {
    const href = link.getAttribute('href').replace(/\.html$/, '');
    if (href === currentPath) {
      link.setAttribute('aria-current', 'page');
    }
  });
})();
