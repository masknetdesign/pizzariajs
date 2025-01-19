document.addEventListener('DOMContentLoaded', () => {
    loadProduct();
    setupEventListeners();
});

async function loadProduct() {
    try {
        // Obter ID do produto da URL
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        if (!productId) {
            throw new Error('ID do produto não fornecido');
        }

        const response = await fetch(`./php/get_product.php?id=${productId}`);
        if (!response.ok) {
            throw new Error(`Erro ao carregar produto: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Erro ao carregar produto');
        }

        fillForm(data.product);
    } catch (error) {
        console.error('Erro:', error);
        Swal.fire({
            title: 'Erro!',
            text: error.message,
            icon: 'error',
            confirmButtonColor: '#c41230'
        }).then(() => {
            window.location.href = 'index.html';
        });
    }
}

function fillForm(product) {
    document.getElementById('productId').value = product.id;
    document.getElementById('name').value = product.name;
    document.getElementById('description').value = product.description || '';
    document.getElementById('price').value = product.price;
    document.getElementById('category').value = product.category;
    
    const imagePreview = document.getElementById('imagePreview');
    if (product.image) {
        imagePreview.src = product.image;
    }
}

function setupEventListeners() {
    // Preview de imagem
    const imageInput = document.getElementById('image');
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('imagePreview').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Submissão do formulário
    const form = document.getElementById('editProductForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const formData = new FormData(form);
            const response = await fetch('./php/update_product.php', {
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
                    text: 'Produto atualizado com sucesso',
                    icon: 'success',
                    confirmButtonColor: '#28a745'
                });
                window.location.href = 'index.html';
            } else {
                throw new Error(data.message || 'Erro ao atualizar produto');
            }
        } catch (error) {
            console.error('Erro:', error);
            Swal.fire({
                title: 'Erro!',
                text: error.message,
                icon: 'error',
                confirmButtonColor: '#c41230'
            });
        }
    });
}
