let allProducts = [];
let filteredProducts = [];
const DEFAULT_IMAGE = 'images/default-product.jpg';

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
        
        Swal.fire({
            title: 'Produto adicionado ao carrinho!',
            text: 'Você adicionou o produto ao carrinho com sucesso.',
            icon: 'success',
            confirmButtonColor: '#c41230'
        });
    }
}

// Função para renderizar produtos
function renderProducts(products) {
    const grid = document.getElementById('products-grid');
    
    if (!products.length) {
        Swal.fire({
            title: 'Nenhum produto encontrado',
            text: 'Não encontramos produtos com esses critérios de busca',
            icon: 'info',
            confirmButtonColor: '#c41230'
        });
        grid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-search"></i>
                <p>Nenhum produto encontrado</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = products.map(product => {
        // Determinar qual imagem usar
        let imageUrl = product.image;
        if (!imageUrl || imageUrl.trim() === '') {
            imageUrl = DEFAULT_IMAGE;
        }
        
        return `
            <div class="product-card" data-category="${product.category}" onclick="window.location.href='detalhes.html?id=${product.id}'">
                <img src="${imageUrl}" 
                     alt="${product.name}" 
                     onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}';">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="description">${product.description}</p>
                    <div class="price">${formatPrice(product.price)}</div>
                    <button class="add-to-cart-btn" 
                            data-product-id="${product.id}" 
                            onclick="event.stopPropagation(); addToCart(${product.id})">
                        <i class="fas fa-shopping-cart"></i>
                        Adicionar ao Carrinho
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Função para filtrar produtos
function filterProducts(category, searchTerm = '') {
    filteredProducts = allProducts.filter(product => {
        const matchesCategory = category === 'all' || 
            (category === 'pizzas_tradicionais' && product.category === 'pizza') ||
            (category === 'pizzas_especiais' && product.category === 'pizza') ||
            (category === 'bebidas' && product.category === 'bebida') ||
            (category === 'sobremesas' && product.category === 'sobremesa');
            
        const matchesSearch = !searchTerm || 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesCategory && matchesSearch;
    });
    
    renderProducts(filteredProducts);
}

// Função para carregar produtos do banco de dados
async function loadProducts() {
    try {
        console.log('Carregando produtos...');
        const response = await fetch('php/get_products.php');
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Resposta não ok:', response.status, errorText);
            throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Dados recebidos:', data);
        
        if (data.success) {
            allProducts = data.products;
            filteredProducts = [...allProducts];
            renderProducts(filteredProducts);
            
            // Salvar produtos no localStorage para uso na página de detalhes
            localStorage.setItem('pizzas', JSON.stringify(allProducts));
        } else {
            throw new Error(data.message || 'Erro ao carregar produtos');
        }
    } catch (error) {
        console.error('Erro detalhado:', error);
        Swal.fire({
            title: 'Erro ao carregar produtos',
            text: error.message,
            icon: 'error',
            confirmButtonColor: '#c41230'
        });
        document.getElementById('products-grid').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Erro ao carregar produtos: ${error.message}</p>
                <button onclick="loadProducts()" class="add-to-cart-btn">
                    <i class="fas fa-sync"></i>
                    Tentar Novamente
                </button>
            </div>
        `;
    }
}

function navigateToDetails(productId) {
    window.location.href = `detalhes.html?id=${productId}`;
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
            // Atualizar estado dos botões
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filtrar produtos
            const category = button.dataset.category;
            const searchTerm = document.getElementById('search-input').value;
            filterProducts(category, searchTerm);
        });
    });
    
    // Configurar busca
    const searchInput = document.getElementById('search-input');
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const activeCategory = document.querySelector('.category-btn.active').dataset.category;
            filterProducts(activeCategory, e.target.value);
        }, 300);
    });
});

