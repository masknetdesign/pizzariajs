// Carrinho de compras
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Atualiza o contador do carrinho
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }
}

// Função para adicionar ao carrinho
function addToCart(id, name, price, quantity = 1) {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id, name, price, quantity });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Função para remover do carrinho
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Função para atualizar quantidade
function updateQuantity(id, quantity) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity = quantity;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
        }
    }
}

// Verifica se o usuário está logado
function isLoggedIn() {
    return localStorage.getItem('user') !== null;
}

// Função para login
function login(email, password) {
    // Aqui você implementaria a lógica de autenticação
    // Por enquanto, vamos apenas simular
    const user = {
        email,
        name: email.split('@')[0]
    };
    localStorage.setItem('user', JSON.stringify(user));
    updateLoginButton();
}

// Função para logout
function logout() {
    localStorage.removeItem('user');
    updateLoginButton();
}

// Atualiza o botão de login/logout
function updateLoginButton() {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        if (isLoggedIn()) {
            const user = JSON.parse(localStorage.getItem('user'));
            loginBtn.textContent = `Olá, ${user.name}`;
            loginBtn.href = '#';
            loginBtn.onclick = () => {
                logout();
                window.location.href = 'index.html';
            };
        } else {
            loginBtn.textContent = 'Login';
            loginBtn.href = 'login.html';
            loginBtn.onclick = null;
        }
    }
}

// Inicializa a página
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    updateLoginButton();
});
