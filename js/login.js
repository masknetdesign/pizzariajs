// Função para mostrar formulário de registro
function showRegisterForm() {
    document.querySelector('.login-box').style.display = 'none';
    document.querySelector('.reset-password-box').style.display = 'none';
    document.querySelector('.register-box').style.display = 'block';
    document.getElementById('regName').focus();
}

// Função para mostrar formulário de login
function showLoginForm() {
    document.querySelector('.register-box').style.display = 'none';
    document.querySelector('.reset-password-box').style.display = 'none';
    document.querySelector('.login-box').style.display = 'block';
    document.getElementById('email').focus();
}

// Função para mostrar formulário de redefinição de senha
function showResetPasswordForm() {
    document.querySelector('.login-box').style.display = 'none';
    document.querySelector('.register-box').style.display = 'none';
    document.querySelector('.reset-password-box').style.display = 'block';
    document.getElementById('resetEmail').focus();
}

// Função para mostrar alerta
function showAlert(message, type = 'error') {
    // Remover alertas anteriores
    const oldAlert = document.querySelector('.alert');
    if (oldAlert) {
        oldAlert.remove();
    }

    // Criar novo alerta
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    
    // Conteúdo do alerta
    alertDiv.innerHTML = `
        <span>${message}</span>
        <button class="alert-close" onclick="closeAlert(this.parentElement)">&times;</button>
    `;
    
    // Adicionar alerta no formulário ativo
    const activeForm = document.querySelector('[style="display: block"]');
    if (activeForm) {
        activeForm.insertBefore(alertDiv, activeForm.firstChild);
    }

    // Remover alerta automaticamente após 5 segundos
    setTimeout(() => closeAlert(alertDiv), 5000);
}

// Função para fechar alerta
function closeAlert(alertElement) {
    if (alertElement) {
        alertElement.classList.add('fade-out');
        setTimeout(() => alertElement.remove(), 300);
    }
}

// Função para validar o formulário de registro
function validateRegisterForm(formData) {
    if (formData.password !== formData.confirmPassword) {
        showAlert('As senhas não coincidem!', 'error');
        return false;
    }
    if (formData.password.length < 6) {
        showAlert('A senha deve ter pelo menos 6 caracteres!', 'warning');
        return false;
    }
    if (formData.name.length < 3) {
        showAlert('O nome deve ter pelo menos 3 caracteres!', 'warning');
        return false;
    }
    if (!formData.email.includes('@')) {
        showAlert('Por favor, insira um email válido!', 'warning');
        return false;
    }
    return true;
}

// Função para mostrar/esconder o spinner de carregamento
function toggleLoadingState(button, isLoading) {
    const spinner = button.querySelector('.spinner');
    const text = button.querySelector('span');
    
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
        if (spinner) spinner.style.display = 'inline-block';
        if (text) text.style.opacity = '0.7';
    } else {
        button.classList.remove('loading');
        button.disabled = false;
        if (spinner) spinner.style.display = 'none';
        if (text) text.style.opacity = '1';
    }
}

// Função para lidar com o login
async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('.login-btn');
    
    // Mostrar spinner
    toggleLoadingState(submitButton, true);
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('php/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao fazer login');
        }

        // Mostrar mensagem de sucesso
        Swal.fire({
            title: 'Login realizado!',
            text: 'Você será redirecionado em instantes...',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            confirmButtonColor: '#28a745'
        }).then(() => {
            // Salvar usuário no localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirecionar após um pequeno delay para mostrar a mensagem
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        });
        
    } catch (error) {
        Swal.fire({
            title: 'Erro no Login',
            text: error.message || 'Ocorreu um erro ao fazer login. Por favor, tente novamente.',
            icon: 'error',
            confirmButtonColor: '#c41230'
        });
        // Esconder spinner em caso de erro
        toggleLoadingState(submitButton, false);
    }
}

// Função para lidar com o registro
async function handleRegister(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('.login-btn');
    
    // Mostrar spinner
    toggleLoadingState(submitButton, true);
    
    const formData = {
        name: document.getElementById('regName').value.trim(),
        email: document.getElementById('regEmail').value.trim(),
        password: document.getElementById('regPassword').value,
        confirmPassword: document.getElementById('confirmPassword').value
    };

    if (!validateRegisterForm(formData)) {
        toggleLoadingState(submitButton, false);
        return;
    }

    try {
        const response = await fetch('php/register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao realizar cadastro');
        }

        // Mostrar mensagem de sucesso
        Swal.fire({
            title: 'Cadastro realizado!',
            text: 'Você será redirecionado em instantes...',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            confirmButtonColor: '#28a745'
        }).then(() => {
            // Salvar usuário no localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirecionar após um pequeno delay para mostrar a mensagem
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        });
        
    } catch (error) {
        Swal.fire({
            title: 'Erro no Cadastro',
            text: error.message || 'Ocorreu um erro ao realizar cadastro. Por favor, tente novamente.',
            icon: 'error',
            confirmButtonColor: '#c41230'
        });
        // Esconder spinner em caso de erro
        toggleLoadingState(submitButton, false);
    }
}

// Função para lidar com a redefinição de senha
async function handleResetPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('resetEmail').value.trim();
    
    if (!email) {
        Swal.fire({
            title: 'Erro',
            text: 'Por favor, insira seu email',
            icon: 'error',
            confirmButtonColor: '#c41230'
        });
        return;
    }

    Swal.fire({
        title: 'Link de redefinição de senha enviado!',
        text: 'Você receberá um email com instruções para redefinir sua senha',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        confirmButtonColor: '#28a745'
    }).then(() => {
        // Redirecionar para a página de login após alguns segundos
        setTimeout(() => {
            showLoginForm();
        }, 2000);
    });
}

// Inicializar a página
document.addEventListener('DOMContentLoaded', () => {
    // Mostrar formulário de login por padrão
    showLoginForm();
});
