// Verificar se o usuário está logado
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token && !window.location.pathname.includes('/admin/login.html')) {
        window.location.href = 'login.html';
    }
}

// Função de login
async function login(username, password) {
    try {
        console.log('Tentando login com:', username);
        const response = await fetch('api/auth/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        console.log('Resposta do servidor:', data);

        if (data.success) {
            localStorage.setItem('adminToken', data.token);
            window.location.href = 'index.html';
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Erro no login:', error);
        return false;
    }
}

// Função de logout
function logout() {
    localStorage.removeItem('adminToken');
    window.location.href = 'login.html';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticação em todas as páginas admin
    checkAuth();

    // Setup login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            const errorMessage = document.getElementById('error-message');
            errorMessage.textContent = '';
            
            if (!await login(username, password)) {
                errorMessage.textContent = 'Usuário ou senha inválidos';
            }
        });
    }

    // Setup logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});
