document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    if (form) {
        form.addEventListener('submit', handleRegister);
    }
});

async function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validações
    if (password !== confirmPassword) {
        Swal.fire({
            title: 'Erro na Senha',
            text: 'As senhas não coincidem',
            icon: 'error',
            confirmButtonColor: '#c41230'
        });
        return;
    }

    try {
        const response = await fetch('api/register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (data.success) {
            // Mostrar mensagem de sucesso
            Swal.fire({
                title: 'Cadastro Realizado!',
                text: 'Sua conta foi criada com sucesso',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                confirmButtonColor: '#28a745'
            }).then(() => {
                // Redirecionar para login
                window.location.href = 'login.html';
            });
        } else {
            throw new Error(data.message || 'Erro ao criar conta');
        }
    } catch (error) {
        console.error('Erro no cadastro:', error);
        Swal.fire({
            title: 'Erro no Cadastro',
            text: error.message || 'Ocorreu um erro ao criar sua conta. Por favor, tente novamente.',
            icon: 'error',
            confirmButtonColor: '#c41230'
        });
    }
}

// Validação em tempo real
function validatePassword() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const confirmInput = document.getElementById('confirm-password');

    if (password !== confirmPassword) {
        confirmInput.setCustomValidity('As senhas não coincidem');
    } else {
        confirmInput.setCustomValidity('');
    }
}

// Adicionar validação em tempo real
document.addEventListener('DOMContentLoaded', () => {
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm-password');

    if (password && confirmPassword) {
        password.addEventListener('change', validatePassword);
        confirmPassword.addEventListener('keyup', validatePassword);
    }
});
