class Header extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const isLoggedIn = localStorage.getItem('user') !== null;
        const currentPath = window.location.pathname;
        const isCartPage = currentPath.endsWith('/carrinho.html') || currentPath.endsWith('\\carrinho.html');
        
        this.innerHTML = `
            <header class="main-header">
                <div class="header-container">
                    <div class="logo">
                        <h1>PizzariaJS</h1>
                    </div>
                    
                    <button class="menu-toggle">
                        <span class="hamburger"></span>
                    </button>
                    
                    <nav class="main-nav">
                        <ul class="nav-list">
                            <li><a href="index.html"><i class="fas fa-home"></i>Home</a></li>
                            <li><a href="cardapio.html"><i class="fas fa-pizza-slice"></i>Cardápio</a></li>
                            <li><a href="sobre.html"><i class="fas fa-info-circle"></i>Sobre</a></li>
                            <li><a href="contato.html"><i class="fas fa-envelope"></i>Contato</a></li>
                            <li>
                                <a href="carrinho.html" class="cart-link">
                                    <i class="fas fa-shopping-cart"></i>
                                    Carrinho
                                    <span class="cart-count">0</span>
                                </a>
                            </li>
                            ${isLoggedIn ? `
                                <li><a href="meus-pedidos.html"><i class="fas fa-list-alt"></i>Meus Pedidos</a></li>
                                <li><a href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i>Sair</a></li>
                            ` : !isCartPage ? `
                                <li class="login-item">
                                    <a href="login.html">
                                        <i class="fas fa-sign-in-alt"></i>
                                        Entrar
                                    </a>
                                </li>
                            ` : ''}
                        </ul>
                    </nav>
                </div>
            </header>
        `;

        // Atualizar contador do carrinho
        this.updateCartCount();

        // Adicionar listener para eventos de storage
        window.addEventListener('storage', () => this.updateCartCount());

        // Configurar menu mobile
        const menuToggle = this.querySelector('.menu-toggle');
        const mainNav = this.querySelector('.main-nav');
        
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                menuToggle.classList.toggle('active');
                mainNav.classList.toggle('active');
            });
        }
    }

    updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        const cartCount = this.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = count;
        }
    }
}

// Registrar o componente
customElements.define('app-header', Header);

// Função de logout
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}
