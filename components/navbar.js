function createNavbar() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    const navbar = document.createElement('nav');
    navbar.className = 'navbar';
    
    navbar.innerHTML = `
        <div class="logo">
            <h1>Pizzaria JS</h1>
        </div>
        <button class="mobile-menu-btn">
            <i class="fas fa-bars"></i>
        </button>
        <div class="nav-items">
            <a href="index.html" class="${currentPage === 'index.html' ? 'active' : ''}">
                <i class="fas fa-home"></i>
                <span>Home</span>
            </a>
            <a href="cardapio.html" class="${currentPage === 'cardapio.html' ? 'active' : ''}">
                <i class="fas fa-pizza-slice"></i>
                <span>Cardápio</span>
            </a>
            <a href="carrinho.html" class="cart-link ${currentPage === 'carrinho.html' ? 'active' : ''}">
                <i class="fas fa-shopping-cart"></i>
                <span>Carrinho</span>
                <span class="cart-count">0</span>
            </a>
            <a href="meus-pedidos.html" class="${currentPage === 'meus-pedidos.html' ? 'active' : ''}">
                <i class="fas fa-list-alt"></i>
                <span>Pedidos</span>
            </a>
            <div class="user-menu">
                <a href="login.html" id="loginBtn" class="${currentPage === 'login.html' ? 'active' : ''}">
                    <i class="fas fa-user"></i>
                    <span>Entrar</span>
                </a>
            </div>
        </div>
    `;

    // Adicionar evento para o botão do menu mobile
    const mobileMenuBtn = navbar.querySelector('.mobile-menu-btn');
    const navItems = navbar.querySelector('.nav-items');

    mobileMenuBtn.addEventListener('click', () => {
        navItems.classList.toggle('show');
        mobileMenuBtn.classList.toggle('active');
    });

    // Fechar menu ao clicar em um link
    const navLinks = navbar.querySelectorAll('.nav-items a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navItems.classList.remove('show');
            mobileMenuBtn.classList.remove('active');
        });
    });

    // Fechar menu ao clicar fora
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target)) {
            navItems.classList.remove('show');
            mobileMenuBtn.classList.remove('active');
        }
    });
    
    return navbar;
}

// Função para inserir a navbar na página
function insertNavbar() {
    const navbar = createNavbar();
    document.body.insertBefore(navbar, document.body.firstChild);

    // Adicionar Font Awesome se ainda não estiver carregado
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fontAwesome = document.createElement('link');
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
        document.head.appendChild(fontAwesome);
    }
}

// Atualizar o contador do carrinho
function updateNavbarCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = count;
    }
}

// Inserir navbar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    insertNavbar();
    updateNavbarCartCount();
});
