// ─── Utility helpers ─────────────────────────────────────────────────────────
const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);
const fmtSigned = n => (n >= 0 ? '+' : '') + fmt(n);

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// ─── State ───────────────────────────────────────────────────────────────────
let currentMonth = new Date().getMonth() + 1; // 1-indexed; fall back to Jan if outside range
if (currentMonth < 1 || currentMonth > 12) currentMonth = 1;

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const monthSelect   = document.getElementById('monthSelect');
const kpiIncome     = document.getElementById('kpi-income');
const kpiExpenses   = document.getElementById('kpi-expenses');
const kpiNet        = document.getElementById('kpi-net');
const kpiRate       = document.getElementById('kpi-rate');
const barCanvas     = document.getElementById('barChart');
const donutCanvas   = document.getElementById('donutChart');
const txBody        = document.getElementById('txBody');
const donutLegend   = document.getElementById('donutLegend');
const monthTitle    = document.getElementById('monthTitle');

// ─── Month selector setup ────────────────────────────────────────────────────
MONTH_NAMES.forEach((name, i) => {
  const opt = document.createElement('option');
  opt.value = i + 1;
  opt.textContent = name + ' 2026';
  if (i + 1 === currentMonth) opt.selected = true;
  monthSelect.appendChild(opt);
});

monthSelect.addEventListener('change', () => {
  currentMonth = parseInt(monthSelect.value);
  render();
});

// ─── KPI Cards ───────────────────────────────────────────────────────────────
function renderKPIs(data) {
  const net  = data.income - data.expenses;
  const rate = ((net / data.income) * 100).toFixed(1);

  kpiIncome.querySelector('.kpi-value').textContent   = fmt(data.income);
  kpiExpenses.querySelector('.kpi-value').textContent = fmt(data.expenses);

  const netEl = kpiNet.querySelector('.kpi-value');
  netEl.textContent = fmtSigned(net);
  netEl.className   = 'kpi-value ' + (net >= 0 ? 'positive' : 'negative');

  const rateEl = kpiRate.querySelector('.kpi-value');
  rateEl.textContent = rate + '%';
  rateEl.className   = 'kpi-value ' + (parseFloat(rate) >= 20 ? 'positive' : parseFloat(rate) >= 10 ? 'neutral' : 'negative');

  // Trend sub-labels
  kpiIncome.querySelector('.kpi-sub').textContent   = MONTH_NAMES[currentMonth - 1];
  kpiExpenses.querySelector('.kpi-sub').textContent = MONTH_NAMES[currentMonth - 1];
  kpiNet.querySelector('.kpi-sub').textContent      = net >= 0 ? 'Surplus' : 'Deficit';
  kpiRate.querySelector('.kpi-sub').textContent     = parseFloat(rate) >= 20 ? 'Great!' : parseFloat(rate) >= 10 ? 'Fair' : 'Needs work';
}

