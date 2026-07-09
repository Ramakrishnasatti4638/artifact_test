const columns = [
  ['sku', 'SKU'],
  ['name', 'Name'],
  ['category', 'Category'],
  ['quantity', 'Quantity'],
  ['minStock', 'Min Stock'],
  ['unitPrice', 'Unit Price'],
  ['supplier', 'Supplier'],
  ['lastUpdated', 'Last Updated'],
];

let products = [];
let lowStock = [];
let movements = [];
let sortKey = 'name';
let sortDirection = 'asc';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

async function api(path, options) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || (data.errors || ['Request failed']).join(', '));
  return data;
}

function sortProducts(rows) {
  return [...rows].sort((a, b) => {
    const first = a[sortKey];
    const second = b[sortKey];
    const modifier = sortDirection === 'asc' ? 1 : -1;
    if (typeof first === 'number' && typeof second === 'number') return (first - second) * modifier;
    return String(first).localeCompare(String(second), undefined, { numeric: true }) * modifier;
  });
}

function renderHeaders() {
  const row = document.getElementById('tableHeaders');
  row.innerHTML = '';
  columns.forEach(([key, label]) => {
    const th = document.createElement('th');
    th.textContent = `${label}${sortKey === key ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ''}`;
    th.addEventListener('click', () => {
      if (sortKey === key) sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      else {
        sortKey = key;
        sortDirection = 'asc';
      }
      renderProducts();
    });
    row.appendChild(th);
  });
  const actionHeader = document.createElement('th');
  actionHeader.textContent = 'Adjust';
  row.appendChild(actionHeader);
}

function renderProducts() {
  renderHeaders();
  const body = document.getElementById('productRows');
  body.innerHTML = '';
  sortProducts(products).forEach((product) => {
    const tr = document.createElement('tr');
    const values = {
      ...product,
      quantity: product.quantity,
      unitPrice: currency.format(product.unitPrice),
      lastUpdated: new Date(product.lastUpdated).toLocaleString(),
    };

    columns.forEach(([key]) => {
      const td = document.createElement('td');
      if (key === 'quantity') {
        const badge = document.createElement('span');
        badge.className = `qty ${product.quantity <= product.minStock ? 'low' : ''}`;
        badge.textContent = product.quantity;
        td.appendChild(badge);
      } else {
        td.textContent = values[key];
      }
      tr.appendChild(td);
    });

    const actions = document.createElement('td');
    actions.className = 'actions';
    const plus = document.createElement('button');
    plus.textContent = '+';
    plus.setAttribute('aria-label', `Restock ${product.name}`);
    plus.addEventListener('click', () => openAdjustModal(product, 1));
    const minus = document.createElement('button');
    minus.textContent = '-';
    minus.className = 'minus';
    minus.setAttribute('aria-label', `Use ${product.name}`);
    minus.addEventListener('click', () => openAdjustModal(product, -1));
    actions.append(plus, minus);
    tr.appendChild(actions);
    body.appendChild(tr);
  });
}

function renderKpis() {
  document.getElementById('totalProducts').textContent = products.length;
  document.getElementById('totalValue').textContent = currency.format(
    products.reduce((sum, product) => sum + product.quantity * product.unitPrice, 0)
  );
  document.getElementById('lowStockCount').textContent = lowStock.length;
}

function renderLowStock() {
  const list = document.getElementById('lowStockList');
  list.innerHTML = lowStock.length ? '' : '<div class="low-item">No low stock items.</div>';
  lowStock.forEach((product) => {
    const item = document.createElement('div');
    item.className = 'low-item';
    item.innerHTML = `<strong>${product.name}</strong><span>${product.sku} · ${product.category}</span><div class="critical">${product.quantity} on hand / min ${product.minStock}</div>`;
    list.appendChild(item);
  });
}

function renderMovements() {
  const list = document.getElementById('movementList');
  list.innerHTML = movements.length ? '' : '<div class="movement">No stock movements yet.</div>';
  movements.forEach((movement) => {
    const product = products.find((row) => row.id === movement.productId);
    const item = document.createElement('div');
    item.className = 'movement';
    item.innerHTML = `<strong>${movement.adjustment > 0 ? '+' : ''}${movement.adjustment} ${product ? product.name : `Product ${movement.productId}`}</strong><span>${movement.reason} · ${new Date(movement.timestamp).toLocaleString()}</span>`;
    list.appendChild(item);
  });
}

async function refresh() {
  [products, lowStock, movements] = await Promise.all([
    api('/api/products'),
    api('/api/products/low-stock'),
    api('/api/stock-movements?limit=8').then((data) => data.data),
  ]);
  renderProducts();
  renderKpis();
  renderLowStock();
  renderMovements();
}

function openAdjustModal(product, direction) {
  document.getElementById('adjustProductId').value = product.id;
  document.getElementById('adjustDirection').value = direction;
  document.getElementById('adjustQuantity').value = '';
  document.getElementById('adjustReason').value = '';
  document.getElementById('modalTitle').textContent = `${direction > 0 ? 'Restock' : 'Use'} ${product.name}`;
  document.getElementById('adjustModal').showModal();
  document.getElementById('adjustQuantity').focus();
}

function closeAdjustModal() {
  document.getElementById('adjustModal').close();
}

function previewImport() {
  const target = document.getElementById('importPreview');
  try {
    const parsed = JSON.parse(document.getElementById('bulkJson').value);
    if (!Array.isArray(parsed)) throw new Error('Input must be a JSON array');
    target.textContent = `Preview: ${parsed.length} rows found\n` + parsed.map((row, index) => `${index + 1}. ${row.sku || 'No SKU'} — ${row.name || 'No name'}`).join('\n');
  } catch (error) {
    target.textContent = `Invalid JSON: ${error.message}`;
  }
}

async function importProducts() {
  const status = document.getElementById('importStatus');
  try {
    const payload = JSON.parse(document.getElementById('bulkJson').value);
    const result = await api('/api/products/bulk-import', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    status.textContent = `Imported ${result.imported}, skipped ${result.skipped}`;
    document.getElementById('importPreview').textContent = result.errors.length ? JSON.stringify(result.errors, null, 2) : 'All rows imported successfully.';
    await refresh();
  } catch (error) {
    status.textContent = error.message;
  }
}

document.getElementById('adjustForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const id = document.getElementById('adjustProductId').value;
  const direction = Number(document.getElementById('adjustDirection').value);
  const quantity = Number(document.getElementById('adjustQuantity').value);
  const reason = document.getElementById('adjustReason').value;
  await api(`/api/products/${id}/adjust`, {
    method: 'POST',
    body: JSON.stringify({ adjustment: quantity * direction, reason }),
  });
  closeAdjustModal();
  await refresh();
});

document.getElementById('closeModal').addEventListener('click', closeAdjustModal);
document.getElementById('cancelAdjust').addEventListener('click', closeAdjustModal);
document.getElementById('previewImport').addEventListener('click', previewImport);
document.getElementById('importProducts').addEventListener('click', importProducts);

previewImport();
refresh().catch((error) => {
  document.getElementById('productRows').innerHTML = `<tr><td colspan="9">${error.message}</td></tr>`;
});
