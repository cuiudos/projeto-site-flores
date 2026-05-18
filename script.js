const PRODUCTS_URL = './produtos.json';
const WHATSAPP_NUMBER = '5531992226115';
const BACKEND_URL = '';
const productsContainer = document.getElementById('products');
const categoryFilter = document.getElementById('categoryFilter');
const purchasePanel = document.getElementById('purchasePanel');
const purchaseProductName = document.getElementById('purchaseProductName');
const purchaseQuantity = document.getElementById('purchaseQuantity');
const purchaseConfirm = document.getElementById('purchaseConfirm');
const closePurchase = document.getElementById('closePurchase');
let allProducts = [];
let selectedProduct = null;

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

async function saveOrder(order) {
  if (!BACKEND_URL) return;
  try {
    await fetch(`${BACKEND_URL}/api/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
  } catch (error) {
    console.warn('Não foi possível salvar pedido no backend:', error);
  }
}

function getProductCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card';

  const image = document.createElement('div');
  image.className = 'product-image';
  image.style.backgroundImage = `url(${product.imagem})`;

  const body = document.createElement('div');
  body.className = 'product-body';

  const title = document.createElement('h3');
  title.textContent = product.nome;

  const description = document.createElement('p');
  description.textContent = product.descricaoCurta || product.descricao;

  const tags = document.createElement('div');
  tags.className = 'product-tags';
  const tag = document.createElement('span');
  tag.className = 'tag';
  tag.textContent = product.categoria;
  tags.appendChild(tag);

  const meta = document.createElement('div');
  meta.className = 'product-meta';

  const price = document.createElement('span');
  price.className = 'product-price';
  price.textContent = formatCurrency(product.preco);

  const actionWrap = document.createElement('div');
  actionWrap.className = 'product-actions';

  const detailsLink = document.createElement('a');
  detailsLink.className = 'button button-secondary';
  detailsLink.textContent = 'Ver detalhes';
  detailsLink.href = `product.html?id=${product.id}`;

  const buyButton = document.createElement('button');
  buyButton.className = 'button';
  buyButton.textContent = 'Comprar agora no WhatsApp';
  buyButton.addEventListener('click', () => handlePurchaseClick(product));

  actionWrap.append(detailsLink, buyButton);
  meta.append(price, actionWrap);
  body.append(title, description, tags, meta);
  card.append(image, body);
  return card;
}

function populateFilter(products) {
  const categories = Array.from(new Set(products.map((item) => item.categoria))).sort();
  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

function filterProducts() {
  const selected = categoryFilter.value;
  const filtered = selected
    ? allProducts.filter((product) => product.categoria === selected)
    : allProducts;
  renderProducts(filtered);
}

function renderProducts(products) {
  productsContainer.innerHTML = '';
  if (products.length === 0) {
    productsContainer.innerHTML = '<p class="empty-state">Nenhum produto encontrado para essa categoria.</p>';
    return;
  }
  products.forEach((product) => productsContainer.appendChild(getProductCard(product)));
}

function buildWhatsAppMessage(product, quantidade) {
  const lines = [
    'Olá, gostaria de fazer um pedido.',
    `Flor: ${product.nome}`,
    `Quantidade: ${quantidade}`,
    `Categoria: ${product.categoria}`,
    `Preço unitário: ${formatCurrency(product.preco)}`,
    `Total: ${formatCurrency(product.preco * quantidade)}`,
  ];

  return encodeURIComponent(lines.join('\n'));
}

function handlePurchaseClick(product) {
  if (!product || !purchasePanel || !purchaseProductName || !purchaseQuantity) return;
  selectedProduct = product;
  purchaseProductName.textContent = product.nome;
  purchaseQuantity.value = '1';
  purchasePanel.classList.remove('hidden');
}

function closePurchasePanel() {
  if (!purchasePanel) return;
  purchasePanel.classList.add('hidden');
  selectedProduct = null;
}

function confirmPurchase() {
  if (!selectedProduct || !purchaseQuantity) return;
  const qtd = parseInt(purchaseQuantity.value, 10);
  if (isNaN(qtd) || qtd < 1) {
    alert('Por favor, insira uma quantidade válida.');
    return;
  }

  const orderData = {
    produtoId: selectedProduct.id,
    produto: selectedProduct.nome,
    categoria: selectedProduct.categoria,
    preco: selectedProduct.preco,
    quantidade: qtd,
    origem: 'site-de-flores',
    data: new Date().toISOString(),
  };

  saveOrder(orderData);

  const message = buildWhatsAppMessage(selectedProduct, qtd);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  window.open(url, '_blank');
  closePurchasePanel();
}

async function loadProducts() {
  if (!productsContainer) return;
  try {
    const response = await fetch(PRODUCTS_URL);
    allProducts = await response.json();
    populateFilter(allProducts);
    renderProducts(allProducts);
  } catch (error) {
    productsContainer.innerHTML = '<p>Não foi possível carregar o catálogo. Atualize a página.</p>';
    console.error(error);
  }
}

if (categoryFilter) {
  categoryFilter.addEventListener('change', filterProducts);
}

if (closePurchase) {
  closePurchase.addEventListener('click', closePurchasePanel);
}

if (purchaseConfirm) {
  purchaseConfirm.addEventListener('click', confirmPurchase);
}

loadProducts();