// Dados dos produtos
const PIZZAS = [
    {
        id: 1,
        type: 'pizza',
        name: 'Margherita',
        description: 'Molho de tomate, mussarela, manjericão fresco e azeite',
        category: 'pizza',
        price: 35.00,
        image: 'images/margherita.jpg'
    },
    {
        id: 2,
        type: 'pizza',
        name: 'Pepperoni',
        description: 'Molho de tomate, mussarela e pepperoni',
        category: 'pizza',
        price: 40.00,
        image: 'images/pepperoni.jpg'
    },
    {
        id: 3,
        type: 'pizza',
        name: 'Quatro Queijos',
        description: 'Molho de tomate, mussarela, gorgonzola, parmesão e catupiry',
        category: 'pizza',
        price: 45.00,
        image: 'images/quatro-queijos.jpg'
    },
    {
        id: 4,
        type: 'pizza',
        name: 'Portuguesa',
        description: 'Molho de tomate, mussarela, presunto, ovos, cebola e ervilha',
        category: 'pizza',
        price: 40.00,
        image: 'images/portuguesa.jpg'
    },
    {
        id: 5,
        type: 'pizza',
        name: 'Vegetariana',
        description: 'Molho de tomate, mussarela, champignon, pimentão, cebola e azeitonas',
        category: 'pizza',
        price: 38.00,
        image: 'images/vegetariana.jpg'
    }
];

const BEVERAGES = [
    {
        id: 101,
        type: 'bebida',
        name: 'Coca-Cola',
        description: 'Refrigerante Coca-Cola 2L',
        category: 'bebida',
        price: 12.00,
        image: 'images/coca-cola.jpg'
    },
    {
        id: 102,
        type: 'bebida',
        name: 'Guaraná Antarctica',
        description: 'Refrigerante Guaraná Antarctica 2L',
        category: 'bebida',
        price: 10.00,
        image: 'images/guarana.jpg'
    },
    {
        id: 103,
        type: 'bebida',
        name: 'Suco de Laranja',
        description: 'Suco natural de laranja 500ml',
        category: 'bebida',
        price: 8.00,
        image: 'images/suco-laranja.jpg'
    },
    {
        id: 104,
        type: 'bebida',
        name: 'Água Mineral',
        description: 'Água mineral sem gás 500ml',
        category: 'bebida',
        price: 4.00,
        image: 'images/agua.jpg'
    }
];

const DESSERTS = [
    {
        id: 201,
        type: 'sobremesa',
        name: 'Petit Gateau',
        description: 'Bolo de chocolate quente com sorvete de baunilha',
        category: 'sobremesa',
        price: 18.00,
        image: 'images/petit-gateau.jpg'
    },
    {
        id: 202,
        type: 'sobremesa',
        name: 'Pudim',
        description: 'Pudim de leite condensado tradicional',
        category: 'sobremesa',
        price: 12.00,
        image: 'images/pudim.jpg'
    },
    {
        id: 203,
        type: 'sobremesa',
        name: 'Sorvete',
        description: 'Duas bolas de sorvete com calda de chocolate',
        category: 'sobremesa',
        price: 10.00,
        image: 'images/sorvete.jpg'
    }
];

// Função para carregar produtos do banco de dados
async function loadProducts() {
    try {
        console.log('Carregando produtos...');
        const response = await fetch('php/get_products.php');
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Resposta não ok:', response.status, errorText);
            throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Dados recebidos:', data);
        
        if (data.success) {
            allProducts = [...PIZZAS, ...BEVERAGES, ...DESSERTS];
            filteredProducts = [...allProducts];
            renderProducts(filteredProducts);
            
            // Salvar produtos no localStorage para uso na página de detalhes
            localStorage.setItem('pizzas', JSON.stringify(allProducts));
        } else {
            throw new Error(data.message || 'Erro ao carregar produtos');
        }
    } catch (error) {
        console.error('Erro detalhado:', error);
        Swal.fire({
            title: 'Erro ao carregar produtos',
            text: error.message,
            icon: 'error',
            confirmButtonColor: '#c41230'
        });
        document.getElementById('products-grid').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Erro ao carregar produtos: ${error.message}</p>
                <button onclick="loadProducts()" class="add-to-cart-btn">
                    <i class="fas fa-sync"></i>
                    Tentar Novamente
                </button>
            </div>
        `;
    }
}
