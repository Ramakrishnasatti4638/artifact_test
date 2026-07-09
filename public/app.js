'use strict';
/* ═══════════════════════════════════════════════════════════════════════════
   InvenTrack — Frontend Application
   ═══════════════════════════════════════════════════════════════════════════ */

const API = '';    // same origin

// ─── State ───────────────────────────────────────────────────────────────────
const state = {
  products:        [],
  lowStock:        [],
  movements:       [],
  movementsTotal:  0,
  movementsPage:   1,
  movementProduct: '',
  sort:            { col: 'name', dir: 'asc' },
  search:          '',
  category:        '',
  editingId:       null,
  adjustId:        null,
  deleteId:        null,
  adjSign:         1,
};

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  bindNav();
  bindProductModal();
  bindAdjustModal();
  bindDeleteModal();
  bindSearch();
  bindMovements();
  bindBulkImport();
  loadAll();
});

async function loadAll() {
  await Promise.all([fetchProducts(), fetchLowStock(), fetchMovements()]);
  updateKPIs();
}

// ─── Navigation ──────────────────────────────────────────────────────────────
function bindNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const view = btn.dataset.view;
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById('view-' + view).classList.add('active');
      if (view === 'movements') fetchMovements();
    });
  });
}

// ─── API helpers ─────────────────────────────────────────────────────────────
async function apiFetch(url, opts = {}) {
  const res = await fetch(API + url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data;
  return data;
}

// ─── Products ─────────────────────────────────────────────────────────────────
async function fetchProducts() {
  state.products = await apiFetch('/api/products');
  renderTable();
  populateCategoryFilter();
  populateMovementProductFilter();
}

async function fetchLowStock() {
  state.lowStock = await apiFetch('/api/products/low-stock');
  renderLowStockPanel();
}

// ─── Render Table ─────────────────────────────────────────────────────────────
function renderTable() {
  const tbody = document.getElementById('inv-tbody');
  const emptyEl = document.getElementById('inv-empty');

  let data = [...state.products];

  // filter
  if (state.search) {
    const q = state.search.toLowerCase();
    data = data.filter(p =>
      p.sku.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.supplier.toLowerCase().includes(q)
    );
  }
  if (state.category) {
    data = data.filter(p => p.category === state.category);
  }

  // sort
  const { col, dir } = state.sort;
  data.sort((a, b) => {
    let va = a[col], vb = b[col];
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return dir === 'asc' ? -1 : 1;
    if (va > vb) return dir === 'asc' ? 1 : -1;
    return 0;
  });

  // update sort icons
  document.querySelectorAll('#inv-table th.sortable').forEach(th => {
    th.classList.remove('sort-asc', 'sort-desc');
    if (th.dataset.col === col) th.classList.add('sort-' + dir);
  });

  tbody.innerHTML = '';

  if (!data.length) {
    emptyEl.style.display = '';
    return;
  }
  emptyEl.style.display = 'none';

  data.forEach(p => {
    const isLow = p.quantity <= p.minStock;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><code style="font-size:12px;color:var(--text-muted)">${esc(p.sku)}</code></td>
      <td style="font-weight:600;">${esc(p.name)}</td>
      <td><span style="background:var(--surface2);padding:2px 8px;border-radius:99px;font-size:11px;">${esc(p.category)}</span></td>
      <td>
        <span class="qty-cell ${isLow ? 'low-stock' : 'ok'}">
          ${p.quantity}
          <span class="qty-badge ${isLow ? 'low' : 'ok'}">${isLow ? '↓ LOW' : '✓ OK'}</span>
        </span>
      </td>
      <td style="color:var(--text-muted)">${p.minStock}</td>
      <td>$${p.unitPrice.toFixed(2)}</td>
      <td style="color:var(--text-muted);font-size:12px;">${esc(p.supplier)}</td>
      <td style="color:var(--text-muted);font-size:12px;">${fmtDate(p.lastUpdated)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon adj"   title="Adjust Stock"  data-id="${p.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button class="btn-icon edit"  title="Edit Product"  data-id="${p.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon del"   title="Delete"        data-id="${p.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });

  // delegate action buttons
  tbody.querySelectorAll('.btn-icon.adj').forEach(b =>
    b.addEventListener('click', () => openAdjustModal(b.dataset.id)));
  tbody.querySelectorAll('.btn-icon.edit').forEach(b =>
    b.addEventListener('click', () => openEditModal(b.dataset.id)));
  tbody.querySelectorAll('.btn-icon.del').forEach(b =>
    b.addEventListener('click', () => openDeleteModal(b.dataset.id)));
}

// Column sort
document.querySelectorAll('#inv-table th.sortable').forEach(th => {
  th.addEventListener('click', () => {
    const col = th.dataset.col;
    if (state.sort.col === col) {
      state.sort.dir = state.sort.dir === 'asc' ? 'desc' : 'asc';
    } else {
      state.sort.col = col;
      state.sort.dir = 'asc';
    }
    renderTable();
  });
});

// ─── Low Stock Panel ──────────────────────────────────────────────────────────
function renderLowStockPanel() {
  const list  = document.getElementById('low-stock-list');
  const count = document.getElementById('low-stock-count');
  count.textContent = state.lowStock.length;

  if (!state.lowStock.length) {
    list.innerHTML = '<div class="low-stock-empty">All stocked up!</div>';
    return;
  }

  list.innerHTML = state.lowStock.map(p => {
    const deficit = p.minStock - p.quantity;
    const critical = deficit > 30 || p.quantity === 0;
    return `<div class="low-stock-item${critical ? ' critical' : ''}" data-id="${p.id}">
      <div class="ls-name">${esc(p.name)}</div>
      <div class="ls-sku">${esc(p.sku)} · ${esc(p.category)}</div>
      <div class="ls-qty">
        <span>Qty: <span class="ls-qty-val">${p.quantity}</span></span>
        <span>Min: <span class="ls-min-val">${p.minStock}</span></span>
      </div>
    </div>`;
  }).join('');

  list.querySelectorAll('.low-stock-item').forEach(el =>
    el.addEventListener('click', () => openAdjustModal(el.dataset.id)));
}

// ─── KPIs ─────────────────────────────────────────────────────────────────────
function updateKPIs() {
  document.getElementById('kpi-total').textContent = state.products.length;
  const total = state.products.reduce((s, p) => s + p.quantity * p.unitPrice, 0);
  document.getElementById('kpi-value').textContent = '$' + total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.getElementById('kpi-low').textContent   = state.lowStock.length;
  document.getElementById('kpi-movements').textContent = state.movementsTotal;
}

// ─── Search / Filter ─────────────────────────────────────────────────────────
function bindSearch() {
  document.getElementById('search-input').addEventListener('input', e => {
    state.search = e.target.value.trim();
    renderTable();
  });
  document.getElementById('category-filter').addEventListener('change', e => {
    state.category = e.target.value;
    renderTable();
  });
}

function populateCategoryFilter() {
  const sel  = document.getElementById('category-filter');
  const curr = sel.value;
  const cats = [...new Set(state.products.map(p => p.category))].sort();
  sel.innerHTML = '<option value="">All Categories</option>' +
    cats.map(c => `<option value="${esc(c)}" ${c === curr ? 'selected' : ''}>${esc(c)}</option>`).join('');
}

function populateMovementProductFilter() {
  const sel  = document.getElementById('movement-product-filter');
  const curr = state.movementProduct;
  sel.innerHTML = '<option value="">All Products</option>' +
    state.products.map(p =>
      `<option value="${p.id}" ${p.id === curr ? 'selected' : ''}>${esc(p.sku)} — ${esc(p.name)}</option>`
    ).join('');
}

// ─── Stock Movements ──────────────────────────────────────────────────────────
function bindMovements() {
  document.getElementById('btn-refresh-movements').addEventListener('click', () => fetchMovements());
  document.getElementById('movement-product-filter').addEventListener('change', e => {
    state.movementProduct = e.target.value;
    state.movementsPage = 1;
    fetchMovements();
  });
}

async function fetchMovements() {
  const params = new URLSearchParams({ page: state.movementsPage, limit: 20 });
  if (state.movementProduct) params.set('productId', state.movementProduct);

  const data = await apiFetch('/api/stock-movements?' + params.toString());
  state.movements      = data.data;
  state.movementsTotal = data.total;
  renderMovements(data);
  updateKPIs();
}

function renderMovements({ data, total, page, limit }) {
  const tbody = document.getElementById('movements-tbody');
  const emptyEl = document.getElementById('movements-empty');
  const pagination = document.getElementById('movements-pagination');

  tbody.innerHTML = '';
  if (!data.length) {
    emptyEl.style.display = '';
    pagination.innerHTML  = '';
    return;
  }
  emptyEl.style.display = 'none';

  data.forEach(m => {
    const tr = document.createElement('tr');
    const cls = m.adjustment > 0 ? 'adj-positive' : 'adj-negative';
    const sign = m.adjustment > 0 ? '+' : '';
    tr.innerHTML = `
      <td style="color:var(--text-muted);font-size:12px;">${fmtDateFull(m.timestamp)}</td>
      <td><code style="font-size:12px;color:var(--text-muted)">${esc(m.sku)}</code></td>
      <td style="font-weight:600;">${esc(m.productName)}</td>
      <td class="${cls}">${sign}${m.adjustment}</td>
      <td style="color:var(--text-muted);font-size:13px;">${esc(m.reason)}</td>`;
    tbody.appendChild(tr);
  });

  // Pagination
  const pages = Math.ceil(total / limit);
  pagination.innerHTML = '';
  if (pages <= 1) return;

  const prev = document.createElement('button');
  prev.className = 'page-btn';
  prev.textContent = '‹ Prev';
  prev.disabled = page <= 1;
  prev.addEventListener('click', () => { state.movementsPage = page - 1; fetchMovements(); });
  pagination.appendChild(prev);

  for (let i = 1; i <= pages; i++) {
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (i === page ? ' active' : '');
    btn.textContent = i;
    btn.addEventListener('click', () => { state.movementsPage = i; fetchMovements(); });
    pagination.appendChild(btn);
  }

  const next = document.createElement('button');
  next.className = 'page-btn';
  next.textContent = 'Next ›';
  next.disabled = page >= pages;
  next.addEventListener('click', () => { state.movementsPage = page + 1; fetchMovements(); });
  pagination.appendChild(next);
}

// ─── Product Modal (Add / Edit) ───────────────────────────────────────────────
function bindProductModal() {
  document.getElementById('btn-add-product').addEventListener('click', openAddModal);
  document.getElementById('modal-close').addEventListener('click',   closeProductModal);
  document.getElementById('modal-cancel').addEventListener('click',  closeProductModal);
  document.getElementById('product-form').addEventListener('submit', submitProductForm);
  document.getElementById('product-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeProductModal();
  });
}

function openAddModal() {
  state.editingId = null;
  document.getElementById('modal-title').textContent = 'Add Product';
  document.getElementById('modal-submit').textContent = 'Add Product';
  document.getElementById('product-form').reset();
  document.getElementById('product-form-error').style.display = 'none';
  document.getElementById('product-modal').classList.add('open');
}

function openEditModal(id) {
  const p = state.products.find(p => p.id === id);
  if (!p) return;
  state.editingId = id;
  document.getElementById('modal-title').textContent = 'Edit Product';
  document.getElementById('modal-submit').textContent = 'Save Changes';
  document.getElementById('product-form-error').style.display = 'none';
  const form = document.getElementById('product-form');
  form.sku.value       = p.sku;
  form.name.value      = p.name;
  form.category.value  = p.category;
  form.supplier.value  = p.supplier;
  form.quantity.value  = p.quantity;
  form.minStock.value  = p.minStock;
  form.unitPrice.value = p.unitPrice;
  document.getElementById('product-modal').classList.add('open');
}

function closeProductModal() {
  document.getElementById('product-modal').classList.remove('open');
}

async function submitProductForm(e) {
  e.preventDefault();
  const form  = e.target;
  const btn   = document.getElementById('modal-submit');
  const errEl = document.getElementById('product-form-error');

  const payload = {
    sku:       form.sku.value.trim(),
    name:      form.name.value.trim(),
    category:  form.category.value.trim(),
    supplier:  form.supplier.value.trim(),
    quantity:  Number(form.quantity.value),
    minStock:  Number(form.minStock.value),
    unitPrice: Number(form.unitPrice.value),
  };

  btn.disabled = true;
  errEl.style.display = 'none';

  try {
    if (state.editingId) {
      await apiFetch('/api/products/' + state.editingId, { method: 'PUT', body: JSON.stringify(payload) });
      toast('Product updated', 'success');
    } else {
      await apiFetch('/api/products', { method: 'POST', body: JSON.stringify(payload) });
      toast('Product added', 'success');
    }
    closeProductModal();
    await loadAll();
  } catch (err) {
    const msg = err.errors ? err.errors.join(', ') : (err.error || 'An error occurred');
    errEl.textContent    = msg;
    errEl.style.display  = '';
  } finally {
    btn.disabled = false;
  }
}

// ─── Adjust Modal ─────────────────────────────────────────────────────────────
function bindAdjustModal() {
  document.getElementById('adjust-close').addEventListener('click',   closeAdjustModal);
  document.getElementById('adjust-cancel').addEventListener('click',  closeAdjustModal);
  document.getElementById('adjust-confirm').addEventListener('click', submitAdjustment);
  document.getElementById('adjust-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeAdjustModal();
  });
  document.getElementById('adj-restock').addEventListener('click', () => setAdjSign(1));
  document.getElementById('adj-usage').addEventListener('click',   () => setAdjSign(-1));
}

function setAdjSign(sign) {
  state.adjSign = sign;
  document.getElementById('adj-restock').classList.toggle('active', sign ===  1);
  document.getElementById('adj-usage').classList.toggle('active',   sign === -1);
}

function openAdjustModal(id) {
  const p = state.products.find(p => p.id === id);
  if (!p) return;
  state.adjustId = id;
  setAdjSign(1);
  document.getElementById('adj-qty').value    = 1;
  document.getElementById('adj-reason').value = '';
  document.getElementById('adjust-error').style.display = 'none';
  document.getElementById('adjust-product-info').innerHTML = `
    <div class="prod-name">${esc(p.name)}</div>
    <div class="prod-meta">${esc(p.sku)} · Current stock: <strong>${p.quantity}</strong> · Min: ${p.minStock}</div>`;
  document.getElementById('adjust-modal').classList.add('open');
}

function closeAdjustModal() {
  document.getElementById('adjust-modal').classList.remove('open');
}

async function submitAdjustment() {
  const qty    = Number(document.getElementById('adj-qty').value);
  const reason = document.getElementById('adj-reason').value.trim();
  const errEl  = document.getElementById('adjust-error');

  if (!qty || qty <= 0) {
    errEl.textContent = 'Quantity must be greater than 0';
    errEl.style.display = '';
    return;
  }
  if (!reason) {
    errEl.textContent = 'Reason is required';
    errEl.style.display = '';
    return;
  }

  const btn = document.getElementById('adjust-confirm');
  btn.disabled = true;
  errEl.style.display = 'none';

  try {
    await apiFetch('/api/products/' + state.adjustId + '/adjust', {
      method: 'POST',
      body: JSON.stringify({ adjustment: state.adjSign * qty, reason }),
    });
    toast(`Stock adjusted by ${state.adjSign > 0 ? '+' : ''}${state.adjSign * qty}`, 'success');
    closeAdjustModal();
    await loadAll();
  } catch (err) {
    errEl.textContent   = err.error || 'Adjustment failed';
    errEl.style.display = '';
  } finally {
    btn.disabled = false;
  }
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function bindDeleteModal() {
  document.getElementById('delete-close').addEventListener('click',  closeDeleteModal);
  document.getElementById('delete-cancel').addEventListener('click', closeDeleteModal);
  document.getElementById('delete-confirm').addEventListener('click', confirmDelete);
  document.getElementById('delete-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeDeleteModal();
  });
}

function openDeleteModal(id) {
  const p = state.products.find(p => p.id === id);
  if (!p) return;
  state.deleteId = id;
  document.getElementById('delete-msg').textContent =
    `Delete "${p.name}" (${p.sku})? This action cannot be undone.`;
  document.getElementById('delete-modal').classList.add('open');
}

function closeDeleteModal() {
  document.getElementById('delete-modal').classList.remove('open');
}

async function confirmDelete() {
  const btn = document.getElementById('delete-confirm');
  btn.disabled = true;
  try {
    await apiFetch('/api/products/' + state.deleteId, { method: 'DELETE' });
    toast('Product deleted', 'info');
    closeDeleteModal();
    await loadAll();
  } catch (err) {
    toast(err.error || 'Delete failed', 'error');
  } finally {
    btn.disabled = false;
  }
}

// ─── Bulk Import ──────────────────────────────────────────────────────────────
function bindBulkImport() {
  document.getElementById('btn-parse-preview').addEventListener('click', parsePreview);
  document.getElementById('btn-run-import').addEventListener('click',   runImport);
}

function parsePreview() {
  const raw     = document.getElementById('import-textarea').value.trim();
  const preview = document.getElementById('import-preview');
  const runBtn  = document.getElementById('btn-run-import');
  const result  = document.getElementById('import-result');
  result.style.display = 'none';

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    preview.innerHTML = `<div style="color:var(--danger);font-size:13px;">Invalid JSON: ${esc(e.message)}</div>`;
    runBtn.disabled = true;
    return;
  }

  if (!Array.isArray(parsed) || !parsed.length) {
    preview.innerHTML = `<div style="color:var(--danger);font-size:13px;">Expected a non-empty JSON array.</div>`;
    runBtn.disabled = true;
    return;
  }

  const required = ['sku', 'name', 'category', 'quantity', 'minStock', 'unitPrice', 'supplier'];
  let validCount = 0;

  preview.innerHTML = parsed.map((item, i) => {
    const missing = required.filter(k => item[k] === undefined || item[k] === null || item[k] === '');
    const numInvalid = ['quantity', 'minStock', 'unitPrice'].filter(k => item[k] !== undefined && isNaN(Number(item[k])));
    const errors = [
      ...missing.map(k => `Missing: ${k}`),
      ...numInvalid.map(k => `Invalid number: ${k}`),
    ];
    if (!errors.length) validCount++;
    return `<div class="import-preview-item ${errors.length ? 'invalid' : 'valid'}">
      <div class="import-item-name">#${i + 1} — ${esc(String(item.sku || '(no sku)'))} ${item.name ? '— ' + esc(item.name) : ''}</div>
      ${errors.length ? `<div class="import-item-errors">⚠ ${errors.join(' · ')}</div>` : '<div style="color:var(--success);font-size:11px;">✓ Valid</div>'}
    </div>`;
  }).join('');

  runBtn.disabled = validCount === 0;
}

async function runImport() {
  const raw    = document.getElementById('import-textarea').value.trim();
  const result = document.getElementById('import-result');
  const runBtn = document.getElementById('btn-run-import');
  runBtn.disabled = true;

  let parsed;
  try { parsed = JSON.parse(raw); } catch { return; }

  try {
    const res = await apiFetch('/api/products/bulk-import', {
      method: 'POST',
      body: JSON.stringify(parsed),
    });

    result.style.display = '';
    result.innerHTML = `
      <div class="import-result-row">
        <div class="import-result-stat">Imported: <span class="ok">${res.imported}</span></div>
        <div class="import-result-stat">Skipped: <span class="err">${res.skipped}</span></div>
        <div class="import-result-stat">Total: <span>${parsed.length}</span></div>
      </div>
      ${res.errors.length ? `<div class="import-result-errors">${res.errors.map(e => `Row ${e.row} (${e.sku || 'no-sku'}): ${e.errors.join(', ')}`).join('<br>')}</div>` : ''}`;

    toast(`Imported ${res.imported} product${res.imported !== 1 ? 's' : ''}`, res.imported > 0 ? 'success' : 'error');
    await loadAll();
  } catch (err) {
    toast(err.error || 'Import failed', 'error');
  } finally {
    runBtn.disabled = false;
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtDateFull(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => {
    el.style.animation = 'toast-out .3s ease forwards';
    setTimeout(() => el.remove(), 300);
  }, 3000);
}
