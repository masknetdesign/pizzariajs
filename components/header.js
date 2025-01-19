class Header extends HTMLElement {
    constructor() {
        super();
        this.currentPage = window.location.pathname.split('/').pop() || 'index.html';
        this.isLoggedIn = this.checkLoginStatus();
        
        // Observar mudanças no localStorage
        window.addEventListener('storage', (e) => {
            if (e.key === 'userData' || e.key === 'token') {
                this.isLoggedIn = this.checkLoginStatus();
                this.render();
            }
        });
    }

    checkLoginStatus() {
        const userData = localStorage.getItem('userData');
        return userData !== null;
    }

    connectedCallback() {
        // Verificar se estamos na página de meus-pedidos
        if (this.currentPage === 'meus-pedidos.html' && !this.isLoggedIn) {
            window.location.href = 'login.html?redirect=meus-pedidos.html';
            return;
        }
        this.render();
        this.setupEventListeners();
        this.updateCartCount();
    }

    render() {
        // Definir os itens de autenticação baseado no estado de login e página atual
        let authItems = '';
        
        if (this.isLoggedIn) {
            authItems = `
                <li>
                    <a href="meus-pedidos.html" class="${this.currentPage === 'meus-pedidos.html' ? 'active' : ''}">
                        <i class="fas fa-list-alt"></i>
                        <span>Pedidos</span>
                    </a>
                </li>
                <li>
                    <a href="#" class="logout-btn">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Sair</span>
                    </a>
                </li>
            `;
        } else if (this.currentPage !== 'index.html') {
            // Só mostra o botão Entrar se não estiver na página index
            authItems = `
                <li class="login-item">
                    <a href="login.html" class="${this.currentPage === 'login.html' ? 'active' : ''}">
                        <i class="fas fa-user"></i>
                        <span>Entrar</span>
                    </a>
                </li>
            `;
        }

        this.innerHTML = `
            <header class="main-header">
                <div class="header-container">
                    <div class="logo">
                        <h1>Pizzaria JS</h1>
                    </div>
                    
                    <button class="menu-toggle" aria-label="Menu">
                        <span class="hamburger"></span>
                    </button>

                    <nav class="main-nav">
                        <ul class="nav-list">
                            <li>
                                <a href="index.html" class="${this.currentPage === 'index.html' ? 'active' : ''}">
                                    <i class="fas fa-home"></i>
                                    <span>Home</span>
                                </a>
                            </li>
                            <li>
                                <a href="cardapio.html" class="${this.currentPage === 'cardapio.html' ? 'active' : ''}">
                                    <i class="fas fa-pizza-slice"></i>
                                    <span>Cardápio</span>
                                </a>
                            </li>
                            <li>
                                <a href="carrinho.html" class="cart-link ${this.currentPage === 'carrinho.html' ? 'active' : ''}">
                                    <i class="fas fa-shopping-cart"></i>
                                    <span>Carrinho</span>
                                    <span class="cart-count">0</span>
                                </a>
                            </li>
                            ${authItems}
                        </ul>
                    </nav>
                </div>
            </header>
        `;
    }

    updateCartCount() {
        const cartCountElement = this.querySelector('.cart-count');
        if (cartCountElement) {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = totalItems;
            cartCountElement.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    setupEventListeners() {
        const menuToggle = this.querySelector('.menu-toggle');
        const mainNav = this.querySelector('.main-nav');
        const logoutBtn = this.querySelector('.logout-btn');

        if (menuToggle && mainNav) {
            menuToggle.addEventListener('click', () => {
                menuToggle.classList.toggle('active');
                mainNav.classList.toggle('active');
            });

            // Fechar menu ao clicar em um link
            const navLinks = this.querySelectorAll('.nav-list a');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    menuToggle.classList.remove('active');
                    mainNav.classList.remove('active');
                });
            });

            // Fechar menu ao clicar fora
            document.addEventListener('click', (e) => {
                if (!this.contains(e.target)) {
                    menuToggle.classList.remove('active');
                    mainNav.classList.remove('active');
                }
            });
        }

        // Adicionar funcionalidade de logout
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('userData');
                localStorage.removeItem('token');
                // Se estivermos na página de meus-pedidos, redirecionar para home
                if (this.currentPage === 'meus-pedidos.html') {
                    window.location.href = 'index.html';
                } else {
                    this.isLoggedIn = false;
                    this.render();
                }
            });
        }
    }
}

// Registrar o componente
customElements.define('main-header', Header);

// Atualizar contador do carrinho quando houver mudanças
window.addEventListener('storage', (e) => {
    if (e.key === 'cart') {
        const header = document.querySelector('main-header');
        if (header) {
            header.updateCartCount();
        }
    }
    // Atualizar o header quando o estado de login mudar
    if (e.key === 'userData') {
        const header = document.querySelector('main-header');
        if (header) {
            header.isLoggedIn = header.checkLoginStatus();
            header.render();
        }
    }
});
