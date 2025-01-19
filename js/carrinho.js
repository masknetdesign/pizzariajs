const DELIVERY_FEE = 5.00;
const DEFAULT_IMAGE = 'images/default.jpg';

// Função para formatar preço
function formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(price);
}

// Verificar se o usuário está logado
function checkLoginStatus() {
    const user = JSON.parse(localStorage.getItem('user'));
    const header = document.querySelector('main-header');
    
    if (user && header && header.shadowRoot) {
        const loginButton = header.shadowRoot.querySelector('.login-btn');
        if (loginButton) {
            loginButton.style.display = 'none';
        }
    }
    return user !== null;
}

// Função para atualizar a quantidade de um item
function handleQuantityUpdate(itemId, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(item => item.id === parseInt(itemId));
    
    if (itemIndex !== -1) {
        const newQuantity = cart[itemIndex].quantity + change;
        if (newQuantity > 0) {
            cart[itemIndex].quantity = newQuantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
            updateCartCount();
        } else if (newQuantity === 0) {
            handleRemoveItem(itemId);
        }
    }
}

// Função para remover um item do carrinho
function handleRemoveItem(itemId) {
    try {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart = cart.filter(item => item.id !== parseInt(itemId));
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
        updateCartCount();
        
        Swal.fire({
            title: 'Item Removido!',
            text: 'O item foi removido do seu carrinho',
            icon: 'success',
            confirmButtonColor: '#28a745'
        });
    } catch (error) {
        console.error('Erro ao remover item:', error);
    }
}

// Função para calcular o subtotal do carrinho
function calculateSubtotal(cart) {
    return cart.reduce((total, item) => {
        const itemTotal = parseFloat(item.price) * parseInt(item.quantity);
        return total + itemTotal;
    }, 0);
}

// Função para calcular o total do carrinho
function calculateTotal(subtotal) {
    return subtotal + DELIVERY_FEE;
}

// Função para renderizar o carrinho
function renderCart() {
    const cartItemsDiv = document.getElementById('cart-items');
    const cartSummaryDiv = document.querySelector('.cart-summary');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Seu carrinho está vazio</p>
                <a href="cardapio.html" class="continue-shopping-btn">
                    <i class="fas fa-arrow-left"></i>
                    Continuar Comprando
                </a>
            </div>
        `;
        if (cartSummaryDiv) {
            cartSummaryDiv.style.display = 'none';
        }
        return;
    }
    
    cartItemsDiv.innerHTML = cart.map(item => {
        const itemTotal = parseFloat(item.price) * parseInt(item.quantity);
        return `
            <div class="cart-item" data-id="${item.id}">
                <div class="item-image">
                    <img src="${item.image || DEFAULT_IMAGE}" alt="${item.name}" 
                         onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}';">
                </div>
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-description">${item.description || ''}</div>
                    <div class="item-price">${formatPrice(item.price)}</div>
                    <div class="item-quantity">
                        <button type="button" class="quantity-btn minus" onclick="handleQuantityUpdate(${item.id}, -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span>${item.quantity}</span>
                        <button type="button" class="quantity-btn plus" onclick="handleQuantityUpdate(${item.id}, 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="item-total">${formatPrice(itemTotal)}</div>
                </div>
                <button type="button" class="remove-btn" onclick="handleRemoveItem(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');
    
    if (cartSummaryDiv) {
        cartSummaryDiv.style.display = 'block';
        const subtotal = calculateSubtotal(cart);
        const total = calculateTotal(subtotal);
        
        document.getElementById('subtotal').textContent = formatPrice(subtotal);
        document.getElementById('delivery-fee').textContent = formatPrice(DELIVERY_FEE);
        document.getElementById('total').textContent = formatPrice(total);

        // Atualizar estado do botão de checkout
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', handleCheckout);
        }
    }
}

// Função para atualizar o contador do carrinho
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = count;
    }

    // Disparar evento de storage para atualizar outros componentes
    window.dispatchEvent(new Event('storage'));
}

// Função para finalizar o pedido
async function checkout() {
    if (!checkLoginStatus()) {
        Swal.fire({
            title: 'Você precisa estar logado para finalizar o pedido',
            text: 'Deseja fazer login agora?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Ir para Login',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#c41230',
            cancelButtonColor: '#333'
        }).then((result) => {
            if (result.isConfirmed) {
                // Salvar URL atual para redirecionamento após login
                localStorage.setItem('redirectAfterLogin', window.location.href);
                window.location.href = 'login.html';
            }
        });
        return;
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        Swal.fire({
            title: 'Carrinho Vazio',
            text: 'Adicione alguns itens ao carrinho antes de finalizar o pedido',
            icon: 'warning',
            confirmButtonColor: '#c41230'
        });
        return;
    }

    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const subtotal = calculateSubtotal(cart);
        const total = calculateTotal(subtotal);
        
        const response = await fetch('php/create_order.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userData.id,
                items: cart,
                subtotal: subtotal,
                delivery_fee: DELIVERY_FEE,
                total: total
            })
        });

        const result = await response.json();
        
        if (result.success) {
            Swal.fire({
                title: 'Pedido Confirmado!',
                text: 'Seu pedido foi recebido e está sendo preparado',
                icon: 'success',
                confirmButtonColor: '#28a745'
            }).then(() => {
                // Limpar carrinho
                localStorage.setItem('cart', '[]');
                // Atualizar header
                const header = document.querySelector('app-header');
                if (header) {
                    header.updateCartCount();
                }
                // Redirecionar para página de pedidos
                window.location.href = 'meus-pedidos.html';
            });
        } else {
            throw new Error(result.message || 'Erro ao processar pedido');
        }
    } catch (error) {
        console.error('Erro:', error);
        Swal.fire({
            title: 'Erro ao Processar Pedido',
            text: 'Ocorreu um erro ao processar seu pedido. Por favor, tente novamente.',
            icon: 'error',
            confirmButtonColor: '#c41230'
        });
    }
}

function handleCheckout() {
    const user = localStorage.getItem('user');
    if (!user) {
        // Se não estiver logado, redireciona para o login
        window.location.href = 'login.html';
        return;
    }
    // Se estiver logado, continua com o checkout
    checkout();
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    renderCart();
    updateCartCount();
    checkLoginStatus();
});
