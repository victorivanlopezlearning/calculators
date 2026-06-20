// --- Format helpers ---

const formatNumber = (value) =>
  new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

const getInputValue = (input) => Number.parseFloat(input.value.replace(/,/g, '').trim());

const formatMoneyInput = (input) => {
  const raw    = input.value;
  const cursor = input.selectionStart;

  let digitsBefore = 0;
  for (let i = 0; i < cursor; i++) {
    if (/\d/.test(raw[i])) digitsBefore++;
  }

  const cleaned = raw.replace(/[^\d.]/g, '').replace(/(\..*?)\..*/g, '$1');

  let formatted;
  if (cleaned === '') {
    formatted = '';
  } else {
    const dotIndex   = cleaned.indexOf('.');
    const hasDecimal = dotIndex !== -1;
    const intStr     = hasDecimal ? cleaned.slice(0, dotIndex) : cleaned;
    const decStr     = hasDecimal ? cleaned.slice(dotIndex + 1) : '';
    const intNum     = intStr === '' ? 0 : parseInt(intStr, 10);
    const intFmt     = intStr === ''
      ? '0'
      : new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(intNum);
    formatted = hasDecimal ? intFmt + '.' + decStr : intFmt;
  }

  input.value = formatted;

  let newPos = 0;
  let count  = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) {
      count++;
      if (count === digitsBefore) { newPos = i + 1; break; }
    }
  }
  if (digitsBefore > 0 && count < digitsBefore) newPos = formatted.length;

  input.setSelectionRange(newPos, newPos);
};


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