// ─── Bar Chart ───────────────────────────────────────────────────────────────
function renderBarChart(data) {
  const ctx    = barCanvas.getContext('2d');
  const W      = barCanvas.width  = barCanvas.offsetWidth  * window.devicePixelRatio;
  const H      = barCanvas.height = barCanvas.offsetHeight * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  const w = barCanvas.offsetWidth;
  const h = barCanvas.offsetHeight;

  ctx.clearRect(0, 0, w, h);

  const weeks   = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const income  = data.weeks.income;
  const expenses= data.weeks.expenses;

  const padL = 60, padR = 24, padT = 24, padB = 48;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;

  const maxVal = Math.max(...income, ...expenses) * 1.15;

  const groupW  = chartW / 4;
  const barW    = groupW * 0.28;
  const gap     = groupW * 0.06;

  // Grid lines
  const gridLines = 5;
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth   = 1;
  ctx.setLineDash([4, 4]);
  for (let i = 0; i <= gridLines; i++) {
    const y = padT + chartH - (i / gridLines) * chartH;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + chartW, y);
    ctx.stroke();

    // Y-axis labels
    ctx.fillStyle   = '#94a3b8';
    ctx.font        = `${11 * window.devicePixelRatio / window.devicePixelRatio}px Inter, sans-serif`;
    ctx.textAlign   = 'right';
    ctx.fillText('$' + Math.round((maxVal * i) / gridLines / 100) * 100, padL - 8, y + 4);
  }
  ctx.setLineDash([]);

  // Bars
  const COLOR_INCOME   = '#6366f1';
  const COLOR_EXPENSES = '#f43f5e';

  for (let i = 0; i < 4; i++) {
    const groupX = padL + i * groupW + groupW / 2;

    // Income bar
    const iH = (income[i] / maxVal) * chartH;
    const iX = groupX - barW - gap / 2;
    const iY = padT + chartH - iH;
    const r  = 4;

    ctx.fillStyle = COLOR_INCOME;
    roundRect(ctx, iX, iY, barW, iH, [r, r, 0, 0]);
    ctx.fill();

    // Expense bar
    const eH = (expenses[i] / maxVal) * chartH;
    const eX = groupX + gap / 2;
    const eY = padT + chartH - eH;

    ctx.fillStyle = COLOR_EXPENSES;
    roundRect(ctx, eX, eY, barW, eH, [r, r, 0, 0]);
    ctx.fill();

    // Value labels on bars
    ctx.fillStyle = '#1e293b';
    ctx.font      = `bold 11px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('$' + (income[i] / 1000).toFixed(1) + 'k', iX + barW / 2, iY - 6);
    ctx.fillText('$' + (expenses[i] / 1000).toFixed(1) + 'k', eX + barW / 2, eY - 6);

    // X-axis labels
    ctx.fillStyle = '#64748b';
    ctx.font      = `12px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(weeks[i], groupX, padT + chartH + 20);
  }

  // Baseline
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(padL, padT + chartH);
  ctx.lineTo(padL + chartW, padT + chartH);
  ctx.stroke();

  // Legend
  const lY = padT + chartH + 40;
  const lX = padL + chartW / 2 - 100;
  ctx.fillStyle = COLOR_INCOME;
  ctx.fillRect(lX, lY - 10, 12, 12);
  ctx.fillStyle = '#1e293b';
  ctx.font      = `12px Inter, sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('Income', lX + 16, lY);

  ctx.fillStyle = COLOR_EXPENSES;
  ctx.fillRect(lX + 90, lY - 10, 12, 12);
  ctx.fillStyle = '#1e293b';
  ctx.fillText('Expenses', lX + 106, lY);
}

function roundRect(ctx, x, y, width, height, radii) {
  if (!Array.isArray(radii)) radii = [radii, radii, radii, radii];
  ctx.beginPath();
  ctx.moveTo(x + radii[0], y);
  ctx.lineTo(x + width - radii[1], y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radii[1]);
  ctx.lineTo(x + width, y + height - radii[2]);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radii[2], y + height);
  ctx.lineTo(x + radii[3], y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radii[3]);
  ctx.lineTo(x, y + radii[0]);
  ctx.quadraticCurveTo(x, y, x + radii[0], y);
  ctx.closePath();
}

// ─── Donut Chart ─────────────────────────────────────────────────────────────
function renderDonutChart(data) {
  const ctx = donutCanvas.getContext('2d');
  const W   = donutCanvas.width  = donutCanvas.offsetWidth  * window.devicePixelRatio;
  const H   = donutCanvas.height = donutCanvas.offsetHeight * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  const w = donutCanvas.offsetWidth;
  const h = donutCanvas.offsetHeight;

  ctx.clearRect(0, 0, w, h);

  const cx    = w / 2;
  const cy    = h / 2;
  const outer = Math.min(w, h) * 0.42;
  const inner = outer * 0.55;

  let startAngle = -Math.PI / 2;

  data.categories.forEach(cat => {
    const slice = (cat.pct / 100) * 2 * Math.PI;

    // Filled arc
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outer, startAngle, startAngle + slice);
    ctx.closePath();
    ctx.fillStyle = cat.color;
    ctx.fill();

    // Gap between slices
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 2;
    ctx.stroke();

    startAngle += slice;
  });

  // Donut hole
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill();

  // Center text
  ctx.fillStyle = '#0f172a';
  ctx.font      = `bold 18px Inter, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('Expenses', cx, cy - 6);
  ctx.font      = `13px Inter, sans-serif`;
  ctx.fillStyle = '#64748b';
  ctx.fillText('by category', cx, cy + 14);

  // Legend
  donutLegend.innerHTML = '';
  data.categories.forEach(cat => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `
      <span class="legend-dot" style="background:${cat.color}"></span>
      <span class="legend-label">${cat.label}</span>
      <span class="legend-pct">${cat.pct}%</span>
    `;
    donutLegend.appendChild(item);
  });
}

// ─── Transactions Table ───────────────────────────────────────────────────────
function renderTransactions(data) {
  txBody.innerHTML = '';
  data.transactions.forEach(tx => {
    const isIncome = tx.amt > 0;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${formatDate(tx.date)}</td>
      <td>${tx.desc}</td>
      <td><span class="cat-badge">${tx.cat}</span></td>
      <td class="tx-amount ${isIncome ? 'income' : 'expense'}">${isIncome ? '+' : ''}${fmt(tx.amt)}</td>
    `;
    txBody.appendChild(tr);
  });
}

function formatDate(str) {
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Master render ────────────────────────────────────────────────────────────
function render() {
  const data = MONTHLY_DATA[currentMonth];
  monthTitle.textContent = MONTH_NAMES[currentMonth - 1] + ' 2026';
  renderKPIs(data);
  renderBarChart(data);
  renderDonutChart(data);
  renderTransactions(data);
}

// ─── Resize handler ────────────────────────────────────────────────────────────
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(render, 120);
});

// ─── Initial render ────────────────────────────────────────────────────────────
render();
