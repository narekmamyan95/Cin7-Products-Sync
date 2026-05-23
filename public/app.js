const syncButton = document.querySelector('#syncButton');
const syncStatus = document.querySelector('#syncStatus');
const productsTable = document.querySelector('#productsTable');
const prevPageButton = document.querySelector('#prevPageButton');
const nextPageButton = document.querySelector('#nextPageButton');
const paginationStatus = document.querySelector('#paginationStatus');

const PRODUCTS_PER_PAGE = 20;

const API_ENDPOINTS = {
  products: (page) => `/products?page=${page}&limit=${PRODUCTS_PER_PAGE}`,
  sync: '/sync',
  syncStatus: '/sync/status'
};

const CIN7_PRODUCT_URL = 'https://inventory.dearsystems.com/Product';
const POLLING_INTERVAL_MS = 20000;

const SYNC_MESSAGES = {
  idle: 'No synchronization has been started yet',
  running: 'Synchronization in progress',
  completed: 'Last successful update',
  failed: 'Synchronization failed'
};

const EMPTY_PRODUCTS_MESSAGE = 'Products will appear here after synchronization.';

let pollingTimer = null;
let currentPage = 1;
let totalPages = 1;

const formatPrice = (price) => {
  if (price === null || price === undefined || Number.isNaN(Number(price))) {
    return '\u20ac0.00';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR'
  }).format(Number(price));
};

const formatDateTime = (value) => {
  if (!value) return '';

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(value));
};

const getCin7Url = (product) => {
  return product.cin7Url || `${CIN7_PRODUCT_URL}#${product.cin7Id}`;
};

const createProductRow = (product) => {
  const row = document.createElement('div');
  row.className = 'products-row product-row';
  row.setAttribute('role', 'row');

  const skuCell = document.createElement('div');
  skuCell.className = 'product-main';
  skuCell.setAttribute('role', 'cell');

  const skuLink = document.createElement('a');
  skuLink.className = 'product-link';
  skuLink.href = getCin7Url(product);
  skuLink.target = '_blank';
  skuLink.rel = 'noreferrer';
  skuLink.textContent = product.sku || product.name || 'No SKU';

  const brand = document.createElement('span');
  brand.className = 'product-brand';
  brand.textContent = product.brand || 'No brand';

  skuCell.append(skuLink, brand);

  const nameCell = document.createElement('div');
  nameCell.className = 'product-main';
  nameCell.setAttribute('role', 'cell');

  const name = document.createElement('span');
  name.className = 'product-name';
  name.textContent = product.name || product.sku || 'Unnamed product';
  nameCell.append(name);

  const priceCell = document.createElement('div');
  priceCell.className = 'product-price';
  priceCell.setAttribute('role', 'cell');
  priceCell.textContent = formatPrice(product.price);

  row.append(skuCell, nameCell, priceCell);
  return row;
};

const renderProducts = (products) => {
  if (!productsTable) return;

  productsTable.replaceChildren();

  if (!products.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = EMPTY_PRODUCTS_MESSAGE;
    productsTable.append(empty);
    return;
  }

  products.forEach((product) => {
    productsTable.append(createProductRow(product));
  });
};

const updatePaginationUi = ({ total, page, limit }) => {
  currentPage = page;
  totalPages = Math.max(1, Math.ceil(total / limit));

  if (paginationStatus) {
    paginationStatus.textContent = `Page ${currentPage} of ${totalPages}`;
  }

  if (prevPageButton) {
    prevPageButton.disabled = currentPage <= 1;
  }

  if (nextPageButton) {
    nextPageButton.disabled = currentPage >= totalPages;
  }
};

const setSyncStatus = (message, type = 'success') => {
  if (!syncStatus) return;

  const dotClass =
    type === 'loading'
      ? 'status-dot status-dot--loading'
      : type === 'error'
        ? 'status-dot status-dot--error'
        : 'status-dot';

  syncStatus.innerHTML = `<span class="${dotClass}" aria-hidden="true"></span><span>${message}</span>`;
};

const updateSyncUi = (state) => {
  if (!syncButton) return;

  if (state.status === 'RUNNING') {
    syncButton.disabled = true;
    setSyncStatus(
      `${SYNC_MESSAGES.running}: ${state.totalFetched} fetched, ${state.totalSaved} saved`,
      'loading'
    );
    return;
  }

  syncButton.disabled = false;

  if (state.status === 'COMPLETED') {
    setSyncStatus(`${SYNC_MESSAGES.completed}: ${formatDateTime(state.finishedAt)}`, 'success');
    return;
  }

  if (state.status === 'FAILED') {
    setSyncStatus(`${SYNC_MESSAGES.failed}: ${state.errorMessage || 'unknown error'}`, 'error');
    return;
  }

  setSyncStatus(SYNC_MESSAGES.idle, 'success');
};

const loadProducts = async (page = currentPage) => {
  const response = await fetch(API_ENDPOINTS.products(page));

  if (!response.ok) {
    throw new Error('Unable to load products');
  }

  const data = await response.json();
  renderProducts(Array.isArray(data.items) ? data.items : []);
  updatePaginationUi({
    total: Number(data.total) || 0,
    page: Number(data.page) || 1,
    limit: Number(data.limit) || PRODUCTS_PER_PAGE
  });
};

const loadSyncStatus = async () => {
  const response = await fetch(API_ENDPOINTS.syncStatus);

  if (!response.ok) {
    throw new Error('Unable to load sync status');
  }

  const state = await response.json();
  updateSyncUi(state);
  return state;
};

const stopPolling = () => {
  if (!pollingTimer) return;

  clearInterval(pollingTimer);
  pollingTimer = null;
};

const pollSyncStatus = async () => {
  try {
    const state = await loadSyncStatus();

    if (state.status === 'COMPLETED') {
      stopPolling();
      await loadProducts(1);
    }

    if (state.status === 'FAILED') {
      stopPolling();
    }
  } catch {
    stopPolling();
    if (syncButton) {
      syncButton.disabled = false;
    }
    setSyncStatus('Unable to load sync status', 'error');
  }
};

const startPolling = () => {
  stopPolling();
  void pollSyncStatus();
  pollingTimer = setInterval(() => {
    void pollSyncStatus();
  }, POLLING_INTERVAL_MS);
};

syncButton?.addEventListener('click', async () => {
  syncButton.disabled = true;
  setSyncStatus(SYNC_MESSAGES.running, 'loading');

  try {
    const response = await fetch(API_ENDPOINTS.sync, { method: 'POST' });

    if (!response.ok) {
      throw new Error('Sync request failed');
    }

    startPolling();
  } catch {
    syncButton.disabled = false;
    setSyncStatus(SYNC_MESSAGES.failed, 'error');
  }
});

prevPageButton?.addEventListener('click', () => {
  if (currentPage <= 1) return;
  void loadProducts(currentPage - 1);
});

nextPageButton?.addEventListener('click', () => {
  if (currentPage >= totalPages) return;
  void loadProducts(currentPage + 1);
});

void (async () => {
  try {
    await Promise.all([loadProducts(), loadSyncStatus()]);
  } catch {
    renderProducts([]);
    setSyncStatus('Unable to load initial data', 'error');
  }
})();
