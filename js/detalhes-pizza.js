// Preços base para cada tamanho
const sizePrices = {
    pequena: 30.00,
    media: 40.00,
    grande: 50.00
};

// Preços das bordas
const borderPrices = {
    sem: 0.00,
    catupiry: 5.00,
    cheddar: 5.00
};

// Função para obter parâmetros da URL
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        id: params.get('id'),
        name: params.get('name'),
        description: params.get('description'),
        image: params.get('image')
    };
}

// Função para atualizar o preço total
function updateTotalPrice() {
    const selectedSize = document.querySelector('input[name="size"]:checked').value;
    const selectedBorder = document.querySelector('input[name="border"]:checked').value;
    const quantity = parseInt(document.getElementById('quantity').value);

    const basePrice = sizePrices[selectedSize];
    const borderPrice = borderPrices[selectedBorder];
    const total = (basePrice + borderPrice) * quantity;

    document.getElementById('totalPrice').textContent = total.toFixed(2);
}

// Função para adicionar ao carrinho
function addToCart() {
    const button = document.querySelector('.add-to-cart-btn');
    button.classList.add('loading');
    
    const params = getUrlParams();
    const selectedSize = document.querySelector('input[name="size"]:checked').value;
    const selectedBorder = document.querySelector('input[name="border"]:checked').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const totalPrice = parseFloat(document.getElementById('totalPrice').textContent);

    const item = {
        id: params.id,
        name: params.name,
        size: selectedSize,
        border: selectedBorder,
        quantity: quantity,
        price: totalPrice,
        image: params.image,
        type: 'pizza'
    };

    // Recuperar carrinho atual
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Adicionar novo item
    cart.push(item);
    
    // Salvar carrinho atualizado
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Atualizar contador do carrinho
    updateCartCount();

    // Simular delay para feedback visual
    setTimeout(() => {
        button.classList.remove('loading');
        window.location.href = 'cardapio.html';
    }, 1000);
}

// Função para atualizar o contador do carrinho
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelector('.cart-count').textContent = count;
}

document.addEventListener('DOMContentLoaded', () => {
    loadPizzaDetails();
});

function loadPizzaDetails() {
    // Obter ID da pizza da URL
    const params = new URLSearchParams(window.location.search);
    const pizzaId = parseInt(params.get('id'));
    
    if (!pizzaId) {
        window.location.href = 'cardapio.html';
        return;
    }

    // Carregar pizzas do localStorage
    const pizzas = JSON.parse(localStorage.getItem('pizzas')) || [];
    const pizza = pizzas.find(p => p.id === pizzaId);
    
    if (!pizza) {
        console.error('Pizza não encontrada:', pizzaId);
        window.location.href = 'cardapio.html';
        return;
    }

    // Preencher dados da pizza
    document.getElementById('pizza-image').src = pizza.image || 'images/pizza-default.jpg';
    document.getElementById('pizza-name').textContent = pizza.name;
    document.getElementById('pizza-description').textContent = pizza.description;

    // Configurar eventos
    setupSizeAndBorderEvents();
    setupQuantityControls();
    setupAddToCartButton(pizza);

    // Inicializar
    updateSelectedStyles();
    updateTotal();
}

function setupSizeAndBorderEvents() {
    // Eventos para tamanhos
    document.querySelectorAll('input[name="size"]').forEach(input => {
        input.addEventListener('change', () => {
            updateSelectedStyles();
            updateTotal();
        });
    });

    // Eventos para bordas
    document.querySelectorAll('input[name="border"]').forEach(input => {
        input.addEventListener('change', () => {
            updateSelectedStyles();
            updateTotal();
        });
    });
}

function setupQuantityControls() {
    const quantityInput = document.getElementById('quantity');
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const plusBtn = document.querySelector('.quantity-btn.plus');

    minusBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
            updateTotal();
        }
    });

    plusBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue < 10) {
            quantityInput.value = currentValue + 1;
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

function setupAddToCartButton(pizza) {
    const addToCartBtn = document.getElementById('add-to-cart');
    addToCartBtn.addEventListener('click', () => {
        const cartItem = createCartItem(pizza);
        addItemToCart(cartItem);
        showSuccessMessage();
    });
}

function updateSelectedStyles() {
    // Atualizar estilos dos cards de tamanho
    document.querySelectorAll('.option-card').forEach(card => {
        const input = card.querySelector('input[type="radio"]');
        if (input.checked) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
}

function getSelectedSize() {
    const sizeInput = document.querySelector('input[name="size"]:checked');
    const sizes = {
        'pequena': { price: 25.00, size: '20cm', slices: 4 },
        'media': { price: 35.00, size: '30cm', slices: 6 },
        'grande': { price: 45.00, size: '40cm', slices: 8 }
    };
    return sizes[sizeInput.value];
}

function getSelectedBorder() {
    const borderInput = document.querySelector('input[name="border"]:checked');
    const borders = {
        'tradicional': { price: 0, name: 'Tradicional' },
        'catupiry': { price: 5.00, name: 'Catupiry' },
        'cheddar': { price: 5.00, name: 'Cheddar' }
    };
    return borders[borderInput.value];
}

function updateTotal() {
    const size = getSelectedSize();
    const border = getSelectedBorder();
    const quantity = parseInt(document.getElementById('quantity').value);
    
    const total = (size.price + border.price) * quantity;
    document.getElementById('total-price').textContent = `R$ ${total.toFixed(2)}`;
}

function createCartItem(pizza) {
    const size = getSelectedSize();
    const border = getSelectedBorder();
    const quantity = parseInt(document.getElementById('quantity').value);
    const total = (size.price + border.price) * quantity;

    return {
        id: Date.now(),
        pizzaId: pizza.id,
        name: pizza.name,
        size: size.size,
        slices: size.slices,
        border: border.name,
        quantity: quantity,
        price: total / quantity,
        total: total,
        image: pizza.image || 'images/pizza-default.jpg'
    };
}

function addItemToCart(cartItem) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));

    // Atualizar contador do carrinho no header
    const header = document.querySelector('app-header');
    if (header) {
        header.updateCartCount();
    }
}

function showSuccessMessage() {
    Swal.fire({
        title: 'Pizza Adicionada!',
        text: 'Sua pizza foi adicionada ao carrinho',
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
