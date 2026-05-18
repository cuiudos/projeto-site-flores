const PRODUCTS_URL = './produtos.json';
const WHATSAPP_NUMBER = '5531992226115';
const BACKEND_URL = '';
const productDetail = document.getElementById('productDetail');

function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

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

function renderProduct(product) {
  if (!product) {
    productDetail.innerHTML = '<div class="empty-state"><h2>Produto não encontrado.</h2><p>Verifique se você acessou pelo catálogo ou tente outro item.</p></div>';
    return;
  }

  productDetail.innerHTML = `
    <article class="product-detail-card">
      <div class="detail-image" style="background-image:url(${product.imagem})"></div>
      <div class="detail-content">
        <span class="tag">${product.categoria}</span>
        <h2>${product.nome}</h2>
        <p class="detail-description">${product.descricao}</p>
        <div class="detail-info">
          <div><strong>Preço:</strong> ${formatCurrency(product.preco)}</div>
          <div><strong>Disponibilidade:</strong> ${product.disponibilidade}</div>
        </div>
        <div class="purchase-section">
          <label>Quantidade
            <input type="number" id="quantidade" min="1" value="1" />
          </label>
          <button class="button button-full" id="buyButton">Comprar agora no WhatsApp</button>
        </div>
      </div>
    </article>
  `;

  const quantidadeInput = document.getElementById('quantidade');
  const buyButton = document.getElementById('buyButton');
  
  buyButton.addEventListener('click', () => {
    const quantidade = parseInt(quantidadeInput.value, 10);
    
    if (isNaN(quantidade) || quantidade < 1) {
      alert('Por favor, insira uma quantidade válida.');
      return;
    }
    
    // Salvar pedido no backend
    const orderData = {
      produtoId: product.id,
      produto: product.nome,
      categoria: product.categoria,
      preco: product.preco,
      quantidade: quantidade,
      origem: 'site-de-flores-detail',
      data: new Date().toISOString(),
    };
    
    saveOrder(orderData);
    
    const message = buildWhatsAppMessage(product, quantidade);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(url, '_blank');
  });
}

async function loadProduct() {
  const id = getProductId();
  if (!id) {
    productDetail.innerHTML = '<div class="empty-state"><h2>ID do produto não encontrado.</h2><p>Use o catálogo para abrir a página de detalhes.</p></div>';
    return;
  }

  try {
    const response = await fetch(PRODUCTS_URL);
    const products = await response.json();
    const product = products.find((item) => String(item.id) === String(id));
    renderProduct(product);
  } catch (error) {
    productDetail.innerHTML = '<div class="empty-state"><h2>Erro ao carregar produto.</h2><p>Tente recarregar a página.</p></div>';
    console.error(error);
  }
}

loadProduct();
