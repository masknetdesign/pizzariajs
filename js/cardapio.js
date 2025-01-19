let allProducts = [];
let filteredProducts = [];
const DEFAULT_IMAGE = 'images/default.jpg';

// Mapeamento de categorias
const categoryMap = {
    'pizza': 'pizzas_tradicionais',
    'bebida': 'bebidas',
    'sobremesa': 'sobremesas'
};

// Função para formatar preço
function formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(price);
}

// Função para adicionar produto ao carrinho
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            description: product.description,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Feedback visual
    const button = document.querySelector(`[data-product-id="${productId}"]`);
    if (button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Adicionado!';
        button.classList.add('added');
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('added');
        }, 1500);
    }
}

// Função para abrir detalhes do produto
function openProductDetails(productId) {
    window.location.href = `detalhes.html?id=${productId}`;
}

// Função para renderizar produtos
function renderProducts(products) {
    console.log('Renderizando produtos:', products);
    const grid = document.getElementById('products-grid');
    
    if (!products || !Array.isArray(products) || products.length === 0) {
        console.log('Nenhum produto para exibir');
        grid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-search"></i>
                <p>Nenhum produto encontrado</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = products.map(product => {
        console.log('Renderizando produto:', product);
        
        // Validar produto
        if (!product || typeof product !== 'object') {
            console.error('Produto inválido:', product);
            return '';
        }

        // Garantir valores padrão seguros
        const safeProduct = {
            id: product.id || 0,
            name: product.name || 'Sem nome',
            description: product.description || '',
            price: parseFloat(product.price || 0),
            image: product.image || DEFAULT_IMAGE,
            category: categoryMap[product.category] || product.category
        };

        // Ajustar caminho da imagem se necessário
        let imageUrl = safeProduct.image;
        if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
            imageUrl = imageUrl; // Já está relativo à raiz do projeto
        }
        
        return `
            <div class="product-card" data-category="${safeProduct.category}" onclick="openProductDetails(${safeProduct.id})">
                <img src="${imageUrl}" 
                     alt="${safeProduct.name}" 
                     onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}';">
                <div class="product-info">
                    <h3>${safeProduct.name}</h3>
                    <p class="description">${safeProduct.description}</p>
                    <div class="price">${formatPrice(safeProduct.price)}</div>
                    <button class="add-to-cart-btn" 
                            data-product-id="${safeProduct.id}" 
                            onclick="event.stopPropagation(); addToCart(${safeProduct.id})">
                        <i class="fas fa-shopping-cart"></i>
                        Adicionar ao Carrinho
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Função para filtrar produtos
function filterProducts(category = 'all', searchTerm = '') {
    console.log('Filtrando produtos:', { category, searchTerm, total: allProducts.length });
    
    filteredProducts = allProducts.filter(product => {
        const productCategory = categoryMap[product.category] || product.category;
        const matchesCategory = category === 'all' || productCategory === category;
        const matchesSearch = !searchTerm || 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });
    
    console.log('Produtos filtrados:', filteredProducts.length);
    renderProducts(filteredProducts);
}

// Função para carregar produtos do banco de dados
async function loadProducts() {
    try {
        console.log('Iniciando carregamento de produtos...');
        const response = await fetch('php/get_products.php');
        
        console.log('Status da resposta:', response.status);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro na resposta:', errorText);
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Resposta não é JSON válido');
        }

        const data = await response.json();
        console.log('Dados recebidos:', data);

        if (!data.success) {
            throw new Error(data.message || 'Erro ao carregar produtos');
        }

        if (!Array.isArray(data.products)) {
            throw new Error('Dados de produtos inválidos');
        }

        console.log('Total de produtos recebidos:', data.products.length);
        allProducts = data.products;
        filterProducts(); // Mostrar todos os produtos inicialmente
        
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        const grid = document.getElementById('products-grid');
        grid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Erro ao carregar produtos: ${error.message}</p>
                <button onclick="loadProducts()" class="retry-btn">
                    <i class="fas fa-sync"></i>
                    Tentar Novamente
                </button>
            </div>
        `;
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, iniciando aplicação...');
    
    // Carregar produtos
    loadProducts();
    
    // Configurar filtros de categoria
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log('Categoria clicada:', button.dataset.category);
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const category = button.dataset.category;
            const searchTerm = document.getElementById('search-input').value;
            filterProducts(category, searchTerm);
        });
    });
    
    // Configurar busca
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        let timeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const activeCategory = document.querySelector('.category-btn.active');
                const category = activeCategory ? activeCategory.dataset.category : 'all';
                console.log('Busca:', { term: e.target.value, category });
                filterProducts(category, e.target.value);
            }, 300);
        });
    }
});
