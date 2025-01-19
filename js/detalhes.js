document.addEventListener('DOMContentLoaded', () => {
    loadProductDetails();
    setupQuantityControls();
});

const DEFAULT_IMAGE = 'images/default.jpg';

// Configuração de preços
const SIZES = {
    'pequena': { price: 25.00, size: '25cm', slices: 4 },
    'media': { price: 35.00, size: '35cm', slices: 6 },
    'grande': { price: 45.00, size: '45cm', slices: 8 }
};

const BORDERS = {
    'tradicional': { price: 0, name: 'Tradicional' },
    'catupiry': { price: 5.00, name: 'Catupiry' },
    'cheddar': { price: 5.00, name: 'Cheddar' }
};

// Função para formatar preço
function formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(price);
}

// Configurar controles de quantidade
function setupQuantityControls() {
    const quantityInput = document.getElementById('quantity');
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const plusBtn = document.querySelector('.quantity-btn.plus');

    minusBtn.addEventListener('click', () => {
        if (quantityInput.value > 1) {
            quantityInput.value = parseInt(quantityInput.value) - 1;
            updateTotal();
        }
    });

    plusBtn.addEventListener('click', () => {
        if (quantityInput.value < 10) {
            quantityInput.value = parseInt(quantityInput.value) + 1;
            updateTotal();
        }
    });

    quantityInput.addEventListener('change', () => {
        let value = parseInt(quantityInput.value);
        if (isNaN(value) || value < 1) value = 1;
        if (value > 10) value = 10;
        quantityInput.value = value;
        updateTotal();
    });
}

// Função para atualizar o total
function updateTotal() {
    const product = window.currentProduct;
    if (!product) return;

    const quantity = parseInt(document.getElementById('quantity').value);
    let total = 0;

    if (product.category === 'pizza') {
        const selectedSize = document.querySelector('input[name="size"]:checked').value;
        const selectedBorder = document.querySelector('input[name="border"]:checked').value;
        total = (SIZES[selectedSize].price + BORDERS[selectedBorder].price) * quantity;
    } else {
        total = product.price * quantity;
    }

    document.querySelector('.total-price').textContent = formatPrice(total);
}

// Função para adicionar ao carrinho
function addToCart() {
    const product = window.currentProduct;
    if (!product) return;

    const quantity = parseInt(document.getElementById('quantity').value);
    let cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        description: product.description,
        quantity: quantity
    };

    if (product.category === 'pizza') {
        const selectedSize = document.querySelector('input[name="size"]:checked').value;
        const selectedBorder = document.querySelector('input[name="border"]:checked').value;
        
        cartItem = {
            ...cartItem,
            size: SIZES[selectedSize].size,
            slices: SIZES[selectedSize].slices,
            border: BORDERS[selectedBorder].name,
            price: SIZES[selectedSize].price + BORDERS[selectedBorder].price
        };
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Feedback visual
    Swal.fire({
        title: 'Produto Adicionado!',
        text: 'O item foi adicionado ao seu carrinho',
        icon: 'success',
        confirmButtonText: 'Continuar Comprando',
        showCancelButton: true,
        cancelButtonText: 'Ir para o Carrinho',
        confirmButtonColor: '#c41230',
        cancelButtonColor: '#333'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = 'cardapio.html';
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            window.location.href = 'carrinho.html';
        }
    });
}

// Função para carregar detalhes do produto
async function loadProductDetails() {
    try {
        // Pegar ID do produto da URL
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        if (!productId) {
            throw new Error('ID do produto não especificado');
        }

        // Buscar detalhes do produto
        const response = await fetch(`php/get_product.php?id=${productId}`);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Erro ao carregar produto');
        }

        const product = data.product;
        window.currentProduct = product;
        
        // Atualizar interface
        document.querySelector('.product-image').src = product.image || DEFAULT_IMAGE;
        document.querySelector('.product-image').alt = product.name;
        document.querySelector('.product-title').textContent = product.name;
        document.querySelector('.product-description').textContent = product.description;

        // Mostrar opções específicas baseado na categoria
        const pizzaOptions = document.querySelector('.pizza-options');
        const simplePrice = document.querySelector('.simple-price');

        if (product.category === 'pizza') {
            pizzaOptions.style.display = 'block';
            simplePrice.style.display = 'none';
            
            // Configurar listeners para opções de pizza
            document.querySelectorAll('input[name="size"], input[name="border"]').forEach(input => {
                input.addEventListener('change', updateTotal);
            });
        } else {
            pizzaOptions.style.display = 'none';
            simplePrice.style.display = 'block';
            document.querySelector('.product-price').textContent = formatPrice(product.price);
        }
        
        // Configurar botão de adicionar ao carrinho
        const addButton = document.querySelector('.add-to-cart-btn');
        if (addButton) {
            addButton.onclick = addToCart;
        }

        // Calcular total inicial
        updateTotal();

    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        document.querySelector('.product-details').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Erro ao carregar detalhes do produto: ${error.message}</p>
                <a href="cardapio.html" class="btn-primary">
                    <i class="fas fa-arrow-left"></i>
                    Voltar ao Cardápio
                </a>
            </div>
        `;
    }
}
