document.addEventListener('DOMContentLoaded', () => {
    initializeProductDetails();
});

function initializeProductDetails() {
    const productId = getProductIdFromUrl();
    if (!productId) {
        redirectToMenu();
        return;
    }

    const product = loadProductData(productId);
    if (!product) {
        redirectToMenu();
        return;
    }

    displayProductDetails(product);
    setupEventListeners(product);
    updateTotal();
}

function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('id'));
}

function loadProductData(productId) {
    const pizzas = JSON.parse(localStorage.getItem('pizzas')) || [];
    const beverages = JSON.parse(localStorage.getItem('beverages')) || [];
    const desserts = JSON.parse(localStorage.getItem('desserts')) || [];
    
    return pizzas.find(p => p.id === productId) || 
           beverages.find(b => b.id === productId) || 
           desserts.find(d => d.id === productId);
}

function redirectToMenu() {
    window.location.href = 'cardapio.html';
}

function displayProductDetails(product) {
    document.getElementById('product-image').src = product.image || 'images/default.jpg';
    document.getElementById('product-image').alt = product.name;
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-description').textContent = product.description;

    // Elementos específicos para pizzas
    const pizzaOptions = document.querySelector('.pizza-options');
    const simpleOptions = document.querySelector('.simple-options');

    if (product.type === 'pizza') {
        pizzaOptions.style.display = 'block';
        simpleOptions.style.display = 'none';
    } else {
        pizzaOptions.style.display = 'none';
        simpleOptions.style.display = 'block';
        
        // Atualizar preço simples
        document.getElementById('simple-price').textContent = `R$ ${product.price.toFixed(2)}`;
    }
}

function setupEventListeners(product) {
    if (product.type === 'pizza') {
        // Eventos para opções de tamanho e borda
        document.querySelectorAll('input[name="size"], input[name="border"]').forEach(input => {
            input.addEventListener('change', updateTotal);
        });
    }

    // Eventos para controles de quantidade
    setupQuantityControls();

    // Evento para adicionar ao carrinho
    document.getElementById('add-to-cart').addEventListener('click', () => {
        addToCart(product);
    });
}

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

function getSelectedOptions() {
    const product = loadProductData(getProductIdFromUrl());

    if (product.type === 'pizza') {
        const sizes = {
            'pequena': { price: 25.00, size: '25cm', slices: 4 },
            'media': { price: 35.00, size: '35cm', slices: 6 },
            'grande': { price: 45.00, size: '45cm', slices: 8 }
        };

        const borders = {
            'tradicional': { price: 0, name: 'Tradicional' },
            'catupiry': { price: 5.00, name: 'Catupiry' },
            'cheddar': { price: 5.00, name: 'Cheddar' }
        };

        const selectedSize = document.querySelector('input[name="size"]:checked').value;
        const selectedBorder = document.querySelector('input[name="border"]:checked').value;
        const quantity = parseInt(document.getElementById('quantity').value);

        return {
            size: sizes[selectedSize],
            border: borders[selectedBorder],
            quantity: quantity
        };
    } else {
        return {
            quantity: parseInt(document.getElementById('quantity').value),
            price: product.price
        };
    }
}

function updateTotal() {
    const product = loadProductData(getProductIdFromUrl());
    const options = getSelectedOptions();
    let total;

    if (product.type === 'pizza') {
        total = (options.size.price + options.border.price) * options.quantity;
    } else {
        total = options.price * options.quantity;
    }

    document.getElementById('total-price').textContent = `R$ ${total.toFixed(2)}`;
}

function addToCart(product) {
    const options = getSelectedOptions();
    let cartItem;

    if (product.type === 'pizza') {
        const total = (options.size.price + options.border.price) * options.quantity;
        cartItem = {
            id: Date.now(),
            productId: product.id,
            type: 'pizza',
            name: product.name,
            size: options.size.size,
            slices: options.size.slices,
            border: options.border.name,
            quantity: options.quantity,
            price: total / options.quantity,
            total: total,
            image: product.image || 'images/pizza-default.jpg'
        };
    } else {
        const total = options.price * options.quantity;
        cartItem = {
            id: Date.now(),
            productId: product.id,
            type: product.type,
            name: product.name,
            quantity: options.quantity,
            price: options.price,
            total: total,
            image: product.image || 'images/default.jpg'
        };
    }

    try {
        // Adicionar ao carrinho
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.push(cartItem);
        localStorage.setItem('cart', JSON.stringify(cart));

        // Atualizar contador do header
        const headers = document.getElementsByTagName('app-header');
        if (headers.length > 0) {
            const header = headers[0];
            if (typeof header.updateCartCount === 'function') {
                header.updateCartCount();
            }
        }

        // Mostrar mensagem de sucesso
        Swal.fire({
            title: product.type === 'pizza' ? 'Pizza Adicionada!' : 'Item Adicionado!',
            text: `${product.name} foi adicionado(a) ao seu carrinho`,
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'Continuar Comprando',
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
    } catch (error) {
        console.error('Erro ao adicionar ao carrinho:', error);
        Swal.fire({
            title: 'Erro',
            text: 'Ocorreu um erro ao adicionar o item ao carrinho',
            icon: 'error',
            confirmButtonColor: '#c41230'
        });
    }
}
