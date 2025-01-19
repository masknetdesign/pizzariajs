document.addEventListener('DOMContentLoaded', () => {
    setupForm();
});

function setupForm() {
    const form = document.getElementById('addProductForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const formData = new FormData(form);
            
            // Validar campos obrigatórios
            const requiredFields = ['name', 'category', 'description', 'price'];
            for (const field of requiredFields) {
                if (!formData.get(field)) {
                    throw new Error(`O campo ${field} é obrigatório`);
                }
            }
            
            // Validar preço
            const price = parseFloat(formData.get('price'));
            if (isNaN(price) || price <= 0) {
                throw new Error('O preço deve ser maior que zero');
            }
            
            // Validar imagem
            const imageFile = formData.get('image');
            if (imageFile && imageFile.size > 0) {
                if (imageFile.size > 2 * 1024 * 1024) { // 2MB
                    throw new Error('A imagem deve ter no máximo 2MB');
                }
                
                const allowedTypes = ['image/jpeg', 'image/png'];
                if (!allowedTypes.includes(imageFile.type)) {
                    throw new Error('A imagem deve ser JPG ou PNG');
                }
            }
            
            // Enviar dados
            const response = await fetch('./php/add_product.php', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                await Swal.fire({
                    title: 'Sucesso!',
                    text: 'Produto adicionado com sucesso',
                    icon: 'success',
                    confirmButtonColor: '#28a745'
                });
                
                // Redirecionar para a lista de produtos
                window.location.href = 'index.html';
            } else {
                throw new Error(data.message || 'Erro ao adicionar produto');
            }
            
        } catch (error) {
            console.error('Erro ao adicionar produto:', error);
            Swal.fire({
                title: 'Erro!',
                text: error.message || 'Não foi possível adicionar o produto',
                icon: 'error',
                confirmButtonColor: '#c41230'
            });
        }
    });
}

// Função para formatar o preço
function formatPrice(input) {
    let value = input.value.replace(/\D/g, '');
    value = (parseInt(value) / 100).toFixed(2);
    input.value = value;
}

// Função para pré-visualizar a imagem
function previewImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        const preview = document.getElementById('imagePreview');
        
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        
        reader.readAsDataURL(input.files[0]);
    }
}
